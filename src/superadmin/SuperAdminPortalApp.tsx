import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Sliders,
  CreditCard,
  Crown,
  Newspaper,
  Download,
  Settings,
  FileText,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Bell,
  RefreshCw,
  HeartHandshake,
  Key,
  ShoppingBag
} from 'lucide-react';
import { SuperAdminSessionState, clearSuperAdminSession } from './auth/superAdminAuthStore';
import { SuperAdminControlCenter } from '../components/admin/SuperAdminControlCenter';
import { BirthDetails, OrganizationProfile, PanchangaData, PlanetPosition } from '../types/astrology';

interface SuperAdminPortalLayoutProps {
  session: SuperAdminSessionState;
  onLogout: () => void;
  onNavigateToClientSoftware: () => void;
  profiles?: BirthDetails[];
  todayPanchanga?: PanchangaData;
  orgProfile?: OrganizationProfile;
  transitPlanets?: PlanetPosition[];
  initialSubRoute?: string;
}

export const SuperAdminPortalLayout: React.FC<SuperAdminPortalLayoutProps> = ({
  session,
  onLogout,
  onNavigateToClientSoftware,
  profiles = [],
  todayPanchanga,
  orgProfile,
  transitPlanets = [],
  initialSubRoute = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Map initialSubRoute to SuperAdminControlCenter tab
    if (initialSubRoute === 'users' || initialSubRoute === 'user-management') return 'user_list';
    if (initialSubRoute === 'access-control' || initialSubRoute === 'menu-control' || initialSubRoute === 'switchboard') return 'menu_switchboard';
    if (initialSubRoute === 'magic-links' || initialSubRoute === 'magic_links' || initialSubRoute === 'links' || initialSubRoute === 'role-links') return 'role_magic_links';
    if (initialSubRoute === 'store-pos' || initialSubRoute === 'pos' || initialSubRoute === 'store' || initialSubRoute === 'store_admin') return 'store_pos';
    if (initialSubRoute === 'subscriptions' || initialSubRoute === 'service_licenses' || initialSubRoute === 'licenses' || initialSubRoute === 'trials') return 'service_licenses';
    if (initialSubRoute === 'payments' || initialSubRoute === 'client-approvals' || initialSubRoute === 'approvals') return 'client_approvals';
    if (initialSubRoute === 'finance') return 'finance';
    if (initialSubRoute === 'content' || initialSubRoute === 'samachar') return 'samachar_editor';
    if (initialSubRoute === 'software' || initialSubRoute === 'downloads') return 'software_releases';
    if (initialSubRoute === 'settings') return 'settings';
    if (initialSubRoute === 'audit-logs' || initialSubRoute === 'audit') return 'security_audit';
    return initialSubRoute || 'overview';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync route hash with active tab in Superadmin portal
  const handleNavClick = (tabKey: string, subRouteSlug: string) => {
    setActiveTab(tabKey);
    setIsMobileSidebarOpen(false);
    window.location.hash = `/superadmin/${subRouteSlug}`;
  };

  const navMenuItems = [
    {
      id: 'overview',
      subRoute: 'dashboard',
      labelNepali: 'केन्द्रीय ड्यासबोर्ड',
      labelEnglish: 'Dashboard Overview',
      icon: LayoutDashboard
    },
    {
      id: 'role_magic_links',
      subRoute: 'magic-links',
      labelNepali: 'सक्रिय लिङ्क जेनेरेटर',
      labelEnglish: 'Active Links (POS & Store)',
      icon: Key
    },
    {
      id: 'store_pos',
      subRoute: 'store-pos',
      labelNepali: 'स्टोर एडमिन तथा POS काउन्टर',
      labelEnglish: 'Store Admin & POS Terminal',
      icon: ShoppingBag
    },
    {
      id: 'user_list',
      subRoute: 'users',
      labelNepali: 'प्रयोगकर्ता व्यवस्थापन',
      labelEnglish: 'User Management',
      icon: Users
    },
    {
      id: 'menu_switchboard',
      subRoute: 'access-control',
      labelNepali: 'मेनु तथा सेवा स्विचबोर्ड',
      labelEnglish: 'Menu & Access Control',
      icon: Sliders
    },
    {
      id: 'client_approvals',
      subRoute: 'payments',
      labelNepali: 'भुक्तानी तथा खरिद रुजु',
      labelEnglish: 'Payment Approvals (eSewa)',
      icon: CreditCard
    },
    {
      id: 'service_licenses',
      subRoute: 'subscriptions',
      labelNepali: 'सदस्यता तथा लाइसेन्स',
      labelEnglish: 'Subscriptions & Trials',
      icon: Crown
    },
    {
      id: 'samachar_editor',
      subRoute: 'content',
      labelNepali: 'समाचार तथा राशिफल',
      labelEnglish: 'Content & News Editor',
      icon: Newspaper
    },
    {
      id: 'software_releases',
      subRoute: 'software',
      labelNepali: 'सफ्टवेयर रिलिज अपलोड',
      labelEnglish: 'Software & Installers',
      icon: Download
    },
    {
      id: 'security_audit',
      subRoute: 'audit-logs',
      labelNepali: 'प्रशासनिक अडिट लग',
      labelEnglish: 'Audit Logs & Security',
      icon: FileText
    },
    {
      id: 'settings',
      subRoute: 'settings',
      labelNepali: 'प्रणाली सेटिङ',
      labelEnglish: 'System Settings',
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-[#0C0A09] text-stone-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* ── TOP SUPER ADMIN APP BAR ── */}
      <header className="sticky top-0 z-40 bg-stone-950/90 border-b border-stone-800/80 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 cursor-pointer"
            aria-label="Toggle Portal Menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-md font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base font-serif text-amber-300 tracking-wider">
                  BRIHAT JYOTISH SUPER ADMIN
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  Isolated Portal
                </span>
              </div>
              <p className="text-[10px] text-stone-400 hidden sm:block">
                केन्द्रीय नियन्त्रण, प्रयोगकर्ता व्यवस्थापन र मुख्य सफ्टवेयर गभर्नेन्स
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick link to client software */}
          <button
            type="button"
            onClick={onNavigateToClientSoftware}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-300 hover:text-amber-300 text-xs font-semibold cursor-pointer transition-colors"
            title="मुख्य सफ्टवेयर इन्टरफेस खोल्नुहोस् (Main Public Software)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">मुख्य सफ्टवेयर हेर्नुहोस्</span>
            <span className="sm:hidden">सफ्टवेयर</span>
          </button>

          {/* Admin User Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
            <div className="text-right hidden sm:block leading-tight">
              <span className="text-xs font-bold text-stone-200 block truncate max-w-[120px]">
                {session.fullName}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                @{session.username}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 hover:text-red-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="सुपरएडमिन सत्र बन्द गर्नुहोस् (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">लगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── PORTAL BODY WITH SIDEBAR AND MAIN CONTENT ── */}
      <div className="flex-1 flex min-h-0">
        {/* Dedicated Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-stone-950 border-r border-stone-800/80 p-3 shrink-0">
          <div className="space-y-1 py-1">
            <div className="px-3 py-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              प्रशासनिक मेनुहरू
            </div>
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id, item.subRoute)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-black'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-stone-950' : 'text-amber-500'}`} />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate">{item.labelNepali}</span>
                    <span className={`text-[10px] block truncate font-normal ${isSelected ? 'text-stone-900' : 'text-stone-500'}`}>
                      {item.labelEnglish}
                    </span>
                  </div>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-950" />}
                </button>
              );
            })}
          </div>

          {/* Sidebar Status Footer */}
          <div className="mt-auto pt-3 border-t border-stone-900 p-2 text-[11px] text-stone-500">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>प्रणाली सक्रिय (Online)</span>
            </div>
            <span>सफ्टवेयर भर्सन १.०.६</span>
          </div>
        </aside>

        {/* Mobile Drawer Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-stone-950 border-r border-stone-800 p-4 flex flex-col z-10">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <span className="font-bold text-sm text-amber-300 font-serif">सुपरएडमिन मेनु</span>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2 space-y-1">
                {navMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id, item.subRoute)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'text-stone-300 hover:bg-stone-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-amber-400" />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate">{item.labelNepali}</span>
                        <span className="text-[10px] block truncate text-stone-500 font-normal">
                          {item.labelEnglish}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-stone-900">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-2.5 rounded-xl bg-red-950 text-red-300 border border-red-800 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>लगआउट</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT WORKSPACE (Totally isolated full-page workstation) ── */}
        <main className="flex-1 bg-[#0F0D0B] overflow-y-auto min-h-0 flex flex-col">
          <SuperAdminControlCenter
            session={session}
            initialTab={activeTab}
            isDirectFullPage={true}
            hideHeader={true}
            profiles={profiles}
            todayPanchanga={todayPanchanga}
            orgProfile={orgProfile}
            transitPlanets={transitPlanets}
            onClose={onNavigateToClientSoftware}
            onNavigateApp={(tab) => {
              if (tab === 'dashboard' || tab === 'home') {
                onNavigateToClientSoftware();
              } else {
                setActiveTab(tab);
                const item = navMenuItems.find(i => i.id === tab || i.subRoute === tab);
                if (item) {
                  window.location.hash = `/superadmin/${item.subRoute}`;
                }
              }
            }}
          />
        </main>
      </div>
    </div>
  );
};
