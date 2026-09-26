import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Sparkles,
  Moon,
  Sun,
  Compass,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sunrise,
  Sunset,
  Info,
  RotateCcw,
  Eye,
  Sliders,
  CalendarDays,
  ShieldAlert,
  HelpCircle,
  Timer,
  Zap,
  ArrowRight
} from 'lucide-react';
import { PanchangaData } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import {
  calculateDailyProgression,
  describeAnnularArc,
  formatDecimalHourToNepali,
  polarToCartesian,
  RingSegment
} from './radialPanchangaUtils';

export interface RadialPanchangaChartProps {
  panchanga: PanchangaData;
  className?: string;
  onNavigateToFullPanchanga?: () => void;
}

type FocusRing = 'all' | 'time_chakra' | 'tithi' | 'nakshatra' | 'yoga' | 'muhurta';

// Helper to format decimal hour into Devanagari HH:MM
const formatHourMinuteDevanagari = (decHour: number): string => {
  const norm = ((decHour % 24) + 24) % 24;
  const h = Math.floor(norm);
  const m = Math.round((norm - h) * 60) % 60;
  return toDevanagariNumerals(
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  );
};

export const RadialPanchangaChart: React.FC<RadialPanchangaChartProps> = ({
  panchanga,
  className = '',
  onNavigateToFullPanchanga
}) => {
  // SVG Center & Radius geometry
  const CX = 260;
  const CY = 260;
  const VIEWBOX_SIZE = 520;

  // Concentric Ring Radii - with dedicated outer Time Chakra (समय चक्र)
  const R_TIME_CHAKRA_OUTER = 256;
  const R_TIME_CHAKRA_INNER = 242;

  const R_TITHI_OUTER = 240;
  const R_TITHI_INNER = 200;

  const R_NAKSHATRA_OUTER = 196;
  const R_NAKSHATRA_INNER = 156;

  const R_YOGA_OUTER = 152;
  const R_YOGA_INNER = 112;

  const R_DAYNIGHT_OUTER = 108;
  const R_DAYNIGHT_INNER = 94;

  const R_CENTER_HUB = 88;

  // Real-time current hour
  const getCurrentDecimalHour = (): number => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  };

  const [selectedHour, setSelectedHour] = useState<number>(getCurrentDecimalHour());
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [focusRing, setFocusRing] = useState<FocusRing>('all');
  const [hoveredSegment, setHoveredSegment] = useState<RingSegment | null>(null);
  const [hoveredTransition, setHoveredTransition] = useState<{
    element: 'nakshatra' | 'yoga' | 'tithi';
    name: string;
    nextName: string;
    clockTime: string;
    remainingText: string;
  } | null>(null);
  const [showHelpGuide, setShowHelpGuide] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Calculate progression data
  const progression = useMemo(() => {
    return calculateDailyProgression(panchanga);
  }, [panchanga]);

  // Current active elements at the inspected hour
  const activeTithi = progression.activeTithiAt(selectedHour);
  const activeNakshatra = progression.activeNakshatraAt(selectedHour);
  const activeYoga = progression.activeYogaAt(selectedHour);

  // Check if current selected time is within Rahukaal
  const isSelectedInRahu =
    selectedHour >= progression.rahuStartHour && selectedHour < progression.rahuEndHour;

  // Check if current selected time is within Abhijit
  const isSelectedInAbhijit =
    progression.abhijitStartHour !== undefined &&
    progression.abhijitEndHour !== undefined &&
    selectedHour >= progression.abhijitStartHour &&
    selectedHour < progression.abhijitEndHour;

  // Day or Night status
  const isDayTime =
    selectedHour >= progression.sunriseHour && selectedHour < progression.sunsetHour;

  // Time remaining until active transitions
  const getTimeRemainingStr = (targetHour: number): string => {
    let diff = targetHour - selectedHour;
    if (diff < 0) diff += 24;
    const hrs = Math.floor(diff);
    const mins = Math.round((diff - hrs) * 60);
    if (hrs === 0 && mins === 0) return 'अहिले परिवर्तन हुँदै';
    if (hrs === 0) return `${toDevanagariNumerals(mins)} मिनेट बाँकी`;
    return `${toDevanagariNumerals(hrs)} घण्टा ${toDevanagariNumerals(mins)} मिनेट बाँकी`;
  };

  // Detailed Upcoming Transitions for Nakshatra, Yoga, and Tithi
  const nakshatraTransition = useMemo(() => {
    if (progression.nakshatraSegments.length > 1) {
      const seg0 = progression.nakshatraSegments[0];
      const seg1 = progression.nakshatraSegments[1];
      const tHour = seg0.endHour;
      const isUpcoming = selectedHour < tHour;
      let diff = isUpcoming ? (tHour - selectedHour) : (24 - selectedHour + (seg1.endHour === 24 ? 0 : seg1.endHour));
      if (diff < 0) diff += 24;
      const hrs = Math.floor(diff);
      const mins = Math.round((diff - hrs) * 60) % 60;
      const remainingText =
        hrs === 0 && mins === 0
          ? 'अहिले परिवर्तन हुँदै'
          : hrs === 0
          ? `${toDevanagariNumerals(mins)} मिनेट बाँकी`
          : `${toDevanagariNumerals(hrs)} घण्टा ${toDevanagariNumerals(mins)} मिनेट बाँकी`;

      const currentSegStart = isUpcoming ? seg0.startHour : seg1.startHour;
      const currentSegEnd = isUpcoming ? seg0.endHour : seg1.endHour;
      const currentDuration = Math.max(0.1, currentSegEnd - currentSegStart);
      const elapsed = Math.max(0, Math.min(currentDuration, selectedHour - currentSegStart));
      const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / currentDuration) * 100)));

      return {
        hasTransition: true,
        transitionHour: tHour,
        currentName: isUpcoming ? seg0.name : seg1.name,
        nextName: isUpcoming ? seg1.name : (panchanga.nakshatra.subsequentName || 'अर्को नक्षत्र'),
        isUpcoming,
        remainingText,
        hours: hrs,
        minutes: mins,
        formattedTime: formatDecimalHourToNepali(tHour),
        clockTime: formatHourMinuteDevanagari(tHour),
        progressPercent,
        currentLord: isUpcoming ? (panchanga.nakshatra.lord || 'सूर्य') : (panchanga.nakshatra.subsequentLord || 'चन्द्र'),
        nextLord: isUpcoming ? (panchanga.nakshatra.subsequentLord || 'चन्द्र') : undefined,
        currentDetail: isUpcoming ? seg0.detail : seg1.detail,
        nextDetail: isUpcoming ? seg1.detail : `पाद १ आरम्भ`,
      };
    }
    return {
      hasTransition: false,
      transitionHour: 24,
      currentName: progression.nakshatraSegments[0]?.name || panchanga.nakshatra.name,
      nextName: panchanga.nakshatra.subsequentName || 'अर्को नक्षत्र',
      isUpcoming: false,
      remainingText: 'दिनभर स्थिर',
      hours: 0,
      minutes: 0,
      formattedTime: panchanga.nakshatra.endTime || 'दिनभर',
      clockTime: '--:--',
      progressPercent: 50,
      currentLord: panchanga.nakshatra.lord || 'सूर्य',
      nextLord: undefined,
      currentDetail: progression.nakshatraSegments[0]?.detail,
      nextDetail: '',
    };
  }, [progression, selectedHour, panchanga]);

  const yogaTransition = useMemo(() => {
    if (progression.yogaSegments.length > 1) {
      const seg0 = progression.yogaSegments[0];
      const seg1 = progression.yogaSegments[1];
      const tHour = seg0.endHour;
      const isUpcoming = selectedHour < tHour;
      let diff = isUpcoming ? (tHour - selectedHour) : (24 - selectedHour);
      if (diff < 0) diff += 24;
      const hrs = Math.floor(diff);
      const mins = Math.round((diff - hrs) * 60) % 60;
      const remainingText =
        hrs === 0 && mins === 0
          ? 'अहिले परिवर्तन हुँदै'
          : hrs === 0
          ? `${toDevanagariNumerals(mins)} मिनेट बाँकी`
          : `${toDevanagariNumerals(hrs)} घण्टा ${toDevanagariNumerals(mins)} मिनेट बाँकी`;

      const currentSegStart = isUpcoming ? seg0.startHour : seg1.startHour;
      const currentSegEnd = isUpcoming ? seg0.endHour : seg1.endHour;
      const currentDuration = Math.max(0.1, currentSegEnd - currentSegStart);
      const elapsed = Math.max(0, Math.min(currentDuration, selectedHour - currentSegStart));
      const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / currentDuration) * 100)));

      return {
        hasTransition: true,
        transitionHour: tHour,
        currentName: isUpcoming ? seg0.name : seg1.name,
        nextName: isUpcoming ? seg1.name : (panchanga.yoga.subsequentName || 'अर्को योग'),
        isUpcoming,
        remainingText,
        hours: hrs,
        minutes: mins,
        formattedTime: formatDecimalHourToNepali(tHour),
        clockTime: formatHourMinuteDevanagari(tHour),
        progressPercent,
        currentIsAuspicious: isUpcoming ? seg0.isAuspicious : seg1.isAuspicious,
        nextIsAuspicious: isUpcoming ? seg1.isAuspicious : true,
        currentDetail: isUpcoming ? seg0.detail : seg1.detail,
        nextDetail: isUpcoming ? seg1.detail : '',
      };
    }
    return {
      hasTransition: false,
      transitionHour: 24,
      currentName: progression.yogaSegments[0]?.name || panchanga.yoga.name,
      nextName: panchanga.yoga.subsequentName || 'अर्को योग',
      isUpcoming: false,
      remainingText: 'दिनभर स्थिर',
      hours: 0,
      minutes: 0,
      formattedTime: panchanga.yoga.endTime || 'दिनभर',
      clockTime: '--:--',
      progressPercent: 50,
      currentIsAuspicious: progression.yogaSegments[0]?.isAuspicious,
      nextIsAuspicious: true,
      currentDetail: progression.yogaSegments[0]?.detail,
      nextDetail: '',
    };
  }, [progression, selectedHour, panchanga]);

  const tithiTransition = useMemo(() => {
    if (progression.tithiSegments.length > 1) {
      const seg0 = progression.tithiSegments[0];
      const seg1 = progression.tithiSegments[1];
      const tHour = seg0.endHour;
      const isUpcoming = selectedHour < tHour;
      let diff = isUpcoming ? (tHour - selectedHour) : (24 - selectedHour);
      if (diff < 0) diff += 24;
      const hrs = Math.floor(diff);
      const mins = Math.round((diff - hrs) * 60) % 60;
      const remainingText =
        hrs === 0 && mins === 0
          ? 'अहिले परिवर्तन हुँदै'
          : hrs === 0
          ? `${toDevanagariNumerals(mins)} मिनेट बाँकी`
          : `${toDevanagariNumerals(hrs)} घण्टा ${toDevanagariNumerals(mins)} मिनेट बाँकी`;

      const currentSegStart = isUpcoming ? seg0.startHour : seg1.startHour;
      const currentSegEnd = isUpcoming ? seg0.endHour : seg1.endHour;
      const currentDuration = Math.max(0.1, currentSegEnd - currentSegStart);
      const elapsed = Math.max(0, Math.min(currentDuration, selectedHour - currentSegStart));
      const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / currentDuration) * 100)));

      return {
        hasTransition: true,
        transitionHour: tHour,
        currentName: isUpcoming ? seg0.name : seg1.name,
        nextName: isUpcoming ? seg1.name : (panchanga.tithi.subsequentName || 'अर्को तिथि'),
        isUpcoming,
        remainingText,
        hours: hrs,
        minutes: mins,
        formattedTime: formatDecimalHourToNepali(tHour),
        clockTime: formatHourMinuteDevanagari(tHour),
        progressPercent,
        currentDetail: isUpcoming ? seg0.detail : seg1.detail,
        nextDetail: isUpcoming ? seg1.detail : '',
      };
    }
    return {
      hasTransition: false,
      transitionHour: 24,
      currentName: progression.tithiSegments[0]?.name || panchanga.tithi.name,
      nextName: panchanga.tithi.subsequentName || 'अर्को तिथि',
      isUpcoming: false,
      remainingText: 'दिनभर स्थिर',
      hours: 0,
      minutes: 0,
      formattedTime: panchanga.tithi.endTime || 'दिनभर',
      clockTime: '--:--',
      progressPercent: 50,
      currentDetail: progression.tithiSegments[0]?.detail,
      nextDetail: '',
    };
  }, [progression, selectedHour, panchanga]);

  // Convert mouse/touch event coordinates to 24-hour decimal time
  const handlePointerCoordToHour = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - (rect.width / VIEWBOX_SIZE) * CX;
    const y = clientY - rect.top - (rect.height / VIEWBOX_SIZE) * CY;

    // Angle from positive X-axis in degrees
    let angleDeg = (Math.atan2(y, x) * 180) / Math.PI;
    // Offset so -90 deg (12 o'clock / Top) becomes 0 degrees
    let clockAngle = angleDeg + 90;
    if (clockAngle < 0) clockAngle += 360;

    const hour = (clockAngle / 360) * 24;
    setSelectedHour(Math.min(23.99, Math.max(0, hour)));
    setIsLiveMode(false);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handlePointerCoordToHour(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingRef.current) {
      handlePointerCoordToHour(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    }
  };

  // Live timer tick every minute when in live mode
  useEffect(() => {
    if (!isLiveMode) return;
    const interval = setInterval(() => {
      setSelectedHour(getCurrentDecimalHour());
    }, 30000);
    return () => clearInterval(interval);
  }, [isLiveMode]);

  // Reset to current time
  const resetToLiveTime = () => {
    setSelectedHour(getCurrentDecimalHour());
    setIsLiveMode(true);
  };

  // Quick jump handlers
  const jumpToHour = (h: number) => {
    setSelectedHour(h);
    setIsLiveMode(false);
  };

  // Needle angle for selected hour
  const needleAngleDeg = (selectedHour / 24) * 360;
  const needleTipCoord = polarToCartesian(CX, CY, R_TITHI_OUTER + 8, needleAngleDeg);
  const needleBaseCoord = polarToCartesian(CX, CY, R_CENTER_HUB - 10, needleAngleDeg);

  // Live needle marker (always shows true real-time)
  const currentLiveHour = getCurrentDecimalHour();
  const liveNeedleAngle = (currentLiveHour / 24) * 360;
  const liveMarkerCoord = polarToCartesian(CX, CY, R_TITHI_OUTER + 12, liveNeedleAngle);

  // Clock hour labels (24 hour dial: 0, 3, 6, 9, 12, 15, 18, 21)
  const dialHours = [
    { hour: 0, label: '००', sub: 'मध्यरात' },
    { hour: 3, label: '०३', sub: 'ब्रह्म' },
    { hour: 6, label: '०६', sub: 'सूर्योदय' },
    { hour: 9, label: '०९', sub: 'प्रातः' },
    { hour: 12, label: '१२', sub: 'मध्याह्न' },
    { hour: 15, label: '१५', sub: 'अपराह्न' },
    { hour: 18, label: '१८', sub: 'सूर्यास्त' },
    { hour: 21, label: '२१', sub: 'प्रदोष' }
  ];

  // Opacity styles based on focus
  const getRingOpacity = (ring: FocusRing) => {
    if (focusRing === 'all' || focusRing === 'time_chakra') return 'opacity-100';
    return focusRing === ring ? 'opacity-100' : 'opacity-30 transition-opacity duration-300';
  };

  return (
    <div
      aria-label="दैनिक पञ्चाङ्ग रेडियल चक्र"
      className={`bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden ${className}`}
    >
      {/* Subtle top banner background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title, Focus Pills and Help Guide Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-[#D97706] dark:text-amber-400 rounded-xl border border-amber-400/30 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-1.5">
                दैनिक पञ्चाङ्ग रेडियल चक्र
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>२४ घण्टा अहोरात्र चक्र</span>
              </span>
            </div>
            <p className="text-xs text-[#78716C] dark:text-stone-400">
              दिनभरिको तिथि, नक्षत्र तथा योगको चक्रिय समयावधि र परिवर्तन विन्दु
            </p>
          </div>
        </div>

        {/* Action Buttons: Help Guide and Live Reset */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowHelpGuide((prev) => !prev)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            title="चक्र कसरी अध्ययन गर्ने?"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xs:inline">चक्र विधि</span>
          </button>

          {!isLiveMode ? (
            <button
              onClick={resetToLiveTime}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-[#D97706] dark:text-amber-300 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer animate-pulse"
              title="वर्तमान प्रत्यक्ष समयमा फर्कनुहोस्"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>अहिलेको समय</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>प्रत्यक्ष (Live)</span>
            </div>
          )}
        </div>
      </div>

      {/* Astrological Usage Guide Box (Collapsible) */}
      {showHelpGuide && (
        <div className="bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200/80 dark:border-stone-700 p-3.5 rounded-xl text-xs space-y-2 text-[#2D241E] dark:text-stone-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600" />
              रेडियल चक्र कसरी बुझ्ने र प्रयोग गर्ने?
            </span>
            <button
              onClick={() => setShowHelpGuide(false)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs cursor-pointer font-bold px-1.5"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-amber-100 dark:border-stone-700">
              <strong className="text-amber-700 dark:text-amber-400 block mb-0.5">१. बाह्य वलय (तिथि):</strong>
              सुवर्ण वा नीलो रङ्गको बाहिरी घेराले दिनभरिको तिथि र समाप्ति समय देखाउँछ।
            </div>
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-amber-100 dark:border-stone-700">
              <strong className="text-sky-700 dark:text-sky-400 block mb-0.5">२. मध्य वलय (नक्षत्र):</strong>
              आकाशीय नीलो रङ्गको बीचको घेराले चन्द्र नक्षत्र र पाद (चरण) परिवर्तन देखाउँछ।
            </div>
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-amber-100 dark:border-stone-700">
              <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">३. आन्तरिक वलय (योग):</strong>
              हरियो (शुभ) वा रातो (दोष/सावधानी) घेराले सूर्य-चन्द्र योगको प्रभाव जनाउँछ।
            </div>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-stone-400 italic">
            💡 <strong>सुझाव:</strong> चक्रको जुनसुकै स्थानमा माउस वा औँलाले घुमाएर दिनको कुनै पनि समयको पञ्च-अङ्ग सूक्ष्म रूपमा निरीक्षण गर्न सक्नुहुन्छ।
          </p>
        </div>
      )}

      {/* Interactive Focus Layer Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 mr-1 flex items-center gap-1">
            <Eye className="w-3 h-3 text-amber-500" />
            <span>वलय दृष्टि:</span>
          </span>

          <button
            onClick={() => setFocusRing('all')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              focusRing === 'all'
                ? 'bg-[#D97706] text-white shadow-2xs font-bold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            सबै ३ अङ्ग
          </button>

          <button
            onClick={() => setFocusRing('time_chakra')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
              focusRing === 'time_chakra'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs font-bold ring-2 ring-amber-300 dark:ring-amber-700'
                : 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-200/70'
            }`}
            title="कुन योग र नक्षत्र कहिले आउँदैछ हेर्नुहोस्"
          >
            <Timer className="w-3 h-3 text-amber-500 animate-spin-slow" />
            <span>समय चक्र (Time)</span>
          </button>

          <button
            onClick={() => setFocusRing('tithi')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
              focusRing === 'tithi'
                ? 'bg-amber-600 text-white shadow-2xs font-bold'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <Moon className="w-3 h-3 text-amber-300" />
            <span>१. तिथि</span>
          </button>

          <button
            onClick={() => setFocusRing('nakshatra')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
              focusRing === 'nakshatra'
                ? 'bg-sky-600 text-white shadow-2xs font-bold'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100'
            }`}
          >
            <Sparkles className="w-3 h-3 text-sky-300" />
            <span>२. नक्षत्र</span>
          </button>

          <button
            onClick={() => setFocusRing('yoga')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
              focusRing === 'yoga'
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Compass className="w-3 h-3 text-emerald-300" />
            <span>३. योग</span>
          </button>

          <button
            onClick={() => setFocusRing('muhurta')}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
              focusRing === 'muhurta'
                ? 'bg-rose-600 text-white shadow-2xs font-bold'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>राहु/अभिजित</span>
          </button>
        </div>

        {/* Selected Hour Pill */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D241E] dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{formatDecimalHourToNepali(selectedHour)}</span>
        </div>
      </div>

      {/* Main Grid: Radial Dial on Left / Top, Active Moment Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Column: The Interactive SVG Radial Wheel (5 or 6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative select-none">
          <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square flex items-center justify-center">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
              className="w-full h-full cursor-crosshair touch-none drop-shadow-sm"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <defs>
                {/* Tithi Shukla Gradient */}
                <linearGradient id="grad-tithi-shukla" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                {/* Tithi Next Shukla Gradient */}
                <linearGradient id="grad-tithi-next-shukla" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                {/* Tithi Krishna Gradient */}
                <linearGradient id="grad-tithi-krishna" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
                {/* Tithi Next Krishna Gradient */}
                <linearGradient id="grad-tithi-next-krishna" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#4338CA" />
                </linearGradient>

                {/* Nakshatra Gradients */}
                <linearGradient id="grad-nakshatra-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="100%" stopColor="#0369A1" />
                </linearGradient>
                <linearGradient id="grad-nakshatra-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0D9488" />
                  <stop offset="100%" stopColor="#0F766E" />
                </linearGradient>

                {/* Yoga Gradients */}
                <linearGradient id="grad-yoga-auspicious" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="grad-yoga-auspicious-alt" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="grad-yoga-inauspicious" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>

                {/* Day / Night Track Gradients */}
                <linearGradient id="grad-day-track" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="grad-night-track" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
                </linearGradient>

                {/* Needle Glow filter */}
                <filter id="needle-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#D97706" floodOpacity="0.5" />
                </filter>
                <filter id="hub-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* Background Outer Ring Dial Base */}
              <circle
                cx={CX}
                cy={CY}
                r={R_TITHI_OUTER + 12}
                className="fill-stone-50/60 dark:fill-stone-900/60 stroke-stone-200/80 dark:stroke-stone-700/80"
                strokeWidth="1.5"
              />

              {/* 24-Hour Tick Marks & Hour Labels */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * 360;
                const isMajor = i % 3 === 0;
                const tickInner = polarToCartesian(CX, CY, R_TITHI_OUTER + (isMajor ? 4 : 8), angle);
                const tickOuter = polarToCartesian(CX, CY, R_TITHI_OUTER + 12, angle);

                return (
                  <line
                    key={`tick-${i}`}
                    x1={tickInner.x}
                    y1={tickInner.y}
                    x2={tickOuter.x}
                    y2={tickOuter.y}
                    className={
                      isMajor
                        ? 'stroke-stone-500 dark:stroke-stone-400'
                        : 'stroke-stone-300 dark:stroke-stone-700'
                    }
                    strokeWidth={isMajor ? 2 : 1}
                  />
                );
              })}

              {/* Major Hour Text Markers around rim */}
              {dialHours.map((dh) => {
                const angle = (dh.hour / 24) * 360;
                const pos = polarToCartesian(CX, CY, R_TITHI_OUTER + 22, angle);
                return (
                  <text
                    key={`dial-text-${dh.hour}`}
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[9px] font-bold fill-stone-500 dark:fill-stone-400 select-none font-mono"
                  >
                    {dh.label}
                  </text>
                );
              })}

              {/* 1. Outer Ring: Tithi Progression Arcs */}
              <g className={`transition-opacity duration-300 ${getRingOpacity('tithi')}`}>
                {progression.tithiSegments.map((seg) => {
                  const d = describeAnnularArc(
                    CX,
                    CY,
                    R_TITHI_INNER,
                    R_TITHI_OUTER,
                    seg.startHour,
                    seg.endHour
                  );
                  const isHovered = hoveredSegment?.id === seg.id;
                  const midHour = (seg.startHour + seg.endHour) / 2;
                  const labelPos = polarToCartesian(
                    CX,
                    CY,
                    (R_TITHI_OUTER + R_TITHI_INNER) / 2,
                    (midHour / 24) * 360
                  );

                  return (
                    <g key={seg.id} className="cursor-pointer">
                      <path
                        d={d}
                        fill={`url(#${seg.gradientId})`}
                        className={`transition-all duration-200 ${
                          isHovered ? 'opacity-90 stroke-white stroke-2' : 'stroke-white/30 dark:stroke-stone-900/40'
                        }`}
                        strokeWidth="1.5"
                        onMouseEnter={() => setHoveredSegment(seg)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        onClick={() => jumpToHour(midHour)}
                      />
                      {/* Segment Label if arc is wide enough */}
                      {seg.endHour - seg.startHour >= 4 && (
                        <text
                          x={labelPos.x}
                          y={labelPos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[10px] font-bold fill-white pointer-events-none drop-shadow-xs font-serif"
                        >
                          {seg.name.length > 12 ? seg.name.slice(0, 10) + '..' : seg.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Transition marker for Tithi */}
                {progression.tithiSegments.length > 1 && (
                  <g>
                    {(() => {
                      const tEnd = progression.tithiSegments[0].endHour;
                      const pInner = polarToCartesian(CX, CY, R_TITHI_INNER - 2, (tEnd / 24) * 360);
                      const pOuter = polarToCartesian(CX, CY, R_TITHI_OUTER + 2, (tEnd / 24) * 360);
                      return (
                        <line
                          x1={pInner.x}
                          y1={pInner.y}
                          x2={pOuter.x}
                          y2={pOuter.y}
                          stroke="#FFFFFF"
                          strokeWidth="2.5"
                          strokeDasharray="2,2"
                        />
                      );
                    })()}
                  </g>
                )}
              </g>

              {/* 2. Middle Ring: Nakshatra Progression Arcs */}
              <g className={`transition-opacity duration-300 ${getRingOpacity('nakshatra')}`}>
                {progression.nakshatraSegments.map((seg) => {
                  const d = describeAnnularArc(
                    CX,
                    CY,
                    R_NAKSHATRA_INNER,
                    R_NAKSHATRA_OUTER,
                    seg.startHour,
                    seg.endHour
                  );
                  const isHovered = hoveredSegment?.id === seg.id;
                  const midHour = (seg.startHour + seg.endHour) / 2;
                  const labelPos = polarToCartesian(
                    CX,
                    CY,
                    (R_NAKSHATRA_OUTER + R_NAKSHATRA_INNER) / 2,
                    (midHour / 24) * 360
                  );

                  return (
                    <g key={seg.id} className="cursor-pointer">
                      <path
                        d={d}
                        fill={`url(#${seg.gradientId})`}
                        className={`transition-all duration-200 ${
                          isHovered ? 'opacity-90 stroke-white stroke-2' : 'stroke-white/30 dark:stroke-stone-900/40'
                        }`}
                        strokeWidth="1.5"
                        onMouseEnter={() => setHoveredSegment(seg)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        onClick={() => jumpToHour(midHour)}
                      />
                      {seg.endHour - seg.startHour >= 4 && (
                        <text
                          x={labelPos.x}
                          y={labelPos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[10px] font-bold fill-white pointer-events-none drop-shadow-xs font-serif"
                        >
                          {seg.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Dynamic Time Chakra Arc: from current selected hour to Nakshatra transition */}
                {nakshatraTransition.hasTransition && nakshatraTransition.isUpcoming && (
                  <path
                    d={describeAnnularArc(
                      CX,
                      CY,
                      R_NAKSHATRA_INNER + 2,
                      R_NAKSHATRA_OUTER - 2,
                      selectedHour,
                      nakshatraTransition.transitionHour
                    )}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeDasharray="4,3"
                    className="animate-pulse pointer-events-none"
                  />
                )}

                {/* Transition marker & Upcoming Pin for Nakshatra */}
                {nakshatraTransition.hasTransition && (
                  <g
                    className="cursor-pointer group"
                    onClick={() => jumpToHour(nakshatraTransition.transitionHour)}
                    onMouseEnter={() =>
                      setHoveredTransition({
                        element: 'nakshatra',
                        name: nakshatraTransition.currentName,
                        nextName: nakshatraTransition.nextName,
                        clockTime: nakshatraTransition.clockTime,
                        remainingText: nakshatraTransition.remainingText
                      })
                    }
                    onMouseLeave={() => setHoveredTransition(null)}
                  >
                    <title>{`आगामी नक्षत्र: ${nakshatraTransition.nextName} (${nakshatraTransition.formattedTime}) - क्लिक गरी चक्रमा हेर्नुहोस्`}</title>
                    {(() => {
                      const nEnd = nakshatraTransition.transitionHour;
                      const nAngle = (nEnd / 24) * 360;
                      const pInner = polarToCartesian(CX, CY, R_NAKSHATRA_INNER - 2, nAngle);
                      const pOuter = polarToCartesian(CX, CY, R_TIME_CHAKRA_OUTER, nAngle);
                      const pinPos = polarToCartesian(CX, CY, (R_NAKSHATRA_INNER + R_NAKSHATRA_OUTER) / 2, nAngle);
                      const rimPos = polarToCartesian(CX, CY, R_TIME_CHAKRA_OUTER - 4, nAngle);

                      return (
                        <>
                          {/* Radial transition line traversing through Time Chakra */}
                          <line
                            x1={pInner.x}
                            y1={pInner.y}
                            x2={pOuter.x}
                            y2={pOuter.y}
                            stroke="#38BDF8"
                            strokeWidth="2"
                            strokeDasharray="3,2"
                          />
                          {/* Pulsing ring at rim */}
                          <circle cx={rimPos.x} cy={rimPos.y} r="6" fill="#0284C7" fillOpacity="0.3" className="animate-ping" />
                          <circle cx={rimPos.x} cy={rimPos.y} r="3" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
                          {/* Nakshatra Ring Pin Bead */}
                          <circle cx={pinPos.x} cy={pinPos.y} r="5.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                          <circle cx={pinPos.x} cy={pinPos.y} r="2" fill="#FFFFFF" />
                        </>
                      );
                    })()}
                  </g>
                )}
              </g>

              {/* 3. Inner Ring: Yoga Progression Arcs */}
              <g className={`transition-opacity duration-300 ${getRingOpacity('yoga')}`}>
                {progression.yogaSegments.map((seg) => {
                  const d = describeAnnularArc(
                    CX,
                    CY,
                    R_YOGA_INNER,
                    R_YOGA_OUTER,
                    seg.startHour,
                    seg.endHour
                  );
                  const isHovered = hoveredSegment?.id === seg.id;
                  const midHour = (seg.startHour + seg.endHour) / 2;
                  const labelPos = polarToCartesian(
                    CX,
                    CY,
                    (R_YOGA_OUTER + R_YOGA_INNER) / 2,
                    (midHour / 24) * 360
                  );

                  return (
                    <g key={seg.id} className="cursor-pointer">
                      <path
                        d={d}
                        fill={`url(#${seg.gradientId})`}
                        className={`transition-all duration-200 ${
                          isHovered ? 'opacity-90 stroke-white stroke-2' : 'stroke-white/30 dark:stroke-stone-900/40'
                        }`}
                        strokeWidth="1.5"
                        onMouseEnter={() => setHoveredSegment(seg)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        onClick={() => jumpToHour(midHour)}
                      />
                      {seg.endHour - seg.startHour >= 4 && (
                        <text
                          x={labelPos.x}
                          y={labelPos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[9px] font-bold fill-white pointer-events-none drop-shadow-xs font-serif"
                        >
                          {seg.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Dynamic Time Chakra Arc: from current selected hour to Yoga transition */}
                {yogaTransition.hasTransition && yogaTransition.isUpcoming && (
                  <path
                    d={describeAnnularArc(
                      CX,
                      CY,
                      R_YOGA_INNER + 2,
                      R_YOGA_OUTER - 2,
                      selectedHour,
                      yogaTransition.transitionHour
                    )}
                    fill="none"
                    stroke={yogaTransition.nextIsAuspicious ? '#34D399' : '#FB7185'}
                    strokeWidth="3"
                    strokeDasharray="4,3"
                    className="animate-pulse pointer-events-none"
                  />
                )}

                {/* Transition marker & Upcoming Pin for Yoga */}
                {yogaTransition.hasTransition && (
                  <g
                    className="cursor-pointer group"
                    onClick={() => jumpToHour(yogaTransition.transitionHour)}
                    onMouseEnter={() =>
                      setHoveredTransition({
                        element: 'yoga',
                        name: yogaTransition.currentName,
                        nextName: yogaTransition.nextName,
                        clockTime: yogaTransition.clockTime,
                        remainingText: yogaTransition.remainingText
                      })
                    }
                    onMouseLeave={() => setHoveredTransition(null)}
                  >
                    <title>{`आगामी योग: ${yogaTransition.nextName} (${yogaTransition.formattedTime}) - क्लिक गरी चक्रमा हेर्नुहोस्`}</title>
                    {(() => {
                      const yEnd = yogaTransition.transitionHour;
                      const yAngle = (yEnd / 24) * 360;
                      const pInner = polarToCartesian(CX, CY, R_YOGA_INNER - 2, yAngle);
                      const pOuter = polarToCartesian(CX, CY, R_TIME_CHAKRA_OUTER, yAngle);
                      const pinPos = polarToCartesian(CX, CY, (R_YOGA_INNER + R_YOGA_OUTER) / 2, yAngle);
                      const rimPos = polarToCartesian(CX, CY, R_TIME_CHAKRA_OUTER - 4, yAngle);
                      const color = yogaTransition.nextIsAuspicious ? '#10B981' : '#F43F5E';

                      return (
                        <>
                          {/* Radial transition line traversing through Time Chakra */}
                          <line
                            x1={pInner.x}
                            y1={pInner.y}
                            x2={pOuter.x}
                            y2={pOuter.y}
                            stroke={color}
                            strokeWidth="2"
                            strokeDasharray="3,2"
                          />
                          <circle cx={rimPos.x} cy={rimPos.y} r="6" fill={color} fillOpacity="0.3" className="animate-ping" />
                          <circle cx={rimPos.x} cy={rimPos.y} r="3" fill={color} stroke="#FFFFFF" strokeWidth="1" />
                          {/* Yoga Ring Pin Bead */}
                          <circle cx={pinPos.x} cy={pinPos.y} r="5" fill={color} stroke="#FFFFFF" strokeWidth="1.8" />
                          <circle cx={pinPos.x} cy={pinPos.y} r="1.8" fill="#FFFFFF" />
                        </>
                      );
                    })()}
                  </g>
                )}
              </g>

              {/* 4. Day / Night Track & Muhurta Highlights */}
              <g className={`transition-opacity duration-300 ${focusRing === 'muhurta' ? 'opacity-100' : 'opacity-80'}`}>
                {/* Night arc 1: 0h to Sunrise */}
                <path
                  d={describeAnnularArc(CX, CY, R_DAYNIGHT_INNER, R_DAYNIGHT_OUTER, 0, progression.sunriseHour)}
                  fill="url(#grad-night-track)"
                  stroke="#334155"
                  strokeWidth="0.5"
                />
                {/* Day arc: Sunrise to Sunset */}
                <path
                  d={describeAnnularArc(
                    CX,
                    CY,
                    R_DAYNIGHT_INNER,
                    R_DAYNIGHT_OUTER,
                    progression.sunriseHour,
                    progression.sunsetHour
                  )}
                  fill="url(#grad-day-track)"
                  stroke="#FBBF24"
                  strokeWidth="0.5"
                />
                {/* Night arc 2: Sunset to 24h */}
                <path
                  d={describeAnnularArc(CX, CY, R_DAYNIGHT_INNER, R_DAYNIGHT_OUTER, progression.sunsetHour, 24)}
                  fill="url(#grad-night-track)"
                  stroke="#334155"
                  strokeWidth="0.5"
                />

                {/* Rahu Kaal Overlay Arc (Flashing caution strip) */}
                <path
                  d={describeAnnularArc(
                    CX,
                    CY,
                    R_DAYNIGHT_INNER - 1,
                    R_DAYNIGHT_OUTER + 1,
                    progression.rahuStartHour,
                    progression.rahuEndHour
                  )}
                  fill="#E11D48"
                  fillOpacity="0.85"
                  className="stroke-rose-300 stroke-1"
                />

                {/* Abhijit Muhurta Overlay Arc (Auspicious emerald strip) */}
                {progression.abhijitStartHour !== undefined && progression.abhijitEndHour !== undefined && (
                  <path
                    d={describeAnnularArc(
                      CX,
                      CY,
                      R_DAYNIGHT_INNER - 1,
                      R_DAYNIGHT_OUTER + 1,
                      progression.abhijitStartHour,
                      progression.abhijitEndHour
                    )}
                    fill="#10B981"
                    fillOpacity="0.9"
                    className="stroke-emerald-200 stroke-1"
                  />
                )}

                {/* Sunrise icon marker */}
                {(() => {
                  const sPos = polarToCartesian(CX, CY, (R_DAYNIGHT_OUTER + R_DAYNIGHT_INNER) / 2, (progression.sunriseHour / 24) * 360);
                  return (
                    <circle cx={sPos.x} cy={sPos.y} r="3" fill="#D97706" stroke="#FFFFFF" strokeWidth="1" />
                  );
                })()}

                {/* Sunset icon marker */}
                {(() => {
                  const sPos = polarToCartesian(CX, CY, (R_DAYNIGHT_OUTER + R_DAYNIGHT_INNER) / 2, (progression.sunsetHour / 24) * 360);
                  return (
                    <circle cx={sPos.x} cy={sPos.y} r="3" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="1" />
                  );
                })()}
              </g>

              {/* 5. Central Hub (Instrument Center) */}
              <circle
                cx={CX}
                cy={CY}
                r={R_CENTER_HUB}
                filter="url(#hub-shadow)"
                className="fill-white dark:fill-stone-900 stroke-stone-200 dark:stroke-stone-700"
                strokeWidth="2"
              />
              <circle
                cx={CX}
                cy={CY}
                r={R_CENTER_HUB - 6}
                className="fill-amber-500/5 dark:fill-amber-400/5 stroke-amber-500/20 dark:stroke-amber-400/20"
                strokeWidth="1"
              />

              {/* Center Hub Content: Time, Solar/Lunar Icon & Status */}
              <g className="select-none">
                {/* Status Badge */}
                <rect
                  x={CX - 38}
                  y={CY - 62}
                  width="76"
                  height="16"
                  rx="8"
                  className={
                    isLiveMode
                      ? 'fill-emerald-100 dark:fill-emerald-950/80 stroke-emerald-400 stroke-1'
                      : 'fill-amber-100 dark:fill-amber-950/80 stroke-amber-400 stroke-1'
                  }
                />
                <text
                  x={CX}
                  y={CY - 51}
                  textAnchor="middle"
                  className={`text-[8.5px] font-bold pointer-events-none ${
                    isLiveMode
                      ? 'fill-emerald-800 dark:fill-emerald-300'
                      : 'fill-amber-800 dark:fill-amber-300'
                  }`}
                >
                  {isLiveMode ? '● प्रत्यक्ष समय' : 'निरीक्षित समय'}
                </text>

                {/* Digital Hour Display */}
                <text
                  x={CX}
                  y={CY - 22}
                  textAnchor="middle"
                  className="text-xl font-bold fill-[#1A1A1A] dark:fill-stone-100 font-mono tracking-tight pointer-events-none"
                >
                  {toDevanagariNumerals(
                    `${String(Math.floor(selectedHour)).padStart(2, '0')}:${String(
                      Math.round((selectedHour % 1) * 60)
                    ).padStart(2, '0')}`
                  )}
                </text>

                {/* Day/Night text + Muhurta alert in Center */}
                <text
                  x={CX}
                  y={CY - 4}
                  textAnchor="middle"
                  className="text-[9.5px] font-medium fill-stone-500 dark:fill-stone-400 pointer-events-none"
                >
                  {isDayTime ? 'दिनमान (दिवाकाल)' : 'रात्रिमान (रात्रिकाल)'}
                </text>

                {/* Active Micro-Badges in Hub */}
                <text
                  x={CX}
                  y={CY + 18}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-amber-700 dark:fill-amber-300 font-serif pointer-events-none"
                >
                  {activeTithi.name.length > 14 ? activeTithi.name.slice(0, 12) + '..' : activeTithi.name}
                </text>

                <text
                  x={CX}
                  y={CY + 36}
                  textAnchor="middle"
                  className="text-[9.5px] font-semibold fill-sky-700 dark:fill-sky-300 pointer-events-none"
                >
                  {activeNakshatra.name} • {activeYoga.name}
                </text>

                {isSelectedInRahu ? (
                  <text
                    x={CX}
                    y={CY + 52}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-rose-600 dark:fill-rose-400 animate-pulse pointer-events-none"
                  >
                    ⚠️ राहुकाल चलिरहेको छ
                  </text>
                ) : isSelectedInAbhijit ? (
                  <text
                    x={CX}
                    y={CY + 52}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-emerald-600 dark:fill-emerald-400 pointer-events-none"
                  >
                    ✨ शुभ अभिजित मुहूर्त
                  </text>
                ) : (
                  /* Dynamic Time Chakra Countdown Ticker inside Center Hub */
                  nakshatraTransition.hasTransition && nakshatraTransition.isUpcoming ? (
                    <g
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToHour(nakshatraTransition.transitionHour);
                      }}
                    >
                      <rect
                        x={CX - 50}
                        y={CY + 46}
                        width="100"
                        height="18"
                        rx="9"
                        className="fill-sky-100/90 dark:fill-sky-950/80 stroke-sky-400 dark:stroke-sky-600 stroke-1"
                      />
                      <text
                        x={CX}
                        y={CY + 58}
                        textAnchor="middle"
                        className="text-[8px] font-bold fill-sky-800 dark:fill-sky-200 pointer-events-none"
                      >
                        ⭐ {nakshatraTransition.nextName}: {nakshatraTransition.hours > 0 ? `${toDevanagariNumerals(nakshatraTransition.hours)}घं ` : ''}{toDevanagariNumerals(nakshatraTransition.minutes)}मि बाँकी
                      </text>
                    </g>
                  ) : yogaTransition.hasTransition && yogaTransition.isUpcoming ? (
                    <g
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToHour(yogaTransition.transitionHour);
                      }}
                    >
                      <rect
                        x={CX - 50}
                        y={CY + 46}
                        width="100"
                        height="18"
                        rx="9"
                        className="fill-emerald-100/90 dark:fill-emerald-950/80 stroke-emerald-400 dark:stroke-emerald-600 stroke-1"
                      />
                      <text
                        x={CX}
                        y={CY + 58}
                        textAnchor="middle"
                        className="text-[8px] font-bold fill-emerald-900 dark:fill-emerald-200 pointer-events-none"
                      >
                        🕉️ {yogaTransition.nextName}: {yogaTransition.hours > 0 ? `${toDevanagariNumerals(yogaTransition.hours)}घं ` : ''}{toDevanagariNumerals(yogaTransition.minutes)}मि बाँकी
                      </text>
                    </g>
                  ) : (
                    <text
                      x={CX}
                      y={CY + 58}
                      textAnchor="middle"
                      className="text-[8.5px] font-medium fill-stone-500 dark:fill-stone-400 pointer-events-none"
                    >
                      अहोरात्र चक्र स्थिर
                    </text>
                  )
                )}
              </g>

              {/* 6. True Real-Time Live Needle Tip Marker (if user is scrubbing elsewhere) */}
              {!isLiveMode && (
                <g className="pointer-events-none">
                  <circle
                    cx={liveMarkerCoord.x}
                    cy={liveMarkerCoord.y}
                    r="4.5"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={polarToCartesian(CX, CY, R_TITHI_INNER, liveNeedleAngle).x}
                    y1={polarToCartesian(CX, CY, R_TITHI_INNER, liveNeedleAngle).y}
                    x2={liveMarkerCoord.x}
                    y2={liveMarkerCoord.y}
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                </g>
              )}

              {/* 7. Active Dynamic Needle (Selected Hour Needle) */}
              <g filter="url(#needle-glow)" className="pointer-events-none">
                {/* Needle shaft from center rim to outer ring */}
                <line
                  x1={needleBaseCoord.x}
                  y1={needleBaseCoord.y}
                  x2={needleTipCoord.x}
                  y2={needleTipCoord.y}
                  stroke="#D97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Glowing Needle Tip Handle bead */}
                <circle
                  cx={needleTipCoord.x}
                  cy={needleTipCoord.y}
                  r="6"
                  fill="#F59E0B"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle
                  cx={needleTipCoord.x}
                  cy={needleTipCoord.y}
                  r="2"
                  fill="#B45309"
                />
              </g>

              {/* Tooltip on SVG when hovering a transition */}
              {hoveredTransition && (
                <g className="pointer-events-none">
                  <rect
                    x={CX - 120}
                    y={CY + R_TITHI_OUTER + 8}
                    width="240"
                    height="24"
                    rx="6"
                    className="fill-stone-900/95 stroke-amber-400 stroke-1 shadow-lg"
                  />
                  <text
                    x={CX}
                    y={CY + R_TITHI_OUTER + 24}
                    textAnchor="middle"
                    className="text-[9.5px] font-bold fill-amber-300 font-sans"
                  >
                    {hoveredTransition.element === 'nakshatra' ? '🌟 नक्षत्र' : hoveredTransition.element === 'yoga' ? '🕉️ योग' : '🌙 तिथि'} आगमन: {hoveredTransition.nextName} ({hoveredTransition.clockTime}) • {hoveredTransition.remainingText}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Time Dial Legend & Hint */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-stone-500 dark:text-stone-400 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>१. बाह्य: तिथि</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
              <span>२. मध्य: नक्षत्र</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>३. आन्तरिक: योग</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>राहुकाल</span>
            </span>
          </div>
        </div>

        {/* Right Column: Active Moment Detailed Breakdown Cards (6 or 7 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col gap-3.5">
          {/* Active Moment Banner */}
          <div className="bg-[#FDFCF8] dark:bg-stone-800/90 border border-[#E6E0D5] dark:border-stone-700/80 p-3.5 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-stone-200/70 dark:border-stone-700/70 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-[#1A1A1A] dark:text-stone-100">
                  चयनित समय: {formatDecimalHourToNepali(selectedHour)}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {isLiveMode ? 'वर्तमान प्रत्यक्ष' : 'निरीक्षण समय'}
              </span>
            </div>

            {/* Muhurta Alerts at this exact time */}
            {isSelectedInRahu ? (
              <div className="mb-2.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <strong className="block">⚠️ राहुकाल प्रभाव सक्रिय:</strong>
                  <span className="text-[11px]">
                    यस समयमा नयाँ, स्थायी तथा शुभ कार्य आरम्भ गर्न शास्त्रतः वर्जित छ।
                  </span>
                </div>
              </div>
            ) : isSelectedInAbhijit ? (
              <div className="mb-2.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <strong className="block">✨ अभिजित मुहूर्त प्रभाव सक्रिय:</strong>
                  <span className="text-[11px]">
                    दिनको सर्वोत्कृष्ट शुभ मुहूर्त; कुनै पनि महत्त्वपूर्ण कार्यका लागि प्रशस्त।
                  </span>
                </div>
              </div>
            ) : null}

            {/* 3 Interactive Cards for Tithi, Nakshatra, and Yoga */}
            <div className="space-y-2.5">
              {/* Card 1: Active Tithi */}
              <div className="p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-400 transition-colors">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
                    <Moon className="w-3 h-3 text-amber-500" />
                    <span>१. सक्रिय तिथि</span>
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-900 dark:text-amber-300">
                    {activeTithi.badge}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100 font-serif">
                    {activeTithi.name}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                    {activeTithi.secondaryInfo}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#78716C] dark:text-stone-400 pt-1 border-t border-amber-200/40 dark:border-amber-900/30">
                  <span>{activeTithi.detail}</span>
                  {activeTithi.endHour < 24 && (
                    <span className="text-amber-700 dark:text-amber-400 font-medium shrink-0 ml-1">
                      {getTimeRemainingStr(activeTithi.endHour)}
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Active Nakshatra */}
              <div className="p-2.5 rounded-lg border border-sky-200/80 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 hover:border-sky-400 transition-colors">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-500" />
                    <span>२. सक्रिय नक्षत्र</span>
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-900 dark:text-sky-300">
                    {activeNakshatra.badge}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100 font-serif">
                    {activeNakshatra.name}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                    {activeNakshatra.secondaryInfo}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#78716C] dark:text-stone-400 pt-1 border-t border-sky-200/40 dark:border-sky-900/30">
                  <span>{activeNakshatra.detail}</span>
                  {activeNakshatra.endHour < 24 && (
                    <span className="text-sky-700 dark:text-sky-400 font-medium shrink-0 ml-1">
                      {getTimeRemainingStr(activeNakshatra.endHour)}
                    </span>
                  )}
                </div>
              </div>

              {/* Card 3: Active Yoga */}
              <div className="p-2.5 rounded-lg border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-400 transition-colors">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-emerald-500" />
                    <span>३. सक्रिय योग</span>
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      activeYoga.isAuspicious
                        ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-300'
                        : 'bg-rose-500/15 text-rose-900 dark:text-rose-300'
                    }`}
                  >
                    {activeYoga.badge}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100 font-serif">
                    {activeYoga.name} योग
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                    {activeYoga.secondaryInfo}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#78716C] dark:text-stone-400 pt-1 border-t border-emerald-200/40 dark:border-emerald-900/30">
                  <span>{activeYoga.detail}</span>
                  {activeYoga.endHour < 24 && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium shrink-0 ml-1">
                      {getTimeRemainingStr(activeYoga.endHour)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= TIME CHAKRA - UPCOMING TRANSITIONS MODULE ================= */}
          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/40 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border border-amber-300/80 dark:border-amber-900/60 p-3.5 rounded-2xl shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 dark:border-stone-700 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-stone-100 font-serif flex items-center gap-1.5">
                    समय चक्र: आगामी नक्षत्र तथा योग आगमन
                  </h4>
                  <p className="text-[10px] text-stone-600 dark:text-stone-400">
                    कुन समयमा कुन योग वा नक्षत्र आउँदैछ भन्ने यथार्थ समयावधि र काउन्टडाउन
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-400/40 shrink-0">
                चक्र सूचक
              </span>
            </div>

            {/* Two Side-by-Side or Stacked Live Transition Trackers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1. Nakshatra Transition Tracker */}
              <div className="p-3 bg-white/95 dark:bg-stone-800/95 rounded-xl border border-sky-200/90 dark:border-sky-900/70 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-sky-800 dark:text-sky-300 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      नक्षत्र समय चक्र
                    </span>
                    <span className="text-[9px] font-semibold text-stone-500 dark:text-stone-400">
                      हाल: {nakshatraTransition.currentName}
                    </span>
                  </div>

                  {nakshatraTransition.hasTransition ? (
                    <>
                      <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900/50 rounded-lg p-2 mb-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-sky-950 dark:text-sky-100 font-serif">
                            आगामी: {nakshatraTransition.nextName}
                          </span>
                          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-sky-500 text-white font-mono">
                            {nakshatraTransition.clockTime} बजे
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-sky-800 dark:text-sky-300 font-medium">
                          <Clock className="w-3 h-3 text-sky-500 shrink-0" />
                          <span>
                            {nakshatraTransition.isUpcoming
                              ? `${nakshatraTransition.remainingText}मा आगमन`
                              : 'अहिले यो नक्षत्र चलिरहेको छ'}
                          </span>
                        </div>
                      </div>

                      {/* Elapsed progress meter */}
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-[9px] text-stone-500 dark:text-stone-400">
                          <span>{nakshatraTransition.currentName} अवधि</span>
                          <span className="font-mono">{nakshatraTransition.progressPercent}% पूरा</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${nakshatraTransition.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-stone-600 dark:text-stone-400 py-2">
                      आज दिनभर <strong className="text-sky-700 dark:text-sky-300">{nakshatraTransition.currentName}</strong> नक्षत्र नै रहनेछ।
                    </div>
                  )}
                </div>

                {nakshatraTransition.hasTransition && (
                  <button
                    onClick={() => jumpToHour(nakshatraTransition.transitionHour)}
                    className="w-full mt-1 py-1.5 px-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-800 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <span>चक्रमा {nakshatraTransition.nextName} आगमन हेर्नुहोस्</span>
                    <ArrowRight className="w-3 h-3 text-sky-600" />
                  </button>
                )}
              </div>

              {/* 2. Yoga Transition Tracker */}
              <div className="p-3 bg-white/95 dark:bg-stone-800/95 rounded-xl border border-emerald-200/90 dark:border-emerald-900/70 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-500" />
                      योग समय चक्र
                    </span>
                    <span className="text-[9px] font-semibold text-stone-500 dark:text-stone-400">
                      हाल: {yogaTransition.currentName}
                    </span>
                  </div>

                  {yogaTransition.hasTransition ? (
                    <>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 rounded-lg p-2 mb-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-emerald-950 dark:text-emerald-100 font-serif">
                            आगामी: {yogaTransition.nextName}
                          </span>
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded text-white font-mono ${
                              yogaTransition.nextIsAuspicious ? 'bg-emerald-600' : 'bg-rose-500'
                            }`}
                          >
                            {yogaTransition.clockTime} बजे
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                          <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>
                            {yogaTransition.isUpcoming
                              ? `${yogaTransition.remainingText}मा आगमन`
                              : 'अहिले यो योग चलिरहेको छ'}
                          </span>
                        </div>
                      </div>

                      {/* Elapsed progress meter */}
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-[9px] text-stone-500 dark:text-stone-400">
                          <span>{yogaTransition.currentName} अवधि</span>
                          <span className="font-mono">{yogaTransition.progressPercent}% पूरा</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              yogaTransition.nextIsAuspicious ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${yogaTransition.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-stone-600 dark:text-stone-400 py-2">
                      आज दिनभर <strong className="text-emerald-700 dark:text-emerald-300">{yogaTransition.currentName}</strong> योग नै रहनेछ।
                    </div>
                  )}
                </div>

                {yogaTransition.hasTransition && (
                  <button
                    onClick={() => jumpToHour(yogaTransition.transitionHour)}
                    className="w-full mt-1 py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <span>चक्रमा {yogaTransition.nextName} आगमन हेर्नुहोस्</span>
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Jump Milestones in the Day */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
              प्रमुख समय विन्दुमा द्रुत छलाङ:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 text-[11px]">
              <button
                onClick={() => jumpToHour(progression.sunriseHour)}
                className="px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-stone-700 dark:text-stone-300 font-medium flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                title="सूर्योदय समय"
              >
                <span className="text-[9px] text-stone-400 flex items-center gap-0.5">
                  <Sunrise className="w-2.5 h-2.5 text-amber-500" />
                  सूर्योदय
                </span>
                <strong className="text-[10px] font-mono">
                  {toDevanagariNumerals(
                    `${String(Math.floor(progression.sunriseHour)).padStart(2, '0')}:${String(
                      Math.round((progression.sunriseHour % 1) * 60)
                    ).padStart(2, '0')}`
                  )}
                </strong>
              </button>

              {/* Upcoming Nakshatra Jump Button */}
              {nakshatraTransition.hasTransition && (
                <button
                  onClick={() => jumpToHour(nakshatraTransition.transitionHour)}
                  className="px-2 py-1 rounded-lg bg-sky-50/80 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800 hover:border-sky-400 text-sky-800 dark:text-sky-300 font-medium flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                  title={`आगामी नक्षत्र: ${nakshatraTransition.nextName}`}
                >
                  <span className="text-[9px] text-sky-600 dark:text-sky-400 flex items-center gap-0.5 font-bold">
                    <Sparkles className="w-2.5 h-2.5 text-sky-500" />
                    {nakshatraTransition.nextName.length > 5 ? nakshatraTransition.nextName.slice(0, 5) + '..' : nakshatraTransition.nextName}
                  </span>
                  <strong className="text-[10px] font-mono">
                    {toDevanagariNumerals(nakshatraTransition.clockTime)}
                  </strong>
                </button>
              )}

              {/* Upcoming Yoga Jump Button */}
              {yogaTransition.hasTransition && (
                <button
                  onClick={() => jumpToHour(yogaTransition.transitionHour)}
                  className="px-2 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 hover:border-emerald-400 text-emerald-800 dark:text-emerald-300 font-medium flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                  title={`आगामी योग: ${yogaTransition.nextName}`}
                >
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-bold">
                    <Zap className="w-2.5 h-2.5 text-emerald-500" />
                    {yogaTransition.nextName.length > 5 ? yogaTransition.nextName.slice(0, 5) + '..' : yogaTransition.nextName}
                  </span>
                  <strong className="text-[10px] font-mono">
                    {toDevanagariNumerals(yogaTransition.clockTime)}
                  </strong>
                </button>
              )}

              {progression.abhijitStartHour !== undefined && (
                <button
                  onClick={() => jumpToHour(progression.abhijitStartHour!)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-emerald-400 text-stone-700 dark:text-stone-300 font-medium flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                  title="अभिजित मुहूर्त"
                >
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                    अभिजित
                  </span>
                  <strong className="text-[10px] font-mono">
                    {toDevanagariNumerals(
                      `${String(Math.floor(progression.abhijitStartHour)).padStart(2, '0')}:${String(
                        Math.round((progression.abhijitStartHour % 1) * 60)
                      ).padStart(2, '0')}`
                    )}
                  </strong>
                </button>
              )}

              <button
                onClick={() => jumpToHour(12.0)}
                className="px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-stone-700 dark:text-stone-300 font-medium flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                title="मध्याह्न १२:०० बजे"
              >
                <span className="text-[9px] text-stone-400 flex items-center gap-0.5">
                  <Sun className="w-2.5 h-2.5 text-amber-500" />
                  मध्याह्न
                </span>
                <strong className="text-[10px] font-mono">१२:००</strong>
              </button>

              <button
                onClick={() => jumpToHour(progression.rahuStartHour)}
                className="px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-rose-400 text-stone-700 dark:text-stone-300 font-medium flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                title="राहुकाल आरम्भ"
              >
                <span className="text-[9px] text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                  राहुकाल
                </span>
                <strong className="text-[10px] font-mono">
                  {toDevanagariNumerals(
                    `${String(Math.floor(progression.rahuStartHour)).padStart(2, '0')}:${String(
                      Math.round((progression.rahuStartHour % 1) * 60)
                    ).padStart(2, '0')}`
                  )}
                </strong>
              </button>

              <button
                onClick={() => jumpToHour(progression.sunsetHour)}
                className="px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-orange-400 text-stone-700 dark:text-stone-300 font-medium flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                title="सूर्यास्त समय"
              >
                <span className="text-[9px] text-stone-400 flex items-center gap-0.5">
                  <Sunset className="w-2.5 h-2.5 text-orange-500" />
                  सूर्यास्त
                </span>
                <strong className="text-[10px] font-mono">
                  {toDevanagariNumerals(
                    `${String(Math.floor(progression.sunsetHour)).padStart(2, '0')}:${String(
                      Math.round((progression.sunsetHour % 1) * 60)
                    ).padStart(2, '0')}`
                  )}
                </strong>
              </button>

              <button
                onClick={resetToLiveTime}
                className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-[#D97706] dark:text-amber-300 font-medium flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                title="वर्तमान समय"
              >
                <span className="text-[9px] text-[#D97706] dark:text-amber-400 flex items-center gap-0.5 font-bold">
                  <RotateCcw className="w-2.5 h-2.5" />
                  अहिले
                </span>
                <strong className="text-[10px] font-mono">
                  {toDevanagariNumerals(
                    `${String(Math.floor(currentLiveHour)).padStart(2, '0')}:${String(
                      Math.round((currentLiveHour % 1) * 60)
                    ).padStart(2, '0')}`
                  )}
                </strong>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Continuous Time Slider Bar */}
      <div className="pt-2 border-t border-[#E6E0D5] dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Sliders className="w-4 h-4 text-stone-400 shrink-0" />
          <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
            समय स्क्रबर (Time Scrubber):
          </span>
          <button
            onClick={() => jumpToHour(Math.max(0, selectedHour - 0.5))}
            className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-[11px] font-mono cursor-pointer"
            title="३० मिनेट पछाडि"
          >
            -३० मि
          </button>
          <button
            onClick={() => jumpToHour(Math.min(23.9, selectedHour + 0.5))}
            className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-[11px] font-mono cursor-pointer"
            title="३० मिनेट अगाडि"
          >
            +३० मि
          </button>
        </div>

        {/* Range Slider */}
        <div className="flex-1 w-full max-w-md flex items-center gap-2">
          <span className="text-[10px] text-stone-400 font-mono">००:००</span>
          <input
            type="range"
            min="0"
            max="23.9"
            step="0.1"
            value={selectedHour}
            onChange={(e) => {
              setSelectedHour(parseFloat(e.target.value));
              setIsLiveMode(false);
            }}
            aria-label="दिनको समय स्क्रबर"
            className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#D97706]"
          />
          <span className="text-[10px] text-stone-400 font-mono">२३:५९</span>
        </div>

        {/* Full Panchanga Link */}
        {onNavigateToFullPanchanga && (
          <button
            onClick={onNavigateToFullPanchanga}
            className="text-xs text-[#D97706] hover:text-[#b45309] dark:text-amber-400 font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap ml-auto"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>पञ्चाङ्ग तालिका</span>
          </button>
        )}
      </div>
    </div>
  );
};
