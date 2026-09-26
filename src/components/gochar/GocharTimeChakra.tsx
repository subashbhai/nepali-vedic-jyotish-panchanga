import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sun,
  Moon as MoonIcon,
  Compass,
  Info,
  CalendarDays
} from 'lucide-react';
import { PlanetPosition, BirthDetails, LagnaInfo } from '../../types/astrology';
import { calculatePanchanga } from '../../utils/panchangaEngine';
import {
  getJulianDay,
  getAyanamsa,
  calculateLagna,
  calculatePlanetaryPositions,
  RASHI_DATA
} from '../../utils/astroCalculations';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface GocharTimeChakraProps {
  birthMoon: PlanetPosition;
  birthLagna?: LagnaInfo;
  activeProfile?: BirthDetails | null;
  baseDateAD: string; // e.g. "2026-09-16"
  className?: string;
}

// Helper to convert polar coordinate to SVG cartesian
function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export const GocharTimeChakra: React.FC<GocharTimeChakraProps> = ({
  birthMoon,
  birthLagna,
  activeProfile,
  baseDateAD,
  className = '',
}) => {
  // Slider offset in minutes (0 to 1440 mins = 24 hours)
  const [sliderMinutes, setSliderMinutes] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Play / Pause auto progression
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setSliderMinutes((prev) => {
          if (prev >= 1440) return 0;
          return prev + 15; // advance 15 mins every 350ms
        });
      }, 350);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying]);

  // Derived target Date and Time
  const { targetDateAD, targetTimeStr, formattedOffset } = useMemo(() => {
    const base = new Date(`${baseDateAD}T06:00:00Z`);
    const target = new Date(base.getTime() + sliderMinutes * 60 * 1000);

    const y = target.getUTCFullYear();
    const m = String(target.getUTCMonth() + 1).padStart(2, '0');
    const d = String(target.getUTCDate()).padStart(2, '0');
    const hh = String(target.getUTCHours()).padStart(2, '0');
    const mm = String(target.getUTCMinutes()).padStart(2, '0');

    const hrs = Math.floor(sliderMinutes / 60);
    const mins = sliderMinutes % 60;
    const offsetStr = hrs > 0 
      ? `+${hrs} घण्टा ${mins > 0 ? `${mins} मिनेट` : ''}`
      : mins > 0 
      ? `+${mins} मिनेट` 
      : 'वर्तमान समय (० मिनेट)';

    return {
      targetDateAD: `${y}-${m}-${d}`,
      targetTimeStr: `${hh}:${mm}`,
      formattedOffset: offsetStr,
    };
  }, [baseDateAD, sliderMinutes]);

  // Calculate planetary positions & Lagna at target date/time
  const { transitPlanets, transitMoon, transitPanchanga } = useMemo(() => {
    const lat = activeProfile?.location?.latitude ?? 27.7172;
    const lng = activeProfile?.location?.longitude ?? 85.324;
    const tz = activeProfile?.location?.timeZone ?? 5.75;

    const jd = getJulianDay(targetDateAD, targetTimeStr, tz);
    const ayan = getAyanamsa(jd);
    const lagna = calculateLagna(jd, ayan, lat, lng);
    const planets = calculatePlanetaryPositions(jd, ayan, lagna.rashiId);
    const panchanga = calculatePanchanga(targetDateAD, targetTimeStr, lat, lng, tz);

    const moon = planets.find((p) => p.englishName === 'Moon' || p.name === 'चन्द्र') || planets[1];

    return {
      transitPlanets: planets,
      transitMoon: moon,
      transitLagna: lagna,
      transitPanchanga: panchanga,
    };
  }, [targetDateAD, targetTimeStr, activeProfile]);

  // Upcoming transitions over the 24-hour progression
  const upcomingTransitions = useMemo(() => {
    const items: Array<{
      type: 'nakshatra' | 'yoga' | 'tithi';
      label: string;
      current: string;
      endTime: string;
    }> = [];

    if (transitPanchanga) {
      items.push({
        type: 'nakshatra',
        label: 'नक्षत्र परिवर्तन',
        current: transitPanchanga.nakshatra.name,
        endTime: transitPanchanga.nakshatra.endTime,
      });
      items.push({
        type: 'yoga',
        label: 'योग परिवर्तन',
        current: transitPanchanga.yoga.name,
        endTime: transitPanchanga.yoga.endTime,
      });
      items.push({
        type: 'tithi',
        label: 'तिथि परिवर्तन',
        current: `${transitPanchanga.tithi.name} (${transitPanchanga.tithi.paksha})`,
        endTime: transitPanchanga.tithi.endTime,
      });
    }

    return items;
  }, [transitPanchanga]);

  // Chart Geometry constants
  const CX = 200;
  const CY = 200;
  const R_OUTER = 185;
  const R_ZODIAC = 145;
  const R_INNER = 105;
  const R_CORE = 60;

  // Planet color map by englishName
  const planetColors: Record<string, string> = {
    Sun: '#EA580C',
    Moon: '#3B82F6',
    Mars: '#EF4444',
    Mercury: '#10B981',
    Jupiter: '#F59E0B',
    Venus: '#EC4899',
    Saturn: '#6366F1',
    Rahu: '#8B5CF6',
    Ketu: '#78716C',
  };

  return (
    <div className={`bg-stone-900/90 dark:bg-stone-950/95 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-stone-100 space-y-6 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <h3 className="text-lg font-bold font-serif text-amber-300">
              समय चक्र (Dynamic 24-Hour Time-Progression Dial)
            </h3>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            जन्म कुण्डलीमाथि प्रत्यक्ष गोचर ग्रहहरूको २४ घण्टे समय-परिक्रमा र नक्षत्र-योग परिवर्तन
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'रोक्नुहोस् (Pause)' : 'अग्रगमन (Play)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setSliderMinutes(0);
            }}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
            title="वर्तमान समयमा रिसेट"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>अहिले</span>
          </button>
        </div>
      </div>

      {/* Interactive Time Slider */}
      <div className="bg-stone-950/70 border border-stone-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">समय विस्थापन:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
              {formattedOffset}
            </span>
          </div>
          <div className="flex items-center gap-3 text-stone-300 font-mono text-xs">
            <span>📅 {targetDateAD}</span>
            <span className="font-bold text-amber-300">⏰ {targetTimeStr} बजे</span>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={1440}
          step={5}
          value={sliderMinutes}
          onChange={(e) => {
            setIsPlaying(false);
            setSliderMinutes(Number(e.target.value));
          }}
          className="w-full h-2.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
        />

        <div className="flex justify-between text-[11px] text-stone-500 font-mono">
          <span>० घण्टा (प्रारम्भ)</span>
          <span>+६ घण्टा</span>
          <span>+१२ घण्टा (मध्याह्न)</span>
          <span>+१८ घण्टा</span>
          <span>+२४ घण्टा (भोलि)</span>
        </div>
      </div>

      {/* Main Dial & Live Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Circular Time Chakra Dial */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-[380px] aspect-square">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full drop-shadow-2xl select-none"
            >
              {/* Outer Glow & Background */}
              <circle cx={CX} cy={CY} r={R_OUTER} fill="#1C1917" stroke="#44403C" strokeWidth="2" />
              <circle cx={CX} cy={CY} r={R_ZODIAC} fill="#141210" stroke="#78716C" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx={CX} cy={CY} r={R_INNER} fill="#0C0A09" stroke="#57534E" strokeWidth="1" />
              <circle cx={CX} cy={CY} r={R_CORE} fill="#1C1917" stroke="#D97706" strokeWidth="2" />

              {/* 12 Rashi Sectors (30 deg each) */}
              {RASHI_DATA.map((rashi, i) => {
                const startAngle = i * 30;
                const midAngle = startAngle + 15;
                const p1 = polarToXY(CX, CY, R_INNER, startAngle);
                const p2 = polarToXY(CX, CY, R_OUTER, startAngle);
                const textPos = polarToXY(CX, CY, (R_INNER + R_ZODIAC) / 2, midAngle);

                // Highlight birth moon rashi and transit moon rashi
                const isBirthMoonRashi = birthMoon && birthMoon.rashiId === rashi.id;
                const isTransitMoonRashi = transitMoon && transitMoon.rashiId === rashi.id;

                return (
                  <g key={rashi.id}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#44403C"
                      strokeWidth="1"
                    />
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="9"
                      fontWeight="bold"
                      fill={isTransitMoonRashi ? '#38BDF8' : isBirthMoonRashi ? '#FBBF24' : '#A8A29E'}
                    >
                      {rashi.name}
                    </text>
                  </g>
                );
              })}

              {/* Natal Birth Lagna Pointer */}
              {birthLagna && (
                (() => {
                  const deg = (birthLagna.rashiId - 1) * 30 + (birthLagna.degree || 15);
                  const pt = polarToXY(CX, CY, R_ZODIAC, deg);
                  return (
                    <g>
                      <line
                        x1={CX}
                        y1={CY}
                        x2={pt.x}
                        y2={pt.y}
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeDasharray="4,2"
                      />
                      <circle cx={pt.x} cy={pt.y} r="3" fill="#F59E0B" />
                    </g>
                  );
                })()
              )}

              {/* Transit Planets plotted on the circle */}
              {transitPlanets.map((planet) => {
                const totalDegree = ((planet.rashiId - 1) * 30 + (planet.degree || 0)) % 360;
                const pos = polarToXY(CX, CY, (R_ZODIAC + R_OUTER) / 2, totalDegree);
                const color = planetColors[planet.englishName] || '#FBBF24';
                const isMoon = planet.englishName === 'Moon' || planet.name === 'चन्द्र';

                return (
                  <g key={planet.id || planet.englishName} className="cursor-pointer">
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isMoon ? '9' : '7'}
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="transition-all duration-300"
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="7"
                      fontWeight="bold"
                      fill="#FFFFFF"
                    >
                      {planet.symbol || planet.name.slice(0, 1)}
                    </text>
                  </g>
                );
              })}

              {/* Center Hub Indicator */}
              <circle cx={CX} cy={CY} r="18" fill="#78350F" stroke="#F59E0B" strokeWidth="2" />
              <text
                x={CX}
                y={CY - 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="bold"
                fill="#FEF3C7"
              >
                काल
              </text>
              <text
                x={CX}
                y={CY + 8}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="6"
                fill="#FDE68A"
              >
                चक्र
              </text>
            </svg>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" />
              <span>गोचर चन्द्रमा</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] inline-block" />
              <span>सूर्य</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
              <span>बृहस्पति</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] inline-block" />
              <span>शनि</span>
            </span>
          </div>
        </div>

        {/* Real-time Transition Metrics & Panchanga Changes */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-stone-950/80 border border-amber-500/20 p-4 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-stone-800 pb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>आगामी २४ घण्टाका मुख्य परिवर्तनहरू</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              {upcomingTransitions.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">
                      {item.label}
                    </span>
                    <div className="font-bold text-stone-100 flex items-center gap-1.5">
                      <span className="text-amber-300">{item.current}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-400">समाप्ति समय:</span>
                    <div className="font-mono font-bold text-emerald-400">{item.endTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transit Moon details at this moment */}
          {transitMoon && (
            <div className="bg-gradient-to-br from-blue-950/40 to-stone-900 border border-blue-800/40 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <MoonIcon className="w-4 h-4 text-blue-400" />
                  <span>प्रक्षेपित गोचर चन्द्रमा स्थिति</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 text-[10px] font-mono">
                  {transitMoon.formattedDegree}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-stone-300 pt-1 text-[11px]">
                <div>
                  राशि: <strong className="text-white">{transitMoon.rashiName}</strong>
                </div>
                <div>
                  नक्षत्र: <strong className="text-white">{transitMoon.nakshatraName}</strong>
                </div>
                <div>
                  गति: <strong className="text-white">{transitMoon.isRetrograde ? 'वक्री (Retro)' : 'मार्गी (Direct)'}</strong>
                </div>
                <div>
                  भाव (चन्द्रबाट): <strong className="text-white">{((transitMoon.rashiId - birthMoon.rashiId + 12) % 12) + 1} औँ भाव</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
