import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  User,
  Flame,
  Droplets,
  Wind,
  Mountain,
  MapPin,
  ArrowUp,
  Layers,
  ChevronRight,
  Sun
} from 'lucide-react';
import { BirthDetails, RashiName, PlanetName } from '../types/astrology';
import { VASTU_ZONES, VastuZone, getDirectionFromDegree } from '../utils/vastuEngine';
import { calculatePlanetaryPositions, calculateLagna, getJulianDay, getAyanamsa, RASHI_DATA } from '../utils/astroCalculations';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

export type AuspiciousLevel = 'highly_auspicious' | 'auspicious' | 'neutral' | 'inauspicious';

export interface DirectionCompatibility {
  zoneId: string;
  code: string;
  nameNepali: string;
  degreeTarget: number;
  level: AuspiciousLevel;
  levelNepali: string;
  badgeClass: string;
  reasonNepali: string;
  roomRecommendations: {
    recommended: string[];
    avoid: string[];
  };
  astroRemedyNepali?: string;
}

interface VastuDigitalCompassProps {
  activeProfile?: BirthDetails | null;
  initialDegree?: number;
  onApplyDirection?: (directionCode: string, degree: number) => void;
  className?: string;
}

export const VastuDigitalCompass: React.FC<VastuDigitalCompassProps> = ({
  activeProfile,
  initialDegree = 45,
  onApplyDirection,
  className = ''
}) => {
  const [degree, setDegree] = useState<number>(initialDegree);
  const [isSensorActive, setIsSensorActive] = useState<boolean>(false);
  const [sensorStatus, setSensorStatus] = useState<'idle' | 'active' | 'denied' | 'unsupported'>('idle');
  const [sensorAccuracy, setSensorAccuracy] = useState<number | null>(null);

  // Compute astrological profile (Moon Rashi, Lagna, Element)
  const astroProfile = useMemo(() => {
    if (!activeProfile || !activeProfile.dateAD || !activeProfile.time) {
      // Default to मेष (Aries) - Fire element for demonstration if no profile
      return {
        name: activeProfile?.name || 'गृहस्वामी (जातक)',
        moonRashi: 'मेष' as RashiName,
        moonNakshatra: 'अश्विनी',
        lagnaRashi: 'मेष' as RashiName,
        element: 'अग्नि' as 'अग्नि' | 'पृथ्वी' | 'वायु' | 'जल',
        rulingPlanet: 'मंगल' as PlanetName,
        rashiDetails: RASHI_DATA[0]
      };
    }

    try {
      const lat = activeProfile.location?.latitude ?? 27.7172;
      const lon = activeProfile.location?.longitude ?? 85.324;
      const tz = activeProfile.location?.timeZone ?? 5.75;
      const jd = getJulianDay(activeProfile.dateAD, activeProfile.time, tz);
      const ayan = getAyanamsa(jd, 'Lahiri');
      const lagna = calculateLagna(jd, lat, lon, ayan);
      const planets = calculatePlanetaryPositions(jd, ayan, lagna.rashiId);
      const moon = planets.find((p) => p.name === 'चन्द्र') || planets[0];
      const rashiDetails = RASHI_DATA[moon.rashiId - 1] || RASHI_DATA[0];

      return {
        name: activeProfile.name || 'गृहस्वामी',
        moonRashi: moon.rashiName,
        moonNakshatra: moon.nakshatraName || 'अश्विनी',
        lagnaRashi: lagna.rashiName as RashiName,
        element: rashiDetails.element as 'अग्नि' | 'पृथ्वी' | 'वायु' | 'जल',
        rulingPlanet: rashiDetails.lord as PlanetName,
        rashiDetails
      };
    } catch {
      return {
        name: activeProfile?.name || 'गृहस्वामी',
        moonRashi: 'मेष' as RashiName,
        moonNakshatra: 'अश्विनी',
        lagnaRashi: 'मेष' as RashiName,
        element: 'अग्नि' as 'अग्नि' | 'पृथ्वी' | 'वायु' | 'जल',
        rulingPlanet: 'मंगल' as PlanetName,
        rashiDetails: RASHI_DATA[0]
      };
    }
  }, [activeProfile]);

  // Compatibility matrix based on Vedic Element & Sign
  const compatibilityMap: Record<string, DirectionCompatibility> = useMemo(() => {
    const { element, moonRashi, rulingPlanet } = astroProfile;

    // Default 8-directional base mapping
    const base: Record<string, DirectionCompatibility> = {
      NE: {
        zoneId: 'NE',
        code: 'NE',
        nameNepali: 'उत्तर-पूर्व (ईशान)',
        degreeTarget: 45,
        level: 'highly_auspicious',
        levelNepali: 'अति शुभ (सर्वोत्तम)',
        badgeClass: 'bg-emerald-600 text-white border-emerald-400',
        reasonNepali: `${moonRashi} राशिका लागि देवगुरु बृहस्पति र शिवजीको ईशान कोण सबैभन्दा पवित्र, शान्तिदायक र वंश वृद्धिकारक छ।`,
        roomRecommendations: {
          recommended: ['पूजा कोठा', 'ध्यान कक्ष', 'सफा पानीको ट्याङ्की', 'अध्ययन कोठा', 'मुख्य प्रवेशद्वार'],
          avoid: ['शौचालय', 'भान्सा', 'भारी भण्डार', 'भर्याङ']
        },
        astroRemedyNepali: 'ईशान कोणमा गुरु यन्त्र, स्फटिक श्रीयन्त्र र सफा जलको कलश राख्नुहोस्।'
      },
      E: {
        zoneId: 'E',
        code: 'E',
        nameNepali: 'पूर्व (इन्द्र)',
        degreeTarget: 90,
        level: element === 'अग्नि' || element === 'वायु' ? 'highly_auspicious' : 'auspicious',
        levelNepali: element === 'अग्नि' || element === 'वायु' ? 'अति शुभ' : 'शुभ',
        badgeClass: 'bg-emerald-700 text-white border-emerald-500',
        reasonNepali: `सूर्यदेवको पूर्व दिशाले आरोग्य, मान-सम्मान, सामाजिक प्रतिष्ठा र राजकीय सफलता प्रदान गर्दछ।`,
        roomRecommendations: {
          recommended: ['मुख्य प्रवेशद्वार', 'बैठक कोठा (Living)', 'बरण्डा', 'अध्ययन कक्ष'],
          avoid: ['शौचालय', 'भारी भण्डार', 'उँचा पर्खाल']
        },
        astroRemedyNepali: 'पूर्व भित्तामा तामाको सूर्य प्रतिमा वा गायत्री मन्त्रको फ्रेम लगाउनुहोस्।'
      },
      SE: {
        zoneId: 'SE',
        code: 'SE',
        nameNepali: 'दक्षिण-पूर्व (आग्नेय)',
        degreeTarget: 135,
        level: element === 'अग्नि' ? 'auspicious' : element === 'जल' ? 'inauspicious' : 'neutral',
        levelNepali: element === 'अग्नि' ? 'अनुकूल अग्नि स्थान' : element === 'जल' ? 'प्रतिकूल (जल-अग्नि द्वन्द्व)' : 'मध्यम',
        badgeClass: element === 'अग्नि' ? 'bg-amber-600 text-white border-amber-400' : element === 'जल' ? 'bg-rose-700 text-white border-rose-500' : 'bg-stone-700 text-amber-100 border-stone-600',
        reasonNepali: element === 'जल'
          ? `तपाईंको जल तत्त्व (${moonRashi} राशि) भएकोले आग्नेय कोणमा अत्यधिक अग्निले मानसिक अशान्ति दिनसक्छ; केवल भान्साको रूपमा सीमित राख्नुहोस्।`
          : `शुक्र र अग्निको स्थान भएकाले भान्सा र ऊर्जा सञ्चारका लागि यो कोण विशेष शुभ छ।`,
        roomRecommendations: {
          recommended: ['भान्सा कोठा (Kitchen)', 'विद्युतीय मिटर / ब्याट्री', 'ग्यास चुलो'],
          avoid: ['शयनकक्ष', 'पूजा कोठा', 'पानीको इनार/ट्याङ्की', 'मुख्य प्रवेशद्वार']
        },
        astroRemedyNepali: 'आग्नेय कुनामा ९ वाटको रातो वा सुन्तला रङ्गको बत्ती निरन्तर बाल्नुहोस्।'
      },
      S: {
        zoneId: 'S',
        code: 'S',
        nameNepali: 'दक्षिण (यम)',
        degreeTarget: 180,
        level: element === 'पृथ्वी' ? 'neutral' : 'inauspicious',
        levelNepali: element === 'पृथ्वी' ? 'मध्यम (भारी संरचना अनुकूल)' : 'प्रतिकूल (सावधानी)',
        badgeClass: element === 'पृथ्वी' ? 'bg-amber-700 text-white border-amber-500' : 'bg-rose-800 text-white border-rose-600',
        reasonNepali: `यम दिशा भएकाले साधारणतया मुख्य प्रवेशद्वार वर्जित मानिन्छ; तर भारी गारो र भण्डारका लागि उपयुक्त हुन्छ।`,
        roomRecommendations: {
          recommended: ['भारी स्टोर रुम', 'भर्याङ', 'बेडरूम (दक्षिणतर्फ सिरानी)'],
          avoid: ['मुख्य प्रवेशद्वार', 'पूजा कोठा', 'खुल्ला आँगन', 'सेप्टिक ट्याङ्की']
        },
        astroRemedyNepali: 'दक्षिण ढोका भएमा माथि पञ्चमुखी हनुमान जीको तस्बिर र तामाको स्वास्तिक राख्नुहोस्।'
      },
      SW: {
        zoneId: 'SW',
        code: 'SW',
        nameNepali: 'दक्षिण-पश्चिम (नैऋत्य)',
        degreeTarget: 225,
        level: element === 'पृथ्वी' ? 'highly_auspicious' : 'auspicious',
        levelNepali: 'स्थिरता र धनको लागि शुभ',
        badgeClass: 'bg-emerald-800 text-white border-emerald-600',
        reasonNepali: `राहु/नैऋत्य कोण घरको सबैभन्दा भारी र अग्लो हुनुपर्छ। यसले घरका मुलीलाई स्थायित्व र अधिकार प्रदान गर्दछ।`,
        roomRecommendations: {
          recommended: ['मास्टर बेडरूम (गृहस्वामीको कोठा)', 'गहना/पैसाको मुख्य दराज', 'भारी संरचना'],
          avoid: ['शौचालय', 'पूजा कोठा', 'भान्सा', 'पानीको खाल्डो', 'मुख्य ढोका']
        },
        astroRemedyNepali: 'नैऋत्य कुनालाई सधैँ उँचो र भारी राख्नुहोस्; भुइँमा पहेँलो वा माटो रङ्ग प्रयोग गर्नुहोस्।'
      },
      W: {
        zoneId: 'W',
        code: 'W',
        nameNepali: 'पश्चिम (वरुण)',
        degreeTarget: 270,
        level: element === 'वायु' || element === 'पृथ्वी' ? 'auspicious' : 'neutral',
        levelNepali: 'व्यापार एवं अध्ययन अनुकूल',
        badgeClass: 'bg-blue-700 text-white border-blue-500',
        reasonNepali: `वरुण र शनिको दिशा; व्यापारिक लाभ, बालबालिकाको अध्ययन र भोजन कक्षका लागि शुभ हुन्छ।`,
        roomRecommendations: {
          recommended: ['डाइनिङ हल (भोजन कक्ष)', 'बालबालिकाको अध्ययन कक्ष', 'पाहुना कोठा'],
          avoid: ['पूजा कोठा', 'मुख्य ढोका (विशिष्ट पद बाहेक)']
        },
        astroRemedyNepali: 'पश्चिम भित्तामा शनि यन्त्र वा सेतो/आकासे रङ्गको सन्तुलन मिलाउनुहोस्।'
      },
      NW: {
        zoneId: 'NW',
        code: 'NW',
        nameNepali: 'उत्तर-पश्चिम (वायव्य)',
        degreeTarget: 315,
        level: element === 'वायु' ? 'highly_auspicious' : 'auspicious',
        levelNepali: 'गतिशीलता र सम्बन्धका लागि शुभ',
        badgeClass: 'bg-teal-700 text-white border-teal-500',
        reasonNepali: `वायुदेव र चन्द्रमाको वायव्य कोणले पाहुना सत्कार, वैदेशिक अवसर र सामानको छिटो बिक्रीलाई बढावा दिन्छ।`,
        roomRecommendations: {
          recommended: ['पाहुना कोठा (Guest Room)', 'विवाहोन्मुख छोरीको कोठा', 'बिक्री योग्य सामानको भण्डार'],
          avoid: ['मास्टर बेडरूम', 'भारी दराज', 'पूजा कोठा']
        },
        astroRemedyNepali: 'वायव्य कुनामा चाँदीको चन्द्रमा वा सेतो क्रिस्टल बल झुन्ड्याउनुहोस्।'
      },
      N: {
        zoneId: 'N',
        code: 'N',
        nameNepali: 'उत्तर (कुबेर)',
        degreeTarget: 0,
        level: 'highly_auspicious',
        levelNepali: 'अति शुभ (धन र लक्ष्मी स्थान)',
        badgeClass: 'bg-emerald-600 text-white border-emerald-400',
        reasonNepali: `धनाधिपति कुबेर र बुद्धको दिशा। यस दिशाबाट आउने सकारात्मक चुम्बकीय तरङ्गले व्यापार, बुद्धि र धनलक्ष्मीको बास गराउँछ।`,
        roomRecommendations: {
          recommended: ['मुख्य प्रवेशद्वार', 'पैसाको सेफ/काउन्टर (उत्तर फर्कने)', 'बैठक कोठा', 'अध्ययन कक्ष'],
          avoid: ['शौचालय', 'भारी भण्डार', 'भर्याङ', 'फोहोरको थुप्रो']
        },
        astroRemedyNepali: 'उत्तर दिशामा कुबेर यन्त्र, मनी प्लान्ट वा चाँदीको सिक्का राख्नुहोस्।'
      }
    };

    return base;
  }, [astroProfile]);

  // Current zone and current compatibility
  const currentZone: VastuZone = useMemo(() => {
    return getDirectionFromDegree(degree);
  }, [degree]);

  const currentCompat: DirectionCompatibility = useMemo(() => {
    return compatibilityMap[currentZone.code] || compatibilityMap['NE'];
  }, [compatibilityMap, currentZone.code]);

  // Trigger Device Sensor
  const requestCompassSensor = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Check for iOS 13+ permission model
    if (
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (permission === 'granted') {
          setIsSensorActive(true);
          setSensorStatus('active');
        } else {
          setSensorStatus('denied');
          setIsSensorActive(false);
        }
      } catch (err) {
        console.error('Sensor permission error:', err);
        setSensorStatus('denied');
      }
      return;
    }

    // Non-iOS standard browsers
    if ('DeviceOrientationEvent' in window) {
      setIsSensorActive(true);
      setSensorStatus('active');
    } else {
      setSensorStatus('unsupported');
    }
  }, []);

  // Sensor Event Listener
  useEffect(() => {
    if (!isSensorActive) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // 1. iOS provides webkitCompassHeading (0 = Magnetic North, clockwise)
      const webkitHeading = (event as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      const webkitAccuracy = (event as unknown as { webkitCompassAccuracy?: number }).webkitCompassAccuracy;

      if (webkitAccuracy !== undefined) {
        setSensorAccuracy(Math.round(webkitAccuracy));
      }

      if (typeof webkitHeading === 'number' && !isNaN(webkitHeading)) {
        const rounded = Math.round(webkitHeading);
        setDegree(rounded);
        return;
      }

      // 2. Android / standard: event.alpha (counter-clockwise from North in standard coord)
      if (event.alpha !== null && !isNaN(event.alpha)) {
        let calculated = 360 - event.alpha;
        if (calculated < 0) calculated += 360;
        if (calculated >= 360) calculated -= 360;
        setDegree(Math.round(calculated));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isSensorActive]);

  // Haptic feedback when snapping to exact cardinal directions (N, E, S, W)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (degree === 0 || degree === 90 || degree === 180 || degree === 270) {
        try {
          navigator.vibrate(35);
        } catch {
          // ignore vibration errors
        }
      }
    }
  }, [degree]);

  // Cardinal button list
  const cardinalButtons = [
    { label: 'उत्तर (N)', deg: 0, code: 'N' },
    { label: 'ईशान (NE)', deg: 45, code: 'NE' },
    { label: 'पूर्व (E)', deg: 90, code: 'E' },
    { label: 'आग्नेय (SE)', deg: 135, code: 'SE' },
    { label: 'दक्षिण (S)', deg: 180, code: 'S' },
    { label: 'नैऋत्य (SW)', deg: 225, code: 'SW' },
    { label: 'पश्चिम (W)', deg: 270, code: 'W' },
    { label: 'वायव्य (NW)', deg: 315, code: 'NW' }
  ];

  return (
    <div id="vastu-digital-compass-container" className={`bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-amber-900/60 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-md">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-red-950 dark:text-amber-300">
                डिजिटल वास्तु कम्पास एवं कुण्डली दिशा निर्देशक
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5">
                मोबाइल सेन्सरबाट घर-घडेरीको कोण मापन गरी जन्मकुण्डली अनुसार शुभ-अशुभ दिशा पत्ता लगाउनुहोस्
              </p>
            </div>
          </div>
        </div>

        {/* User Chart Badge */}
        <div className="bg-amber-50 dark:bg-stone-800/90 border border-amber-300 dark:border-stone-700 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-stone-900 dark:text-amber-200 flex items-center gap-1.5">
              <span>{astroProfile.name}</span>
              <span className="text-[10px] bg-amber-200 dark:bg-stone-700 px-1.5 py-0.5 rounded-md font-semibold">
                {astroProfile.moonRashi} राशि
              </span>
            </div>
            <div className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-2 mt-0.5">
              <span>तत्त्व: <strong className="text-amber-700 dark:text-amber-400">{astroProfile.element}</strong></span>
              <span>•</span>
              <span>स्वामी: <strong className="text-amber-700 dark:text-amber-400">{astroProfile.rulingPlanet}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Dial + Live Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* COMPASS DIAL COLUMN (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-5">
          {/* Compass Bezel */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-[10px] border-amber-700/90 dark:border-amber-600 bg-stone-950 shadow-2xl flex items-center justify-center p-3 select-none">
            
            {/* Compass Heading Needle / Degree Markers */}
            <div
              className="absolute inset-3 rounded-full border-2 border-amber-500/30 transition-transform duration-200 ease-out flex items-center justify-center"
              style={{ transform: `rotate(${-degree}deg)` }}
            >
              {/* Major 8 Directions Markers */}
              <div className="absolute top-2 font-black text-xs text-red-500 tracking-wider flex flex-col items-center">
                <span>N ०°</span>
                <span className="text-[9px] text-amber-300 font-normal">उत्तर</span>
              </div>
              <div className="absolute right-2 font-black text-xs text-amber-300 flex flex-col items-center">
                <span>E ९०°</span>
                <span className="text-[9px] text-stone-300 font-normal">पूर्व</span>
              </div>
              <div className="absolute bottom-2 font-black text-xs text-stone-400 flex flex-col items-center">
                <span>S १८०°</span>
                <span className="text-[9px] text-stone-400 font-normal">दक्षिण</span>
              </div>
              <div className="absolute left-2 font-black text-xs text-stone-400 flex flex-col items-center">
                <span>W २७०°</span>
                <span className="text-[9px] text-stone-400 font-normal">पश्चिम</span>
              </div>

              {/* Intercardinals */}
              <div className="absolute top-9 right-9 font-bold text-[10px] text-emerald-400 flex flex-col items-center">
                <span>NE</span>
                <span className="text-[8px] text-stone-400">ईशान</span>
              </div>
              <div className="absolute bottom-9 right-9 font-bold text-[10px] text-amber-400 flex flex-col items-center">
                <span>SE</span>
                <span className="text-[8px] text-stone-400">आग्नेय</span>
              </div>
              <div className="absolute bottom-9 left-9 font-bold text-[10px] text-rose-400 flex flex-col items-center">
                <span>SW</span>
                <span className="text-[8px] text-stone-400">नैऋत्य</span>
              </div>
              <div className="absolute top-9 left-9 font-bold text-[10px] text-cyan-400 flex flex-col items-center">
                <span>NW</span>
                <span className="text-[8px] text-stone-400">वायव्य</span>
              </div>

              {/* Subtle 360 degree tick circle */}
              <div className="w-full h-full rounded-full border border-dashed border-amber-500/20" />
            </div>

            {/* FIXED HEADING INDICATOR (Red needle top) */}
            <div className="absolute top-1 z-30 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-red-600 drop-shadow-md" />
              <div className="w-1.5 h-16 bg-gradient-to-b from-red-600 via-red-500 to-transparent rounded-full" />
            </div>

            {/* CENTER HUB */}
            <div className="relative z-20 w-24 h-24 rounded-full bg-gradient-to-br from-stone-900 to-stone-950 border-4 border-amber-400 flex flex-col items-center justify-center text-center shadow-2xl">
              <span className="text-lg font-black text-amber-300 font-mono tracking-tight leading-none">
                {degree}°
              </span>
              <span className="text-[11px] font-black text-white mt-1">
                {currentZone.code}
              </span>
              <span className="text-[9px] text-amber-200/80 font-serif">
                {currentZone.nameNepali.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* SENSOR / MODE CONTROLS */}
          <div className="w-full max-w-sm space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isSensorActive) {
                    requestCompassSensor();
                  } else {
                    setIsSensorActive(false);
                    setSensorStatus('idle');
                  }
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  isSensorActive
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-400/50'
                    : 'bg-red-800 dark:bg-amber-600 text-white hover:bg-red-900 dark:hover:bg-amber-700'
                }`}
              >
                <RotateCw className={`w-4 h-4 ${isSensorActive ? 'animate-spin' : ''}`} />
                <span>{isSensorActive ? 'लाइभ मोबाइल सेन्सर चालु छ' : 'मोबाइल कम्पास सेन्सर सुरु गर्नुहोस्'}</span>
              </button>
            </div>

            {sensorStatus === 'denied' && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-800 dark:text-rose-300 p-2.5 rounded-xl text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>मोबाइल ब्राउजरले दिशा सेन्सर अनुमति अस्वीकार गर्‍यो। कृपया तलको म्यानुअल स्लाइडर प्रयोग गर्नुहोस्।</span>
              </div>
            )}

            {sensorAccuracy !== null && isSensorActive && (
              <div className="text-[11px] text-center text-stone-500 dark:text-stone-400">
                सेन्सर शुद्धता: ±{sensorAccuracy}°
              </div>
            )}
          </div>
        </div>

        {/* DETAILS & COMPATIBILITY COLUMN (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Real-time Angle & Astrological Auspiciousness Rating */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-stone-800 dark:to-stone-800/80 border-2 border-amber-300 dark:border-stone-700 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 dark:border-stone-700 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                  वर्तमान लक्षित दिशा (Current Direction)
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-amber-200 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <span>{currentZone.nameNepali} ({degree}°)</span>
                </h3>
              </div>

              {/* Auspiciousness Pill */}
              <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${currentCompat.badgeClass}`}>
                {currentCompat.level === 'highly_auspicious' || currentCompat.level === 'auspicious' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{currentCompat.levelNepali}</span>
              </div>
            </div>

            {/* Native Birth Chart Analysis for this direction */}
            <div className="bg-white dark:bg-stone-900/90 border border-amber-200 dark:border-stone-700 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-900 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{astroProfile.name}को कुण्डली अनुसार दिशा फलादेश</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {currentCompat.reasonNepali}
              </p>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 flex flex-wrap items-center gap-3 pt-1 border-t border-stone-100 dark:border-stone-800">
                <span>दिशा तत्त्व: <strong>{currentZone.element}</strong></span>
                <span>•</span>
                <span>दिक्पाल देवता: <strong>{currentZone.deity}</strong></span>
                <span>•</span>
                <span>स्वामी ग्रह: <strong>{currentZone.rulingPlanet}</strong></span>
              </div>
            </div>

            {/* Room Planning Layout Guide for this direction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Best Recommended Rooms */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>यस दिशामा सिफारिस गरिएका संरचना:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentCompat.roomRecommendations.recommended.map((r) => (
                    <span
                      key={r}
                      className="text-[11px] bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-md font-medium text-emerald-900 dark:text-emerald-200"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Avoid / Caution Rooms */}
              <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 p-3 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>यस दिशामा पूर्ण रूपमा वर्जित संरचना:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentCompat.roomRecommendations.avoid.map((a) => (
                    <span
                      key={a}
                      className="text-[11px] bg-white dark:bg-stone-900 border border-rose-300 dark:border-rose-700 px-2 py-0.5 rounded-md font-medium text-rose-900 dark:text-rose-200 line-through"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Astrological Vastu Remedy if any */}
            {currentCompat.astroRemedyNepali && (
              <div className="bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-3 rounded-xl text-xs space-y-1 text-stone-800 dark:text-stone-200">
                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>वैदिक वास्तु एवं ग्रहशान्ति उपाय (Upay):</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  {currentCompat.astroRemedyNepali}
                </p>
              </div>
            )}

            {/* Action button to apply direction to Vastu project */}
            {onApplyDirection && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onApplyDirection(currentZone.code.toLowerCase(), degree)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <MapPin className="w-4 h-4" />
                  <span>परियोजनाको मुख्य मुख {currentZone.nameNepali} ({degree}°) मा सेट गर्नुहोस्</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Degree Slider */}
          <div className="bg-amber-50 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-600" />
                <span>म्यानुअल कोण नियन्त्रण (Manual Degree Slider):</span>
              </span>
              <span className="font-mono text-sm text-red-900 dark:text-amber-300 font-black">
                {degree}° ({toDevanagariNumerals(degree)}°)
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="359"
              value={degree}
              onChange={(e) => setDegree(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer h-2.5 bg-amber-200 dark:bg-stone-700 rounded-lg"
            />

            {/* Quick 8-Direction Matrix Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
              {cardinalButtons.map((btn) => {
                const compat = compatibilityMap[btn.code];
                const isCurrent = currentZone.code === btn.code;

                return (
                  <button
                    key={btn.deg}
                    type="button"
                    onClick={() => setDegree(btn.deg)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isCurrent
                        ? 'bg-red-800 text-white border-red-950 shadow-md ring-2 ring-amber-400'
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-amber-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="truncate">{btn.label}</span>
                    <span
                      className={`text-[9px] px-1 rounded-sm font-semibold ${
                        compat.level === 'highly_auspicious'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : compat.level === 'auspicious'
                          ? 'text-blue-600 dark:text-blue-400'
                          : compat.level === 'inauspicious'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {compat.level === 'highly_auspicious' ? 'अति शुभ' : compat.level === 'auspicious' ? 'शुभ' : compat.level === 'inauspicious' ? 'वर्जित' : 'मध्यम'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
