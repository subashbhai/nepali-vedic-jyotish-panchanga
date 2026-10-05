import React, { useState, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  BookOpen,
  Shuffle,
  Eye,
  Info
} from 'lucide-react';
import { BirthDetails, VivahMilanResult, AshtakootScore } from '../../types/astrology';
import { calculateVivahMilan } from '../../utils/vivahEngine';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { NavTab } from '../Navigation';

interface KundaliCompatibilityWidgetProps {
  profiles: BirthDetails[];
  activeProfile?: BirthDetails | null;
  onNavigate?: (tab: NavTab) => void;
  className?: string;
}

// Polar coordinate conversion for SVG gauge arc
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// SVG Arc path generator (gauge style from startAngle to endAngle)
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

export const KundaliCompatibilityWidget: React.FC<KundaliCompatibilityWidgetProps> = ({
  profiles,
  activeProfile,
  onNavigate,
  className = ''
}) => {
  // Candidate male & female profiles list (fallback to any 2 profiles if genders are unspecified)
  const maleProfiles = useMemo(() => {
    const list = profiles.filter((p) => p.gender === 'male');
    return list.length > 0 ? list : profiles;
  }, [profiles]);

  const femaleProfiles = useMemo(() => {
    const list = profiles.filter((p) => p.gender === 'female');
    return list.length > 0 ? list : profiles;
  }, [profiles]);

  // Selected Profile 1 (Boy / Person 1)
  const [person1Id, setPerson1Id] = useState<string>(() => {
    if (activeProfile) return activeProfile.id;
    if (maleProfiles.length > 0) return maleProfiles[0].id;
    if (profiles.length > 0) return profiles[0].id;
    return '';
  });

  // Selected Profile 2 (Girl / Person 2)
  const [person2Id, setPerson2Id] = useState<string>(() => {
    if (activeProfile && profiles.length > 1) {
      const other = profiles.find((p) => p.id !== activeProfile.id);
      if (other) return other.id;
    }
    if (femaleProfiles.length > 0) {
      const match = femaleProfiles.find((p) => p.id !== person1Id);
      if (match) return match.id;
      return femaleProfiles[0].id;
    }
    if (profiles.length > 1) return profiles[1].id;
    return '';
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeKootFilter, setActiveKootFilter] = useState<'all' | 'high_impact'>('all');

  // Resolve current selected person objects
  const person1 = useMemo(() => {
    return profiles.find((p) => p.id === person1Id) || profiles[0] || null;
  }, [profiles, person1Id]);

  const person2 = useMemo(() => {
    return profiles.find((p) => p.id === person2Id) || (profiles.length > 1 ? profiles[1] : null);
  }, [profiles, person2Id]);

  // Comprehensive Vivah Milan computation via classical vivahEngine
  const vivahMilanResult: VivahMilanResult | null = useMemo(() => {
    if (!person1 || !person2 || person1.id === person2.id) {
      // If same person or missing, create synthetic default comparison between person1 and standard counterpart
      if (person1) {
        const dummyPartner: BirthDetails = {
          id: 'partner_default',
          name: person1.gender === 'female' ? 'वर (प्रतिपक्ष वर)' : 'कन्या (प्रतिपक्ष कन्या)',
          gender: person1.gender === 'female' ? 'male' : 'female',
          dateBS: '२०५३-०५-१०',
          dateAD: '1996-08-25',
          time: '०७:४५',
          location: {
            name: 'काठमाडौँ',
            country: 'नेपाल',
            latitude: 27.7172,
            longitude: 85.3240,
            timeZone: 5.75
          }
        };
        return calculateVivahMilan(
          person1.gender === 'female' ? dummyPartner : person1,
          person1.gender === 'female' ? person1 : dummyPartner
        );
      }
      return null;
    }

    // Pass Boy first if distinguishable, otherwise person1, person2
    const boy = person1.gender === 'female' ? person2 : person1;
    const girl = person1.gender === 'female' ? person1 : person2;
    return calculateVivahMilan(boy, girl);
  }, [person1, person2]);

  // Swap profiles button
  const handleSwapProfiles = () => {
    const temp = person1Id;
    setPerson1Id(person2Id);
    setPerson2Id(temp);
  };

  // Score statistics & percentages (out of 36)
  const totalScore = vivahMilanResult?.totalScore ?? 24;
  const scorePercentage = Math.round((totalScore / 36) * 100);

  // Status badge config
  const statusConfig = useMemo(() => {
    if (totalScore >= 28) {
      return {
        label: 'अति उत्तम (Excellent Match)',
        sublabel: 'अष्टकूट मिलान असाध्यै शुभ एवं फलदायी',
        color: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800',
        badgeColor: 'bg-emerald-600',
        gradientStart: '#10B981',
        gradientEnd: '#059669',
        gaugeZoneColor: '#10B981',
      };
    }
    if (totalScore >= 18) {
      return {
        label: 'शुभ / अनुकूल (Good Match)',
        sublabel: 'शास्त्रसम्मत १८ भन्दा बढी गुण प्राप्त',
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800',
        badgeColor: 'bg-amber-600',
        gradientStart: '#F59E0B',
        gradientEnd: '#D97706',
        gaugeZoneColor: '#F59E0B',
      };
    }
    return {
      label: 'मध्यम / अध्ययन आवश्यक (Needs Remedy)',
      sublabel: '१८ भन्दा कम गुण वा दोष शान्ति आवश्यक',
      color: 'text-rose-700 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800',
      badgeColor: 'bg-rose-600',
      gradientStart: '#F43F5E',
      gradientEnd: '#E11D48',
      gaugeZoneColor: '#F43F5E',
    };
  }, [totalScore]);

  // Semi-circle Gauge Geometry (180 degree span from 0° to 180°)
  const GAUGE_CX = 150;
  const GAUGE_CY = 140;
  const GAUGE_RADIUS = 110;
  const GAUGE_STROKE_WIDTH = 18;

  // Calculate pointer & progress arc angles
  // 0 points = 0°, 36 points = 180°
  const clampedScore = Math.max(0, Math.min(36, totalScore));
  const gaugeAngle = (clampedScore / 36) * 180;

  // Background Arc (0 to 180 degrees)
  const bgArcPath = describeArc(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS, 0, 180);

  // Active Value Arc (0 to gaugeAngle)
  const valueArcPath = gaugeAngle > 0 ? describeArc(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS, 0, gaugeAngle) : '';

  // Needle pointer endpoint
  const needleAngle = gaugeAngle; // 0 to 180
  const needleCoord = polarToCartesian(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS - 16, needleAngle);

  // 18 Guna Minimum threshold marker on the gauge (18 / 36 * 180 = 90°)
  const thresholdCoordOuter = polarToCartesian(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS + 12, 90);
  const thresholdCoordInner = polarToCartesian(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS - 12, 90);

  // Koot list
  const ashtakootScores: AshtakootScore[] = vivahMilanResult?.ashtakoot || [];

  // Filtered Koot list
  const displayedKoots = useMemo(() => {
    if (activeKootFilter === 'high_impact') {
      // High weight Kutas: Nadi (8), Bhakoot (7), Gana (6), Graha Maitri (5)
      return ashtakootScores.filter((k) => k.maxPoints >= 5);
    }
    return ashtakootScores;
  }, [ashtakootScores, activeKootFilter]);

  // Mangal Dosha summary
  const boyManglik = vivahMilanResult?.mangalDoshaBoy;
  const girlManglik = vivahMilanResult?.mangalDoshaGirl;
  const isMangalCancelled = vivahMilanResult?.isMangalDoshaCancelled;

  return (
    <div
      id="kundali-compatibility-calculator-widget"
      data-testid="kundali-compatibility-calculator-widget"
      className={`bg-white dark:bg-stone-900 rounded-2xl border border-rose-200/90 dark:border-stone-800 shadow-sm relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Top Auspicious Rose-Gold decorative border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-red-600" />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Header: Title & Action to Full Vivah Milan Tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 via-orange-500/15 to-amber-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400 fill-rose-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800 shadow-2xs">
                  ३६ गुण कुण्डली मिलान (Ashtakoot 36 Gunas)
                </span>
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>विवाह अनुकूलता क्यालकुलेटर</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 mt-0.5">
                कुण्डली अनुकूलता मापन (Compatibility Gauge)
              </h3>
            </div>
          </div>

          {/* Navigate to Full Vivah Milan View */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('vivah')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 transition cursor-pointer self-start sm:self-auto"
              title="विस्तृत ३६ गुण तथा विवाह मिलान पृष्ठमा जानुहोस्"
            >
              <span>विस्तृत विवाह मिलान</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Profile Selectors: Person 1 (Boy/Partner 1) & Person 2 (Girl/Partner 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-stone-50 dark:bg-stone-850/60 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
          {/* Person 1 Selector */}
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>पहिलो व्यक्ति (वर / व्यक्ति १):</span>
            </label>
            <select
              id="select-compatibility-person1"
              value={person1?.id || ''}
              onChange={(e) => setPerson1Id(e.target.value)}
              className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={`p1-${p.id}`} value={p.id}>
                  {p.name} ({p.gender === 'female' ? 'कन्या' : 'वर'} • {p.dateBS || p.dateAD})
                </option>
              ))}
              {profiles.length === 0 && <option value="">कुनै कुण्डली उपलब्ध छैन</option>}
            </select>
          </div>

          {/* Swap Button */}
          <div className="sm:col-span-2 flex justify-center py-1">
            <button
              onClick={handleSwapProfiles}
              className="p-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 shadow-2xs transition cursor-pointer active:scale-95"
              title="व्यक्ति १ र २ साटासाट गर्नुहोस् (Swap)"
            >
              <Shuffle className="w-3.5 h-3.5 text-rose-600" />
            </button>
          </div>

          {/* Person 2 Selector */}
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>दोस्रो व्यक्ति (कन्या / व्यक्ति २):</span>
            </label>
            <select
              id="select-compatibility-person2"
              value={person2?.id || ''}
              onChange={(e) => setPerson2Id(e.target.value)}
              className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={`p2-${p.id}`} value={p.id}>
                  {p.name} ({p.gender === 'female' ? 'कन्या' : 'वर'} • {p.dateBS || p.dateAD})
                </option>
              ))}
              {profiles.length <= 1 && (
                <option value="partner_default">प्रतिपक्ष जोडी (तुलनात्मक विवरण)</option>
              )}
            </select>
          </div>
        </div>

        {/* MAIN COMPATIBILITY GAUGE & VERDICT SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-gradient-to-br from-rose-50/60 via-amber-50/40 to-stone-50 dark:from-stone-850 dark:via-stone-900 dark:to-stone-900 p-5 rounded-2xl border border-rose-200/70 dark:border-stone-800">
          {/* Gauge Chart SVG (Left 5 Cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full max-w-[280px] aspect-[4/3] flex items-center justify-center">
              <svg
                viewBox="0 0 300 200"
                className="w-full h-full drop-shadow-xs overflow-visible"
                aria-label={`३६ गुण मध्ये ${totalScore} गुण प्राप्त`}
              >
                <defs>
                  {/* Gauge active value gradient */}
                  <linearGradient id="compatGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="80%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  {/* Needle shadow */}
                  <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Outer decorative track */}
                <path
                  d={describeArc(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS + 12, 0, 180)}
                  fill="none"
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />

                {/* Background Full Track (180 degrees) */}
                <path
                  d={bgArcPath}
                  fill="none"
                  stroke="currentColor"
                  className="text-stone-200 dark:text-stone-800"
                  strokeWidth={GAUGE_STROKE_WIDTH}
                  strokeLinecap="round"
                />

                {/* Auspicious Passing Score Zone Marker (18 to 36 = right 90 degs) */}
                <path
                  d={describeArc(GAUGE_CX, GAUGE_CY, GAUGE_RADIUS, 90, 180)}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={GAUGE_STROKE_WIDTH}
                  strokeOpacity="0.15"
                  strokeLinecap="round"
                />

                {/* Active Score Arc */}
                {valueArcPath && (
                  <path
                    d={valueArcPath}
                    fill="none"
                    stroke="url(#compatGaugeGradient)"
                    strokeWidth={GAUGE_STROKE_WIDTH}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                )}

                {/* 18 Guna Minimum Auspicious Threshold Divider Line */}
                <line
                  x1={thresholdCoordInner.x}
                  y1={thresholdCoordInner.y}
                  x2={thresholdCoordOuter.x}
                  y2={thresholdCoordOuter.y}
                  stroke="#D97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <text
                  x={thresholdCoordOuter.x}
                  y={thresholdCoordOuter.y - 6}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-amber-700 dark:fill-amber-400 font-sans"
                >
                  १८ (न्यूनतम)
                </text>

                {/* Ticks at 0, 9, 18, 27, 36 */}
                <text x="26" y="152" textAnchor="middle" className="text-[10px] fill-stone-400 font-sans">०</text>
                <text x="80" y="70" textAnchor="middle" className="text-[10px] fill-stone-400 font-sans">९</text>
                <text x="220" y="70" textAnchor="middle" className="text-[10px] fill-stone-400 font-sans">२७</text>
                <text x="274" y="152" textAnchor="middle" className="text-[10px] fill-stone-400 font-sans">३६</text>

                {/* Needle Pointer */}
                <line
                  x1={GAUGE_CX}
                  y1={GAUGE_CY}
                  x2={needleCoord.x}
                  y2={needleCoord.y}
                  stroke="#1E293B"
                  className="dark:stroke-stone-100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#needleShadow)"
                />

                {/* Center Hub Circles */}
                <circle cx={GAUGE_CX} cy={GAUGE_CY} r="10" fill="#1E293B" className="dark:fill-stone-100" />
                <circle cx={GAUGE_CX} cy={GAUGE_CY} r="4" fill="#F59E0B" />
              </svg>

              {/* Centered Large Score Overlay */}
              <div className="absolute bottom-1 flex flex-col items-center pointer-events-none">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold font-serif text-[#1A1A1A] dark:text-stone-100 tracking-tight">
                    {toDevanagariNumerals(totalScore)}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-500 dark:text-stone-400">
                    / ३६ गुण
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                  कुल अनुकूलता: {toDevanagariNumerals(scorePercentage)}%
                </span>
              </div>
            </div>

            {/* Threshold Guide */}
            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5 text-center">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>१८ भन्दा माथिको गुणलाई शास्त्रीय रूपमा विवाह योग्य मानिन्छ।</span>
            </div>
          </div>

          {/* Verdict & Astrological Factors Summary (Right 7 Cols) */}
          <div className="md:col-span-7 space-y-3">
            {/* Status Pill Card */}
            <div className={`p-4 rounded-xl border ${statusConfig.bg} space-y-1.5 shadow-2xs`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${statusConfig.color}`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{statusConfig.label}</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-stone-900/80 font-bold border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                  {vivahMilanResult?.overallCompatibility || 'शुभ'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 font-serif leading-relaxed">
                {vivahMilanResult?.recommendationNepali ||
                  `${person1?.name || 'व्यक्ति १'} र ${person2?.name || 'व्यक्ति २'} बीचको कुण्डली मिलानमा कुल ३६ मध्ये ${toDevanagariNumerals(totalScore)} गुण प्राप्त भएको छ।`}
              </p>
            </div>

            {/* Essential Astrological Key Indicators (Mangal Dosha & Nadi) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Mangal Dosha Card */}
              <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    <span>मंगल दोष विश्लेषण</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isMangalCancelled || (!boyManglik?.isManglik && !girlManglik?.isManglik)
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {isMangalCancelled ? 'परिहार/शमित' : (boyManglik?.isManglik || girlManglik?.isManglik) ? 'दोष उपस्थित' : 'निर्दोष'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {boyManglik?.isManglik
                    ? `वरमा मंगल दोष (${boyManglik.severity})`
                    : 'वरमा मंगल दोष छैन'} • {girlManglik?.isManglik ? `कन्यामा मंगल दोष (${girlManglik.severity})` : 'कन्यामा मंगल दोष छैन'}
                </p>
              </div>

              {/* Nadi Koot Check Card (8 Points) */}
              {(() => {
                const nadi = ashtakootScores.find((k) => k.kootName === 'Nadi');
                const isNadiGood = nadi ? nadi.obtainedPoints > 0 : false;
                return (
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isNadiGood ? 'text-emerald-600' : 'text-rose-500'}`} />
                        <span>नाडी कूट (स्वास्थ्य र सन्तान)</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isNadiGood
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {toDevanagariNumerals(nadi?.obtainedPoints ?? 0)}/८ अङ्क
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {nadi?.descriptionNepali || (isNadiGood ? 'नाडी दोष परिहार अनुकूल।' : 'नाडी दोष अध्ययन आवश्यक।')}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Quick Positive & Alert Signals */}
            {vivahMilanResult?.positiveSignalsNepali && vivahMilanResult.positiveSignalsNepali.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{vivahMilanResult.positiveSignalsNepali[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* EXPANDABLE ASHTAKOOT 8-FOLD BREAKDOWN TOGGLE */}
        <div className="pt-1">
          <div className="flex items-center justify-between">
            <button
              id="btn-toggle-ashtakoot-breakdown"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>अष्टकूट ८-गुण विस्तृत तालिका ({toDevanagariNumerals(ashtakootScores.length)} कूट)</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {isExpanded && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveKootFilter('all')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                    activeKootFilter === 'all'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  सबै (८)
                </button>
                <button
                  onClick={() => setActiveKootFilter('high_impact')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                    activeKootFilter === 'high_impact'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  मुख्य कूट (५+ अङ्क)
                </button>
              </div>
            )}
          </div>

          {/* Expandable Ashtakoot Table Grid */}
          {isExpanded && (
            <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-stone-50 dark:bg-stone-800/60">
                {displayedKoots.map((koot) => {
                  const isPerfect = koot.obtainedPoints === koot.maxPoints;
                  const isZero = koot.obtainedPoints === 0;
                  return (
                    <div
                      key={`koot-${koot.kootName}`}
                      className="bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700/80 space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800 dark:text-stone-200">
                          {koot.kootNepali} ({koot.kootName})
                        </span>
                        <span
                          className={`text-xs font-extrabold px-1.5 py-0.2 rounded font-sans ${
                            isPerfect
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isZero
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {toDevanagariNumerals(koot.obtainedPoints)}/{toDevanagariNumerals(koot.maxPoints)}
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isPerfect ? 'bg-emerald-500' : isZero ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${(koot.obtainedPoints / koot.maxPoints) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-tight">
                        {koot.descriptionNepali}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
