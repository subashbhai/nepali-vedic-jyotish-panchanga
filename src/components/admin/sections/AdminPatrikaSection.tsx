import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Printer,
  Eye,
  Calendar,
  Sparkles,
  Download,
  Filter,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  User,
  Users,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { BirthDetails, Gender } from '../../../types/astrology';
import { 
  getStoredProfiles, 
  editProfile, 
  deleteProfile, 
  exportProfilesToCSV 
} from '../../../db/profileStore';
import { logAdminAction } from '../../../db/adminStore';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';

interface AdminPatrikaSectionProps {
  onRefresh?: () => void;
}

export const AdminPatrikaSection: React.FC<AdminPatrikaSectionProps> = ({ onRefresh }) => {
  const [profiles, setProfiles] = useState<BirthDetails[]>(() => getStoredProfiles());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Modal States
  const [viewingProfile, setViewingProfile] = useState<BirthDetails | null>(null);
  const [editingProfile, setEditingProfile] = useState<BirthDetails | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<BirthDetails | null>(null);

  // Edit Form Fields
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<Gender>('male');
  const [editDateBS, setEditDateBS] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocationName, setEditLocationName] = useState('');

  const refreshData = () => {
    setProfiles(getStoredProfiles());
    onRefresh?.();
  };

  // Distinct clients list
  const distinctClients = useMemo(() => {
    const map = new Map<string, { id: string; count: number }>();
    profiles.forEach((p) => {
      const cid = p.clientId || (p.id?.startsWith('sample_') ? 'system_sample' : 'client_legacy');
      const existing = map.get(cid) || { id: cid, count: 0 };
      existing.count += 1;
      map.set(cid, existing);
    });
    return Array.from(map.values());
  }, [profiles]);

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // 1. Client filter
      if (selectedClientFilter !== 'all') {
        const cid = p.clientId || (p.id?.startsWith('sample_') ? 'system_sample' : 'client_legacy');
        if (selectedClientFilter === 'system_sample') {
          if (!p.id?.startsWith('sample_')) return false;
        } else if (cid !== selectedClientFilter) {
          return false;
        }
      }

      // 2. Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.customerId && p.customerId.toLowerCase().includes(q)) ||
        (p.dateBS && p.dateBS.includes(q)) ||
        (p.location?.name && p.location.name.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    });
  }, [profiles, selectedClientFilter, searchQuery]);

  // Handle Edit Click
  const handleOpenEdit = (profile: BirthDetails) => {
    setEditingProfile(profile);
    setEditName(profile.name || '');
    setEditGender(profile.gender || 'male');
    setEditDateBS(profile.dateBS || '');
    setEditTime(profile.time || '');
    setEditLocationName(profile.location?.name || '');
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    const updated: BirthDetails = {
      ...editingProfile,
      name: editName.trim(),
      gender: editGender,
      dateBS: editDateBS.trim(),
      time: editTime.trim(),
      location: {
        ...editingProfile.location,
        name: editLocationName.trim()
      }
    };

    editProfile(updated);
    logAdminAction('admin', 'Super Admin', 'system', 'कुण्डली सम्पादन', updated.id || '', updated.name, 'SuperAdmin ले कुण्डली सम्पादन गर्नुभयो।');
    refreshData();
    setEditingProfile(null);
    setStatusFeedback(`${updated.name} को कुण्डली सफलतापूर्वक अध्यावधिक गरियो!`);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingProfile) return;
    deleteProfile(deletingProfile.id || '');
    logAdminAction('admin', 'Super Admin', 'system', 'कुण्डली मेटाइयो', deletingProfile.id || '', deletingProfile.name, 'SuperAdmin ले कुण्डली हटाउनुभयो।');
    refreshData();
    setDeletingProfile(null);
    setStatusFeedback(`${deletingProfile.name} को कुण्डली सफलतापूर्वक हटाइयो।`);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Export CSV
  const handleDownloadCSV = () => {
    const csv = exportProfilesToCSV(filteredProfiles);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Balananda_All_Kundalis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusFeedback('कुण्डली प्रतिवेदन CSV फाइल सफलतापूर्वक डाउनलोड भयो!');
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Print PDF Window
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('कृपया ब्राउजरको Pop-up खोल्न अनुमति दिनुहोस्।');
      return;
    }

    const rows = filteredProfiles
      .map(
        (p, idx) => `
        <tr>
          <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
          <td style="padding: 6px; border: 1px solid #ddd; font-weight: bold;">${p.name}</td>
          <td style="padding: 6px; border: 1px solid #ddd;">${p.customerId || p.id}</td>
          <td style="padding: 6px; border: 1px solid #ddd;">${p.dateBS || p.dateAD || ''} (${p.time || ''})</td>
          <td style="padding: 6px; border: 1px solid #ddd;">${p.location?.name || ''}</td>
          <td style="padding: 6px; border: 1px solid #ddd;">${p.clientId || 'System/Legacy'}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>केन्द्रीय कुण्डली प्रतिवेदन - बालानन्द वैदिक ज्योतिष</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #1a1a1a; }
          h2 { color: #7A1C1C; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
          th { background: #f5eedc; border: 1px solid #ddd; padding: 8px; font-weight: bold; }
          .footer { margin-top: 24px; font-size: 10px; color: #777; border-top: 1px solid #eee; padding-top: 8px; }
        </style>
      </head>
      <body>
        <h2>🚩 बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा</h2>
        <p style="font-size: 12px; margin: 0; color: #555;">केन्द्रीय कुण्डली, चीना तथा जन्म विवरण प्रतिवेदन (SuperAdmin Data Inspector)</p>
        <p style="font-size: 11px; color: #888;">कुल कुण्डली संख्या: ${filteredProfiles.length} • मिति: ${new Date().toLocaleDateString('ne-NP')}</p>
        <table>
          <thead>
            <tr>
              <th>क्र.सं.</th>
              <th>जातकको नाम</th>
              <th>ग्राहक कोड / ID</th>
              <th>जन्म मिति र समय</th>
              <th>जन्म स्थान</th>
              <th>तयार गर्ने क्लाइन्ट/ज्योतिषी</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="footer">
          प्रणाली: बालानन्द वैदिक ज्योतिष बहु-ग्राहक डाटा सुरक्षा प्रणाली • प्रतिवेदन निर्माण मिति: ${new Date().toLocaleString('ne-NP')}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              केन्द्रीय डाटा इन्स्पेक्टर (Multi-Tenant Inspector)
            </span>
            <span className="text-xs text-stone-400">
              कुल कुण्डली: <strong>{toDevanagariNumerals(profiles.length)}</strong>
            </span>
          </div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>केन्द्रीय कुण्डली, चीना तथा पत्रिका व्यवस्थापन (Kundali & Patrika Records)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            सबै क्लाइन्ट तथा सदस्यहरूले बनाएका जन्मकुण्डली, चीना तथा जन्म विवरणहरूको केन्द्रीय निरीक्षण, सम्पादन र प्रतिवेदन।
          </p>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Excel (.csv) ढाँचामा डाउनलोड गर्नुहोस्"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel (.csv) डाउनलोड</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="A4 साइजमा प्रिन्ट / PDF प्रतिवेदन"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 PDF / प्रिन्ट</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {statusFeedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
          <button onClick={() => setStatusFeedback(null)} className="text-stone-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FILTERS & SEARCH CONTROLS */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="जातकको नाम, ग्राहक ID, मिति वा स्थान खोज्नुहोस्..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-200 focus:outline-hidden focus:border-amber-500 placeholder:text-stone-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Client-wise Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <span className="text-xs text-stone-400 font-semibold">क्लाइन्ट/ज्योतिषी:</span>
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="all">सबै कुण्डलीहरू ({profiles.length})</option>
              <option value="system_sample">नमुना कुण्डलीहरू (Sample Kundalis)</option>
              {distinctClients
                .filter((c) => c.id !== 'system_sample')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    क्लाइन्ट: {c.id} ({c.count} कुण्डली)
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-800/80 text-xs text-stone-400 flex-wrap">
          <span className="font-semibold text-stone-500">द्रुत छनोट:</span>
          <button
            onClick={() => setSelectedClientFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedClientFilter === 'all'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800'
            }`}
          >
            सबै ({toDevanagariNumerals(profiles.length)})
          </button>
          <button
            onClick={() => setSelectedClientFilter('system_sample')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedClientFilter === 'system_sample'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800'
            }`}
          >
            नमुना कुण्डली मात्र
          </button>
          <span className="ml-auto text-[11px] text-stone-500">
            फेला परेको संख्या: <strong className="text-amber-400">{toDevanagariNumerals(filteredProfiles.length)}</strong>
          </span>
        </div>
      </div>

      {/* KUNDALI RECORDS DATA TABLE */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-3.5">क्र.सं.</th>
                <th className="p-3.5">जातकको नाम</th>
                <th className="p-3.5">ग्राहक कोड / ID</th>
                <th className="p-3.5">जन्म मिति (वि.सं.)</th>
                <th className="p-3.5">समय</th>
                <th className="p-3.5">जन्म स्थान</th>
                <th className="p-3.5">तयार गर्ने क्लाइन्ट</th>
                <th className="p-3.5 text-right">कार्यहरू (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-500">
                    कुनै पनि कुण्डली विवरण फेला परेन।
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-stone-800/40 transition">
                    <td className="p-3.5 font-mono text-stone-500">{toDevanagariNumerals(idx + 1)}</td>
                    <td className="p-3.5 font-bold text-stone-100 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/20">
                        {p.gender === 'female' ? '♀' : '♂'}
                      </div>
                      <span>{p.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-amber-400 font-semibold">{p.customerId || p.id}</td>
                    <td className="p-3.5 font-mono text-stone-300">{p.dateBS || p.dateAD}</td>
                    <td className="p-3.5 font-mono text-stone-400">{p.time}</td>
                    <td className="p-3.5 text-stone-300">
                      <span className="flex items-center gap-1 truncate max-w-[140px]" title={p.location?.name}>
                        <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                        <span>{p.location?.name || 'काठमाडौँ'}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-stone-950 text-stone-300 font-mono text-[10px] border border-stone-800">
                        {p.clientId || (p.id?.startsWith('sample_') ? 'System Demo' : 'Legacy')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingProfile(p)}
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg transition cursor-pointer"
                          title="कुण्डली हेर्नुहोस्"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition cursor-pointer border border-amber-500/30"
                          title="सम्पादन गर्नुहोस्"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingProfile(p)}
                          className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg transition cursor-pointer border border-rose-500/30"
                          title="मेटाउनुहोस्"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW PROFILE MODAL */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-stone-100 text-base">कुण्डली विवरण: {viewingProfile.name}</h3>
              </div>
              <button onClick={() => setViewingProfile(null)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                <span className="text-stone-500 block">ग्राहक कोड (ID)</span>
                <span className="font-mono text-amber-400 font-bold">{viewingProfile.customerId || viewingProfile.id}</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                <span className="text-stone-500 block">लिङ्ग</span>
                <span className="text-stone-200 font-bold">{viewingProfile.gender === 'female' ? 'महिला' : viewingProfile.gender === 'other' ? 'अन्य' : 'पुरुष'}</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                <span className="text-stone-500 block">जन्म मिति (वि.सं.)</span>
                <span className="font-mono text-stone-200 font-bold">{viewingProfile.dateBS}</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                <span className="text-stone-500 block">जन्म समय</span>
                <span className="font-mono text-stone-200 font-bold">{viewingProfile.time}</span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1 col-span-2">
                <span className="text-stone-500 block">जन्म स्थान</span>
                <span className="text-stone-200 font-bold">
                  {viewingProfile.location?.name} (अक्षांश: {viewingProfile.location?.latitude ?? ''}, देशान्तर: {viewingProfile.location?.longitude ?? ''})
                </span>
              </div>
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1 col-span-2">
                <span className="text-stone-500 block">सिर्जना गर्ने क्लाइन्ट (Client Scope)</span>
                <span className="font-mono text-amber-300 font-bold">{viewingProfile.clientId || 'System/Legacy'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingProfile(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-stone-100 text-base">कुण्डली सम्पादन (Edit Kundali)</h3>
              </div>
              <button type="button" onClick={() => setEditingProfile(null)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 font-semibold block mb-1">जातकको पूरा नाम</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-stone-400 font-semibold block mb-1">लिङ्ग</label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value as Gender)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="male">पुरुष</option>
                  <option value="female">महिला</option>
                  <option value="other">अन्य</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-semibold block mb-1">जन्म मिति (वि.सं.)</label>
                  <input
                    type="text"
                    required
                    value={editDateBS}
                    onChange={(e) => setEditDateBS(e.target.value)}
                    placeholder="२०४०-०५-१५"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-semibold block mb-1">जन्म समय (HH:MM)</label>
                  <input
                    type="text"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="०६:३०"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-semibold block mb-1">जन्म स्थान</label>
                <input
                  type="text"
                  required
                  value={editLocationName}
                  onChange={(e) => setEditLocationName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold cursor-pointer"
              >
                परिवर्तन सेभ गर्नुहोस्
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-900 border border-rose-900/60 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-100 text-base">कुण्डली मेटाउने पुष्टि गर्नुहोस्</h3>
              <p className="text-xs text-stone-400">
                के तपाईं साँच्चिकै <strong>{deletingProfile.name}</strong> को कुण्डली मेटाउन चाहनुहुन्छ? यो कार्य पुनः फिर्ता हुन सक्ने छैन।
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingProfile(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                हो, मेटाउनुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
