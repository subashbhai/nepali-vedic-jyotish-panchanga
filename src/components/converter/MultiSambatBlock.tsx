import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Compass,
  Layers,
  Info,
  CalendarDays
} from 'lucide-react';
import {
  convertBSToMultiSambat,
  convertNSToMultiSambat,
  convertTibetanToMultiSambat,
  convertADToMultiSambat,
  NEPAL_SAMBAT_MONTHS,
  NEPAL_SAMBAT_PAKSHAS,
  NEWA_TITHIS,
  MultiSambatResult
} from '../../utils/sambatConverterEngine';
import { NEPALI_MONTH_NAMES, getBSDaysInMonth, convertADToBSFull } from '../../utils/bsCalendarData';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

export const MultiSambatBlock: React.FC = () => {
  // Source Era: 'BS' | 'NS' | 'TIBETAN' | 'AD'
  const [sourceEra, setSourceEra] = useState<'BS' | 'NS' | 'TIBETAN' | 'AD'>('BS');

  // Today reference
  const todayAD = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayBS = useMemo(() => convertADToBSFull(todayAD), [todayAD]);

  // BS Inputs
  const [bsYear, setBsYear] = useState<number>(todayBS.year);
  const [bsMonth, setBsMonth] = useState<number>(todayBS.month);
  const [bsDay, setBsDay] = useState<number>(todayBS.day);

  // NS Inputs
  const [nsYear, setNsYear] = useState<number>(todayBS.year - 937);
  const [nsMonthIdx, setNsMonthIdx] = useState<number>(0);
  const [nsPaksha, setNsPaksha] = useState<'thwa' | 'ga'>('thwa');
  const [nsTithiDay, setNsTithiDay] = useState<number>(1);

  // Tibetan Inputs
  const [tibetanYear, setTibetanYear] = useState<number>(new Date().getFullYear() + 127);
  const [tibetanMonth, setTibetanMonth] = useState<number>(1);
  const [tibetanDay, setTibetanDay] = useState<number>(1);

  // AD Inputs
  const [adDate, setAdDate] = useState<string>(todayAD);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Computed multi-sambat result
  const result: MultiSambatResult = useMemo(() => {
    try {
      if (sourceEra === 'BS') {
        const maxDays = getBSDaysInMonth(bsYear, bsMonth);
        const safeDay = Math.min(Math.max(bsDay, 1), maxDays);
        return convertBSToMultiSambat(bsYear, bsMonth, safeDay);
      } else if (sourceEra === 'NS') {
        return convertNSToMultiSambat(nsYear, nsMonthIdx, nsPaksha, nsTithiDay);
      } else if (sourceEra === 'TIBETAN') {
        return convertTibetanToMultiSambat(tibetanYear, tibetanMonth, tibetanDay);
      } else {
        return convertADToMultiSambat(adDate || todayAD);
      }
    } catch (e) {
      return convertBSToMultiSambat(todayBS.year, todayBS.month, todayBS.day);
    }
  }, [sourceEra, bsYear, bsMonth, bsDay, nsYear, nsMonthIdx, nsPaksha, nsTithiDay, tibetanYear, tibetanMonth, tibetanDay, adDate, todayAD, todayBS]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleResetToToday = () => {
    setBsYear(todayBS.year);
    setBsMonth(todayBS.month);
    setBsDay(todayBS.day);
    setAdDate(todayAD);
    setSourceEra('BS');
  };

  return (
    <div className="bg-white dark:bg-[#1E1B18] rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-md p-4 sm:p-6 overflow-hidden">
      {/* Block Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
                नेपाल संवत्, नेवाः संवत्, नेमा तिब्बती संवत् तथा विक्रम संवत् रूपान्तरण
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                नेपालको मौलिक संवत्, हिमालयन तिब्बती लोसार संवत्, विक्रम संवत् (BS) र ईस्वी संवत् (AD) बीच दुईतर्फी रूपान्तरण
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetToToday}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>आजको मिति</span>
        </button>
      </div>

      {/* Era Selector Tabs */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
          रूपान्तरण गर्न चाहनुभएको मुख्य संवत् (Source Sambat) छान्नुहोस्:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setSourceEra('BS')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              sourceEra === 'BS'
                ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-sm'
                : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>🌞 विक्रम संवत् (BS)</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceEra('NS')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              sourceEra === 'NS'
                ? 'bg-[#D97706] text-white border-[#D97706] shadow-sm'
                : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>🇳🇵 नेपाल संवत् (NS)</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceEra('TIBETAN')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              sourceEra === 'TIBETAN'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>🏔️ नेमा तिब्बती संवत्</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceEra('AD')}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              sourceEra === 'AD'
                ? 'bg-stone-800 text-white border-stone-800 dark:bg-stone-200 dark:text-stone-900 shadow-sm'
                : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            <span>🌐 ईस्वी संवत् (AD)</span>
          </button>
        </div>
      </div>

      {/* Dynamic Input Row based on chosen Source Era */}
      <div className="bg-[#FAF7F2] dark:bg-[#25201A] p-4 rounded-xl border border-amber-200/60 dark:border-stone-700 mb-6">
        {sourceEra === 'BS' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                वि.सं. वर्ष (Year BS)
              </label>
              <input
                type="number"
                min="1970"
                max="2100"
                value={bsYear}
                onChange={(e) => setBsYear(parseInt(e.target.value, 10) || todayBS.year)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                महिना (Month)
              </label>
              <select
                value={bsMonth}
                onChange={(e) => setBsMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {NEPALI_MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx + 1}>
                    {name} ({idx + 1})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                गते (Day)
              </label>
              <input
                type="number"
                min="1"
                max={getBSDaysInMonth(bsYear, bsMonth)}
                value={bsDay}
                onChange={(e) => setBsDay(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {sourceEra === 'NS' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                नेपाल संवत् वर्ष (Year NS)
              </label>
              <input
                type="number"
                min="1000"
                max="1200"
                value={nsYear}
                onChange={(e) => setNsYear(parseInt(e.target.value, 10) || 1145)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                नेवाः महिना (NS Month)
              </label>
              <select
                value={nsMonthIdx}
                onChange={(e) => setNsMonthIdx(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {NEPAL_SAMBAT_MONTHS.map((m) => (
                  <option key={m.index} value={m.index}>
                    {m.nameNewa}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                पक्ष (Paksha)
              </label>
              <select
                value={nsPaksha}
                onChange={(e) => setNsPaksha(e.target.value as 'thwa' | 'ga')}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {NEPAL_SAMBAT_PAKSHAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameNewa} ({p.nameNepali})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                तिथि (Tithi Day: 1-15)
              </label>
              <select
                value={nsTithiDay}
                onChange={(e) => setNsTithiDay(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {NEWA_TITHIS.map((t, idx) => (
                  <option key={idx} value={idx + 1}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {sourceEra === 'TIBETAN' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                बोद संवत् वर्ष (Bod Year - Royal)
              </label>
              <input
                type="number"
                min="2000"
                max="2250"
                value={tibetanYear}
                onChange={(e) => setTibetanYear(parseInt(e.target.value, 10) || 2151)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                तिब्बती महिना (दा-वा १ देखि १२)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={tibetanMonth}
                onChange={(e) => setTibetanMonth(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                तिब्बती दिन (त्शे १ देखि ३०)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={tibetanDay}
                onChange={(e) => setTibetanDay(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {sourceEra === 'AD' && (
          <div className="max-w-md">
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
              ईस्वी सन् मिति (AD Date: YYYY-MM-DD)
            </label>
            <input
              type="date"
              value={adDate}
              onChange={(e) => setAdDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* 4 Comparative Sambat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. नेपाल संवत् / नेवाः संवत् */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/40 dark:border-amber-500/30 rounded-2xl p-4 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-[#B45309] dark:text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30">
              🇳🇵 नेपाल संवत् (नेवाः संवत्)
            </span>
            <button
              type="button"
              onClick={() => handleCopy(result.ns.formatted, 'ns')}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
              title="प्रतिलिपि गर्नुहोस्"
            >
              {copiedKey === 'ns' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-1">
            नेपाल संवत् {toDevanagariNumerals(result.ns.year)}
          </div>
          <div className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
            {result.ns.monthNameNewa} • {result.ns.pakshaName} ({result.ns.tithiNameNewa})
          </div>

          <div className="text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-amber-300/40 dark:border-amber-500/20">
            <span className="font-semibold text-stone-700 dark:text-stone-300">विशेषता:</span> {result.ns.sankhadharInfo}
          </div>
        </div>

        {/* 2. नेमा तिब्बती संवत् / लोसार संवत् */}
        <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-400/40 dark:border-blue-500/30 rounded-2xl p-4 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30">
              🏔️ नेमा तिब्बती संवत् (लोसार)
            </span>
            <button
              type="button"
              onClick={() => handleCopy(result.tibetan.formatted, 'tibetan')}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
              title="प्रतिलिपि गर्नुहोस्"
            >
              {copiedKey === 'tibetan' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-1">
            बोद संवत् {toDevanagariNumerals(result.tibetan.royalYear)} (ग्याल्पो)
          </div>
          <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
            {result.tibetan.cycleDescription}
          </div>

          <div className="text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-blue-300/40 dark:border-blue-500/20 flex flex-wrap gap-2">
            <span>• सोनाम/तामाङ संवत्: <b>{toDevanagariNumerals(result.tibetan.sonamYear)}</b></span>
            <span>• तमु संवत्: <b>{toDevanagariNumerals(result.tibetan.tamuYear)}</b></span>
            <span>• मेवा: <b>{toDevanagariNumerals(result.tibetan.mewaNumber)}</b></span>
          </div>
        </div>

        {/* 3. विक्रम संवत् (BS) */}
        <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-400/40 dark:border-red-500/30 rounded-2xl p-4 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-[#7A1C1C] dark:text-rose-300 text-xs font-bold rounded-lg border border-red-500/30">
              🌞 विक्रम संवत् (नेपाली क्यालेन्डर)
            </span>
            <button
              type="button"
              onClick={() => handleCopy(result.bs.formatted, 'bs')}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
              title="प्रतिलिपि गर्नुहोस्"
            >
              {copiedKey === 'bs' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-1">
            वि.सं. {toDevanagariNumerals(result.bs.year)} {result.bs.monthNameNepali} {toDevanagariNumerals(result.bs.day)} गते
          </div>
          <div className="text-sm font-semibold text-rose-950 dark:text-rose-200 mb-2">
            {result.bs.dayNameNepali} • ऋतु: {result.bs.ritu} • {result.bs.ayana}
          </div>

          <div className="text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-red-300/40 dark:border-red-500/20">
            <span className="font-semibold text-stone-700 dark:text-stone-300">संवत्सर:</span> {result.bs.samvatsara}
          </div>
        </div>

        {/* 4. ईस्वी संवत् (AD) */}
        <div className="bg-gradient-to-br from-stone-500/10 via-stone-500/5 to-transparent border border-stone-300 dark:border-stone-700 rounded-2xl p-4 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-500/20 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-lg border border-stone-400/30">
              🌐 ईस्वी संवत् (Gregorian AD)
            </span>
            <button
              type="button"
              onClick={() => handleCopy(result.ad.formatted, 'ad')}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
              title="प्रतिलिपि गर्नुहोस्"
            >
              {copiedKey === 'ad' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-1">
            {result.ad.dateString}
          </div>
          <div className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            Day: {result.ad.dayOfWeek} (International Standard)
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200 dark:border-stone-700">
            विश्वव्यापी मान्यता प्राप्त ग्रेगोरियन पात्रो मिति
          </div>
        </div>
      </div>
    </div>
  );
};
