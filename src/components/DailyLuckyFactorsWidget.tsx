import React, { useState, useMemo, useEffect } from 'react';
import {
  Palette,
  Clock,
  Compass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Shirt,
  Flame,
  Sun,
  Moon,
  ShieldCheck,
  Layers,
  Copy,
  Check,
  Calendar,
  ChevronRight,
  Info,
  Briefcase,
  Coins,
  Car,
  GraduationCap,
  Activity,
  Filter,
  Sliders,
  Eye,
  Zap,
  Star
} from 'lucide-react';
import { PanchangaData, PlanetPosition } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { calculateFullChoghadiya, ChoghadiyaSlot } from '../utils/saitEngine';

export interface DailyLuckyFactorsWidgetProps {
  luckyColor: string;
  luckyTime: string;
  luckyNumber: string;
  luckyDirection: string;
  avoidFactors?: string;
  todayPanchanga: PanchangaData;
  transitPlanets?: PlanetPosition[];
  activeProfileName?: string;
  activeMoonRashi?: string;
}

// Color profile definition with styling, chakra and wardrobe recommendations
interface ColorDetail {
  nameNepali: string;
  hex: string;
  gradient: string;
  textClass: string;
  bgLight: string;
  borderClass: string;
  accentHex: string;
  chakra: string;
  planetLord: string;
  element: string;
  attireRecommendation: {
    work: string;
    special: string;
    casual: string;
    accessories: string;
    metal: string;
    tilak: string;
  };
  avoidColor: string;
  energyDescription: string;
}

