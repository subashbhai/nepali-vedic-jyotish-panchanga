import React, { useState, useEffect } from 'react';
import {
  Globe,
  Users,
  Activity,
  Smartphone,
  Monitor,
  RefreshCw,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Compass,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';

interface AnalyticsData {
  period: 'today' | '7d' | '30d' | 'all';
  summary: {
    totalVisits: number;
    uniqueVisitors: number;
    todayVisits: number;
    todayUniqueVisitors: number;
    authenticatedVisits: number;
    anonymousVisits: number;
  };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    web: number;
  };
  countries: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  districts: Array<{
    district: string;
    count: number;
    percentage: number;
  }>;
  recentVisits: Array<{
    path: string;
    deviceType: string;
    country: string;
    district: string;
    isAuthenticated: boolean;
    visitedAtISO: string;
  }>;
}

export const AdminVisitorAnalyticsSection: React.FC = () => {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (selectedPeriod: 'today' | '7d' | '30d' | 'all' = period) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/superadmin/analytics?period=${selectedPeriod}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      if (result.success && result.analytics) {
        setData(result.analytics);
      } else {
        setError(result.error || 'विश्लेषण डेटा लोड गर्न सकिएन।');
      }
    } catch (err: any) {
      console.warn('Visitor analytics fetch error:', err);
      setError('सर्भरबाट प्रत्यक्ष विश्लेषण डेटा प्राप्त हुन सकेन।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const summary = data?.summary || {
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    todayUniqueVisitors: 0,
    authenticatedVisits: 0,
    anonymousVisits: 0
  };

  const devices = data?.deviceBreakdown || { desktop: 0, mobile: 0, web: 0 };
  const totalDeviceHits = (devices.desktop + devices.mobile + devices.web) || 1;
  const mobilePct = Math.round((devices.mobile / totalDeviceHits) * 100);
  const desktopPct = Math.round(((devices.desktop + devices.web) / totalDeviceHits) * 100);

  return (
    <div className="space-y-6">
      {/* ── Header & Period Selector ── */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>दर्शक तथा आगन्तुक विश्लेषण</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                  LIVE ANALYTICS
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                गोपनीयता-मैत्री (SHA-256 Hashed), रोबोट फिल्टर गरिएको र क्लाउडफ्लेयर देश ट्र्याकिङसहितको वास्तविक ट्राफिक
              </p>
            </div>
          </div>
        </div>

        {/* Period Pill Toggles + Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex bg-stone-950 p-1 rounded-2xl border border-stone-800 text-xs">
            {(['today', '7d', '30d', 'all'] as const).map((p) => {
              const labels = {
                today: 'आज (Today)',
                '7d': '७ दिन (7 Days)',
                '30d': '३० दिन (30 Days)',
                all: 'सम्पूर्ण (All Time)'
              };
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    period === p
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(period)}
            disabled={loading}
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl border border-stone-700 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="रिफ्रेस गर्नुहोस्"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Key Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Page Views */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wide">
            कुल पेजभ्यु (Visits)
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
            {toDevanagariNumerals(summary.totalVisits)}
          </p>
          <span className="text-[10px] text-stone-500 block">१० सेकेन्ड डिबाउन्स सहित</span>
        </div>

        {/* Unique Visitors */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wide">
            अद्वितीय दर्शक (Unique)
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {toDevanagariNumerals(summary.uniqueVisitors)}
          </p>
          <span className="text-[10px] text-stone-500 block">दैनिक साल्टेड ह्यास</span>
        </div>

        {/* Today's Visits */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wide">
            आजको भ्रमण (Today)
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {toDevanagariNumerals(summary.todayVisits)}
          </p>
          <span className="text-[10px] text-stone-500 block">काठमाडौँ स्थानीय समय</span>
        </div>

        {/* Today Unique */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wide">
            आजका अद्वितीय दर्शक
          </span>
          <p className="text-xl sm:text-2xl font-black text-teal-400 font-mono">
            {toDevanagariNumerals(summary.todayUniqueVisitors)}
          </p>
          <span className="text-[10px] text-stone-500 block">नयाँ तथा दोहोरिएका</span>
        </div>

        {/* Authenticated Users */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wide">
            लगइन भएका सदस्य
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
            {toDevanagariNumerals(summary.authenticatedVisits)}
          </p>
          <span className="text-[10px] text-stone-500 block">सक्रिय खाता भएका</span>
        </div>

        {/* Anonymous Visitors */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wide">
            अनामिक आगन्तुक (Guest)
          </span>
          <p className="text-xl sm:text-2xl font-black text-stone-300 font-mono">
            {toDevanagariNumerals(summary.anonymousVisits)}
          </p>
          <span className="text-[10px] text-stone-500 block">लगइन नगरिएका</span>
        </div>
      </div>

      {/* ── Two Column Breakdown: Countries & Geolocation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Country Breakdown (Cloudflare Header cf-ipcountry) */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>देश अनुसार दर्शक (Country Ranking)</span>
            </h3>
            <span className="text-[10px] font-mono bg-stone-950 px-2 py-0.5 rounded text-amber-400">
              Cloudflare ISO
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {(!data?.countries || data.countries.length === 0) ? (
              <p className="text-xs text-stone-500 py-6 text-center">कुनै देशको विवरण प्राप्त भएन।</p>
            ) : (
              data.countries.map((c) => (
                <div key={c.country} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span className="font-bold flex items-center gap-2">
                      <span className="w-6 text-center font-mono text-[10px] bg-stone-800 px-1 py-0.5 rounded text-amber-300">
                        {c.country}
                      </span>
                      <span>{c.country === 'NP' ? 'नेपाल (Nepal)' : c.country === 'IN' ? 'भारत (India)' : c.country === 'US' ? 'संयुक्त राज्य अमेरिका (USA)' : c.country === 'AU' ? 'अस्ट्रेलिया (Australia)' : c.country === 'GB' ? 'बेलायत (UK)' : c.country === 'JP' ? 'जापान (Japan)' : c.country}</span>
                    </span>
                    <span className="font-mono text-stone-400">
                      {toDevanagariNumerals(c.count)} ({c.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(3, c.percentage))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* District Breakdown: Strictly "Unknown/अनिर्धारित" when undetermined */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>जिल्ला अनुसार वर्गीकरण (District Breakdown)</span>
            </h3>
            <span className="text-[10px] font-mono bg-stone-950 px-2 py-0.5 rounded text-emerald-400">
              Strict Policy
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {(!data?.districts || data.districts.length === 0) ? (
              <p className="text-xs text-stone-500 py-6 text-center">कुनै जिल्लाको विवरण फेला परेन।</p>
            ) : (
              data.districts.map((d) => (
                <div key={d.district} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span className="font-bold flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${d.district.includes('Unknown') ? 'bg-stone-500' : 'bg-emerald-400'}`} />
                      <span>{d.district}</span>
                    </span>
                    <span className="font-mono text-stone-400">
                      {toDevanagariNumerals(d.count)} ({d.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(3, d.percentage))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-stone-950/70 border border-stone-800 rounded-xl text-[11px] text-stone-400">
            <strong>नीति:</strong> यदि डिभाइस वा ब्राउजरले आधिकारिक जिल्ला खुलाएको छैन भने कुनै अनुमान नगरी स्पष्ट रूपमा <code className="text-amber-400 font-mono font-bold">Unknown/अनिर्धारित</code> अभिलेख राखिन्छ।
          </div>
        </div>
      </div>

      {/* ── Device & Platform Ratio ── */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-3 shadow-xl">
        <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2 border-b border-stone-800 pb-2.5">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>डिभाइस तथा प्लेटफर्म अनुपात (Device Platform Distribution)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-200 block">मोबाइल डिभाइस (Mobile App / Web)</span>
                <span className="text-[11px] text-stone-500">{mobilePct}% सम्पूर्ण ट्राफिक</span>
              </div>
            </div>
            <span className="text-xl font-mono font-black text-amber-300">
              {toDevanagariNumerals(devices.mobile)}
            </span>
          </div>

          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-200 block">कम्प्युटर / डेस्कटप (Desktop / PC)</span>
                <span className="text-[11px] text-stone-500">{desktopPct}% सम्पूर्ण ट्राफिक</span>
              </div>
            </div>
            <span className="text-xl font-mono font-black text-blue-300">
              {toDevanagariNumerals(devices.desktop + devices.web)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
