// ============================================================================
// बालानन्द वैदिक ज्योतिष - सुपर एडमिन राशिफल व्यवस्थापन खण्ड (Super Admin Rashifal Management)
// १२ वटै राशिका लागि दैनिक, मासिक र वार्षिक राशिफल सिर्जना, सम्पादन, मस्यौदा, पूर्वावलोकन र प्रकाशन
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Moon,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  Eye,
  RefreshCw,
  RotateCcw,
  Send,
  AlertTriangle,
  Clock,
  Briefcase,
  Coins,
  Heart,
  GraduationCap,
  Activity,
  Layers,
  BookOpen,
  X,
  FileCheck,
  Zap,
  Globe
} from 'lucide-react';
import { RASHI_DATA } from '../../../data/rashiData';
import {
  DailyRashifalItem,
  MonthlyRashifalItem,
  YearlyRashifalItem,
  getStoredDailyRashifal,
  saveDailyRashifalList,
  getStoredMonthlyRashifal,
  saveMonthlyRashifalList,
  getStoredYearlyRashifal,
  saveYearlyRashifalList,
  generateDefaultDailyForRashi,
  generateDefaultMonthlyForRashi,
  generateDefaultYearlyForRashi,
  BALANANDA_RASHIFAL_UPDATED_EVENT
} from '../../../db/rashifalStore';
import { convertADToBSFull, NEPALI_MONTH_NAMES } from '../../../utils/bsCalendarData';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';

