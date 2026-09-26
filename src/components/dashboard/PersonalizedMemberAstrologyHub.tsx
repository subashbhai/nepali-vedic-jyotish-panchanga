import React, { useState, useMemo } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Clock,
  Compass,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Flame,
  Zap,
  Star,
  Award,
  Heart,
  TrendingUp,
  UserCheck,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  BirthDetails,
  PanchangaData,
  PlanetPosition,
  LagnaInfo
} from '../../types/astrology';
import { getCachedAstroCalculation } from '../../utils/astroCache';
import { calculateChandrabala, calculateTarabala } from '../../utils/muhurtaEngine';
import { calculateShivaVaas, calculateAgniVaas } from '../../utils/saitEngine';
import { calculateGocharAndSadeSati } from '../../utils/gocharEngine';
import { RASHI_DATA, NAKSHATRA_DATA } from '../../utils/astroCalculations';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface PersonalizedMemberAstrologyHubProps {
  profile: BirthDetails;
  todayPanchanga: PanchangaData;
  todayAD?: string;
  todayBS?: string;
  transitPlanets?: PlanetPosition[];
}

export const PersonalizedMemberAstrologyHub: React.FC<PersonalizedMemberAstrologyHubProps> = ({
  profile,
  todayPanchanga,
  todayAD = new Date().toISOString().split('T')[0],
  todayBS = '',
  transitPlanets = []
}) => {
  const [horoscopePeriod, setHoroscopePeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  // Compute the native's astrological chart from their registered birth data
  const astroData = useMemo(() => {
    try {
      const lat = profile.location?.latitude || 27.7172;
      const lng = profile.location?.longitude || 85.3240;
      const tz = profile.location?.timeZone || 5.75;
      return getCachedAstroCalculation(profile.dateAD, profile.time, lat, lng, tz);
    } catch (e) {
      console.error('Failed to compute member natal chart:', e);
      return null;
    }
  }, [profile]);

  // Natal Moon and Lagna
  const birthMoon = astroData?.moon;
  const birthLagna = astroData?.lagna;
  const birthDasha = astroData?.dasha;

  // Resolve Transit Moon
  const transitMoon = transitPlanets.find(p => p.name === 'चन्द्र') || birthMoon;
  const transitMoonRashiId = transitMoon?.rashiId || 1;

  // Transit Nakshatra ID (from Panchanga or current moon)
  const transitNakshatraId = todayPanchanga.nakshatra?.number || 1;

  // 1. Personalized Chandrabala for this native today
  const chandrabala = useMemo(() => {
    if (!birthMoon) return null;
    return calculateChandrabala(birthMoon.rashiId, transitMoonRashiId);
  }, [birthMoon, transitMoonRashiId]);

  // 2. Personalized Tarabala for this native today
  const tarabala = useMemo(() => {
    if (!birthMoon) return null;
    const birthNakshatraId = birthMoon.nakshatraId || 1;
    return calculateTarabala(birthNakshatraId, transitNakshatraId);
  }, [birthMoon, transitNakshatraId]);

  // 3. Shiva Vaas & Agni Vaas
  const shivaVaas = useMemo(() => {
    const tithiNum = todayPanchanga.tithi?.number || 1;
    const paksha = todayPanchanga.tithi?.paksha === 'कृष्ण' ? 'कृष्ण' : 'शुक्ल';
    return calculateShivaVaas(tithiNum, paksha);
  }, [todayPanchanga]);

  const agniVaas = useMemo(() => {
    const tithiNum = todayPanchanga.tithi?.number || 1;
    const dayOfWeek = new Date(todayAD).getDay();
    const paksha = todayPanchanga.tithi?.paksha === 'कृष्ण' ? 'कृष्ण' : 'शुक्ल';
    return calculateAgniVaas(tithiNum, dayOfWeek, paksha);
  }, [todayPanchanga, todayAD]);

  // 4. Sade Sati / Ashtama Shani status
  const sadeSati = useMemo(() => {
    if (!birthMoon) return null;
    return calculateGocharAndSadeSati(birthMoon, transitPlanets, todayAD);
  }, [birthMoon, transitPlanets, todayAD]);

  // 5. Current Mahadasha & Antardasha
  const currentDashaInfo = useMemo(() => {
    if (!birthDasha) return null;
    const mdPlanet = birthDasha.currentMahadasha?.planet || 'बृहस्पति';
    const adPlanet = birthDasha.currentAntardasha?.planet || 'शनि';
    return {
      mahadashaLord: mdPlanet,
      antardashaLord: adPlanet,
    };
  }, [birthDasha]);

  // Personalized Horoscopes
  const personalizedPredictions = useMemo(() => {
    const moonRashi = birthMoon?.rashiName || 'मेष';
    const moonRashiId = birthMoon?.rashiId || 1;
    const dayScore = chandrabala?.isFavorable ? (tarabala?.isFavorable ? 92 : 82) : 65;

    const luckyColors = ['पहेंलो', 'रातो', 'सेतो', 'सुन्तला', 'गुलाबी', 'हरियो', 'नीलो'];
    const luckyColor = luckyColors[(moonRashiId + 2) % luckyColors.length];
    const luckyNumbers = ['१', '३', '५', '७', '९'];
    const luckyNumber = luckyNumbers[(moonRashiId * 2) % luckyNumbers.length];
    const luckyDirections = ['पूर्व', 'उत्तर', 'ईशान', 'उत्तर-पश्चिम'];
    const luckyDirection = luckyDirections[moonRashiId % luckyDirections.length];

    return {
      daily: {
        score: dayScore,
        verdict: dayScore >= 80 ? 'शुभ एवं कार्यसिद्धिदायक' : 'सामान्य एवं सतर्कतापूर्वक कार्य गर्ने दिन',
        summary: `जातक ${profile.name} का लागि आज चन्द्रबल (${chandrabala?.houseFromMoon || 1} औं भाव) र ताराबल (${tarabala?.taraNameNepali || 'शुभ'}) को प्रभावले गर्दा मान-प्रतिष्ठा, पारिवारिक सुख र रोकिएका कार्यहरूमा गति मिल्नेछ।`,
        career: `व्यापार तथा पेसागत क्षेत्रमा सकारात्मक ऊर्जा रहनेछ। नयाँ सम्पर्कहरू फलदायी साबित हुनेछन्। महत्वपूर्ण सम्झौताका लागि आजको समय अनुकूल छ।`,
        finance: `आर्थिक पक्ष मजबुत बन्नेछ। विगतको लगानीबाट प्रतिफल मिल्ने सम्भावना छ, तर अनावश्यक खर्च नियन्त्रण गर्नुहोस्।`,
        health: `शारीरिक तथा मानसिक स्फूर्ति राम्रो रहनेछ। बिहान सूर्य नमस्कार वा प्राणायाम गर्दा अझै ऊर्जा प्राप्त हुनेछ।`,
        love: `पारिवारिक तथा दाम्पत्य सम्बन्धमा सद्भाव र आत्मीयता बढ्नेछ। प्रियजनको सहयोगले मन प्रसन्न रहनेछ।`,
        luckyColor,
        luckyNumber,
        luckyDirection,
        luckyTime: 'बिहान ०८:०० देखि १०:३० सम्म',
        mantra: `ॐ सोमाय नमः (वा ॐ नमो भगवते वासुदेवाय)`,
        remedy: `आज बिहान घरबाट निस्कँदा मीठो वा दही ग्रहण गर्नुहोस् र पूर्व वा उत्तर दिशा फर्केर यात्रा सुरु गर्नुहोस्।`
      },
      monthly: {
        title: `${todayPanchanga.masaInfo?.masaName || 'चालु महिना'}को व्यक्तिगत फलादेश`,
        highlight: `यो महिना तपाईंको जन्म राशि (${moonRashi}) मा गोचर ग्रहहरूको समन्वयले दीर्घकालीन योजना सुरु गर्न प्रेरणा दिनेछ।`,
        pros: `व्यावसायिक क्षेत्रमा नयाँ अवसर, सन्तान पक्षबाट शुभ समाचार, धार्मिक वा आध्यात्मिक कार्यमा रुचि वृद्धि।`,
        cons: `महिनाको मध्य भागमा अष्टम चन्द्रमा र राहुको गोचरले सामान्य आर्थिक चुनौती वा यात्रामा ढिलाइ हुनसक्छ।`,
        bestDays: `यस महिनाका २, ५, ९, ११ औं तिथिहरू विशेष लाभदायी रहनेछन्।`
      },
      yearly: {
        title: `वि.सं. ${todayBS.split(' ')[0] || '२०८१/०८२'} को समग्र वार्षिक फलादेश`,
        highlight: `यस वर्ष बृहस्पति (गुरु) र शनिदेवको गोचरले तपाईंको जीवनमा नयाँ अध्यायको सुरुवात गर्ने संकेत गरेको छ।`,
        careerAnnual: `पदोन्नति, वैदेशिक अवसर वा नयाँ व्यवसाय विस्तारका लागि वर्षको उत्तरार्ध विशेष बलियो रहनेछ।`,
        financialAnnual: `स्थिर सम्पत्ति (जग्गा, घर वा सवारी) जोड्ने प्रबल योग बन्नेछ। शेयर बजार वा जोखिमपूर्ण लगानीमा संयम अपनाउनुहोला।`,
        healthAnnual: `ऋतु परिवर्तनको समयमा चिसो तथा खानपानमा विशेष ध्यान दिनुहोला।`,
        spiritualRemedy: `वर्षभरि प्रत्येक बिहीबार भगवान विष्णु वा लक्ष्मीनारायणको पूजा एवं शनिश्चरी अमावस्यामा दीपदान गर्नुहोस्।`
      }
    };
  }, [profile.name, birthMoon, chandrabala, tarabala, todayPanchanga, todayBS]);

  const abhijitDisplay: string = typeof todayPanchanga.abhijitMuhurta === 'object' && todayPanchanga.abhijitMuhurta !== null
    ? `${todayPanchanga.abhijitMuhurta.start} - ${todayPanchanga.abhijitMuhurta.end}`
    : (typeof todayPanchanga.abhijitMuhurta === 'string' ? todayPanchanga.abhijitMuhurta : '११:३६ - १२:२४');

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-stone-50 to-orange-500/10 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border-2 border-amber-400/60 dark:border-amber-700/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 text-stone-800 dark:text-stone-100 animate-fade-in">
      
      {/* ------------------------------------------------------------ */}
      {/* HEADER: Member Identity & Calculated Birth Chart Highlights   */}
      {/* ------------------------------------------------------------ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-amber-200/80 dark:border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7A1C1C] to-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {profile.name}
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                आधिकारिक सदस्य
              </span>
              <span className="text-xs text-stone-500 font-mono">
                {profile.customerId || 'सदस्य'}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>📅 <strong>जन्म:</strong> {profile.dateBS || profile.dateAD}</span>
              <span>⏰ <strong>समय:</strong> {profile.time}</span>
              <span>📍 <strong>स्थान:</strong> {profile.location?.name || 'नेपाल'}</span>
            </p>
          </div>
        </div>

        {/* Calculated Kundali Pill Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 bg-amber-500/20 dark:bg-amber-950/50 border border-amber-400/60 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>लग्न: <strong>{birthLagna?.rashiName || 'मेष'}</strong></span>
          </div>
          <div className="px-3 py-1.5 bg-red-500/15 dark:bg-red-950/50 border border-red-400/50 rounded-xl text-xs font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>जन्म राशि: <strong>{birthMoon?.rashiName || 'मेष'}</strong></span>
          </div>
          <div className="px-3 py-1.5 bg-indigo-500/15 dark:bg-indigo-950/50 border border-indigo-400/50 rounded-xl text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>नक्षत्र: <strong>{birthMoon?.nakshatraName || 'अश्विनी'}</strong></span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 3 COLUMN GRID: Personalized Sait, Timings/Dasha & Horoscope  */}
      {/* ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* COLUMN 1: जन्मको आधारमा व्यक्तिगत साइत (Personalized Sait) */}
        <div className="bg-white/90 dark:bg-stone-900/90 border border-amber-300/70 dark:border-stone-800 rounded-2xl p-4.5 space-y-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>जन्मको आधारमा आजको साइत</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                chandrabala?.isFavorable && tarabala?.isFavorable
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-400/40'
                  : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400/40'
              }`}>
                {chandrabala?.isFavorable ? 'शुभ साइत' : 'मध्यम'}
              </span>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              {/* Chandrabala */}
              <div className="p-2.5 bg-amber-50/70 dark:bg-stone-800/60 rounded-xl border border-amber-200/60 dark:border-stone-700/60">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-amber-600" />
                    चन्द्रबल (Chandrabala):
                  </span>
                  <span className={chandrabala?.isFavorable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                    {chandrabala?.isFavorable ? 'शुभ / अनुकूल' : 'अनिष्ट'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                  {chandrabala?.statusNepali}
                </p>
              </div>

              {/* Tarabala */}
              <div className="p-2.5 bg-indigo-50/70 dark:bg-stone-800/60 rounded-xl border border-indigo-200/60 dark:border-stone-700/60">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-indigo-600" />
                    ताराबल (Tarabala):
                  </span>
                  <span className={tarabala?.isFavorable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                    {tarabala?.taraNameNepali} तारा ({tarabala?.isFavorable ? 'शुभ' : 'अशुभ'})
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                  {tarabala?.statusNepali}
                </p>
              </div>

              {/* Shiva Vaas & Agni Vaas */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 block font-semibold">रुद्री पूजा (शिव वास):</span>
                  <span className={`text-[11px] font-bold block mt-0.5 ${shivaVaas?.isFavorable ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-600 dark:text-stone-400'}`}>
                    {shivaVaas?.location || 'कैलाशे'} ({shivaVaas?.isFavorable ? 'उत्तम' : 'मध्यम'})
                  </span>
                </div>

                <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 block font-semibold">हवन (अग्नि वास):</span>
                  <span className={`text-[11px] font-bold block mt-0.5 ${agniVaas?.isFavorable ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-600 dark:text-stone-400'}`}>
                    {agniVaas?.residence || 'पृथ्वी'} ({agniVaas?.isFavorable ? 'शुभ' : 'अशुभ'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-emerald-500/10 border border-emerald-400/30 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-300">
            <strong>💡 साइत फैसला:</strong> {chandrabala?.isFavorable ? 'आज तपाईंको जन्म राशिका लागि नयाँ कार्य, किनमेल र यात्रा शुभ छ।' : 'आज ठूला आर्थिक सम्झौता गर्दा सतर्कता अपनाउनुहोला।'}
          </div>
        </div>

        {/* COLUMN 2: शुभ-अशुभ समय, वर्तमान दशा र साढेसाती */}
        <div className="bg-white/90 dark:bg-stone-900/90 border border-amber-300/70 dark:border-stone-800 rounded-2xl p-4.5 space-y-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
                <Clock className="w-4 h-4 text-[#7A1C1C]" />
                <span>शुभ-अशुभ समय र दशा अवस्था</span>
              </div>
              <span className="text-[10px] font-bold text-stone-500">आजको</span>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              {/* Auspicious & Inauspicious Times */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    अभिजित मुहूर्त:
                  </span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-200">
                    {abhijitDisplay}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900">
                  <span className="font-semibold text-rose-900 dark:text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    राहुकाल (बच्नुपर्ने):
                  </span>
                  <span className="font-bold text-rose-800 dark:text-rose-200">
                    {typeof todayPanchanga.rahuKaal === 'object'
                      ? `${todayPanchanga.rahuKaal.start} - ${todayPanchanga.rahuKaal.end}`
                      : (todayPanchanga.rahuKaal || 'अपराह्न')}
                  </span>
                </div>
              </div>

              {/* Vimshottari Mahadasha & Antardasha */}
              <div className="p-2.5 bg-amber-500/10 dark:bg-stone-800/60 rounded-xl border border-amber-300/60 dark:border-stone-700/60">
                <span className="text-[10px] text-amber-800 dark:text-amber-400 block font-bold mb-1">
                  वर्तमान विंशोत्तरी दशा:
                </span>
                <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100">
                  <span>महादशा: <strong className="text-amber-700 dark:text-amber-300">{currentDashaInfo?.mahadashaLord || 'बृहस्पति'}</strong></span>
                  <span>अन्तर्दशा: <strong className="text-amber-700 dark:text-amber-300">{currentDashaInfo?.antardashaLord || 'शनि'}</strong></span>
                </div>
              </div>

              {/* Sade Sati Status */}
              <div className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-stone-700 dark:text-stone-300">साढेसाती / अढैया अवस्था:</span>
                  <span className={sadeSati?.sadeSati?.status && sadeSati.sadeSati.status !== 'कुनै प्रभाव छैन' ? 'text-amber-600' : 'text-emerald-600'}>
                    {sadeSati?.sadeSati?.phaseName || sadeSati?.sadeSati?.status || 'साढेसाती छैन (मुक्त)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>सूर्योदय: {todayPanchanga.sunrise || '०५:५४'}</span>
            <span>सूर्यास्त: {todayPanchanga.sunset || '१८:२५'}</span>
          </div>
        </div>

        {/* COLUMN 3: Costamize Daily, Monthly, Yearly Rashifal */}
        <div className="bg-white/90 dark:bg-stone-900/90 border border-amber-300/70 dark:border-stone-800 rounded-2xl p-4.5 space-y-3.5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Period Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-bold mb-3">
              <button
                type="button"
                onClick={() => setHoroscopePeriod('daily')}
                className={`py-1.5 rounded-lg transition-all ${
                  horoscopePeriod === 'daily'
                    ? 'bg-[#7A1C1C] text-white shadow'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                दैनिक
              </button>
              <button
                type="button"
                onClick={() => setHoroscopePeriod('monthly')}
                className={`py-1.5 rounded-lg transition-all ${
                  horoscopePeriod === 'monthly'
                    ? 'bg-[#7A1C1C] text-white shadow'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                मासिक
              </button>
              <button
                type="button"
                onClick={() => setHoroscopePeriod('yearly')}
                className={`py-1.5 rounded-lg transition-all ${
                  horoscopePeriod === 'yearly'
                    ? 'bg-[#7A1C1C] text-white shadow'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                वार्षिक
              </button>
            </div>

            {/* Daily View */}
            {horoscopePeriod === 'daily' && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    आजको व्यक्तिगत फलादेश:
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-900 dark:text-amber-300 rounded-full border border-amber-400/40">
                    {personalizedPredictions.daily.score}% अनुकूल
                  </span>
                </div>

                <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                  {personalizedPredictions.daily.summary}
                </p>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                  <div className="p-1.5 bg-stone-50 dark:bg-stone-800 rounded-lg text-center">
                    <span className="text-[9px] text-stone-400 block">शुभ रङ</span>
                    <strong className="text-amber-700 dark:text-amber-400">{personalizedPredictions.daily.luckyColor}</strong>
                  </div>
                  <div className="p-1.5 bg-stone-50 dark:bg-stone-800 rounded-lg text-center">
                    <span className="text-[9px] text-stone-400 block">शुभ अंक</span>
                    <strong className="text-amber-700 dark:text-amber-400">{personalizedPredictions.daily.luckyNumber}</strong>
                  </div>
                  <div className="p-1.5 bg-stone-50 dark:bg-stone-800 rounded-lg text-center">
                    <span className="text-[9px] text-stone-400 block">शुभ दिशा</span>
                    <strong className="text-amber-700 dark:text-amber-400">{personalizedPredictions.daily.luckyDirection}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly View */}
            {horoscopePeriod === 'monthly' && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-amber-800 dark:text-amber-300">
                  {personalizedPredictions.monthly.title}
                </h4>
                <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                  {personalizedPredictions.monthly.highlight}
                </p>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 dark:text-emerald-300">
                  <strong>सकारात्मक पक्ष:</strong> {personalizedPredictions.monthly.pros}
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 text-[11px] text-amber-900 dark:text-amber-300">
                  <strong>शुभ मितिहरू:</strong> {personalizedPredictions.monthly.bestDays}
                </div>
              </div>
            )}

            {/* Yearly View */}
            {horoscopePeriod === 'yearly' && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-amber-800 dark:text-amber-300">
                  {personalizedPredictions.yearly.title}
                </h4>
                <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                  {personalizedPredictions.yearly.highlight}
                </p>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 text-[11px] text-indigo-900 dark:text-indigo-300">
                  <strong>व्यावसायिक प्रगति:</strong> {personalizedPredictions.yearly.careerAnnual}
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 text-[11px] text-amber-900 dark:text-amber-300">
                  <strong>वार्षिक उपाय:</strong> {personalizedPredictions.yearly.spiritualRemedy}
                </div>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-amber-500/10 border border-amber-400/30 rounded-xl text-[10px] text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>यो फलादेश तपाईंको आफ्नै जन्म समय र ग्रहस्थितिको आधारमा तयार गरिएको हो।</span>
          </div>
        </div>

      </div>

    </div>
  );
};
