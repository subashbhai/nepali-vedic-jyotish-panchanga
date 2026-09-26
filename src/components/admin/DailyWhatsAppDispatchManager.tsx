import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  CheckSquare,
  Square,
  Printer,
  Download,
  Share2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Settings,
  ShieldCheck,
  Sparkles,
  Phone,
  Calendar,
  Sun,
  Moon,
  Compass,
  FileText,
  Loader2,
  X,
  ExternalLink
} from 'lucide-react';

import {
  BirthDetails,
  PanchangaData,
  PlanetPosition,
  OrganizationProfile
} from '../../types/astrology';

import {
  DailyWhatsAppSubscriber,
  DailyWhatsAppScheduleConfig,
  getStoredScheduleConfig,
  saveScheduleConfig,
  getSubscribersFromProfiles,
  updateSubscriberSelection,
  generatePersonalizedDailyReport,
  formatDailyWhatsAppMessage,
  buildWhatsAppDirectUrl,
  PersonalizedDailyVedicReport
} from '../../utils/dailyWhatsAppScheduler';

import { exportElementToPDF, printElement, generatePDFFileFromElement } from '../../utils/pdfGenerator';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { ReportActionToolbar } from '../common/ReportActionToolbar';
import { WhatsAppShareModal } from '../common/WhatsAppShareModal';

interface DailyWhatsAppDispatchManagerProps {
  profiles: BirthDetails[];
  todayPanchanga: PanchangaData;
  orgProfile?: OrganizationProfile;
  transitPlanets?: PlanetPosition[];
  onClose?: () => void;
}

