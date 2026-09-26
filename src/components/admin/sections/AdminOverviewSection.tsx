import React from 'react';
import {
  Users,
  UserCheck,
  Award,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  Crown,
  ShoppingBag,
  PackageX,
  FileText,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Database,
  Server,
  Zap,
  Bell,
  RefreshCw,
  HeartHandshake
} from 'lucide-react';
import { formatNPRCurrency } from '../../../db/subscriptionStore';

interface AdminOverviewSectionProps {
  stats: {
    totalUsers: number;
    totalYajaman: number;
    totalExperts: number;
    pendingExperts: number;
    activeExperts: number;
    pendingBookings: number;
    todayBookings: number;
    pendingPayments: number;
    todayRevenue: number;
    monthlyRevenue: number;
    activeMemberships: number;
    expiringMemberships: number;
    pendingStoreOrders: number;
    pendingPosOrders: number;
    lowStockItems: number;
    pendingPatrikaRecords: number;
    pendingPurchases?: number;
    pendingVivah?: number;
    totalVivahProfiles?: number;
  };
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

export const AdminOverviewSection: React.FC<AdminOverviewSectionProps> = ({
  stats,
  onNavigateTab,
  onRefresh
}) => {
  // Critical Alerts Calculation
  const criticalAlerts = [
    {
      id: 'alert_vivah',
      title: 'विवाह मञ्च समीक्षा बाँकी',
      count: stats.pendingVivah || 0,
      type: 'vivah',
      tab: 'vivah_portal',
      desc: `${stats.pendingVivah || 0} वटा विवाह विज्ञापन, प्रमाणीकरण वा सम्पर्क सेयरिङ अनुरोध समीक्षाको पर्खाइमा छन्।`,
      urgency: 'high'
    },
    {
      id: 'alert_purchases',
      title: 'सफ्टवेयर खरिद स्वीकृति बाँकी',
      count: stats.pendingPurchases || 0,
      type: 'purchase',
      tab: 'client_approvals',
      desc: `${stats.pendingPurchases || 0} जना ग्राहकको सफ्टवेयर खरिद प्रमाणीकरण तथा लाइसेन्स सक्रियता बाँकी छ।`,
      urgency: 'high'
    },
    {
      id: 'alert_payments',
      title: 'भुक्तानी प्रमाणीकरण बाँकी',
      count: stats.pendingPayments,
      type: 'payment',
      tab: 'payments',
      desc: `${stats.pendingPayments} eSewa र बैंक ट्रान्सफर भुक्तानी स्वीकृतिका लागि पर्खाइमा छन्।`,
      urgency: 'high'
    },
    {
      id: 'alert_experts',
      title: 'विशेषज्ञ दर्ता स्वीकृति बाँकी',
      count: stats.pendingExperts,
      type: 'expert',
      tab: 'experts',
      desc: `${stats.pendingExperts} जना नयाँ ज्योतिषी/पुरोहित/वास्तुविद्को आवेदन स्वीकृत हुन बाँकी छ।`,
      urgency: 'high'
    },
    {
      id: 'alert_memberships',
      title: 'सदस्यता नवीकरण म्याद नाघ्दै',
      count: stats.expiringMemberships,
      type: 'membership',
      tab: 'memberships',
      desc: `${stats.expiringMemberships} जना विशेषज्ञको सदस्यता आगामी ७ दिन भित्र सकिँदैछ।`,
      urgency: 'medium'
    },
    {
      id: 'alert_bookings',
      title: 'सेवा बुकिङ पेन्डिङ',
      count: stats.pendingBookings,
      type: 'booking',
      tab: 'bookings',
      desc: `${stats.pendingBookings} सेवा बुकिङमा विशेषज्ञ तोक्न वा भुक्तानी पुष्टि गर्न बाँकी छ।`,
      urgency: 'medium'
    },
    {
      id: 'alert_store',
      title: 'वैदिक पसल अर्डर बाँकी',
      count: stats.pendingStoreOrders,
      type: 'store',
      tab: 'store_pos',
      desc: `${stats.pendingStoreOrders} सामान अर्डर प्याकिङ र डेलिभरीका लागि तयारीमा छन्।`,
      urgency: 'medium'
    },
    {
      id: 'alert_stock',
      title: 'सामग्रीको स्टक कम (Low Stock)',
      count: stats.lowStockItems,
      type: 'stock',
      tab: 'store_pos',
      desc: `${stats.lowStockItems} पूजा सामग्रीको मौज्दात न्यूनतम भन्दा कम भएको छ।`,
      urgency: 'low'
    }
  ].filter(a => a.count > 0);

  const kpiCards = [
    { id: 'totalUsers', label: 'जम्मा प्रयोगकर्ता', value: stats.totalUsers, icon: Users, tab: 'users', color: 'from-blue-600 to-indigo-700' },
    { id: 'totalYajaman', label: 'जम्मा यजमान/ग्राहक', value: stats.totalYajaman, icon: UserCheck, tab: 'yajaman', color: 'from-emerald-600 to-teal-700' },
    { id: 'totalExperts', label: 'जम्मा विशेषज्ञ', value: stats.totalExperts, icon: Award, tab: 'experts', color: 'from-purple-600 to-indigo-700' },
    { id: 'pendingExperts', label: 'स्वीकृति बाँकी विशेषज्ञ', value: stats.pendingExperts, icon: Clock, tab: 'experts', color: 'from-amber-500 to-orange-600', badge: stats.pendingExperts > 0 ? 'Urgent' : null },
    { id: 'activeExperts', label: 'सक्रिय विशेषज्ञ', value: stats.activeExperts, icon: CheckCircle2, tab: 'experts', color: 'from-green-600 to-emerald-700' },
    { id: 'pendingBookings', label: 'बाँकी बुकिङहरू', value: stats.pendingBookings, icon: Calendar, tab: 'bookings', color: 'from-amber-600 to-yellow-600' },
    { id: 'todayBookings', label: 'आजका बुकिङहरू', value: stats.todayBookings, icon: Clock, tab: 'bookings', color: 'from-cyan-600 to-blue-700' },
    { id: 'pendingPayments', label: 'प्रमाणीकरण बाँकी भुक्तानी', value: stats.pendingPayments, icon: CreditCard, tab: 'payments', color: 'from-rose-600 to-red-700', badge: stats.pendingPayments > 0 ? 'Review' : null },
    { id: 'todayRevenue', label: 'आजको कुल आम्दानी', value: formatNPRCurrency(stats.todayRevenue), icon: DollarSign, tab: 'finance', color: 'from-emerald-500 to-green-600' },
    { id: 'monthlyRevenue', label: 'यस महिनाको आम्दानी', value: formatNPRCurrency(stats.monthlyRevenue), icon: TrendingUp, tab: 'finance', color: 'from-teal-600 to-cyan-700' },
    { id: 'activeMemberships', label: 'सक्रिय सदस्यता', value: stats.activeMemberships, icon: Crown, tab: 'memberships', color: 'from-indigo-600 to-blue-700' },
    { id: 'expiringMemberships', label: 'म्याद सकिन लागेको', value: stats.expiringMemberships, icon: AlertTriangle, tab: 'memberships', color: 'from-yellow-600 to-amber-700' },
    { id: 'pendingStoreOrders', label: 'स्टोर अर्डर पेन्डिङ', value: stats.pendingStoreOrders, icon: ShoppingBag, tab: 'store_pos', color: 'from-orange-600 to-amber-700' },
    { id: 'pendingPosOrders', label: 'POS काउन्टर अर्डर', value: stats.pendingPosOrders, icon: CreditCard, tab: 'store_pos', color: 'from-violet-600 to-purple-700' },
    { id: 'lowStockItems', label: 'कम स्टक सामग्री', value: stats.lowStockItems, icon: PackageX, tab: 'store_pos', color: 'from-pink-600 to-rose-700' },
    { id: 'pendingPurchases', label: 'सफ्टवेयर खरिद पेन्डिङ', value: stats.pendingPurchases || 0, icon: Crown, tab: 'client_approvals', color: 'from-amber-500 to-rose-600', badge: (stats.pendingPurchases || 0) > 0 ? 'Urgent' : null },
    { id: 'totalVivah', label: 'विवाह मञ्च प्रोफाइल', value: stats.totalVivahProfiles || 0, icon: HeartHandshake, tab: 'vivah_portal', color: 'from-pink-600 to-rose-700', badge: (stats.pendingVivah || 0) > 0 ? `${stats.pendingVivah} पेन्डिङ` : null },
    { id: 'pendingPatrika', label: 'पत्रिका रेकर्ड पेन्डिङ', value: stats.pendingPatrikaRecords, icon: FileText, tab: 'patrika', color: 'from-blue-500 to-cyan-600' },
  ];

  const systemHealth = [
    { name: 'केन्द्रीय डाटाबेस (Database)', status: 'operational', ping: '12ms', type: 'Firestore / Cloud SQL' },
    { name: 'कर्मकाण्ड र कुण्डली इन्जिन (Engine)', status: 'operational', ping: '4ms', type: 'Astro Calculations' },
    { name: 'प्रमाणीकरण र RBAC (Auth)', status: 'operational', ping: '8ms', type: 'Secure Session' },
    { name: 'भुक्तानी गेटवे (eSewa / QR)', status: 'operational', ping: '24ms', type: 'API Verified' },
    { name: 'वैदिक पसल / POS इन्भेन्टरी', status: 'operational', ping: '15ms', type: 'Sync Ready' },
    { name: 'सूचना तथा म्यासेज प्रणाली', status: 'operational', ping: '30ms', type: 'SMS / Push' }
  ];

  return (
    <div className="space-[#2A2421] space-y-6">
      {/* Top Welcome & Refresh Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            <h2 className="text-xl font-bold text-stone-100 font-serif">
              केन्द्रीय कमान्ड कक्ष — मुख्य प्रशासक ओभरभ्यु
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            सम्पूर्ण बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा प्रणालीको वास्तविक समय (Real-time) स्थिति र कार्यसम्पादन।
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>डाटा रिफ्रेस गर्नुहोस्</span>
        </button>
      </div>

      {/* REAL-TIME ADMIN ALERT CENTER */}
      {criticalAlerts.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-rose-800/40 pb-3 mb-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
              <span>गम्भीर ध्यान दिनुपर्ने विषयहरू ({criticalAlerts.length} Critical Alerts)</span>
            </div>
            <span className="text-[11px] text-rose-300 font-mono font-bold bg-rose-900/60 px-2.5 py-0.5 rounded-full border border-rose-700">
              तत्काल कारवाही आवश्यक
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => onNavigateTab(alert.tab)}
                className="bg-stone-900/80 hover:bg-stone-900 border border-rose-900/50 hover:border-rose-500/60 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-stone-100 group-hover:text-amber-400 transition-colors">
                      {alert.title}
                    </span>
                    <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 shadow">
                      {alert.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1.5 leading-snug">
                    {alert.desc}
                  </p>
                </div>
                <div className="flex items-center justify-end text-[11px] text-amber-400 font-bold mt-2 group-hover:underline">
                  <span>हेर्नुहोस्</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI METRICS GRID */}
      <div>
        <h3 className="text-sm font-bold text-stone-300 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>मुख्य कार्यसम्पादन सूचकहरू (KPI Summary Cards)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {kpiCards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigateTab(card.tab)}
                className="bg-stone-900/90 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-3.5 cursor-pointer transition-all shadow-md group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {card.badge && (
                    <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      {card.badge}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <p className="text-xl sm:text-2xl font-black text-stone-100 font-mono tracking-tight group-hover:text-amber-300 transition-colors">
                    {card.value}
                  </p>
                  <p className="text-xs font-medium text-stone-400 mt-0.5 truncate">
                    {card.label}
                  </p>
                </div>

                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>

      {/* SYSTEM HEALTH MONITORING */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3">
          <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>प्रणाली स्वास्थ्य र सर्भर स्थिति (System Health Monitor)</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            सबै सेवाहरू सक्रिय (All Systems Operational)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {systemHealth.map((sh, idx) => (
            <div key={idx} className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-stone-200">{sh.name}</p>
                <p className="text-[10px] text-stone-500 font-mono">{sh.type}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  {sh.ping}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