const COLOR_DATABASE: Record<string, ColorDetail> = {
  'पहेँलो': {
    nameNepali: 'पहेँलो (Yellow / Golden)',
    hex: '#EAB308',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    textClass: 'text-amber-950 dark:text-amber-200',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-400 dark:border-amber-600',
    accentHex: '#F59E0B',
    chakra: 'मणिपुर चक्र (Solar Plexus) - ज्ञान, विवेक र आत्मविश्वास',
    planetLord: 'बृहस्पति (गुरु) तथा सूर्य',
    element: 'अग्नि / तेजस्विता',
    attireRecommendation: {
      work: 'हल्का पहेँलो वा क्रिम कलरको सर्ट/कुर्ता, सुनौलो टाई वा स्कार्फ',
      special: 'चम्किलो सुनौलो वा बसन्ती पहेँलो परम्परागत पोसाक',
      casual: 'सरल पहेँलो टी-सर्ट वा हल्का सुनौलो सुती वस्त्र',
      accessories: 'पहेँलो रुमाल, सुन वा पित्तलको घडी/औंठी',
      metal: 'सुन (Gold) वा पित्तल (Brass)',
      tilak: 'केसर वा पहेँलो चन्दन'
    },
    avoidColor: 'गाढा कालो वा अत्यधिक फुस्रो (Grey) रङबाट आज बच्नुहोस्',
    energyDescription: 'पहेँलो रङले बुद्धि, एकाग्रता, भाग्य वृद्धि र सकारात्मक विचारलाई तीव्र बनाउँछ।'
  },
  'रातो': {
    nameNepali: 'रातो (Red / Crimson)',
    hex: '#DC2626',
    gradient: 'from-red-500 via-rose-600 to-red-700',
    textClass: 'text-red-950 dark:text-red-200',
    bgLight: 'bg-red-50 dark:bg-red-950/40',
    borderClass: 'border-red-400 dark:border-red-600',
    accentHex: '#EF4444',
    chakra: 'मूलाधार तथा आज्ञा चक्र - शक्ति, साहस र पराक्रम',
    planetLord: 'मङ्गल तथा सूर्य',
    element: 'अग्नि / तेज',
    attireRecommendation: {
      work: 'गाढा रातो वा म्यारुन सर्ट, रातो टाई वा रुमाल',
      special: 'रातो वा ढाकाको टोपी/कुर्ता, सिन्दूरी वस्त्र',
      casual: 'रातो क्याजुअल पहिरन वा रातो ज्याकेट',
      accessories: 'रातो रुमाल, तामाको कडा, मुगा (Coral)',
      metal: 'तामा (Copper) वा रक्त स्वर्ण',
      tilak: 'रातो रक्तचन्दन वा कुमकुम'
    },
    avoidColor: 'अत्यधिक हरियो वा कालो रङको समिश्रण आज टार्नुहोस्',
    energyDescription: 'रातो रङले आत्मबल, नेतृत्व क्षमता, साहस र प्रशासनिक कार्यमा उच्च प्रभाव पार्छ।'
  },
  'सेतो': {
    nameNepali: 'सेतो / दुग्ध (White / Pearl)',
    hex: '#F8FAFC',
    gradient: 'from-slate-100 via-stone-200 to-amber-100',
    textClass: 'text-stone-900 dark:text-stone-100',
    bgLight: 'bg-stone-50 dark:bg-stone-800/60',
    borderClass: 'border-stone-300 dark:border-stone-600',
    accentHex: '#E2E8F0',
    chakra: 'सहस्रार चक्र - मानसिक शान्ति, पवित्रता र सन्तुलन',
    planetLord: 'चन्द्रमा तथा शुक्र',
    element: 'जल / शीतलता',
    attireRecommendation: {
      work: 'सफा सेतो सुती सर्ट/कमिज वा अफ-ह्वाइट पोसाक',
      special: 'सेतो कुर्ता-सुरुवाल वा सेतो रेशमी पहिरन',
      casual: 'सेतो टी-सर्ट वा लाइट क्रिम ट्राउजर',
      accessories: 'सेतो रुमाल, चाँदीको सिक्री/औंठी वा मोती',
      metal: 'चाँदी (Silver) वा प्लेटिनम',
      tilak: 'श्वेत श्रीखण्ड चन्दन वा कपुर'
    },
    avoidColor: 'अत्यधिक गाढा कालो वा कडा नीलो रङबाट जोगिनुहोला',
    energyDescription: 'सेतो रङले चित्त शान्ति, तनावमुक्ति, पारिवारिक सद्भाव र सौम्य आकर्षण प्रदान गर्दछ।'
  },
  'सुन्तला': {
    nameNepali: 'सुन्तला / केशरी (Orange / Saffron)',
    hex: '#EA580C',
    gradient: 'from-orange-500 via-amber-600 to-red-600',
    textClass: 'text-orange-950 dark:text-orange-200',
    bgLight: 'bg-orange-50 dark:bg-orange-950/40',
    borderClass: 'border-orange-400 dark:border-orange-600',
    accentHex: '#F97316',
    chakra: 'स्वाधिष्ठान चक्र - सृजनशीलता, उमङ्ग र आरोग्य',
    planetLord: 'सूर्य नारायण',
    element: 'अग्नि / जीवनशक्ति',
    attireRecommendation: {
      work: 'हल्का केशरी वा गेरुवा टोनको सर्ट, सुन्तला टाई',
      special: 'केशरी परम्परागत कुर्था वा पछ्यौरी',
      casual: 'सुन्तला रंगको आरामदायी टी-सर्ट',
      accessories: 'सुन्तला रुमाल, तामाको धातु, माणिक्य',
      metal: 'तामा (Copper) वा सुन',
      tilak: 'केसर-मिश्रित चन्दन'
    },
    avoidColor: 'अति अँध्यारो खैरो वा कालो रङ प्रयोग नगर्नुहोला',
    energyDescription: 'सुन्तला रङले नयाँ उत्साह, रोग प्रतिरोधात्मक क्षमता र सामाजिक ख्याति बढाउँछ।'
  },
  'हरियो': {
    nameNepali: 'हरियो (Green / Emerald)',
    hex: '#16A34A',
    gradient: 'from-emerald-500 via-green-600 to-teal-700',
    textClass: 'text-emerald-950 dark:text-emerald-200',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-400 dark:border-emerald-600',
    accentHex: '#22C55E',
    chakra: 'अनाहत चक्र (Heart Chakra) - व्यापार, बुद्धि र स्वास्थ्य',
    planetLord: 'बुध ग्रह',
    element: 'पृथ्वी / प्रकृति',
    attireRecommendation: {
      work: 'हल्का पिस्ता हरियो वा बोतल ग्रिन सर्ट, हरियो टाई',
      special: 'हरियो रेशमी ढाका पोसाक वा हरियो कुर्ता',
      casual: 'ओलिभ ग्रिन वा मिन्ट ग्रिन पहिरन',
      accessories: 'हरियो रुमाल, पन्ना (Emerald) वा काँसको धातु',
      metal: 'काँस (Bronze) वा पञ्चधातु',
      tilak: 'तुलसीको पात वा हरियो चन्दन'
    },
    avoidColor: 'अत्यधिक गाढा रातो वा कडा सिन्दूरी रङ त्याग्नुहोस्',
    energyDescription: 'हरियो रङले वित्तीय लाभ, वार्तामा सफलता, व्यापारिक सम्झौता र बौद्धिक तिखोपन बढाउँछ।'
  },
  'गुलाबी': {
    nameNepali: 'गुलाबी (Pink / Rose)',
    hex: '#DB2777',
    gradient: 'from-pink-400 via-rose-500 to-pink-600',
    textClass: 'text-pink-950 dark:text-pink-200',
    bgLight: 'bg-pink-50 dark:bg-pink-950/40',
    borderClass: 'border-pink-400 dark:border-pink-600',
    accentHex: '#F43F5E',
    chakra: 'हृदय चक्र - प्रेम, आकर्षण, दाम्पत्य सौहार्द',
    planetLord: 'शुक्र ग्रह',
    element: 'जल / सौन्दर्य',
    attireRecommendation: {
      work: 'हल्का गुलाबी फर्मल सर्ट, रोमान्टिक टोनको स्कार्फ',
      special: 'गुलाबी रेशमी साडी/कुर्ता वा मखमली पोसाक',
      casual: 'गुलाबी टी-सर्ट वा हल्का गुलाबी स्वेटर',
      accessories: 'गुलाबी रुमाल, स्फटिक माला, हीरा/जर्कन',
      metal: 'चाँदी (Silver) वा सेतो सुन',
      tilak: 'गुलाब जल मिश्रित चन्दन'
    },
    avoidColor: 'गाढा पहेंलो वा मयल खैरो रङबाट टाढा रहनुहोला',
    energyDescription: 'गुलाबी रङले आपसी सम्बन्धमा मिठास, प्रेम, कलात्मक रुचि र सौन्दर्यबोध बढाउँछ।'
  },
  'आसमानी': {
    nameNepali: 'आसमानी / हल्का नीलो (Sky Blue / Cyan)',
    hex: '#0284C7',
    gradient: 'from-sky-400 via-blue-500 to-cyan-600',
    textClass: 'text-sky-950 dark:text-sky-200',
    bgLight: 'bg-sky-50 dark:bg-sky-950/40',
    borderClass: 'border-sky-400 dark:border-sky-600',
    accentHex: '#38BDF8',
    chakra: 'विशुद्धि चक्र (Throat Chakra) - प्रभावकारी सञ्चार र सत्यवादिता',
    planetLord: 'शनि तथा बुध',
    element: 'आकाश / गाम्भीर्य',
    attireRecommendation: {
      work: 'हल्का स्काई ब्लु फर्मल सर्ट वा रोयल ब्लु ब्लेजर',
      special: 'नीलो रेशमी वस्त्र वा निलम मिश्रित पहिरन',
      casual: 'आसमानी निलो क्याजुअल कपडा',
      accessories: 'आसमानी रुमाल, फलाम वा स्टिलको कडा, नीलम',
      metal: 'चाँदी वा पञ्चधातु',
      tilak: 'नीलकमल वा श्वेत चन्दन'
    },
    avoidColor: 'कडा रातो वा चम्किलो सिन्दूरी रङ नलगाउनुहोला',
    energyDescription: 'आसमानी रङले गहिरो सञ्चार कौशल, मानसिक सन्तुलन र विवाद निवारणमा सघाउँछ।'
  }
};