export const DailyWhatsAppDispatchManager: React.FC<DailyWhatsAppDispatchManagerProps> = ({
  profiles,
  todayPanchanga,
  orgProfile,
  transitPlanets,
  onClose
}) => {
  // Configuration State
  const [config, setConfig] = useState<DailyWhatsAppScheduleConfig>(getStoredScheduleConfig());
  const [subscribers, setSubscribers] = useState<DailyWhatsAppSubscriber[]>(() =>
    getSubscribersFromProfiles(profiles)
  );

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneFilter, setPhoneFilter] = useState<'all' | 'with_phone' | 'without_phone'>('all');

  // Preview & Dispatch States
  const [previewReport, setPreviewReport] = useState<PersonalizedDailyVedicReport | null>(null);
  const [activeShareReport, setActiveShareReport] = useState<PersonalizedDailyVedicReport | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [batchStatus, setBatchStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentName: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editing phone number in-line
  const [editingPhoneProfileId, setEditingPhoneProfileId] = useState<string | null>(null);
  const [editingPhoneValue, setEditingPhoneValue] = useState<string>('');

  const orgName = orgProfile?.name || 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा';
  const orgPhone = orgProfile?.phone || '+९७७-९७६४४००५३३';

  // Live timer for 7:00 AM countdown
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute countdown to 7:00 AM
  const countdownText = useMemo(() => {
    const now = currentTime;
    const [targetHour, targetMinute] = (config.sendTime || '07:00').split(':').map(Number);
    const target = new Date(now);
    target.setHours(targetHour, targetMinute, 0, 0);

    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const diffMs = target.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${toDevanagariNumerals(hours)} घण्टा ${toDevanagariNumerals(minutes)} मिनेट ${toDevanagariNumerals(seconds)} सेकेन्ड पछि`;
  }, [currentTime, config.sendTime]);

  // Sync subscribers when profiles change
  useEffect(() => {
    const subs = getSubscribersFromProfiles(profiles);
    setSubscribers(subs);
  }, [profiles]);

  // Handle single subscriber toggle
  const handleToggleSubscriber = (profileId: string) => {
    const nextSubs = subscribers.map((s) =>
      s.profileId === profileId ? { ...s, enabled: !s.enabled } : s
    );
    setSubscribers(nextSubs);

    const tickedIds = nextSubs.filter((s) => s.enabled).map((s) => s.profileId);
    updateSubscriberSelection(tickedIds);
  };

  // Bulk select / deselect
  const handleSelectAll = (select: boolean) => {
    const nextSubs = subscribers.map((s) => ({ ...s, enabled: select }));
    setSubscribers(nextSubs);
    const tickedIds = select ? nextSubs.map((s) => s.profileId) : [];
    updateSubscriberSelection(tickedIds);
  };

  const handleSelectWithPhoneOnly = () => {
    const nextSubs = subscribers.map((s) => ({
      ...s,
      enabled: Boolean(s.phone && s.phone.trim().length >= 7)
    }));
    setSubscribers(nextSubs);
    const tickedIds = nextSubs.filter((s) => s.enabled).map((s) => s.profileId);
    updateSubscriberSelection(tickedIds);
  };

  // Toggle auto send switch
  const handleToggleAutoSend = () => {
    const nextConfig = { ...config, autoSendEnabled: !config.autoSendEnabled };
    setConfig(nextConfig);
    saveScheduleConfig(nextConfig);
    showToast(nextConfig.autoSendEnabled ? 'दैनिक बिहान ७:०० बजे अटो-सेन्ड सक्रिय गरियो!' : 'दैनिक अटो-सेन्ड बन्द गरियो।');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save updated phone number
  const handleSavePhone = (profileId: string) => {
    const nextSubs = subscribers.map((s) =>
      s.profileId === profileId ? { ...s, phone: editingPhoneValue } : s
    );
    setSubscribers(nextSubs);
    setEditingPhoneProfileId(null);
    showToast('फोन नम्बर अद्यावधिक भयो!');
  };

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.phone.includes(searchQuery) ||
        sub.moonRashiName.includes(searchQuery) ||
        sub.dateBS.includes(searchQuery);

      if (!matchesSearch) return false;

      if (phoneFilter === 'with_phone') return Boolean(sub.phone && sub.phone.trim().length >= 7);
      if (phoneFilter === 'without_phone') return !sub.phone || sub.phone.trim().length < 7;
      return true;
    });
  }, [subscribers, searchQuery, phoneFilter]);

  const tickedSubscribers = subscribers.filter((s) => s.enabled);

  // Single User WhatsApp Direct Trigger
  const handleSendSingleWhatsApp = (sub: DailyWhatsAppSubscriber) => {
    const report = generatePersonalizedDailyReport(sub, todayPanchanga, transitPlanets);
    const message = formatDailyWhatsAppMessage(report, orgName, orgPhone);
    const url = buildWhatsAppDirectUrl(sub.phone, message);
    window.open(url, '_blank');
  };

  // Preview user report modal
  const handleOpenPreview = (sub: DailyWhatsAppSubscriber) => {
    const report = generatePersonalizedDailyReport(sub, todayPanchanga, transitPlanets);
    setPreviewReport(report);
  };

  // Batch Dispatch Runner (Send to All Selected)
  const handleBatchDispatch = async () => {
    if (tickedSubscribers.length === 0) {
      alert('कृपया पहिले कम्तीमा एक जना ग्राहकको चेकबक्समा टिक लगाउनुहोस्।');
      return;
    }

    setBatchStatus('running');
    setBatchProgress({ current: 0, total: tickedSubscribers.length, currentName: '' });

    for (let i = 0; i < tickedSubscribers.length; i++) {
      const sub = tickedSubscribers[i];
      setBatchProgress({ current: i + 1, total: tickedSubscribers.length, currentName: sub.name });

      const report = generatePersonalizedDailyReport(sub, todayPanchanga, transitPlanets);
      const msg = formatDailyWhatsAppMessage(report, orgName, orgPhone);

      // Open WhatsApp tab for each or first recipient
      if (sub.phone) {
        const url = buildWhatsAppDirectUrl(sub.phone, msg);
        window.open(url, '_blank');
      }

      // Small delay between opens so browser does not block popups
      await new Promise((r) => setTimeout(r, 600));
    }

    setBatchStatus('completed');
    showToast(`${toDevanagariNumerals(tickedSubscribers.length)} जना ग्राहकलाई दैनिक फलादेश प्रेषण सम्पन्न भयो!`);
  };

  return (
    <div className="bg-[#FAF8F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-6 shadow-xl space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: SUPER ADMIN CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-md">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-amber-400">
                दैनिक बिहान ७:०० बजे स्वचालित व्हाट्सएप सेवा (Daily 7 AM WhatsApp Engine)
              </h2>
              <span className="bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              DOB भरेका ग्राहकहरूको दैनिक व्यक्तिगत फलादेश, शुभ मुहूर्त, पञ्चाङ्ग तथा गोचर प्रतिवेदन WhatsApp मा स्वचालित पठाउने प्रणाली
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 7:00 AM AUTO ENGINE DASHBOARD CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status & Toggle Card */}
        <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-900/60 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                स्वचालित प्रेषण समय (Daily Schedule)
              </span>
            </div>
            <span className="font-mono text-xs font-black bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg">
              {config.sendTime || '०७:००'} AM
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  बिहान ७:०० बजेको अटो-सेन्ड प्रणाली
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {config.autoSendEnabled ? 'सक्रिय छ (Active)' : 'निष्कृय छ (Paused)'}
                </p>
              </div>

              <button
                onClick={handleToggleAutoSend}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  config.autoSendEnabled ? 'bg-emerald-600' : 'bg-stone-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.autoSendEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              अर्को प्रेषण: <strong>{countdownText}</strong>
            </span>
          </div>
        </div>

        {/* Audience Overview Stats */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              ग्राहक सदस्यता तथ्याङ्क (Subscribers)
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-stone-50 dark:bg-stone-800 p-2 rounded-xl">
              <p className="text-base font-black text-stone-900 dark:text-stone-100 font-mono">
                {toDevanagariNumerals(subscribers.length)}
              </p>
              <p className="text-[10px] text-stone-500">कुल DOB प्रयोगकर्ता</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2 rounded-xl">
              <p className="text-base font-black text-amber-700 dark:text-amber-300 font-mono">
                {toDevanagariNumerals(tickedSubscribers.length)}
              </p>
              <p className="text-[10px] text-amber-800 dark:text-amber-400 font-bold">टिक लगाइएका</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2 rounded-xl">
              <p className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {toDevanagariNumerals(subscribers.filter((s) => Boolean(s.phone)).length)}
              </p>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">सम्पर्क उपलब्ध</p>
            </div>
          </div>

          <p className="text-[10px] text-stone-400">
            * सुपर एडमिनले तलको सूचीमा जुन जुन नम्बरमा टिक लगाउनुहुन्छ, उनीहरूलाई मात्र बिहान ७ बजे दैनिक PDF र सन्देश प्रेषण हुनेछ।
          </p>
        </div>

        {/* Batch Action Box */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-stone-950 text-white rounded-2xl p-4.5 shadow-md flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>एकमुष्ट प्रेषण कमान्ड (Batch Dispatch)</span>
              </span>
              <span className="bg-emerald-800/80 px-2 py-0.5 rounded-md font-mono text-[10px]">
                {toDevanagariNumerals(tickedSubscribers.length)} छानिएका
              </span>
            </div>
            <p className="text-xs text-stone-200 mt-1">
              सबै टिक लगाइएका ग्राहकहरूलाई आजको दैनिक फलादेश र शुभ मुहूर्त प्रतिवेदन तुरुन्त पठाउनुहोस्।
            </p>
          </div>

          {batchStatus === 'running' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-emerald-200">
                <span>पठाउँदै: {batchProgress.currentName}</span>
                <span>
                  {toDevanagariNumerals(batchProgress.current)}/{toDevanagariNumerals(batchProgress.total)}
                </span>
              </div>
              <div className="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-700">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleBatchDispatch}
            disabled={batchStatus === 'running' || tickedSubscribers.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-50 text-stone-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            {batchStatus === 'running' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                <span>प्रेषण हुँदैछ...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>अहिले सबै छानिएकालाई पठाउनुहोस्</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* FILTER & BULK SELECTION CONTROLS */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Bulk Checkbox Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSelectAll(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-bold transition cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>सबै छान्नुहोस् ({toDevanagariNumerals(subscribers.length)})</span>
          </button>

          <button
            onClick={() => handleSelectAll(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-bold transition cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 text-stone-400" />
            <span>सबै खाली गर्नुहोस्</span>
          </button>

          <button
            onClick={handleSelectWithPhoneOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold transition cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span>फोन भएका मात्र छान्नुहोस्</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="नाम, फोन वा राशि खोज्नुहोस्..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none focus:border-amber-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value as any)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none cursor-pointer"
          >
            <option value="all">सबै प्रयोगकर्ता</option>
            <option value="with_phone">फोन नम्बर भएका</option>
            <option value="without_phone">फोन नम्बर नभएका</option>
          </select>
        </div>
      </div>

      {/* SUBSCRIBERS TABLE */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-stone-800">
                <th className="p-3 text-center w-12">
                  <span className="sr-only">छनोट</span>
                  ✓
                </th>
                <th className="p-3">जातकको नाम</th>
                <th className="p-3">WhatsApp फोन नम्बर</th>
                <th className="p-3">जन्म मिति (DOB)</th>
                <th className="p-3">चन्द्र राशि र नक्षत्र</th>
                <th className="p-3">बिहान ७ बजे स्थिति</th>
                <th className="p-3 text-right">कार्यहरू (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-stone-400">
                    कुनै पनि जातक फेला परेन।
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr
                    key={sub.profileId}
                    className={`hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors ${
                      sub.enabled ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    {/* Checkbox Column */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={sub.enabled}
                        onChange={() => handleToggleSubscriber(sub.profileId)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        title="दैनिक ७ बजे पठाउनका लागि टिक लगाउनुहोस्"
                      />
                    </td>

                    {/* Name */}
                    <td className="p-3 font-bold text-stone-900 dark:text-stone-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-serif font-bold text-xs">
                          {sub.name.charAt(0)}
                        </div>
                        <div>
                          <p>{sub.name}</p>
                          <p className="text-[10px] text-stone-400 font-normal">{sub.locationName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="p-3 font-mono">
                      {editingPhoneProfileId === sub.profileId ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingPhoneValue}
                            onChange={(e) => setEditingPhoneValue(e.target.value)}
                            className="bg-white dark:bg-stone-800 border border-amber-500 rounded px-2 py-0.5 text-xs font-mono outline-none w-28"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePhone(sub.profileId)}
                            className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                          >
                            सुरक्षित
                          </button>
                        </div>
                      ) : sub.phone ? (
                        <div className="flex items-center gap-1.5 group">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{sub.phone}</span>
                          <button
                            onClick={() => {
                              setEditingPhoneProfileId(sub.profileId);
                              setEditingPhoneValue(sub.phone);
                            }}
                            className="text-[10px] text-stone-400 hover:text-stone-700 opacity-0 group-hover:opacity-100 transition"
                            title="सम्पादन"
                          >
                            ✎
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPhoneProfileId(sub.profileId);
                            setEditingPhoneValue('');
                          }}
                          className="text-[11px] text-rose-500 hover:underline font-semibold"
                        >
                          + नम्बर थप्नुहोस्
                        </button>
                      )}
                    </td>

                    {/* DOB */}
                    <td className="p-3">
                      <p className="font-semibold text-stone-800 dark:text-stone-200">वि.सं. {sub.dateBS}</p>
                      <p className="text-[10px] text-stone-400 font-mono">{sub.time} बजे</p>
                    </td>

                    {/* Rashi & Nakshatra */}
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold text-[11px]">
                        <Moon className="w-3 h-3" />
                        <span>{sub.moonRashiName} राशि</span>
                      </span>
                      <p className="text-[10px] text-stone-400 mt-0.5">नक्षत्र: {sub.nakshatraName}</p>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      {sub.enabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>सक्रिय (७:०० AM)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400 font-medium">छानिएको छैन</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Preview Report Button */}
                        <button
                          onClick={() => handleOpenPreview(sub)}
                          className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-300 hover:text-amber-600 transition cursor-pointer"
                          title="दैनिक PDF प्रतिवेदन हेर्नुहोस्"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Send on WhatsApp Button */}
                        <button
                          onClick={() => handleSendSingleWhatsApp(sub)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-[11px] shadow-xs transition cursor-pointer"
                          title="WhatsApp मा सिधै पठाउनुहोस्"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
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

      {/* =========================================================================
          FULL REPORT PREVIEW & PDF EXPORT MODAL
         ========================================================================= */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-amber-600 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Top Action Toolbar */}
            <div className="bg-gradient-to-r from-red-950 via-amber-950 to-stone-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-600/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  卐
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif">
                    दैनिक वैदिक फलादेश तथा पञ्चाङ्ग प्रतिवेदन (Daily A4 PDF)
                  </h3>
                  <p className="text-[11px] text-amber-200">
                    जातक: <strong>{previewReport.subscriber.name}</strong> • मिति: वि.सं. {previewReport.todayBS}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Unified Report Actions: Print, Export PDF, WhatsApp Share */}
                <ReportActionToolbar
                  elementId="daily-personalized-a4-report-document"
                  reportTitle="दैनिक_वैदिक_फलादेश_तथा_पञ्चाङ्ग"
                  clientName={previewReport.subscriber.name}
                  clientPhone={previewReport.subscriber.phone}
                  dateBS={previewReport.todayBS}
                  orgName={orgName}
                  orgPhone={orgPhone}
                  variant="dark_header"
                  customSummaryText={`• चन्द्र राशि: ${previewReport.subscriber.moonRashiName} | फल: ${previewReport.dailyForecast.description}\n• शुभ बेला: ${previewReport.muhurtha.shubhaBela}\n• वर्जित राहुकाल: ${previewReport.muhurtha.rahuKaal}`}
                />

                <button
                  onClick={() => setPreviewReport(null)}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable A4 Printable Canvas Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 dark:bg-stone-950 flex justify-center">
              <div
                id="daily-personalized-a4-report-document"
                className="w-full max-w-[760px] bg-[#FDFCF8] text-stone-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-[#8B2500] font-serif space-y-4"
              >
                {/* Official Sacred Vedic Header */}
                <div className="text-center border-b-2 border-red-900 pb-3 space-y-1">
                  <div className="text-[10px] font-bold text-red-700 tracking-widest">
                    卐 ॥ श्री गणेशाय नमः ॥ 卐
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-red-900 font-serif">
                    {orgName}
                  </h1>
                  <p className="text-xs font-bold text-amber-900">
                    ॥ दैनिक व्यक्तिगत फलादेश, शुभ मुहूर्त तथा पञ्चाङ्ग गोचर प्रतिवेदन ॥
                  </p>
                  <p className="text-[10px] text-stone-600 font-sans">
                    सम्पर्क: {orgPhone} • आधिकारिक वैदिक सेवा
                  </p>
                </div>

                {/* Profile & Panchanga Meta Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs font-sans">
                  <div>
                    <span className="text-stone-500 block text-[10px]">जातकको नाम:</span>
                    <strong className="text-stone-900">{previewReport.subscriber.name}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">चन्द्र राशि:</span>
                    <strong className="text-red-900">{previewReport.subscriber.moonRashiName} राशि</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">आजको मिति:</span>
                    <strong className="text-stone-900">वि.सं. {previewReport.todayBS}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">बार:</span>
                    <strong className="text-stone-900">{previewReport.panchanga.dayNameNepali}</strong>
                  </div>
                </div>

                {/* 1. Personalized Daily Prediction */}
                <div className="border border-stone-300 rounded-xl p-3.5 bg-white space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                    <h3 className="font-bold text-xs text-red-900 flex items-center gap-1.5 font-serif">
                      <Sun className="w-4 h-4 text-amber-600" />
                      <span>१. आजको व्यक्तिगत फलादेश (Daily Horoscope):</span>
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-sans">
                      {previewReport.dailyForecast.ratingText}
                    </span>
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed font-sans">
                    {previewReport.dailyForecast.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans pt-1">
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <strong>कार्य तथा अर्थ:</strong> {previewReport.dailyForecast.careerMoney}
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                      <strong>पारिवारिक सुख:</strong> {previewReport.dailyForecast.healthFamily}
                    </div>
                  </div>
                </div>

                {/* 2. Muhurtha & Timings */}
                <div className="border border-stone-300 rounded-xl p-3.5 bg-white space-y-2">
                  <h3 className="font-bold text-xs text-red-900 flex items-center gap-1.5 font-serif border-b border-stone-200 pb-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>२. आजको शुभ मुहूर्त तथा राहुकाल (Auspicious & Inauspicious Times):</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-sans">
                    <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 block font-bold">🟢 शुभ/अमृत बेला:</span>
                      <strong className="text-emerald-950 text-[11px]">{previewReport.muhurtha.shubhaBela}</strong>
                    </div>
                    <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                      <span className="text-[10px] text-amber-800 block font-bold">🟢 अभिजित मुहूर्त:</span>
                      <strong className="text-amber-950 text-[11px]">{previewReport.muhurtha.abhijitMuhurtha}</strong>
                    </div>
                    <div className="bg-rose-50/70 p-2 rounded-lg border border-rose-200">
                      <span className="text-[10px] text-rose-800 block font-bold">🔴 वर्जित राहुकाल:</span>
                      <strong className="text-rose-950 text-[11px]">{previewReport.muhurtha.rahuKaal}</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500 italic font-sans">
                    * राहुकालमा नयाँ सम्झौता, लगानी वा यात्रा नगर्नुहोला। अभिजित मुहूर्त सर्वकार्य सिद्धिदायी छ।
                  </p>
                </div>

                {/* 3. Daily Panchanga & Lucky Factors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Panchanga */}
                  <div className="border border-stone-300 rounded-xl p-3 bg-white space-y-1.5 text-xs font-sans">
                    <h4 className="font-bold text-red-900 font-serif border-b pb-1">
                      ३. पञ्चाङ्ग सारांश
                    </h4>
                    <div className="space-y-1 text-[11px]">
                      <div><strong>तिथि:</strong> {previewReport.panchanga.tithi.name} ({previewReport.panchanga.tithi.paksha} पक्ष)</div>
                      <div><strong>नक्षत्र:</strong> {previewReport.panchanga.nakshatra.name}</div>
                      <div><strong>योग:</strong> {previewReport.panchanga.yoga.name} | <strong>करण:</strong> {previewReport.panchanga.karana.name}</div>
                      <div><strong>सूर्योदय:</strong> {previewReport.panchanga.sunrise || '०५:५४'} | <strong>सूर्यास्त:</strong> {previewReport.panchanga.sunset || '१८:२५'}</div>
                    </div>
                  </div>

                  {/* Lucky Factors & Mantra */}
                  <div className="border border-stone-300 rounded-xl p-3 bg-white space-y-1.5 text-xs font-sans">
                    <h4 className="font-bold text-red-900 font-serif border-b pb-1">
                      ४. आजको शुभ सङ्केत तथा मन्त्र
                    </h4>
                    <div className="grid grid-cols-3 gap-1 text-[11px] text-center">
                      <div className="bg-stone-50 p-1 rounded">
                        <span className="text-[9px] text-stone-500 block">शुभ रङ्ग</span>
                        <strong className="text-stone-900">{previewReport.luckyFactors.color}</strong>
                      </div>
                      <div className="bg-stone-50 p-1 rounded">
                        <span className="text-[9px] text-stone-500 block">शुभ अङ्क</span>
                        <strong className="text-stone-900">{previewReport.luckyFactors.number}</strong>
                      </div>
                      <div className="bg-stone-50 p-1 rounded">
                        <span className="text-[9px] text-stone-500 block">शुभ दिशा</span>
                        <strong className="text-stone-900">{previewReport.luckyFactors.direction}</strong>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-2 rounded text-center text-amber-900 font-serif font-bold text-xs mt-1 border border-amber-200">
                      📿 दैनिक मन्त्र: {previewReport.luckyFactors.mantra}
                    </div>
                  </div>
                </div>

                {/* Footer Official Verification */}
                <div className="pt-3 border-t-2 border-red-900 flex justify-between items-center text-[10px] text-stone-600 font-sans">
                  <div>
                    प्रतिवेदन प्रदायक: <strong>{orgName}</strong>
                  </div>
                  <div className="font-serif font-bold text-red-900">
                    ॥ शुभम् भवतु कल्याणम् अस्तु ॥
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
