import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  LogOut,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AdminUserManagementSection } from './sections/AdminUserManagementSection';
import { SuperAdminUserManagementTable } from './sections/SuperAdminUserManagementTable';
import { AdminServiceLicenseSection } from './sections/AdminServiceLicenseSection';
import { getStoredRBACUsers, editRBACUserDetails, syncUsersFromServer, RBACUser } from '../../db/rbacStore';

interface UserControlMasterViewProps {
  onBackToDashboard?: () => void;
  onLogoutAdmin?: () => void;
  hideHeader?: boolean;
  initialSubTab?: 'user_table' | 'user_list' | 'service_licenses' | 'rbac_staff';
}

export const UserControlMasterView: React.FC<UserControlMasterViewProps> = ({
  onBackToDashboard,
  onLogoutAdmin,
  hideHeader = false,
  initialSubTab = 'user_table'
}) => {
  // Normalize initialSubTab: map legacy 'user_list' directly to 'user_table'
  const resolvedSubTab = (initialSubTab === 'user_list' ? 'user_table' : initialSubTab) as 
    'user_table' | 'service_licenses' | 'rbac_staff';

  const [activeSubTab, setActiveSubTab] = useState<'user_table' | 'service_licenses' | 'rbac_staff'>(resolvedSubTab);
  const [selectedMobile, setSelectedMobile] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab === 'user_list' ? 'user_table' : (initialSubTab as any));
    }
  }, [initialSubTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // RBAC staff state
  const [rbacUsers, setRbacUsers] = useState<RBACUser[]>(() => {
    try {
      return getStoredRBACUsers();
    } catch {
      return [];
    }
  });

  const reloadRbacUsers = useCallback(() => {
    try {
      syncUsersFromServer().then((synced) => {
        if (synced && synced.length > 0) {
          setRbacUsers(synced);
        } else {
          setRbacUsers(getStoredRBACUsers());
        }
      }).catch(() => {
        setRbacUsers(getStoredRBACUsers());
      });
    } catch {
      setRbacUsers(getStoredRBACUsers());
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0A09] text-stone-100 flex flex-col font-sans select-none antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-md bg-stone-900 border border-amber-500/50 shadow-2xl rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-stone-100 leading-snug">{toastMessage}</p>
        </div>
      )}

      {/* TOP HEADER & SUB-TABS NAVIGATION */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-lg">
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer border border-stone-700"
                title="कन्ट्रोल सेन्टरमा फर्कनुहोस्"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                  प्रयोगकर्ता तथा पहुँच नियन्त्रण
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                वास्तविक डेटाबेस प्रयोगकर्ता, भुक्तानी रुजु र सेवा लाइसेन्स व्यवस्थापन
              </p>
            </div>
          </div>

          {/* Center: 3 Clean Sub-menu Tabs */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveSubTab('user_table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'user_table'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>१. प्रयोगकर्ता व्यवस्थापन</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('service_licenses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'service_licenses'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>२. सेवा लाइसेन्स</span>
            </button>

            <button
              type="button"
              onClick={() => {
                reloadRbacUsers();
                setActiveSubTab('rbac_staff');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'rbac_staff'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>३. कर्मचारी & RBAC</span>
            </button>
          </div>

          {/* Right: Super Admin Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xs ring-2 ring-amber-400">
                SA
              </div>
              <div className="hidden lg:block text-left text-[11px] leading-tight">
                <span className="font-bold block text-white">Super Admin</span>
                <span className="text-[9px] text-stone-400">केन्द्रीय प्रशासक</span>
              </div>
            </div>
            {onLogoutAdmin && (
              <button
                type="button"
                onClick={onLogoutAdmin}
                className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-950/60 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="लगआउट"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* MAIN CONTAINER: FULL CONTENT CANVAS */}
      <div className="flex-1 flex overflow-hidden w-full">
        <main className="w-full flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-5 bg-[#0C0A09]">
          
          {/* ── 1. REAL USER MANAGEMENT TABLE (Central Database Users, Filters, Right-Click System) ── */}
          {activeSubTab === 'user_table' && (
            <div className="w-full">
              <SuperAdminUserManagementTable
                onOpenLicensesForUser={(mobile) => {
                  setSelectedMobile(mobile);
                  setActiveSubTab('service_licenses');
                }}
              />
            </div>
          )}

          {/* ── 3. SERVICE LICENSES SECTION (Jyotish & Vastu Lock) ── */}
          {activeSubTab === 'service_licenses' && (
            <div className="bg-stone-900 rounded-3xl shadow-sm border border-stone-800 p-4 sm:p-6 space-y-4">
              <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-500" />
                    <span>सेवा लाइसेन्स नियन्त्रण (Jyotish & Vastu Single Device Licenses)</span>
                  </h2>
                  <p className="text-xs text-stone-400">
                    ज्योतिष तथा वास्तुशास्त्र सेवाहरूलाई Single Device Hard-Lock, QR खरिद स्वीकृति र लाइसेन्स अवधि नवीकरण
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('user_table')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors w-fit cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>← प्रयोगकर्ता तालिकामा फर्कनुहोस्</span>
                </button>
              </div>
              <AdminServiceLicenseSection />
            </div>
          )}

          {/* ── 4. STAFF & RBAC ACCOUNTS DIRECTORY ── */}
          {activeSubTab === 'rbac_staff' && (
            <div className="bg-stone-900 rounded-3xl shadow-sm border border-stone-800 p-4 sm:p-6 space-y-4">
              <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    <span>कर्मचारी तथा RBAC खाता व्यवस्थापन (Staff & Admin Accounts)</span>
                  </h2>
                  <p className="text-xs text-stone-400">
                    प्रशासक, स्टोर एडमिन, ज्योतिषी, सम्पादक लगायतका आन्तरिक कर्मचारी भूमिकाहरू
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('user_table')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors w-fit cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>← प्रयोगकर्ता तालिकामा फर्कनुहोस्</span>
                </button>
              </div>
              <AdminUserManagementSection
                users={rbacUsers}
                onUpdateUserStatus={(userId, newStatus) => {
                  editRBACUserDetails(userId, { status: newStatus }, 'super_admin');
                  reloadRbacUsers();
                  showToast('प्रयोगकर्ता खाता स्थिति अद्यावधिक भयो।');
                }}
                onChangeUserRole={(userId, newRole) => {
                  editRBACUserDetails(userId, { role: newRole }, 'super_admin');
                  reloadRbacUsers();
                  showToast('प्रयोगकर्ता भूमिका परिवर्तन भयो।');
                }}
                onResetUserPassword={() => {
                  showToast('पासवर्ड रिसेट लिङ्क सिर्जना गरियो।');
                }}
                onAddNewUser={() => reloadRbacUsers()}
                onRefresh={reloadRbacUsers}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
