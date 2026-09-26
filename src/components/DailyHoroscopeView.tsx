import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Bot,
  RefreshCw,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Calendar,
  Layers,
  Heart,
  Briefcase,
  Activity,
  GraduationCap,
  ShieldCheck,
  Zap,
  Copy,
  ChevronRight,
  User,
  Star,
  Globe2,
  Clock,
  Mail,
  Download,
  FileText,
  Bell,
  BellRing
} from 'lucide-react';
import {
  BirthDetails,
  PanchangaData,
  PlanetPosition,
  LagnaInfo,
  VimshottariDashaResult
} from '../types/astrology';
import { RASHI_DATA } from '../utils/astroCalculations';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { HoroscopeEmailSubscriptionModal } from './HoroscopeEmailSubscriptionModal';
import { DailyHoroscopePdfModal } from './DailyHoroscopePdfModal';
import { PlanetaryIngressAlertBox } from './PlanetaryIngressAlertBox';
import { DailyLuckyFactorsWidget } from './DailyLuckyFactorsWidget';
import { detectSignificantPlanetaryIngress } from '../utils/ingressDetector';
import {
  isDailyHoroscopePushEnabled,
  setDailyHoroscopePushEnabled,
  getBrowserNotificationPermission,
  requestHoroscopeNotificationPermission,
  sendHoroscopeWebNotification
} from '../utils/dailyHoroscopeNotifier';

export interface DailyHoroscopeData {
  overallRating: number; // 0 to 100
  overallSummary: string;
  careerAndFinance: string;
  healthAndWellness: string;
  loveAndFamily: string;
  educationAndCreativity: string;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  luckyTime: string;
  avoidFactors: string;
  dailyMantra: string;
  dailyRemedy: string;
  transitMatchingSummary?: string;
  auspiciousInfluences?: string[];
  inauspiciousInfluences?: string[];
  transitHighlights: string[];
  generatedAtBS: string;
  isAiGenerated: boolean;
}

interface DailyHoroscopeViewProps {
  activeProfile: BirthDetails | null;
  profiles: BirthDetails[];
  todayPanchanga: PanchangaData;
  transitPlanets: PlanetPosition[];
  natalPlanets: PlanetPosition[];
  lagna: LagnaInfo;
  dasha: VimshottariDashaResult;
  onSelectProfile: (profile: BirthDetails) => void;
  onNewProfile: () => void;
}