// Activity definitions for interactive time recommendation
interface ActivityPlan {
  id: string;
  name: string;
  icon: any;
  category: string;
  bestChoghadiyas: string[];
  guidanceNepali: string;
  avoidRahuKaal: boolean;
}

const ACTIVITIES: ActivityPlan[] = [
  {
    id: 'career_business',
    name: 'नयाँ काम / व्यापार सम्झौता',
    icon: Briefcase,
    category: 'व्यापार तथा नोकरी',
    bestChoghadiyas: ['लाभ', 'शुभ', 'अमृत'],
    guidanceNepali: 'लाभ र अमृत चौघडियामा गरिएको व्यावसायिक सम्झौता, नयाँ प्रोजेक्ट शुभारम्भ तथा कार्यालय उद्घाटनले दीर्घकालीन आर्थिक समृद्धि ल्याउँछ।',
    avoidRahuKaal: true
  },
  {
    id: 'finance_investment',
    name: 'धन लगानी / बैंकिङ कारोबार',
    icon: Coins,
    category: 'आर्थिक क्षेत्र',
    bestChoghadiyas: ['लाभ', 'शुभ'],
    guidanceNepali: 'लगानी तथा ठूलो धन लेनदेनको लागि लाभ चौघडिया सर्वोत्तम हुन्छ। राहुकालमा कुनै पनि सेयर वा जग्गाको बैनाबट्टा नगर्नुहोला।',
    avoidRahuKaal: true
  },
  {
    id: 'travel_commute',
    name: 'यात्रा तथा नयाँ सवारी साधन',
    icon: Car,
    category: 'यात्रा तथा गतिशीलता',
    bestChoghadiyas: ['चर', 'अमृत', 'शुभ'],
    guidanceNepali: 'सवारी साधन खरिद तथा लामो यात्राको आरम्भका लागि चर तथा अमृत चौघडिया अति शुभ मानिन्छ। आजको दिशाशूल ख्याल गरी यात्रा गर्नुहोस्।',
    avoidRahuKaal: true
  },
  {
    id: 'spiritual_puja',
    name: 'पूजा / मन्त्रजप / साधना',
    icon: Flame,
    category: 'धार्मिक तथा आध्यात्मिक',
    bestChoghadiyas: ['अमृत', 'शुभ'],
    guidanceNepali: 'ब्रह्ममुहूर्त (सूर्योदय अघि) र अमृत चौघडिया मन्त्रदीक्षा, रुद्री, कुलपूजा तथा ध्यानका लागि सर्वकार्य सिद्धिकारक हुन्छ।',
    avoidRahuKaal: false
  },
  {
    id: 'study_exam',
    name: 'अध्ययन / परीक्षा / अन्तर्वार्ता',
    icon: GraduationCap,
    category: 'विद्या तथा शिक्षा',
    bestChoghadiyas: ['शुभ', 'लाभ'],
    guidanceNepali: 'शुभ चौघडियामा परीक्षा भवन प्रवेश गर्दा वा अध्ययन सुरु गर्दा गुरु ग्रहको कृपाले एकाग्रता र स्मरण शक्ति उच्च रहन्छ।',
    avoidRahuKaal: true
  },
  {
    id: 'health_wellness',
    name: 'औषधि सेवन / स्वास्थ्य उपचार',
    icon: Activity,
    category: 'आरोग्य तथा स्वास्थ्य',
    bestChoghadiyas: ['अमृत', 'शुभ'],
    guidanceNepali: 'नयाँ औषधि सुरु गर्न वा शल्यक्रिया/उपचारको परामर्श लिन अमृत चौघडिया सबैभन्दा बढी लाभदायक र शीघ्र स्वास्थ्यलाभ गराउने हुन्छ। रोग चौघडिया त्याग्नुहोला।',
    avoidRahuKaal: true
  }
];