export const SuperAdminRashifalManagement: React.FC = () => {
  // Period Mode: 'daily' | 'monthly' | 'yearly'
  const [periodMode, setPeriodMode] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  // Active Rashi selection (1 to 12)
  const [activeRashiId, setActiveRashiId] = useState<number>(1);

  // Date / Month / Year selection
  const currentBS = useMemo(() => convertADToBSFull(new Date()), []);
  const [targetDateBS, setTargetDateBS] = useState<string>(currentBS.formattedBS);
  const [targetYearBS, setTargetYearBS] = useState<number>(currentBS.year);
  const [targetMonthBS, setTargetMonthBS] = useState<number>(currentBS.month);

  // Form State
  const [dailyForm, setDailyForm] = useState<DailyRashifalItem>(() =>
    generateDefaultDailyForRashi(1, currentBS.formattedBS, new Date().toISOString().split('T')[0])
  );

  const [monthlyForm, setMonthlyForm] = useState<MonthlyRashifalItem>(() =>
    generateDefaultMonthlyForRashi(1, currentBS.year, currentBS.month, currentBS.monthName)
  );

  const [yearlyForm, setYearlyForm] = useState<YearlyRashifalItem>(() =>
    generateDefaultYearlyForRashi(1, currentBS.year)
  );

  // Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load from Store when parameters change
  useEffect(() => {
    if (periodMode === 'daily') {
      const allDaily = getStoredDailyRashifal(targetDateBS);
      const found = allDaily.find((i) => i.rashiId === activeRashiId);
      if (found) {
        setDailyForm(found);
      } else {
        const todayAD = new Date().toISOString().split('T')[0];
        setDailyForm(generateDefaultDailyForRashi(activeRashiId, targetDateBS, todayAD));
      }
    } else if (periodMode === 'monthly') {
      const allMonthly = getStoredMonthlyRashifal(targetYearBS, targetMonthBS);
      const found = allMonthly.find((i) => i.rashiId === activeRashiId);
      if (found) {
        setMonthlyForm(found);
      } else {
        const mName = NEPALI_MONTH_NAMES[targetMonthBS - 1] || 'महिना';
        setMonthlyForm(generateDefaultMonthlyForRashi(activeRashiId, targetYearBS, targetMonthBS, mName));
      }
    } else if (periodMode === 'yearly') {
      const allYearly = getStoredYearlyRashifal(targetYearBS);
      const found = allYearly.find((i) => i.rashiId === activeRashiId);
      if (found) {
        setYearlyForm(found);
      } else {
        setYearlyForm(generateDefaultYearlyForRashi(activeRashiId, targetYearBS));
      }
    }
  }, [periodMode, activeRashiId, targetDateBS, targetYearBS, targetMonthBS]);

  // Trigger notification toast
  const triggerSuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Save / Publish Handlers
  const handleSaveDaily = (publish: boolean) => {
    const updated: DailyRashifalItem = {
      ...dailyForm,
      isPublished: publish,
      updatedAt: new Date().toISOString()
    };
    saveDailyRashifalList([updated]);
    setDailyForm(updated);
    triggerSuccess(publish ? 'दैनिक राशिफल सफलतापूर्वक प्रकाशित भयो!' : 'दैनिक राशिफल मस्यौदामा सुरक्षित भयो!');
  };

  const handleSaveMonthly = (publish: boolean) => {
    const updated: MonthlyRashifalItem = {
      ...monthlyForm,
      isPublished: publish,
      updatedAt: new Date().toISOString()
    };
    saveMonthlyRashifalList([updated]);
    setMonthlyForm(updated);
    triggerSuccess(publish ? 'मासिक राशिफल सफलतापूर्वक प्रकाशित भयो!' : 'मासिक राशिफल मस्यौदामा सुरक्षित भयो!');
  };

  const handleSaveYearly = (publish: boolean) => {
    const updated: YearlyRashifalItem = {
      ...yearlyForm,
      isPublished: publish,
      updatedAt: new Date().toISOString()
    };
    saveYearlyRashifalList([updated]);
    setYearlyForm(updated);
    triggerSuccess(publish ? 'वार्षिक राशिफल सफलतापूर्वक प्रकाशित भयो!' : 'वार्षिक राशिफल मस्यौदामा सुरक्षित भयो!');
  };

  // Reset to Shastric Defaults
  const handleResetDefaults = () => {
    if (!confirm('के तपाईं यस राशिका लागि शास्त्रीय प्रमाणित पूर्वनिर्धारित सामग्री पुनर्स्थापना गर्न चाहनुहुन्छ?')) return;
    if (periodMode === 'daily') {
      const def = generateDefaultDailyForRashi(activeRashiId, targetDateBS, new Date().toISOString().split('T')[0]);
      setDailyForm(def);
      saveDailyRashifalList([def]);
    } else if (periodMode === 'monthly') {
      const mName = NEPALI_MONTH_NAMES[targetMonthBS - 1] || 'महिना';
      const def = generateDefaultMonthlyForRashi(activeRashiId, targetYearBS, targetMonthBS, mName);
      setMonthlyForm(def);
      saveMonthlyRashifalList([def]);
    } else if (periodMode === 'yearly') {
      const def = generateDefaultYearlyForRashi(activeRashiId, targetYearBS);
      setYearlyForm(def);
      saveYearlyRashifalList([def]);
    }
    triggerSuccess('शास्त्रीय सामग्री पुनर्स्थापना गरियो!');
  };

  // Active Rashi Object
  const currentRashiObj = RASHI_DATA.find((r) => r.id === activeRashiId) || RASHI_DATA[0];

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 p-1 sm:p-2">
      
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Control Header */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🪔</span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif">
              केन्द्रीय राशिफल व्यवस्थापन केन्द्र (Super Admin)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-200 mt-1">
            १२ वटै राशिका लागि दैनिक, मासिक र वार्षिक सामग्री सिर्जना, सम्पादन, मस्यौदा, पूर्वावलोकन र तत्काल प्रकाशन
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
          >
            <Eye className="w-4 h-4" />
            <span>पूर्वावलोकन</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="शास्त्रीय मानकमा पुनर्स्थापना गर्नुहोस्"
          >
            <RotateCcw className="w-4 h-4" />
            <span>पुनर्स्थापना</span>
          </button>
        </div>
      </div>

      {/* Period Tabs & Target Period Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Period Mode Selector */}
        <div className="bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 flex gap-1 text-xs font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setPeriodMode('daily')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              periodMode === 'daily'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>दैनिक राशिफल</span>
          </button>
          <button
            type="button"
            onClick={() => setPeriodMode('monthly')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              periodMode === 'monthly'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>मासिक राशिफल</span>
          </button>
          <button
            type="button"
            onClick={() => setPeriodMode('yearly')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              periodMode === 'yearly'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>वार्षिक राशिफल</span>
          </button>
        </div>

        {/* Date / Month / Year Picker */}
        <div className="md:col-span-2 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center gap-3 flex-wrap text-xs font-bold shadow-xs">
          {periodMode === 'daily' && (
            <div className="flex items-center gap-2">
              <span className="text-stone-500">वि.सं. मिति:</span>
              <input
                type="text"
                value={targetDateBS}
                onChange={(e) => setTargetDateBS(e.target.value)}
                placeholder="२०८३-०६-२३"
                className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 font-mono text-xs font-bold"
              />
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-normal">
                (दिन परिवर्तन हुँदा प्रयोगकर्ताले स्वतः नयाँ सामग्री पाउनेछन्)
              </span>
            </div>
          )}

          {periodMode === 'monthly' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500">वर्ष:</span>
                <input
                  type="number"
                  value={targetYearBS}
                  onChange={(e) => setTargetYearBS(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500">महिना:</span>
                <select
                  value={targetMonthBS}
                  onChange={(e) => setTargetMonthBS(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold text-xs cursor-pointer"
                >
                  {NEPALI_MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {periodMode === 'yearly' && (
            <div className="flex items-center gap-2">
              <span className="text-stone-500">विक्रम संवत् वर्ष:</span>
              <input
                type="number"
                value={targetYearBS}
                onChange={(e) => setTargetYearBS(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 font-bold text-xs"
              />
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-normal">
                (पुराना वर्षहरूको सामग्री सुरक्षित रहनेछ, इतिहासबाट हेर्न मिल्नेछ)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 12 Rashis Selector Bar */}
      <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
          <span>सम्पादनका लागि राशि छनोट गर्नुहोस्:</span>
          <span className="text-amber-700 dark:text-amber-400">
            हाल छनोट: {currentRashiObj.name} राशि ({currentRashiObj.englishName})
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {RASHI_DATA.map((r) => {
            const isSelected = activeRashiId === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRashiId(r.id)}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md scale-105'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                <span className="text-sm">{r.symbol}</span>
                <span className="truncate w-full text-[11px]">{r.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. DAILY EDITING FORM                                                */}
      {/* ==================================================================== */}
      {periodMode === 'daily' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-amber-300/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
              <span>☀️</span>
              <span>{dailyForm.rashiName} राशिको दैनिक राशिफल सम्पादन</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${dailyForm.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {dailyForm.isPublished ? 'प्रकाशित' : 'मस्यौदा'}
              </span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveDaily(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>मस्यौदा सुरक्षित</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveDaily(true)}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>तुरुन्त प्रकाशित गर्नुहोस्</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                समग्र दिनको फल (Verdict):
              </label>
              <input
                type="text"
                value={dailyForm.overallVerdict}
                onChange={(e) => setDailyForm({ ...dailyForm, overallVerdict: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                अनुकूलता अंक (0 - 100):
              </label>
              <input
                type="number"
                value={dailyForm.overallScore}
                onChange={(e) => setDailyForm({ ...dailyForm, overallScore: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                शुभ रङ / अंक / दिशा:
              </label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="text"
                  placeholder="रङ"
                  value={dailyForm.luckyColor}
                  onChange={(e) => setDailyForm({ ...dailyForm, luckyColor: e.target.value })}
                  className="px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 font-bold"
                />
                <input
                  type="text"
                  placeholder="अंक"
                  value={dailyForm.luckyNumber}
                  onChange={(e) => setDailyForm({ ...dailyForm, luckyNumber: e.target.value })}
                  className="px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 font-bold"
                />
                <input
                  type="text"
                  placeholder="दिशा"
                  value={dailyForm.luckyDirection}
                  onChange={(e) => setDailyForm({ ...dailyForm, luckyDirection: e.target.value })}
                  className="px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
              समग्र दैनिक राशिफल सारांश (Overall Daily Summary):
            </label>
            <textarea
              rows={3}
              value={dailyForm.overallSummary}
              onChange={(e) => setDailyForm({ ...dailyForm, overallSummary: e.target.value })}
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs leading-relaxed"
            />
          </div>

          {/* Area Facets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                💼 कार्यक्षेत्र तथा व्यवसाय:
              </label>
              <textarea
                rows={2}
                value={dailyForm.career}
                onChange={(e) => setDailyForm({ ...dailyForm, career: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                💰 आर्थिक अवस्था र धनसम्बन्धी सम्भावना:
              </label>
              <textarea
                rows={2}
                value={dailyForm.finance}
                onChange={(e) => setDailyForm({ ...dailyForm, finance: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                ❤️ प्रेम, दाम्पत्य तथा पारिवारिक सम्बन्ध:
              </label>
              <textarea
                rows={2}
                value={dailyForm.loveAndFamily}
                onChange={(e) => setDailyForm({ ...dailyForm, loveAndFamily: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                🎓 अध्ययन, परीक्षा तथा बौद्धिक कार्य:
              </label>
              <textarea
                rows={2}
                value={dailyForm.education}
                onChange={(e) => setDailyForm({ ...dailyForm, education: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                🏥 स्वास्थ्य तथा दिनचर्याका सामान्य सुझाव:
              </label>
              <textarea
                rows={2}
                value={dailyForm.health}
                onChange={(e) => setDailyForm({ ...dailyForm, health: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                👥 सामाजिक सम्बन्ध तथा मानसम्मान:
              </label>
              <textarea
                rows={2}
                value={dailyForm.social}
                onChange={(e) => setDailyForm({ ...dailyForm, social: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>
          </div>

          {/* Timings, Mantra & Remedies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                ⏰ अनुकूल समय तथा सावधानी अपनाउनुपर्ने समय:
              </label>
              <input
                type="text"
                value={dailyForm.favorableTime}
                onChange={(e) => setDailyForm({ ...dailyForm, favorableTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 mb-2"
                placeholder="अनुकूल समय"
              />
              <input
                type="text"
                value={dailyForm.cautionTime}
                onChange={(e) => setDailyForm({ ...dailyForm, cautionTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700"
                placeholder="सावधानी समय"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                🪔 दैनिक मन्त्र र सत्कर्म/दान सुझाव:
              </label>
              <input
                type="text"
                value={dailyForm.mantra}
                onChange={(e) => setDailyForm({ ...dailyForm, mantra: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 mb-2 font-serif font-bold text-amber-800 dark:text-amber-300"
                placeholder="मन्त्र"
              />
              <input
                type="text"
                value={dailyForm.remedy}
                onChange={(e) => setDailyForm({ ...dailyForm, remedy: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700"
                placeholder="दान तथा सत्कर्म सुझाव"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MONTHLY EDITING FORM                                              */}
      {/* ==================================================================== */}
      {periodMode === 'monthly' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-indigo-300/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
              <span>🌙</span>
              <span>{monthlyForm.rashiName} राशिको मासिक राशिफल सम्पादन ({monthlyForm.monthName})</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${monthlyForm.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {monthlyForm.isPublished ? 'प्रकाशित' : 'मस्यौदा'}
              </span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveMonthly(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>मस्यौदा सुरक्षित</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveMonthly(true)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>तुरुन्त प्रकाशित गर्नुहोस्</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
              महिनाको समग्र फल (Overall Monthly Summary):
            </label>
            <textarea
              rows={3}
              value={monthlyForm.overallSummary}
              onChange={(e) => setMonthlyForm({ ...monthlyForm, overallSummary: e.target.value })}
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                प्रारम्भ, मध्य र अन्त्यको सम्भावित प्रवृत्ति:
              </label>
              <textarea
                rows={3}
                value={monthlyForm.trendBeginMidEnd}
                onChange={(e) => setMonthlyForm({ ...monthlyForm, trendBeginMidEnd: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                ग्रहगोचरको विस्तृत विश्लेषण:
              </label>
              <textarea
                rows={3}
                value={monthlyForm.gocharAnalysis}
                onChange={(e) => setMonthlyForm({ ...monthlyForm, gocharAnalysis: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                कार्यक्षेत्र, जागिर तथा व्यवसाय:
              </label>
              <textarea
                rows={2}
                value={monthlyForm.career}
                onChange={(e) => setMonthlyForm({ ...monthlyForm, career: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                आम्दानी, खर्च र बचत योजना:
              </label>
              <textarea
                rows={2}
                value={monthlyForm.finance}
                onChange={(e) => setMonthlyForm({ ...monthlyForm, finance: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. YEARLY EDITING FORM                                               */}
      {/* ==================================================================== */}
      {periodMode === 'yearly' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 border border-amber-400/90 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
              <span>🪐</span>
              <span>{yearlyForm.rashiName} राशिको वार्षिक राशिफल सम्पादन (वि.सं. {yearlyForm.yearBS})</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans ${yearlyForm.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {yearlyForm.isPublished ? 'प्रकाशित' : 'मस्यौदा'}
              </span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveYearly(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>मस्यौदा सुरक्षित</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveYearly(true)}
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>तुरुन्त प्रकाशित गर्नुहोस्</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
              वर्षको समग्र ज्योतिषीय विश्लेषण एवं भाग्योदय फल (Yearly Overview):
            </label>
            <textarea
              rows={4}
              value={yearlyForm.yearlyOverview}
              onChange={(e) => setYearlyForm({ ...yearlyForm, yearlyOverview: e.target.value })}
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                प्रमुख ग्रहहरूको गोचर व्याख्या (गुरु, शनि, राहु-केतु):
              </label>
              <textarea
                rows={3}
                value={yearlyForm.majorPlanetaryTransits}
                onChange={(e) => setYearlyForm({ ...yearlyForm, majorPlanetaryTransits: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                वर्षका अवसर तथा सावधानीका विषय:
              </label>
              <textarea
                rows={3}
                value={yearlyForm.opportunitiesAndCautions}
                onChange={(e) => setYearlyForm({ ...yearlyForm, opportunitiesAndCautions: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                कार्यक्षेत्र, नोकरी र व्यवसाय:
              </label>
              <textarea
                rows={2}
                value={yearlyForm.career}
                onChange={(e) => setYearlyForm({ ...yearlyForm, career: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                आर्थिक अवस्था र धनसम्बन्धी सम्भावना:
              </label>
              <textarea
                rows={2}
                value={yearlyForm.finance}
                onChange={(e) => setYearlyForm({ ...yearlyForm, finance: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PREVIEW MODAL                                                        */}
      {/* ==================================================================== */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-3xl w-full max-h-[90vh] bg-white dark:bg-stone-900 rounded-3xl p-6 overflow-y-auto space-y-4 border border-amber-300 dark:border-stone-700 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>👁️</span>
                <span>पूर्वावलोकन: {currentRashiObj.name} राशिफल ({periodMode.toUpperCase()})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {periodMode === 'daily' && (
                <>
                  <div className="p-3 bg-amber-50 dark:bg-stone-800 rounded-xl">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                      {dailyForm.overallVerdict} ({dailyForm.overallScore}%)
                    </span>
                    <p className="leading-relaxed text-stone-800 dark:text-stone-200">{dailyForm.overallSummary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <strong>कार्यक्षेत्र:</strong> {dailyForm.career}
                    </div>
                    <div className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <strong>आर्थिक:</strong> {dailyForm.finance}
                    </div>
                  </div>
                </>
              )}

              {periodMode === 'monthly' && (
                <div className="p-3 bg-indigo-50 dark:bg-stone-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300">{monthlyForm.monthName} महिनाको फल:</h4>
                  <p className="leading-relaxed text-stone-800 dark:text-stone-200">{monthlyForm.overallSummary}</p>
                  <p className="text-stone-600 dark:text-stone-300"><strong>प्रवृत्ति:</strong> {monthlyForm.trendBeginMidEnd}</p>
                </div>
              )}

              {periodMode === 'yearly' && (
                <div className="p-3 bg-amber-50 dark:bg-stone-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-900 dark:text-amber-300">वि.सं. {yearlyForm.yearBS} सालको फल:</h4>
                  <p className="leading-relaxed text-stone-800 dark:text-stone-200">{yearlyForm.yearlyOverview}</p>
                  <p className="text-stone-600 dark:text-stone-300"><strong>गोचर:</strong> {yearlyForm.majorPlanetaryTransits}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