// Classical astrological daily synthesis engine for fallback/instant generation
const generateClassicalDailyHoroscope = (
  moonRashiName: string,
  todayPanchanga: PanchangaData,
  profileName: string,
  lagnaRashiName: string = 'मेष',
  transitPlanets: PlanetPosition[] = []
): DailyHoroscopeData => {
  const rashi = RASHI_DATA.find((r) => r.name === moonRashiName) || RASHI_DATA[0];
  const rashiId = rashi.id;
  const tithiIndex = 5; // pseudo base
  const dayScore = 75 + ((rashiId * 7 + todayPanchanga.tithi.name.length * 3) % 22);

  const colors = ['पहेँलो (Yellow)', 'रातो (Red)', 'सेतो (White)', 'सुन्तला (Orange)', 'गुलाबी (Pink)', 'हरियो (Green)', 'आसमानी (Sky Blue)'];
  const directions = ['पूर्व (East)', 'उत्तर (North)', 'ईशान (North-East)', 'उत्तर-पश्चिम (North-West)'];
  const numbers = ['३', '५', '७', '९', '१', '८', '६'];
  const luckyColor = colors[(rashiId + 2) % colors.length];
  const luckyDirection = directions[rashiId % directions.length];
  const luckyNumber = numbers[(rashiId * 3) % numbers.length];

  const transitMoon = transitPlanets.find((p) => p.name === 'चन्द्र')?.rashiName || todayPanchanga.moonRashi || moonRashiName;

  return {
    overallRating: dayScore,
    overallSummary: `जातक ${profileName} का लागि आजको दिन चन्द्रमाको गोचर तथा ताराबलको अनुकूलताले गर्दा आत्मबल, पराक्रम र नयाँ अवसरहरू अभिवृद्धि गराउने खालको रहनेछ। सोचेका कामहरू क्रमशः पूरा हुनेछन्।`,
    careerAndFinance: `व्यावसायिक कार्यक्षेत्रमा सकारात्मक प्रगति देखिनेछ। नयाँ जिम्मेवारी प्राप्त हुनसक्छ। आर्थिक कारोबारमा लाभ हुने संकेत छ तर अनावश्यक विलासितामा खर्च नियन्त्रण गर्नु बुद्धिमानी हुनेछ।`,
    healthAndWellness: `स्वास्थ्य सामान्यतया स्फूर्तिदायक र ऊर्जावान् रहनेछ। मानसिक शान्तिका लागि ध्यान तथा पर्याप्त जल सेवन गर्नुहोस्। मौसम परिवर्तनजन्य चिसोबाट जोगिनुहोला।`,
    loveAndFamily: `पारिवारिक वातावरण सौहार्दपूर्ण रहनेछ। जीवनसाथी तथा आत्मीय जनसँगको सहकार्यले मनमा आनन्द मिल्नेछ। पुराना असमझदारीहरू छलफलबाट सुल्झिनेछन्।`,
    educationAndCreativity: `विद्यार्थी वर्गका लागि एकाग्रता र बौद्धिक क्षमतामा सुधार आउनेछ। सिर्जनात्मक तथा अनुसन्धानमूलक कार्यहरूमा शुभ नतिजा प्राप्त हुनेछ।`,
    luckyColor,
    luckyNumber,
    luckyDirection,
    luckyTime: 'बिहान ०८:३० देखि १०:१५ सम्म',
    avoidFactors: `राहुकालको समय (${typeof todayPanchanga.rahuKaal === 'object' ? `${todayPanchanga.rahuKaal.start} देखि ${todayPanchanga.rahuKaal.end}` : (todayPanchanga.rahuKaal || 'अपराह्न')}) मा महत्त्वपूर्ण सम्झौता नगर्नुहोस् र विवादबाट टाढा रहनुहोस्।`,
    dailyMantra: `ॐ नमो भगवते वासुदेवाय (वा ॐ नमः शिवाय)`,
    dailyRemedy: `आज बिहान तामाको लोटाबाट सूर्यदेवलाई अर्घ्य चढाउनुहोस् र घरबाट निस्कनुअघि गुलियो वस्तु वा दही सेवन गर्नुहोस्।`,
    transitMatchingSummary: `जातकको जन्म चन्द्र राशि (${moonRashiName}) र लग्न (${lagnaRashiName}) सँग आजको गोचर चन्द्रमा (${transitMoon}) तथा अन्य मुख्य ग्रहहरूको दृष्टि मिलान गर्दा कार्यक्षेत्र र बौद्धिक क्षेत्रमा बलियो सकारात्मक प्रभाव छ।`,
    auspiciousInfluences: [
      `${moonRashiName} राशि: चन्द्रमाको अनुकूल गोचर र ताराबलले गर्दा आत्मबल, सामाजिक प्रतिष्ठा र कार्य सिद्धिमा विशेष शुभता`,
      `लग्न तथा त्रिकोण भाव: शुभ ग्रहहरूको पारस्परिक दृष्टिले धनार्जन, नयाँ योजनाहरूको थालनी र पारिवारिक सहयोगमा वृद्धि`,
      `दशम कर्म स्थान: कर्म भावमा अनुकूल ग्रह प्रभावले व्यावसायिक भेटघाट, पदोन्नति वा नयाँ अवसरको सिर्जना`
    ],
    inauspiciousInfluences: [
      `अष्टम/द्वादश गोचर: व्यय तथा अष्टम भावमा पापक ग्रहको सामान्य प्रभावले अनावश्यक खर्च र सामान्य यात्रामा सतर्कता आवश्यक`,
      `षष्ठ भाव: प्रतिपक्षी र प्रतिस्पर्धीहरूसँग अनावश्यक विवाद नगर्नुहोला, स्वास्थ्यमा चिसो वा पेटको सामान्य ध्यान दिनुहोस्`,
      `राहुकाल अवधि: पञ्चाङ्ग अनुसार आजको राहुकाल समयमा महत्वपूर्ण सम्झौता र ठूला लगानी टार्नु बुद्धिमानी हुनेछ`
    ],
    transitHighlights: [
      `चन्द्रमाको गोचर प्रभाव सकारात्मक`,
      `ताराबल अनुसार शुभ समय`,
      `कर्म भावमा ग्रहहरूको सन्तुलित दृष्टि`
    ],
    generatedAtBS: todayPanchanga.dateBS,
    isAiGenerated: false
  };
};

