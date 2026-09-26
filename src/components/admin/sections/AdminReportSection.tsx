import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  FileText,
  Calendar,
  Filter,
  DollarSign,
  Users,
  Award,
  Printer,
  Smartphone,
  Monitor,
  Crown,
  CheckCircle2,
  Clock,
  Zap,
  ArrowDownToLine
} from 'lucide-react';
import { getVisitorAnalytics, exportVisitorsToCSV } from '../../../db/visitorAnalyticsStore';
import { getStoredRBACUsers, exportMembersToCSV } from '../../../db/rbacStore';
import { getStoredClientLeads, exportClientsToCSV } from '../../../db/clientLeadStore';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';

export const AdminReportSection: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'visitors' | 'members' | 'clients'>('clients');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const visitorAnalytics = getVisitorAnalytics();
  const members = getStoredRBACUsers();
  const clientLeads = getStoredClientLeads();

  const approvedClientsCount = clientLeads.filter((l) => l.status === 'PURCHASE_APPROVED').length;
  const pendingPurchasesCount = clientLeads.filter((l) => l.status === 'PURCHASE_PENDING').length;
  const activeTrialsCount = clientLeads.filter((l) => l.status === 'TRIAL_ACTIVE').length;

  const downloadFile = (content: string, fileName: string, mime: string = 'text/csv;charset=utf-8;') => {
    const blob = new Blob(['\uFEFF' + content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccessMsg(`${fileName} सफलतापूर्वक डाउनलोड भयो!`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handleExportCSV = (type: 'visitors' | 'members' | 'clients') => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (type === 'visitors') {
      const csv = exportVisitorsToCSV();
      downloadFile(csv, `Balananda_Visitors_Report_${todayStr}.csv`);
    } else if (type === 'members') {
      const csv = exportMembersToCSV();
      downloadFile(csv, `Balananda_Registered_Members_${todayStr}.csv`);
    } else {
      const csv = exportClientsToCSV();
      downloadFile(csv, `Balananda_Clients_and_Licenses_${todayStr}.csv`);
    }
  };

  const handlePrintPDF = (type: 'visitors' | 'members' | 'clients') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('कृपया ब्राउजरको Pop-up खोल्न अनुमति दिनुहोस्।');
      return;
    }

    const title =
      type === 'visitors'
        ? 'सामान्य आगन्तुक प्रतिवेदन (Visitor Analytics Report)'
        : type === 'members'
        ? 'दर्ता भएका सदस्यहरूको प्रतिवेदन (Registered Members Report)'
        : 'सफ्टवेयर खरिद गरेका क्लाइन्टहरूको प्रतिवेदन (Purchased Clients & Licenses Report)';

    let tableHtml = '';
    if (type === 'visitors') {
      tableHtml = `
        <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead style="background:#f2f2f2;">
            <tr><th>क्र.सं.</th><th>Visitor ID</th><th>Platform</th><th>Browser</th><th>Date (BS)</th><th>Page</th></tr>
          </thead>
          <tbody>
            ${visitorAnalytics.recentLogs.map((l, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${l.visitorId}</td>
                <td>${l.platform}</td>
                <td>${l.browser}</td>
                <td>${l.visitedAtBS}</td>
                <td>${l.page}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'members') {
      tableHtml = `
        <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead style="background:#f2f2f2;">
            <tr><th>क्र.सं.</th><th>नाम</th><th>फोन / प्रयोगकर्ता</th><th>इमेल</th><th>भूमिका</th><th>ठेगाना</th><th>दर्ता मिति</th></tr>
          </thead>
          <tbody>
            ${members.map((m, i) => {
              const addr = m.savedAddresses?.[0] ? `${m.savedAddresses[0].district}, ${m.savedAddresses[0].localLevel}` : '-';
              return `
                <tr>
                  <td>${i + 1}</td>
                  <td><b>${m.fullName}</b></td>
                  <td>${m.phone || m.username}</td>
                  <td>${m.email || '-'}</td>
                  <td>${m.roleNameNepali}</td>
                  <td>${addr}</td>
                  <td>${m.createdAtBS}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else {
      tableHtml = `
        <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead style="background:#f2f2f2;">
            <tr><th>क्र.सं.</th><th>क्लाइन्ट नाम</th><th>मोबाइल / ह्वाट्सएप</th><th>ठेगाना</th><th>योजना (Plan)</th><th>रकम</th><th>स्थिति</th><th>कारोबार ID</th><th>स्वीकृत मिति</th></tr>
          </thead>
          <tbody>
            ${clientLeads.map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><b>${c.fullName}</b></td>
                <td>${c.mobile} / ${c.whatsapp}</td>
                <td>${c.address}</td>
                <td>${c.planNameNepali || '-'}</td>
                <td>रु. ${c.planAmountNPR || 0}</td>
                <td><b>${c.status === 'PURCHASE_APPROVED' ? 'स्वीकृत' : c.status === 'PURCHASE_PENDING' ? 'स्वीकृति बाँकी' : c.status}</b></td>
                <td>${c.transactionId || '-'}</td>
                <td>${c.approvedAtBS || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; margin: 20px; color: #222; }
            h2, h3, p { margin: 4px 0; }
            .header { text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 12px; margin-bottom: 20px; }
            .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>॥ बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा ॥</h2>
            <p>काठमाडौँ, नेपाल • फोन: +९७७-९७६४४००५३३ • Email: suwashdmk@gmail.com</p>
            <h3>${title}</h3>
            <p style="font-size:12px; color:#666;">प्रतिवेदन मिति: ${new Date().toLocaleDateString()} (${type.toUpperCase()})</p>
          </div>
          <div class="no-print" style="margin-bottom:15px; text-align:right;">
            <button onclick="window.print()" style="padding:8px 16px; background:#059669; color:#fff; font-weight:bold; border:none; border-radius:8px; cursor:pointer;">🖨️ प्रिन्ट / PDF सेभ गर्नुहोस्</button>
          </div>
          ${tableHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-stone-900 border border-stone-800 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>आगन्तुक, सदस्य तथा क्लाइन्ट प्रतिवेदन केन्द्र (Excel / PDF Exports)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            सामान्य आगन्तुकहरूको संख्या, दर्ता भएका सदस्यहरूको विवरण र खरिद गरेका क्लाइन्टहरूको सम्पूर्ण तथ्यांक।
          </p>
        </div>

        {downloadSuccessMsg && (
          <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl animate-bounce">
            ✓ {downloadSuccessMsg}
          </div>
        )}
      </div>

      {/* 3 Core Metric & Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* १. सामान्य आगन्तुक (Visitors) */}
        <div className="bg-stone-900 border border-stone-800 p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-blue-500/15 text-blue-400 font-bold text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>सामान्य आगन्तुक</span>
              </span>
              <span className="text-[10px] font-mono bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full">
                अद्यावधिक
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-100">
                {toDevanagariNumerals(visitorAnalytics.totalUniqueVisitors)}
              </div>
              <div className="text-xs text-stone-400 mt-0.5">
                कुल अद्वितीय आगन्तुक (कुल भिजिट: {toDevanagariNumerals(visitorAnalytics.totalPageViews)})
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span>आज: <b className="text-stone-200">{toDevanagariNumerals(visitorAnalytics.todayCount)}</b></span>
              <span>मोबाइल: <b className="text-stone-200">{toDevanagariNumerals(visitorAnalytics.mobileCount)}</b></span>
              <span>डेस्कटप: <b className="text-stone-200">{toDevanagariNumerals(visitorAnalytics.desktopCount)}</b></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => handleExportCSV('visitors')}
              className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel/CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrintPDF('visitors')}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>PDF छाप्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* २. दर्ता सदस्यहरू (Members) */}
        <div className="bg-stone-900 border border-stone-800 p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>दर्ता सदस्यहरू (Members)</span>
              </span>
              <span className="text-[10px] font-mono bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full">
                साइन अप
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-100">
                {toDevanagariNumerals(members.length)}
              </div>
              <div className="text-xs text-stone-400 mt-0.5">
                कुल साइन अप गरेका सदस्यहरू
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span>सक्रिय: <b className="text-emerald-400">{toDevanagariNumerals(members.filter(m => m.status === 'active').length)}</b></span>
              <span>ठेगाना सहित: <b className="text-stone-200">{toDevanagariNumerals(members.filter(m => (m.savedAddresses?.length || 0) > 0).length)}</b></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => handleExportCSV('members')}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel/CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrintPDF('members')}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF छाप्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* ३. अधिकृत क्लाइन्ट (Clients) */}
        <div className="bg-stone-900 border border-amber-500/40 p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:border-amber-500 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>खरिद क्लाइन्ट (Clients)</span>
              </span>
              <span className="text-[10px] font-mono bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full">
                • One Year / Life
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {toDevanagariNumerals(approvedClientsCount)}
              </div>
              <div className="text-xs text-stone-400 mt-0.5">
                स्वीकृत पूर्ण क्लाइन्टहरू (पेन्डिङ: {toDevanagariNumerals(pendingPurchasesCount)})
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span>२४ घण्टे ट्रायल: <b className="text-teal-400">{toDevanagariNumerals(activeTrialsCount)}</b></span>
              <span>कुल दर्ता: <b className="text-stone-200">{toDevanagariNumerals(clientLeads.length)}</b></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => handleExportCSV('clients')}
              className="py-2 px-3 bg-[#D97706] hover:bg-[#b45309] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel/CSV</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrintPDF('clients')}
              className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>PDF छाप्नुहोस्</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabbed Detailed Table Preview */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedReport('clients')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedReport === 'clients'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              सफ्टवेयर क्लाइन्ट सूची ({clientLeads.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedReport('members')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedReport === 'members'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              दर्ता सदस्य सूची ({members.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedReport('visitors')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedReport === 'visitors'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              हालैका आगन्तुक लग ({visitorAnalytics.recentLogs.length})
            </button>
          </div>
        </div>

        {/* Clients Table */}
        {selectedReport === 'clients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-800/80 text-stone-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">क्र.सं.</th>
                  <th className="p-2.5">क्लाइन्ट नाम</th>
                  <th className="p-2.5">मोबाइल / ह्वाट्सएप</th>
                  <th className="p-2.5">ठेगाना</th>
                  <th className="p-2.5">योजना</th>
                  <th className="p-2.5">रकम</th>
                  <th className="p-2.5">कारोबार कोड</th>
                  <th className="p-2.5">स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {clientLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-stone-500">
                      हालसम्म कुनै खरिद आवेदन छैन।
                    </td>
                  </tr>
                ) : (
                  clientLeads.map((c, i) => (
                    <tr key={c.id} className="hover:bg-stone-800/50">
                      <td className="p-2.5">{i + 1}</td>
                      <td className="p-2.5 font-bold text-stone-100">{c.fullName}</td>
                      <td className="p-2.5">{c.mobile} / {c.whatsapp}</td>
                      <td className="p-2.5">{c.address}</td>
                      <td className="p-2.5 font-semibold text-amber-300">{c.planNameNepali || '-'}</td>
                      <td className="p-2.5 font-mono">रु. {c.planAmountNPR || 0}</td>
                      <td className="p-2.5 font-mono">{c.transactionId || '-'}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'PURCHASE_APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : c.status === 'PURCHASE_PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {c.status === 'PURCHASE_APPROVED'
                            ? 'स्वीकृत'
                            : c.status === 'PURCHASE_PENDING'
                            ? 'स्वीकृति बाँकी'
                            : c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Members Table */}
        {selectedReport === 'members' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-800/80 text-stone-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">क्र.सं.</th>
                  <th className="p-2.5">पूरा नाम</th>
                  <th className="p-2.5">फोन / युजरनेम</th>
                  <th className="p-2.5">इमेल</th>
                  <th className="p-2.5">भूमिका</th>
                  <th className="p-2.5">ठेगाना</th>
                  <th className="p-2.5">दर्ता मिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {members.map((m, i) => (
                  <tr key={m.id} className="hover:bg-stone-800/50">
                    <td className="p-2.5">{i + 1}</td>
                    <td className="p-2.5 font-bold text-stone-100">{m.fullName}</td>
                    <td className="p-2.5">{m.phone || m.username}</td>
                    <td className="p-2.5">{m.email || '-'}</td>
                    <td className="p-2.5">{m.roleNameNepali}</td>
                    <td className="p-2.5">
                      {m.savedAddresses?.[0]
                        ? `${m.savedAddresses[0].district}, ${m.savedAddresses[0].localLevel}`
                        : '-'}
                    </td>
                    <td className="p-2.5 font-mono">{m.createdAtBS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Visitors Table */}
        {selectedReport === 'visitors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-800/80 text-stone-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">क्र.सं.</th>
                  <th className="p-2.5">Visitor ID</th>
                  <th className="p-2.5">Platform</th>
                  <th className="p-2.5">Browser</th>
                  <th className="p-2.5">Visited Date (BS)</th>
                  <th className="p-2.5">Visited Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {visitorAnalytics.recentLogs.slice(0, 50).map((l, i) => (
                  <tr key={l.id} className="hover:bg-stone-800/50">
                    <td className="p-2.5">{i + 1}</td>
                    <td className="p-2.5 font-mono text-[11px] text-blue-300">{l.visitorId}</td>
                    <td className="p-2.5 capitalize">{l.platform}</td>
                    <td className="p-2.5">{l.browser}</td>
                    <td className="p-2.5 font-mono">{l.visitedAtBS}</td>
                    <td className="p-2.5">{l.page}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