export const DailyLuckyFactorsWidget: React.FC<DailyLuckyFactorsWidgetProps> = ({
  luckyColor,
  luckyTime,
  luckyNumber,
  luckyDirection,
  avoidFactors,
  todayPanchanga,
  transitPlanets = [],
  activeProfileName = 'जातक',
  activeMoonRashi = 'मेष'
}) => {
  // Navigation tabs inside widget
  const [activeTab, setActiveTab] = useState<'color' | 'time' | 'direction' | 'checker'>('color');
  const [selectedAttireCategory, setSelectedAttireCategory] = useState<'work' | 'special' | 'casual'>('work');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('career_business');
  const [copiedColorAdvice, setCopiedColorAdvice] = useState<boolean>(false);
  const [choghadiyaPeriod, setChoghadiyaPeriod] = useState<'day' | 'night'>('day');

  // Custom Time Checker State
  const [customHour, setCustomHour] = useState<number>(() => new Date().getHours());
  const [customMinute, setCustomMinute] = useState<number>(() => new Date().getMinutes());

  // Parse color profile from text
  const matchedColorProfile = useMemo<ColorDetail>(() => {
    const raw = (luckyColor || '').toLowerCase();
    for (const [key, profile] of Object.entries(COLOR_DATABASE)) {
      if (raw.includes(key.toLowerCase()) || raw.includes(key)) {
        return profile;
      }
    }
    // Fallback: Check standard English names
    if (raw.includes('red') || raw.includes('रातो')) return COLOR_DATABASE['रातो'];
    if (raw.includes('white') || raw.includes('सेतो')) return COLOR_DATABASE['सेतो'];
    if (raw.includes('green') || raw.includes('हरियो')) return COLOR_DATABASE['हरियो'];
    if (raw.includes('orange') || raw.includes('सुन्तला')) return COLOR_DATABASE['सुन्तला'];
    if (raw.includes('blue') || raw.includes('निलो') || raw.includes('आसमानी')) return COLOR_DATABASE['आसमानी'];
    if (raw.includes('pink') || raw.includes('गुलाबी')) return COLOR_DATABASE['गुलाबी'];
    return COLOR_DATABASE['पहेँलो'];
  }, [luckyColor]);

  // Derive day of week index (0=Sun, 1=Mon, ..., 6=Sat)
  const dayOfWeekIndex = useMemo(() => {
    const dayMap: Record<string, number> = {
      'आइतबार': 0,
      'सोमबार': 1,
      'मंगलबार': 2,
      'मङ्गलबार': 2,
      'बुधबार': 3,
      'बिहीबार': 4,
      'बिहिवार': 4,
      'शुक्रबार': 5,
      'शनिबार': 6,
      'शनिवार': 6,
    };
    return dayMap[todayPanchanga.dayNameNepali] ?? new Date().getDay();
  }, [todayPanchanga.dayNameNepali]);

  // Parse sunrise & sunset into decimal hours
  const { sunriseDec, sunsetDec } = useMemo(() => {
    const parseTime = (str?: string, defaultHour = 6) => {
      if (!str) return defaultHour;
      // Format: "05:42 AM", "06:48 PM", or "०५:४२"
      const match = str.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h + m / 60.0;
      }
      return defaultHour;
    };
    return {
      sunriseDec: parseTime(todayPanchanga.sunrise, 5.75),
      sunsetDec: parseTime(todayPanchanga.sunset, 18.5)
    };
  }, [todayPanchanga.sunrise, todayPanchanga.sunset]);

  // Calculate 16 Choghadiya slots (8 Day + 8 Night)
  const fullChoghadiya = useMemo(() => {
    return calculateFullChoghadiya(sunriseDec, sunsetDec, dayOfWeekIndex);
  }, [sunriseDec, sunsetDec, dayOfWeekIndex]);

  // Real-time live status evaluation (Check where current time falls)
  const currentLiveStatus = useMemo(() => {
    const now = new Date();
    const currDec = now.getHours() + now.getMinutes() / 60.0;
    const isDay = currDec >= sunriseDec && currDec < sunsetDec;
    const activeSlots = isDay ? fullChoghadiya.daySlots : fullChoghadiya.nightSlots;

    // Determine which slot corresponds
    const dayDuration = sunsetDec - sunriseDec;
    const nightDuration = 24.0 - dayDuration;
    const slotLength = isDay ? dayDuration / 8.0 : nightDuration / 8.0;
    const elapsed = isDay ? (currDec - sunriseDec) : (currDec >= sunsetDec ? currDec - sunsetDec : currDec + 24 - sunsetDec);
    const slotIdx = Math.min(7, Math.max(0, Math.floor(elapsed / slotLength)));
    const currentSlot = activeSlots[slotIdx];

    // Check if within Rahu Kaal
    let isInRahuKaal = false;
    if (todayPanchanga.rahuKaal) {
      const parseDec = (tStr: string) => {
        const m = tStr.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
        if (!m) return null;
        let h = parseInt(m[1], 10);
        const mins = parseInt(m[2], 10);
        const ampm = m[3]?.toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h + mins / 60.0;
      };
      const rStart = parseDec(todayPanchanga.rahuKaal.start);
      const rEnd = parseDec(todayPanchanga.rahuKaal.end);
      if (rStart !== null && rEnd !== null && currDec >= rStart && currDec <= rEnd) {
        isInRahuKaal = true;
      }
    }

    return {
      currentSlot,
      isDay,
      isInRahuKaal,
      currDec
    };
  }, [sunriseDec, sunsetDec, fullChoghadiya, todayPanchanga.rahuKaal]);

  // Selected Activity Plan guidance
  const selectedActivity = useMemo(() => {
    return ACTIVITIES.find((a) => a.id === selectedActivityId) || ACTIVITIES[0];
  }, [selectedActivityId]);

  // Filter choghadiya slots that are best for the selected activity
  const recommendedSlotsForActivity = useMemo(() => {
    const slots = [...fullChoghadiya.daySlots, ...fullChoghadiya.nightSlots];
    return slots.filter((slot) => selectedActivity.bestChoghadiyas.includes(slot.name));
  }, [fullChoghadiya, selectedActivity]);

  // Custom Time Checker Evaluation
  const customEvaluation = useMemo(() => {
    const dec = customHour + customMinute / 60.0;
    const isDay = dec >= sunriseDec && dec < sunsetDec;
    const activeSlots = isDay ? fullChoghadiya.daySlots : fullChoghadiya.nightSlots;

    const dayDuration = sunsetDec - sunriseDec;
    const nightDuration = 24.0 - dayDuration;
    const slotLength = isDay ? dayDuration / 8.0 : nightDuration / 8.0;
    const elapsed = isDay ? (dec - sunriseDec) : (dec >= sunsetDec ? dec - sunsetDec : dec + 24 - sunsetDec);
    const slotIdx = Math.min(7, Math.max(0, Math.floor(elapsed / slotLength)));
    const slot = activeSlots[slotIdx] || activeSlots[0];

    // Check Rahu Kaal
    let inRahu = false;
    if (todayPanchanga.rahuKaal) {
      const parseDec = (tStr: string) => {
        const m = tStr.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
        if (!m) return null;
        let h = parseInt(m[1], 10);
        const mins = parseInt(m[2], 10);
        const ampm = m[3]?.toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h + mins / 60.0;
      };
      const rStart = parseDec(todayPanchanga.rahuKaal.start);
      const rEnd = parseDec(todayPanchanga.rahuKaal.end);
      if (rStart !== null && rEnd !== null && dec >= rStart && dec <= rEnd) {
        inRahu = true;
      }
    }

    let verdict = 'सामान्य फलदायक';
    let score = 70;
    let badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    if (inRahu) {
      verdict = 'राहुकाल (सावधानी आवश्यक - नयाँ काम नथाल्नुहोस्)';
      score = 30;
      badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
    } else if (slot.type === 'शुभ') {
      verdict = `अति उत्तम तथा सिद्धिदायक (${slot.name} चौघडिया)`;
      score = 95;
      badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (slot.type === 'सामान्य') {
      verdict = `मध्यम / सामान्य अनुकूल (${slot.name} चौघडिया)`;
      score = 75;
      badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    } else {
      verdict = `प्रतिकूल / विघ्नकारक (${slot.name} चौघडिया - त्याज्य)`;
      score = 40;
      badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
    }

    return {
      slot,
      inRahu,
      verdict,
      score,
      badgeColor,
      isDay
    };
  }, [customHour, customMinute, sunriseDec, sunsetDec, fullChoghadiya, todayPanchanga.rahuKaal]);

  // Copy Color Advice handler
  const handleCopyColorAdvice = () => {
    const text = `🎨 आजको भाग्यशाली रङ तथा पोसाक सिफारिस 🎨\nजातक: ${activeProfileName} (राशि: ${activeMoonRashi})\n\nमुख्य रङ: ${matchedColorProfile.nameNepali}\nचक्र तथा ग्रह: ${matchedColorProfile.chakra} (अधिपति: ${matchedColorProfile.planetLord})\n\n👔 पहिरन सल्लाह:\n• कार्यालय/व्यापार: ${matchedColorProfile.attireRecommendation.work}\n• विशेष/धार्मिक कार्य: ${matchedColorProfile.attireRecommendation.special}\n• धातु/आभूषण: ${matchedColorProfile.attireRecommendation.metal}\n• शुभ तिलक: ${matchedColorProfile.attireRecommendation.tilak}\n\n⚠️ बच्नुपर्ने रङ: ${matchedColorProfile.avoidColor}\n\n— बालानन्द वैदिक ज्योतिष सेवा`;
    navigator.clipboard.writeText(text);
    setCopiedColorAdvice(true);
    setTimeout(() => setCopiedColorAdvice(false), 2500);
  };

  return (
    <div
      id="daily-lucky-factors-interactive-widget"
      className="bg-white dark:bg-stone-900 border-2 border-amber-400/90 dark:border-stone-700 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6 relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: matchedColorProfile.hex }}
      />

      {/* 1. HEADER WITH LIVE TIME STATUS BADGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/80 dark:border-stone-800 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700 flex items-center gap-1.5 uppercase tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>अन्तरक्रियात्मक भाग्यशाली तत्व विजेट</span>
            </span>

            {/* Live Time Indicator Badge */}
            <div
              id="live-time-status-pill"
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 shadow-2xs ${
                currentLiveStatus.isInRahuKaal
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-300'
                  : currentLiveStatus.currentSlot?.type === 'शुभ'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    currentLiveStatus.isInRahuKaal
                      ? 'bg-rose-500'
                      : currentLiveStatus.currentSlot?.type === 'शुभ'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    currentLiveStatus.isInRahuKaal
                      ? 'bg-rose-600'
                      : currentLiveStatus.currentSlot?.type === 'शुभ'
                      ? 'bg-emerald-600'
                      : 'bg-amber-600'
                  }`}
                />
              </span>
              <span>
                अहिले ({currentLiveStatus.isDay ? 'दिन' : 'रात'}):{' '}
                {currentLiveStatus.isInRahuKaal
                  ? '⚠️ राहुकाल चलिरहेको छ'
                  : `${currentLiveStatus.currentSlot?.name || 'शुभ'} चौघडिया (${currentLiveStatus.currentSlot?.type || 'शुभ'})`}
              </span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif text-red-950 dark:text-amber-300 flex items-center gap-2">
            <span>आजको भाग्यशाली रङ, शुभ समय तथा मुहूर्त सल्लाह</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-serif">
            {activeProfileName} ({activeMoonRashi} राशि) का लागि आजको दिन ऊर्जावान्, फलदायी र विघ्नमुक्त बनाउने वैदिक मार्गदर्शन।
          </p>
        </div>

        {/* 4 INTERACTIVE TAB SWITCHERS */}
        <div
          id="lucky-factors-tab-bar"
          className="flex flex-wrap p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 self-start md:self-auto shrink-0"
        >
          <button
            id="tab-btn-lucky-color"
            onClick={() => setActiveTab('color')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'color'
                ? 'bg-white dark:bg-stone-900 text-red-900 dark:text-amber-300 shadow-sm border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-600" />
            <span>भाग्यशाली रङ</span>
          </button>

          <button
            id="tab-btn-lucky-time"
            onClick={() => setActiveTab('time')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'time'
                ? 'bg-white dark:bg-stone-900 text-red-900 dark:text-amber-300 shadow-sm border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>शुभ समय / चौघडिया</span>
          </button>

          <button
            id="tab-btn-lucky-direction"
            onClick={() => setActiveTab('direction')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'direction'
                ? 'bg-white dark:bg-stone-900 text-red-900 dark:text-amber-300 shadow-sm border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>दिशा र अंक</span>
          </button>

          <button
            id="tab-btn-time-checker"
            onClick={() => setActiveTab('checker')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'checker'
                ? 'bg-white dark:bg-stone-900 text-red-900 dark:text-amber-300 shadow-sm border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span>समय जाँचक</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LUCKY COLOR, ATTIRE & ENERGY GUIDE                      */}
      {/* ============================================================== */}
      {activeTab === 'color' && (
        <div id="lucky-color-content" className="space-y-6">
          
          {/* Main Visual Swatch Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left Col: Color Swatch & Resonance Card */}
            <div className="lg:col-span-5 rounded-3xl p-6 border border-stone-200 dark:border-stone-700 bg-gradient-to-br from-stone-50 via-white to-amber-50/40 dark:from-stone-900 dark:via-stone-900 dark:to-stone-850 flex flex-col justify-between shadow-xs space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-600" />
                    <span>आजको मुख्य भाग्योदय रङ</span>
                  </span>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                    सर्वोत्तम अनुकूल
                  </span>
                </div>

                {/* Big Color Preview Circle with Glow */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-2xl shadow-md border-4 border-white dark:border-stone-800 flex items-center justify-center transition-transform hover:scale-105"
                      style={{ backgroundColor: matchedColorProfile.hex }}
                    >
                      <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
                      {matchedColorProfile.nameNepali}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                      स्वामी: <strong className="text-red-900 dark:text-amber-400">{matchedColorProfile.planetLord}</strong> | तत्त्व: {matchedColorProfile.element}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: matchedColorProfile.hex }} />
                      <span className="text-[11px] font-mono font-bold text-stone-500">{matchedColorProfile.hex}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                  {matchedColorProfile.energyDescription}
                </p>
              </div>

              {/* Chakra Connection Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>चक्र तथा आन्तरिक ऊर्जा संरेखण:</span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-normal font-medium">
                  {matchedColorProfile.chakra}
                </p>
              </div>

              {/* Copy Advice Button */}
              <button
                id="btn-copy-color-advice"
                onClick={handleCopyColorAdvice}
                className="w-full bg-stone-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600 rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copiedColorAdvice ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400">रङ सल्लाह प्रतिलिपि भयो!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-600" />
                    <span>रङ तथा पोसाक सल्लाह प्रतिलिपि गर्नुहोस्</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Col: Interactive Wardrobe & Style Selector */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Category Selector Tabs */}
              <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-amber-600" />
                    <span>आज कुन अवसरमा कस्तो पोसाक लगाउने? (Daily Attire & Styling)</span>
                  </h4>
                  <span className="text-[10px] text-stone-500 font-bold uppercase">अवसर छनोट</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="btn-attire-work"
                    onClick={() => setSelectedAttireCategory('work')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      selectedAttireCategory === 'work'
                        ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-amber-50'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>कार्यालय / व्यापार</span>
                  </button>

                  <button
                    id="btn-attire-special"
                    onClick={() => setSelectedAttireCategory('special')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      selectedAttireCategory === 'special'
                        ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-amber-50'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>पूजा / विशेष समारोह</span>
                  </button>

                  <button
                    id="btn-attire-casual"
                    onClick={() => setSelectedAttireCategory('casual')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      selectedAttireCategory === 'casual'
                        ? 'bg-amber-700 text-white border-amber-800 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-amber-50'
                    }`}
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>दैनिक / सामान्य</span>
                  </button>
                </div>

                {/* Attire recommendation text */}
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <strong className="text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif">
                      {selectedAttireCategory === 'work' && 'कार्यालय, व्यापार तथा महत्वपूर्ण भेटघाटको लागि:'}
                      {selectedAttireCategory === 'special' && 'धार्मिक अनुष्ठान, पूजा तथा पारिवारिक उत्सवको लागि:'}
                      {selectedAttireCategory === 'casual' && 'घरमा, यात्रा तथा दैनिक सामान्य गतिविधिको लागि:'}
                    </strong>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-6">
                    {matchedColorProfile.attireRecommendation[selectedAttireCategory]}
                  </p>
                </div>
              </div>

              {/* 3 Accessory & Energy Cards: Metals, Tilak, Pocket Square */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Metal & Gems */}
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-600" />
                    <span>अनुकूल धातु / आभूषण</span>
                  </span>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {matchedColorProfile.attireRecommendation.metal}
                  </p>
                </div>

                {/* Tilak */}
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-600" />
                    <span>दैनिक शुभ तिलक</span>
                  </span>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {matchedColorProfile.attireRecommendation.tilak}
                  </p>
                </div>

                {/* Small Pocket Accessory */}
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>रुमाल / सुरक्षा कवच</span>
                  </span>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {matchedColorProfile.attireRecommendation.accessories}
                  </p>
                </div>

              </div>

              {/* Avoid Color Caution Box */}
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-serif">आज बच्नुपर्ने रङ (Avoid Color):</strong> {matchedColorProfile.avoidColor}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: AUSPICIOUS TIME & CHOGHADIYA TRACKER                     */}
      {/* ============================================================== */}
      {activeTab === 'time' && (
        <div id="lucky-time-content" className="space-y-6">
          
          {/* Activity Planner Selector Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-teal-950/40 border border-amber-300 dark:border-amber-700 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-700" />
                  <span>तपाईं कुन कामका लागि आज शुभ समय खोज्दै हुनुहुन्छ? (Plan Your Task)</span>
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  आफ्नो आजको कार्य छनोट गर्नुहोस्, प्रणालीले सो कार्यका लागि दिनभरका उत्कृष्ट मुहूर्तहरू तत्काल देखाउनेछ।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-choghadiya-day"
                  onClick={() => setChoghadiyaPeriod('day')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    choghadiyaPeriod === 'day'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>दिनको समय (Day)</span>
                </button>
                <button
                  id="btn-choghadiya-night"
                  onClick={() => setChoghadiyaPeriod('night')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    choghadiyaPeriod === 'night'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>रातको समय (Night)</span>
                </button>
              </div>
            </div>

            {/* 6 Clickable Activity Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {ACTIVITIES.map((act) => {
                const IconComponent = act.icon;
                const isSelected = act.id === selectedActivityId;
                return (
                  <button
                    key={act.id}
                    id={`btn-act-${act.id}`}
                    onClick={() => setSelectedActivityId(act.id)}
                    className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-stone-900 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30 shadow-xs'
                        : 'bg-white/80 dark:bg-stone-900/80 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="text-[11px] font-bold font-serif text-stone-900 dark:text-stone-100 leading-tight">
                      {act.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Activity Recommendation Detail Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-stone-700 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 uppercase">सिफारिस चौघडिया:</span>
                  <div className="flex items-center gap-1">
                    {selectedActivity.bestChoghadiyas.map((bc, idx) => (
                      <span key={idx} className="bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-300">
                        ✓ {bc}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedActivity.avoidRahuKaal && (
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200">
                    ⚠️ राहुकाल समय वर्जित
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
                {selectedActivity.guidanceNepali}
              </p>
            </div>

          </div>

          {/* Classical Muhurta Windows Row (Abhijit, Brahma, Rahu Kaal) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Abhijit Muhurta */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>अभिजित मुहूर्त (सर्वकार्य सिद्धि)</span>
                </span>
                <span className="text-[9px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold px-1.5 py-0.5 rounded">
                  अति शुभ
                </span>
              </div>
              <p className="text-base font-black font-serif text-emerald-950 dark:text-emerald-200">
                {todayPanchanga.abhijitMuhurta?.start || '११:४५'} देखि {todayPanchanga.abhijitMuhurta?.end || '१२:३५'} सम्म
              </p>
              <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-normal">
                मध्याह्नको यो समयमा कुनै पनि शुभ कार्य, हस्ताक्षर, नयाँ यात्रा वा खरिदबिक्री निर्धक्क सुरु गर्न सकिन्छ।
              </p>
            </div>

            {/* Brahma Muhurta */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-800 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-300 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5" />
                  <span>ब्रह्म मुहूर्त (साधना र ध्यान)</span>
                </span>
                <span className="text-[9px] bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 font-bold px-1.5 py-0.5 rounded">
                  आध्यात्मिक
                </span>
              </div>
              <p className="text-base font-black font-serif text-blue-950 dark:text-blue-200">
                {todayPanchanga.brahmaMuhurta?.start || '०४:१५'} देखि {todayPanchanga.brahmaMuhurta?.end || '०५:०२'} सम्म
              </p>
              <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80 leading-normal">
                सूर्योदय अघिको यो समय मानसिक शान्ति, अध्ययन, मन्त्रदीक्षा र दीर्घायु आरोग्य साधनाका लागि अमृततुल्य हुन्छ।
              </p>
            </div>

            {/* Rahu Kaal Warning */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-rose-800 dark:text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>राहुकाल (त्याज्य / सावधानी)</span>
                </span>
                <span className="text-[9px] bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-bold px-1.5 py-0.5 rounded">
                  अशुभ
                </span>
              </div>
              <p className="text-base font-black font-serif text-rose-950 dark:text-rose-200">
                {typeof todayPanchanga.rahuKaal === 'object'
                  ? `${todayPanchanga.rahuKaal.start} देखि ${todayPanchanga.rahuKaal.end}`
                  : (todayPanchanga.rahuKaal || 'अपराह्न')}
              </p>
              <p className="text-[11px] text-rose-900/80 dark:text-rose-300/80 leading-normal">
                यो समयमा नयाँ कामको थालनी, आर्थिक लगानी, महत्त्वपूर्ण वार्ता वा यात्रा शुभारम्भ पूर्ण रूपमा त्याज्य मानिन्छ।
              </p>
            </div>

          </div>

          {/* Interactive 8-Slot Choghadiya Timeline Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>
                  {choghadiyaPeriod === 'day' ? 'दिनको ८ चौघडिया समय चक्र' : 'रातको ८ चौघडिया समय चक्र'}
                </span>
              </h4>
              <span className="text-xs text-stone-500">
                {choghadiyaPeriod === 'day' ? 'सूर्योदय देखि सूर्यास्त सम्म' : 'सूर्यास्त देखि भोलिको सूर्योदय सम्म'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(choghadiyaPeriod === 'day' ? fullChoghadiya.daySlots : fullChoghadiya.nightSlots).map((slot, idx) => {
                const isRecommended = selectedActivity.bestChoghadiyas.includes(slot.name);
                const isGood = slot.type === 'शुभ';
                const isNormal = slot.type === 'सामान्य';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between gap-2 shadow-2xs ${
                      isRecommended
                        ? 'ring-2 ring-amber-500 bg-amber-50/40 dark:bg-amber-950/30 border-amber-400'
                        : isGood
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : isNormal
                        ? 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700'
                        : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-500">{slot.startTime} - {slot.endTime}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          isGood
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                            : isNormal
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300'
                            : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-300'
                        }`}
                      >
                        {slot.type}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-base font-black font-serif text-stone-900 dark:text-stone-100">
                          {slot.name}
                        </strong>
                        {isRecommended && (
                          <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold px-1.5 py-0.5 rounded">
                            ⭐ छनोट कार्यका लागि उत्तम
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug mt-1">
                        {slot.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LUCKY DIRECTION & NUMBER RESONANCE                      */}
      {/* ============================================================== */}
      {activeTab === 'direction' && (
        <div id="lucky-direction-content" className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Box: Lucky Direction Compass */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/40 dark:from-stone-900 dark:via-stone-900 dark:to-stone-850 border border-stone-200 dark:border-stone-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>आजको शुभ दिशा (Lucky Direction)</span>
                </span>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-bold px-2.5 py-0.5 rounded-full border border-indigo-300">
                  {luckyDirection}
                </span>
              </div>

              {/* Visual Direction Compass Dial */}
              <div className="flex flex-col items-center justify-center p-4">
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-indigo-200 dark:border-stone-700 relative flex items-center justify-center bg-stone-50/60 dark:bg-stone-800/40 shadow-inner">
                  {/* Cardinal Points */}
                  <span className="absolute top-2 text-xs font-black text-stone-600">उत्तर (North)</span>
                  <span className="absolute bottom-2 text-xs font-black text-stone-600">दक्षिण (South)</span>
                  <span className="absolute right-2 text-xs font-black text-stone-600">पूर्व (East)</span>
                  <span className="absolute left-2 text-xs font-black text-stone-600">पश्चिम (West)</span>

                  {/* Center Target Indicator */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-amber-600 text-white flex flex-col items-center justify-center shadow-lg text-center p-2">
                    <Compass className="w-5 h-5 text-amber-200 animate-spin-slow" />
                    <span className="text-xs font-bold mt-1 font-serif">{luckyDirection}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-indigo-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 space-y-1.5">
                <strong className="text-indigo-900 dark:text-indigo-300 font-serif">दैनिक दिशा सल्लाह:</strong>
                <p className="leading-relaxed">
                  आज अध्ययन, व्यापारिक कारोबार वा महत्त्वपूर्ण सम्झौताका लागि बस्दा <strong>{luckyDirection}</strong> फर्केर बस्नुहोला। यसले मनमा एकाग्रता, निर्णय क्षमता र अभीष्ट फल प्रदान गर्दछ।
                </p>
              </div>
            </div>

            {/* Right Box: Lucky Number & Numerology Resonance */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/50 via-white to-red-50/40 dark:from-stone-900 dark:via-stone-900 dark:to-stone-850 border border-stone-200 dark:border-stone-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span>आजको भाग्यशाली अंक (Lucky Number)</span>
                </span>
                <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  अंक: {luckyNumber}
                </span>
              </div>

              <div className="flex items-center gap-5 pt-2">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-600 to-red-700 text-white flex flex-col items-center justify-center font-black shadow-lg shrink-0">
                  <span className="text-3xl font-serif">{luckyNumber}</span>
                  <span className="text-[10px] tracking-wider uppercase font-sans">शुभ अंक</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
                    वैदिक अंकशास्त्र प्रभाव
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    अंक <strong>{luckyNumber}</strong> ले आज तपाईंको कर्म, पराक्रम र आर्थिक निर्णयमा दैवी साथ प्रदान गर्दछ।
                  </p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                    शुभ समयको थालनी वा मन्त्रजप गर्दा यो अंकको गुणन (जस्तै: {luckyNumber} वा {parseInt(luckyNumber) * 3 || 21} पटक) प्रयोग गर्न सक्नुहुन्छ।
                  </p>
                </div>
              </div>

              {/* Avoid Factors Reminder */}
              {avoidFactors && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-950 dark:text-rose-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold font-serif text-rose-900 dark:text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>सावधानी तथा त्याज्य पक्ष:</span>
                  </div>
                  <p className="leading-relaxed pl-6">
                    {avoidFactors}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CUSTOM TIME CHECKER (समय अनुकूलता परीक्षक)             */}
      {/* ============================================================== */}
      {activeTab === 'checker' && (
        <div id="time-checker-content" className="space-y-6">
          
          <div className="bg-stone-50 dark:bg-stone-850 p-6 rounded-3xl border border-stone-200 dark:border-stone-700 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700 pb-3">
              <div>
                <h4 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>दैनिक समय अनुकूलता परीक्षक (Check Any Planned Time)</span>
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  तपाईंले आज योजना बनाउनुभएको कुनै पनि समय छान्नुहोस्, प्रणालीले सो समय शुभ छ वा त्याज्य छ भनी तत्काल विश्लेषण गर्नेछ।
                </p>
              </div>
              <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-bold px-3 py-1 rounded-xl border border-purple-300">
                समय जाँचक
              </span>
            </div>

            {/* Interactive Time Selector */}
            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400">घण्टा (Hour - 24h):</label>
                <select
                  id="select-custom-hour"
                  value={customHour}
                  onChange={(e) => setCustomHour(parseInt(e.target.value, 10))}
                  className="bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {toDevanagariNumerals(String(i).padStart(2, '0'))}:०० ({i < 12 ? (i === 0 ? '१२ AM' : `${i} AM`) : (i === 12 ? '१२ PM' : `${i - 12} PM`)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400">मिनेट (Minute):</label>
                <select
                  id="select-custom-minute"
                  value={customMinute}
                  onChange={(e) => setCustomMinute(parseInt(e.target.value, 10))}
                  className="bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {toDevanagariNumerals(String(m).padStart(2, '0'))} मिनेट
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-4 sm:pt-0 sm:ml-auto">
                <span className="text-xs text-stone-400 font-bold mr-1">द्रुत समय:</span>
                <button
                  onClick={() => {
                    const now = new Date();
                    setCustomHour(now.getHours());
                    setCustomMinute(now.getMinutes());
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[11px] font-bold text-stone-700 dark:text-stone-300 transition cursor-pointer"
                >
                  अहिलेको समय
                </button>
                <button
                  onClick={() => { setCustomHour(9); setCustomMinute(30); }}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[11px] font-bold text-stone-700 dark:text-stone-300 transition cursor-pointer"
                >
                  बिहान ०९:३०
                </button>
                <button
                  onClick={() => { setCustomHour(12); setCustomMinute(0); }}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[11px] font-bold text-stone-700 dark:text-stone-300 transition cursor-pointer"
                >
                  मध्याह्न १२:००
                </button>
                <button
                  onClick={() => { setCustomHour(15); setCustomMinute(30); }}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-[11px] font-bold text-stone-700 dark:text-stone-300 transition cursor-pointer"
                >
                  दिउँसो ०३:३०
                </button>
              </div>
            </div>

            {/* Verdict Result Card */}
            <div className={`p-5 rounded-3xl border-2 space-y-3 ${customEvaluation.badgeColor}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase">जाँच गरिएको समय:</span>
                  <strong className="text-base font-black font-serif">
                    {toDevanagariNumerals(String(customHour).padStart(2, '0'))}:{toDevanagariNumerals(String(customMinute).padStart(2, '0'))} ({customEvaluation.isDay ? 'दिन' : 'रात'})
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">अनुकूलता अंक:</span>
                  <span className="text-sm font-black px-2.5 py-0.5 rounded-full bg-white dark:bg-stone-900 border font-serif">
                    {toDevanagariNumerals(customEvaluation.score)}%
                  </span>
                </div>
              </div>

              <div className="text-lg font-black font-serif flex items-center gap-2">
                {customEvaluation.score >= 75 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{customEvaluation.verdict}</span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed">
                यो समयमा <strong>{customEvaluation.slot.name}</strong> चौघडिया पर्दछ। {customEvaluation.slot.description}
                {customEvaluation.inRahu && ' विशेष ध्यान दिनुहोस्: यो समय आजको राहुकाल भित्र पर्ने भएकाले नयाँ सम्झौता तथा लगानी नगर्नुहोला।'}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