// Helper to format Gregorian Date (AD) and Day of Week
const getGregorianDateDetails = (dateAD?: string, dayNameNepali?: string) => {
  const nepaliToEnglishDay: Record<string, string> = {
    'आइतबार': 'Sunday',
    'सोमबार': 'Monday',
    'मंगलबार': 'Tuesday',
    'मङ्गलबार': 'Tuesday',
    'बुधबार': 'Wednesday',
    'बिहीबार': 'Thursday',
    'बिहिवार': 'Thursday',
    'शुक्रबार': 'Friday',
    'शनिबार': 'Saturday',
    'शनिवार': 'Saturday'
  };

  const fallbackWeekday = dayNameNepali ? (nepaliToEnglishDay[dayNameNepali] || '') : '';

  if (dateAD) {
    try {
      const parsed = new Date(dateAD);
      if (!isNaN(parsed.getTime())) {
        const formattedDate = parsed.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        const weekday = parsed.toLocaleDateString('en-US', { weekday: 'long' });
        return { 
          formattedDate, 
          weekday: weekday || fallbackWeekday, 
          fullString: `${formattedDate} (${weekday || fallbackWeekday})` 
        };
      }
    } catch {
      // ignore
    }
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  return { 
    formattedDate, 
    weekday: fallbackWeekday || weekday, 
    fullString: `${formattedDate} (${fallbackWeekday || weekday})` 
  };
};

export const DailyHoroscopeView: React.FC<DailyHoroscopeViewProps> = memo(({
  activeProfile,
  profiles,
  todayPanchanga,
  transitPlanets,
  natalPlanets,
  lagna,
  dasha,
  onSelectProfile,
  onNewProfile
}) => {
  const [selectedRashiTab, setSelectedRashiTab] = useState<string>('profile');
  const [horoscopeData, setHoroscopeData] = useState<DailyHoroscopeData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedTextNotification, setCopiedTextNotification] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => isDailyHoroscopePushEnabled());
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() => getBrowserNotificationPermission());
  const [pushToastMessage, setPushToastMessage] = useState<string | null>(null);

  const handleTogglePushAlert = async () => {
    if (pushPermission !== 'granted') {
      const perm = await requestHoroscopeNotificationPermission();
      setPushPermission(perm);
      if (perm === 'granted') {
        setDailyHoroscopePushEnabled(true);
        setIsPushEnabled(true);
        setPushToastMessage('दैनिक राशिफल पुश नोटिफिकेसन सक्रिय गरियो!');
        sendHoroscopeWebNotification({
          profileName: activeProfile?.name || 'जातक',
          moonRashi: activeMoonRashi,
          todayBS: todayPanchanga.dateBS,
          luckyColor: horoscopeData?.luckyColor || 'पहेँलो',
          luckyNumber: horoscopeData?.luckyNumber || '७',
          overallRating: horoscopeData?.overallRating || 85,
        });
      } else {
        setDailyHoroscopePushEnabled(false);
        setIsPushEnabled(false);
        setPushToastMessage('ब्राउजरमा नोटिफिकेसन अनुमति दिइएन।');
      }
    } else {
      const next = !isPushEnabled;
      setDailyHoroscopePushEnabled(next);
      setIsPushEnabled(next);
      setPushToastMessage(next ? 'दैनिक राशिफल पुश नोटिफिकेसन सक्रिय गरियो!' : 'दैनिक पुश नोटिफिकेसन बन्द गरियो।');
    }
    setTimeout(() => setPushToastMessage(null), 3500);
  };

  // Active profile Moon Rashi determination
  const activeMoon = useMemo(() => {
    return natalPlanets.find((p) => p.name === 'चन्द्र') || { rashiName: 'मेष' };
  }, [natalPlanets]);

  const activeMoonRashi = activeMoon.rashiName || 'मेष';

  // Significant Planetary Ingress Events for the active native's chart
  const ingressEvents = useMemo(() => {
    return detectSignificantPlanetaryIngress(
      transitPlanets,
      natalPlanets,
      lagna,
      todayPanchanga,
      activeProfile?.name || 'जातक'
    );
  }, [transitPlanets, natalPlanets, lagna, todayPanchanga, activeProfile?.name]);

  // Gregorian date & day of week details for accessibility
  const gregorianDateInfo = useMemo(() => {
    return getGregorianDateDetails(todayPanchanga.dateAD, todayPanchanga.dayNameNepali);
  }, [todayPanchanga.dateAD, todayPanchanga.dayNameNepali]);

  // Cache key for today's horoscope
  const storageKey = useMemo(() => {
    const pId = activeProfile?.id || 'guest';
    const date = todayPanchanga.dateBS || 'today';
    return `daily_horoscope_${pId}_${date}`;
  }, [activeProfile?.id, todayPanchanga.dateBS]);

  // Initial load: check cache or compute fallback
  useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setHoroscopeData(JSON.parse(cached));
        return;
      }
    } catch (err) {
      console.warn('Storage read error:', err);
    }

    // Default fallback
    const fallback = generateClassicalDailyHoroscope(
      activeMoonRashi,
      todayPanchanga,
      activeProfile?.name || 'जातक',
      lagna?.rashiName || 'मेष',
      transitPlanets
    );
    setHoroscopeData(fallback);
  }, [storageKey, activeMoonRashi, todayPanchanga, activeProfile?.name, lagna?.rashiName, transitPlanets]);

  // AI Generator Trigger
  const handleGenerateAiHoroscope = async () => {
    if (!activeProfile) return;
    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/daily-horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: activeProfile.name,
            gender: activeProfile.gender,
            dateBS: activeProfile.dateBS,
            dateAD: activeProfile.dateAD,
            time: activeProfile.time,
            location: activeProfile.location,
            moonRashi: activeMoonRashi,
            lagnaRashi: lagna.rashiName
          },
          todayPanchanga,
          transitPlanets,
          natalPlanets,
          currentDasha: `${dasha.currentMahadasha?.planet || 'गुरु'} महादशा / ${dasha.currentAntardasha?.planet || 'शुक्र'} अन्तर्दशा`
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.horoscope) {
        const fullHoroscope: DailyHoroscopeData = {
          ...result.horoscope,
          generatedAtBS: todayPanchanga.dateBS,
          isAiGenerated: true
        };
        setHoroscopeData(fullHoroscope);
        try {
          localStorage.setItem(storageKey, JSON.stringify(fullHoroscope));
        } catch (storageErr) {
          console.warn('Could not cache horoscope:', storageErr);
        }
      } else {
        throw new Error('AI Response empty');
      }
    } catch (err: any) {
      console.error('Failed to generate AI horoscope:', err);
      setAiError('AI सर्भर व्यस्त रहेकोले शास्त्रीय गणितीय विश्लेषण सक्रिय गरिएको छ।');
      // Ensure we have fallback data
      const fallback = generateClassicalDailyHoroscope(
        activeMoonRashi,
        todayPanchanga,
        activeProfile.name,
        lagna?.rashiName || 'मेष',
        transitPlanets
      );
      setHoroscopeData(fallback);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyHoroscope = () => {
    if (!horoscopeData) return;
    const auspiciousText = horoscopeData.auspiciousInfluences?.length 
      ? `\n🟢 विशेष शुभ प्रभाव:\n${horoscopeData.auspiciousInfluences.map(i => `• ${i}`).join('\n')}` 
      : '';
    const inauspiciousText = horoscopeData.inauspiciousInfluences?.length 
      ? `\n🔴 विशेष सावधानी:\n${horoscopeData.inauspiciousInfluences.map(i => `• ${i}`).join('\n')}` 
      : '';
    const shareText = `🌟 आजको राशिफल तथा गोचर ग्रह मिलान 🌟\n📅 वि.सं. ${todayPanchanga.dateBS} (${todayPanchanga.dayNameNepali}) | ई.सं. ${gregorianDateInfo.formattedDate} (${gregorianDateInfo.weekday})\nजातक: ${activeProfile?.name || 'जातक'} (राशि: ${activeMoonRashi})\n\n${horoscopeData.overallSummary}\n${auspiciousText}\n${inauspiciousText}\n\n💼 कार्य तथा धन: ${horoscopeData.careerAndFinance}\n❤️ प्रेम तथा परिवार: ${horoscopeData.loveAndFamily}\n🌿 स्वास्थ्य: ${horoscopeData.healthAndWellness}\n\n🎨 शुभ रंग: ${horoscopeData.luckyColor} | 🔢 शुभ अंक: ${horoscopeData.luckyNumber} | 🧭 शुभ दिशा: ${horoscopeData.luckyDirection}\n🕉️ दैनिक मन्त्र: ${horoscopeData.dailyMantra}\n\n— बालानन्द वैदिक ज्योतिष सेवा`;
    navigator.clipboard.writeText(shareText);
    setCopiedTextNotification(true);
    setTimeout(() => setCopiedTextNotification(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* 1. TOP HERO HEADER */}
      <div className="bg-gradient-to-r from-red-950 via-amber-950 to-stone-900 text-amber-50 p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-600/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500/30 text-amber-200 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/40 uppercase tracking-wide flex items-center gap-1.5 shadow-xs">
                <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                <span>दैनिक वैदिक राशिफल</span>
              </span>
              
              {/* Nepali BS Date Badge */}
              <span className="bg-black/35 text-amber-300 text-xs font-serif font-semibold px-3 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>वि.सं. {todayPanchanga.dateBS} ({todayPanchanga.dayNameNepali})</span>
              </span>

              {/* Gregorian AD Date & Weekday Badge */}
              <span className="bg-stone-900/70 text-stone-200 text-xs font-sans font-medium px-3 py-1 rounded-xl border border-stone-600/50 flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>ई.सं. {gregorianDateInfo.formattedDate} ({gregorianDateInfo.weekday})</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-tight flex items-center gap-2.5">
              <span>दैनिक राशिफल तथा ग्रह गोचर प्रभाव</span>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
            </h1>

            <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl leading-relaxed font-serif">
              सक्रिय जातकको चन्द्र राशि, जन्म नक्षत्र र आजको प्रत्यक्ष ग्रह गोचरको आधारमा AI ज्योतिषीद्वारा तयार पारिएको व्यक्तिगत दैनिक फलादेश तथा उपायहरू।
            </p>
          </div>

          {/* AI GENERATE BUTTON & ACTIONS */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2.5 shrink-0">
            <button
              onClick={handleGenerateAiHoroscope}
              disabled={isAiLoading || !activeProfile}
              className="bg-gradient-to-r from-amber-600 to-red-700 hover:from-amber-500 hover:to-red-600 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/40 border border-amber-400/50 flex items-center justify-center gap-2.5 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                  <span>AI फलादेश तयार हुँदैछ...</span>
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5 text-amber-300" />
                  <span>AI व्यक्तिगत राशिफल सिर्जना</span>
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleTogglePushAlert}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs border ${
                  isPushEnabled && pushPermission === 'granted'
                    ? 'bg-amber-500/25 text-amber-200 border-amber-400/50 hover:bg-amber-500/35'
                    : 'bg-stone-900/60 text-stone-300 border-stone-700/60 hover:bg-stone-800 hover:text-white'
                }`}
                title={
                  isPushEnabled && pushPermission === 'granted'
                    ? 'दैनिक पुश अलर्ट सक्रिय छ (क्लिक गरेर बन्द गर्न सक्नुहुन्छ)'
                    : 'हरेक दिन बिहान नयाँ राशिफलको पुश सूचना पाउनुहोस्'
                }
              >
                {isPushEnabled && pushPermission === 'granted' ? (
                  <>
                    <BellRing className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                    <span>पुश अलर्ट सक्रिय</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>दैनिक पुश अलर्ट</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border border-amber-300/50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                title="दैनिक राशिफल तथा गोचर प्रतिवेदन PDF डाउनलोड"
              >
                <Download className="w-3.5 h-3.5 text-amber-200" />
                <span>PDF डाउनलोड</span>
              </button>

              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="flex-1 sm:flex-initial bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-400/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span>ईमेल सूचना</span>
              </button>

              <button
                onClick={handleCopyHoroscope}
                className="flex-1 sm:flex-initial bg-black/40 hover:bg-black/60 text-amber-200 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>सेयर</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST COPY NOTIFICATION */}
      {copiedTextNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-emerald-100 border border-emerald-500 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>आजको राशिफल प्रतिलिपि भयो! अब सजिलै सेयर गर्न सक्नुहुन्छ।</span>
        </div>
      )}

      {/* TOAST PUSH NOTIFICATION FEEDBACK */}
      {pushToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-900 text-amber-100 border border-amber-500 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{pushToastMessage}</span>
        </div>
      )}

      {/* AI ERROR BANNER IF ANY */}
      {aiError && (
        <div className="p-3.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>{aiError}</span>
          </div>
          <button onClick={() => setAiError(null)} className="text-stone-500 hover:text-stone-900 font-bold ml-2">✕</button>
        </div>
      )}

      {/* 2. ACTIVE JATAK / PROFILE SELECTION BAR */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-800 text-amber-200 flex items-center justify-center font-bold text-base shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-bold">सक्रिय जातक कुण्डली:</span>
              <strong className="text-sm sm:text-base font-serif text-red-900 dark:text-amber-400">
                {activeProfile?.name || 'जातक चयन गरिएको छैन'}
              </strong>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              चन्द्र राशि: <strong>{activeMoonRashi}</strong> | लग्न: <strong>{lagna.rashiName}</strong> | महादशा: <strong>{dasha.currentMahadasha?.planet || 'गुरु'}</strong>
            </p>
          </div>
        </div>

        {/* Profile Switcher Dropdown */}
        <div className="flex items-center gap-2">
          {profiles.length > 0 && (
            <select
              value={activeProfile?.id || ''}
              onChange={(e) => {
                const target = profiles.find((p) => p.id === e.target.value);
                if (target) onSelectProfile(target);
              }}
              className="bg-stone-50 dark:bg-stone-800 border border-amber-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold px-3 py-2 rounded-xl focus:ring-2 focus:ring-red-700 outline-none"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.gender === 'female' ? 'स्त्री' : 'पुरुष'})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onNewProfile}
            className="bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-red-900 dark:text-amber-300 border border-amber-300/80 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            + नयाँ जातक
          </button>
        </div>
      </div>

      {/* 2.5 EMAIL NOTIFICATION SUBSCRIPTION BANNER */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-red-950/40 border border-amber-300/80 dark:border-amber-700/50 rounded-2xl p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-xs shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-xs sm:text-sm font-serif text-amber-950 dark:text-amber-200 flex items-center gap-2">
              <span>दैनिक राशिफल तथा ग्रह गोचर ईमेल सूचना सदस्यता</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-sans font-bold">निःशुल्क सेवा</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 leading-normal">
              हरेक बिहान आफ्नो जन्म कुण्डली अनुसारको प्रत्यक्ष ग्रह गोचर चाल सारांश, शुभ अंक र विशेष उपायहरू आफ्नो ईमेलमा स्वतः प्राप्त गर्नुहोस्।
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEmailModalOpen(true)}
          className="shrink-0 bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-600 hover:to-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs border border-amber-400/40 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 text-amber-200" />
          <span>ईमेल सूचना सदस्यता लिनुहोस्</span>
        </button>
      </div>

      {/* 3. TODAY'S TRANSIT & CALENDAR HIGHLIGHTS SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        
        {/* Date & Day dual calendar badge */}
        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-3.5 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-600" />
            <span>मिति तथा वार (Date)</span>
          </span>
          <p className="font-bold text-amber-950 dark:text-amber-300 text-xs sm:text-sm font-serif">
            {todayPanchanga.dateBS}
          </p>
          <div className="text-[10px] text-stone-600 dark:text-stone-400 font-medium">
            <span>{gregorianDateInfo.formattedDate}</span>
            <span className="text-amber-700 dark:text-amber-400 ml-1 font-bold">({gregorianDateInfo.weekday})</span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-3.5 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">आजको तिथि व पक्ष</span>
          <p className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">{todayPanchanga.tithi.name}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{todayPanchanga.tithi.paksha} पक्ष ({todayPanchanga.dayNameNepali})</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-3.5 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">नक्षत्र तथा स्वामी</span>
          <p className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">{todayPanchanga.nakshatra.name}</p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">स्वामी: {todayPanchanga.nakshatra.lord}</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-3.5 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">राहुकाल (सावधानी)</span>
          <p className="font-bold text-red-700 dark:text-red-400 text-xs sm:text-sm">
            {typeof todayPanchanga.rahuKaal === 'object' ? `${todayPanchanga.rahuKaal.start} - ${todayPanchanga.rahuKaal.end}` : (todayPanchanga.rahuKaal || 'अपराह्न')}
          </p>
          <span className="text-[10px] text-stone-500">शुभ कार्य त्याज्य</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 p-3.5 rounded-2xl shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">आजको चन्द्र गोचर</span>
          <p className="font-bold text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
            {transitPlanets.find((p) => p.name === 'चन्द्र')?.rashiName || todayPanchanga.moonRashi || activeMoonRashi}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">ताराबल शुभ</span>
        </div>
      </div>

      {/* 3.5 SIGNIFICANT PLANETARY INGRESS ALERT & BROWSER NOTIFICATION BOX */}
      {ingressEvents.length > 0 && (
        <PlanetaryIngressAlertBox
          ingressEvents={ingressEvents}
          userName={activeProfile?.name || 'जातक'}
        />
      )}

      {/* 4. MAIN HOROSCOPE DASHBOARD CARDS */}
      {horoscopeData && (
        <div className="space-y-6">

          {/* OVERALL SCORE & SUMMARY HERO CARD */}
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-800 rounded-3xl p-6 shadow-md relative overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-800 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
                  <span className="text-lg leading-tight">{toDevanagariNumerals(horoscopeData.overallRating)}%</span>
                  <span className="text-[9px] uppercase tracking-wider font-sans">शुभता</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-300">
                      {horoscopeData.isAiGenerated ? '✨ AI वैदिक फलादेश' : '📐 शास्त्रीय गोचर गणना'}
                    </span>
                    <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                      वि.सं. {horoscopeData.generatedAtBS} ({todayPanchanga.dayNameNepali}) | ई.सं. {gregorianDateInfo.formattedDate} ({gregorianDateInfo.weekday})
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-red-950 dark:text-amber-300 mt-1">
                    आजको समग्र दिन स्थिति ({activeProfile?.name || 'जातक'})
                  </h2>
                </div>
              </div>

              {/* Progress bar and Quick PDF Action */}
              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-48 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400">
                    <span>दैनिक अनुकूलता दर</span>
                    <span>{horoscopeData.overallRating}%</span>
                  </div>
                  <div className="h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full transition-all duration-700" 
                      style={{ width: `${horoscopeData.overallRating}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-stone-600 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer self-stretch sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>PDF प्रतिवेदन डाउनलोड</span>
                </button>
              </div>
            </div>

            <p className="text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed font-serif bg-amber-50/60 dark:bg-stone-800/50 p-4 rounded-2xl border border-amber-200/60 dark:border-stone-700">
              {horoscopeData.overallSummary}
            </p>

            {/* Transit Highlight Badges */}
            {horoscopeData.transitHighlights && horoscopeData.transitHighlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-stone-500">गोचर विश्लेषण:</span>
                {horoscopeData.transitHighlights.map((th, idx) => (
                  <span key={idx} className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300/70 px-3 py-1 rounded-xl font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{th}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 🌟 NEW: COMPARATIVE PLANETARY MATCHING (गोचर र जन्मकुण्डली ग्रह मिलान फलादेश) */}
          <div className="bg-gradient-to-br from-stone-50 via-white to-amber-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-850 border-2 border-amber-400/80 dark:border-stone-700 rounded-3xl p-6 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 dark:border-stone-800 pb-3">
              <div className="space-y-1">
                <h3 className="font-bold text-base sm:text-lg font-serif text-red-950 dark:text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D97706]" />
                  <span>गोचर र जन्मकुण्डली ग्रह मिलान (Natal vs Transit Comparative Analysis)</span>
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  आजका प्रत्यक्ष गोचर ग्रहहरू र जातकको जन्म कुण्डलीका ग्रहहरूको पारस्परिक दृष्टि तथा प्रभाव मिलान
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-bold rounded-xl border border-amber-300 dark:border-amber-700">
                  {horoscopeData.isAiGenerated ? '🤖 AI ग्रह विश्लेषण' : '📐 शास्त्रीय दृष्टि मिलान'}
                </span>
              </div>
            </div>

            {/* Summary Synthesis Box if available */}
            {horoscopeData.transitMatchingSummary && (
              <div className="p-3.5 bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 rounded-2xl text-xs sm:text-sm text-stone-800 dark:text-stone-200 flex items-start gap-2.5">
                <Globe2 className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-amber-950 dark:text-amber-300 font-serif">ग्रह मिलान सारांश:</strong> {horoscopeData.transitMatchingSummary}
                </p>
              </div>
            )}

            {/* 2 COLUMNS: AUSPICIOUS (शुभ प्रभाव) & CAUTIONARY (अशुभ / सावधानी प्रभाव) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Left Box: विशेष शुभ प्रभाव पर्ने राशि तथा भावहरू */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                      ✓
                    </span>
                    <h4 className="font-bold text-sm sm:text-base font-serif text-emerald-950 dark:text-emerald-200">
                      विशेष शुभ प्रभाव पर्ने राशि तथा भावहरू
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300">
                    शुभ कारक
                  </span>
                </div>

                <div className="space-y-2.5">
                  {horoscopeData.auspiciousInfluences && horoscopeData.auspiciousInfluences.length > 0 ? (
                    horoscopeData.auspiciousInfluences.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-white dark:bg-stone-900/90 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-stone-500 italic p-3 text-center">
                      चन्द्रमा तथा शुभ ग्रहहरूको गोचर अनुकूल प्रभावमा छ।
                    </div>
                  )}
                </div>
              </div>

              {/* Right Box: विशेष सावधानी तथा अशुभ प्रभाव पर्ने क्षेत्रहरू */}
              <div className="bg-rose-50/60 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-800/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                      !
                    </span>
                    <h4 className="font-bold text-sm sm:text-base font-serif text-rose-950 dark:text-rose-200">
                      विशेष सावधानी तथा प्रतिकूल प्रभाव पर्ने क्षेत्रहरू
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full border border-rose-300">
                    सावधानी
                  </span>
                </div>

                <div className="space-y-2.5">
                  {horoscopeData.inauspiciousInfluences && horoscopeData.inauspiciousInfluences.length > 0 ? (
                    horoscopeData.inauspiciousInfluences.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-white dark:bg-stone-900/90 rounded-xl border border-rose-200/80 dark:border-rose-900/60 shadow-2xs">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-stone-500 italic p-3 text-center">
                      आज कुनै गम्भीर अशुभ योग छैन, सामान्य सावधानी अपनाउनुहोला।
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* 4 LIFE SECTOR CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Career & Finance */}
            <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-400 border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base font-serif text-stone-900 dark:text-stone-100">
                  कार्यक्षेत्र, व्यापार तथा धन (Career & Wealth)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {horoscopeData.careerAndFinance}
              </p>
            </div>

            {/* Health & Wellness */}
            <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base font-serif text-stone-900 dark:text-stone-100">
                  स्वास्थ्य तथा मानसिक ऊर्जा (Health & Vitality)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {horoscopeData.healthAndWellness}
              </p>
            </div>

            {/* Love & Family */}
            <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base font-serif text-stone-900 dark:text-stone-100">
                  दाम्पत्य, प्रेम तथा पारिवारिक सुख (Love & Family)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {horoscopeData.loveAndFamily}
              </p>
            </div>

            {/* Education & Creativity */}
            <div className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-400 border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base font-serif text-stone-900 dark:text-stone-100">
                  विद्या, अनुसन्धान तथा सिर्जनशीलता (Education & Focus)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {horoscopeData.educationAndCreativity}
              </p>
            </div>

          </div>

          {/* 5. INTERACTIVE LUCKY FACTORS, COLOR & TIME WIDGET */}
          <DailyLuckyFactorsWidget
            luckyColor={horoscopeData.luckyColor}
            luckyTime={horoscopeData.luckyTime}
            luckyNumber={horoscopeData.luckyNumber}
            luckyDirection={horoscopeData.luckyDirection}
            avoidFactors={horoscopeData.avoidFactors}
            todayPanchanga={todayPanchanga}
            transitPlanets={transitPlanets}
            activeProfileName={activeProfile?.name || 'जातक'}
            activeMoonRashi={activeMoonRashi}
          />

          {/* 6. DAILY MANTRA & VEDIC REMEDY CARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Mantra Card */}
            <div className="bg-gradient-to-br from-amber-900 to-red-950 text-amber-50 rounded-2xl p-5 shadow-md border border-amber-500/40 space-y-2.5">
              <span className="text-xs bg-amber-500/30 text-amber-200 px-3 py-0.5 rounded-full font-bold border border-amber-400/40 inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-300" />
                <span>आजको दैनिक वैदिक मन्त्र</span>
              </span>
              <p className="font-serif font-black text-lg sm:text-xl text-amber-100 pt-1">
                {horoscopeData.dailyMantra}
              </p>
              <p className="text-[11px] text-amber-200/80">
                बिहान पूजा गर्दा कम्तीमा ११ वा १०८ पटक जप गर्दा दिनभर सकारात्मक ऊर्जा र कार्य सफलता प्राप्त हुन्छ।
              </p>
            </div>

            {/* Remedy Card */}
            <div className="bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-800 rounded-2xl p-5 shadow-md space-y-2.5">
              <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-3 py-0.5 rounded-full font-bold border border-emerald-300 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>दिन शुभ बनाउने अचुक उपाय</span>
              </span>
              <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium leading-relaxed pt-1">
                {horoscopeData.dailyRemedy}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                वैदिक नियम अनुसार सानो सेवा र दानले पनि ठूला ग्रह अरिष्ट निवारण गर्दछ।
              </p>
            </div>

          </div>

        </div>
      )}

      {/* 7. 12 RASHIS QUICK HOROSCOPE DIRECTORY */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-red-800 dark:text-amber-400" />
            <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
              १२ राशि सामान्य गोचर स्थिति (12 Zodiac Signs Overview)
            </h3>
          </div>
          <span className="text-xs text-stone-500">आजको दिन</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {RASHI_DATA.map((r) => {
            const isCurrentMoon = r.name === activeMoonRashi;
            return (
              <div
                key={r.id}
                className={`p-3 rounded-2xl border text-xs space-y-1.5 transition ${
                  isCurrentMoon
                    ? 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 ring-2 ring-amber-400/40'
                    : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-900 dark:text-stone-100 font-serif">{r.id}. {r.name}</span>
                  <span className="text-base">{r.symbol}</span>
                </div>
                <p className="text-[10px] text-stone-500">स्वामी: {r.lord}</p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-amber-800 dark:text-amber-400">
                  <span>{isCurrentMoon ? '⭐ तपाईंको राशि' : `${r.element} तत्त्व`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. EMAIL SUBSCRIPTION MODAL */}
      <HoroscopeEmailSubscriptionModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        activeProfile={activeProfile}
        todayPanchanga={todayPanchanga}
        horoscopeData={horoscopeData}
        transitPlanets={transitPlanets}
      />

      {/* 9. DAILY HOROSCOPE PDF EXPORT MODAL */}
      <DailyHoroscopePdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        activeProfile={activeProfile}
        lagna={lagna}
        natalPlanets={natalPlanets}
        transitPlanets={transitPlanets}
        todayPanchanga={todayPanchanga}
        dasha={dasha}
        horoscopeData={horoscopeData}
        gregorianDateInfo={gregorianDateInfo}
      />

    </div>
  );
});
