import { PlanetPosition, LagnaInfo, PanchangaData, PlanetName, RashiName } from '../types/astrology';
import { RASHI_DATA } from './astroCalculations';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface PlanetaryIngressEvent {
  id: string;
  planetName: PlanetName;
  planetEnglishName: string;
  glyph: string;
  fromRashi?: RashiName;
  transitRashi: RashiName;
  transitRashiId: number;
  degree: number;
  formattedDegree: string;
  isRetrograde: boolean;
  
  // Ingress characteristics
  ingressType: 'major_slow' | 'sankranti_solar' | 'sandhi_critical' | 'lunar_daily' | 'retrograde_shift';
  ingressTitleNepali: string;
  timingDescriptionNepali: string;
  
  // Impact on Active Native's Natal Chart
  houseFromMoon: number;
  houseFromLagna: number;
  nature: 'अत्यन्त शुभ' | 'शुभ' | 'मध्यम' | 'सावधानी';
  impactCategory: 'career' | 'finance' | 'health' | 'family' | 'spiritual';
  personalizedImpactNepali: string;
  remedyNepali: string;
  mantraNepali: string;
  
  // Color styling helpers
  themeColor: string;
  badgeBg: string;
}

const PLANET_GLYPHS: Record<string, string> = {
  'सूर्य': '☉',
  'चन्द्र': '☽',
  'मंगल': '♂',
  'बुध': '☿',
  'गुरु': '♃',
  'शुक्र': '♀',
  'शनि': '♄',
  'राहु': '☊',
  'केतु': '☋'
};

/**
 * Detects significant planetary ingress, sandhi states, or major transit shifts
 * for today relative to the native's natal Moon and Lagna.
 */
export function detectSignificantPlanetaryIngress(
  transitPlanets: PlanetPosition[],
  natalPlanets: PlanetPosition[],
  lagna: LagnaInfo,
  todayPanchanga: PanchangaData,
  userName: string = 'जातक'
): PlanetaryIngressEvent[] {
  const events: PlanetaryIngressEvent[] = [];

  const natalMoon = natalPlanets.find((p) => p.name === 'चन्द्र') || { rashiId: 1, rashiName: 'मेष' as RashiName };
  const moonRashiId = natalMoon.rashiId || 1;
  const lagnaRashiId = lagna?.rashiId || 1;

  transitPlanets.forEach((tp) => {
    const deg = tp.degree || 0;
    const houseFromMoon = ((tp.rashiId - moonRashiId + 12) % 12) + 1;
    const houseFromLagna = ((tp.rashiId - lagnaRashiId + 12) % 12) + 1;
    const degInt = Math.floor(deg);
    const minInt = Math.floor((deg % 1) * 60);
    const formattedDegree = `${toDevanagariNumerals(degInt)}° ${toDevanagariNumerals(minInt)}'`;
    const glyph = PLANET_GLYPHS[tp.name] || '★';

    // 1. SATURN (शनि) Ingress / Transition
    if (tp.name === 'शनि') {
      let nature: PlanetaryIngressEvent['nature'] = 'मध्यम';
      let title = `शनिदेवको ${tp.rashiName} राशि गोचर प्रवाह`;
      let desc = '';
      let remedy = 'शनिबार पिपलको बोटमा जल अर्पण तथा तोरीको तेलको दीप प्रज्वलन गर्नुहोस्।';
      let mantra = 'ॐ शं शनैश्चराय नमः (१०८ पटक)';
      let impactCat: PlanetaryIngressEvent['impactCategory'] = 'career';

      if ([12, 1, 2].includes(houseFromMoon)) {
        nature = 'सावधानी';
        title = `शनिदेवको साढेसाती प्रभाव (${tp.rashiName} राशि - भाव ${toDevanagariNumerals(houseFromMoon)})`;
        desc = `${userName} को जन्म चन्द्र राशि (${natalMoon.rashiName}) बाट शनिदेव ${houseFromMoon} औँ भावमा रहेकाले साढेसातीको विशेष प्रभाव छ। कार्यमा धैर्य, अनुशासन र नियमित परिश्रमले सफलता मिल्नेछ।`;
        remedy = 'दैनिक हनुमान चालीसा पाठ र शनिवार गरिबलाई कालो तिल/मासको दाल दान।';
        impactCat = 'health';
      } else if (houseFromMoon === 4 || houseFromMoon === 8) {
        nature = 'सावधानी';
        title = `शनिदेवको ढैय्या प्रभाव (${houseFromMoon === 4 ? 'कण्टक शनि' : 'अष्टम शनि'})`;
        desc = `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा शनिको गोचरले यात्रा तथा पारिवारिक निर्णयहरूमा संयम र सतर्कता माग गर्दछ।`;
        remedy = 'महामृत्युञ्जय मन्त्र जप तथा शनिवार भैरव/शनि दर्शन।';
        impactCat = 'family';
      } else if ([3, 6, 11].includes(houseFromMoon)) {
        nature = 'अत्यन्त शुभ';
        title = `शनिदेवको परम शुभ गोचर (${toDevanagariNumerals(houseFromMoon)} औँ भाव विजय स्थान)`;
        desc = `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा शनिदेवले शत्रु पराजय, उच्च पद प्रतिष्ठा, कार्य सिद्धि र आर्थिक स्थायित्व प्रदान गर्नुहुनेछ।`;
        mantra = 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः';
        remedy = 'कर्मनिष्ठ भई असहाय व्यक्तिहरूलाई सहयोग गर्नुहोस्।';
        impactCat = 'career';
      } else {
        nature = 'मध्यम';
        desc = `शनिदेव ${tp.rashiName} राशिमा स्थिर रहँदै कर्म क्षेत्रमा अनुशासन र निरन्तर साधनाको फल दिनुहुनेछ।`;
      }

      events.push({
        id: `ingress_shani_${tp.rashiId}`,
        planetName: tp.name,
        planetEnglishName: tp.englishName || 'Saturn',
        glyph,
        transitRashi: tp.rashiName,
        transitRashiId: tp.rashiId,
        degree: deg,
        formattedDegree,
        isRetrograde: !!tp.isRetrograde,
        ingressType: 'major_slow',
        ingressTitleNepali: title,
        timingDescriptionNepali: `दीर्घकालीन मुख्य गोचर (२.५ वर्ष अवधि) ${tp.isRetrograde ? '• वक्री (Retrograde)' : '• मार्गी'}`,
        houseFromMoon,
        houseFromLagna,
        nature,
        impactCategory: impactCat,
        personalizedImpactNepali: desc,
        remedyNepali: remedy,
        mantraNepali: mantra,
        themeColor: nature === 'अत्यन्त शुभ' ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-700 dark:text-amber-400',
        badgeBg: nature === 'अत्यन्त शुभ' ? 'bg-indigo-100 dark:bg-indigo-950/80 border-indigo-300' : 'bg-amber-100 dark:bg-amber-950/80 border-amber-300'
      });
    }

    // 2. JUPITER (गुरु) Ingress / Transition
    else if (tp.name === 'गुरु') {
      let nature: PlanetaryIngressEvent['nature'] = 'मध्यम';
      let title = `देवगुरु बृहस्पतिको ${tp.rashiName} राशि गोचर (गुरुबल)`;
      let desc = '';
      let remedy = 'बिहीबार गाईलाई चनाको दाल र गुड खुवाउनुहोस् वा विष्णु सहस्रनाम पाठ गर्नुहोस्।';
      let mantra = 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः (१०८ पटक)';
      let impactCat: PlanetaryIngressEvent['impactCategory'] = 'spiritual';

      if ([2, 5, 7, 9, 11].includes(houseFromMoon)) {
        nature = 'अत्यन्त शुभ';
        title = `देवगुरुको शुभ गोचर प्रभाव (भाव ${toDevanagariNumerals(houseFromMoon)} - गुरुबल सक्रिय)`;
        desc = `${userName} को चन्द्र राशिबाट गुरु ${houseFromMoon} औँ शुभ भावमा गोचर गर्दा बौद्धिक विकास, विवाह/सन्तान सुख, भाग्य वृद्धि र ठूला आर्थिक योजनाहरू सफल हुनेछन्।`;
        impactCat = 'finance';
      } else if ([1, 4, 8, 12].includes(houseFromMoon)) {
        nature = 'मध्यम';
        desc = `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा गुरु गोचर रहँदा धार्मिक तथा आध्यात्मिक उन्नति हुनेछ तर लगानी र खर्चमा सन्तुलन राख्नु आवश्यक छ।`;
      } else {
        nature = 'शुभ';
        desc = `गुरुदेवको अमृतमय दृष्टिले कुण्डलीका महत्वपूर्ण भावहरूलाई सुरक्षा प्रदान गरेको छ।`;
      }

      events.push({
        id: `ingress_guru_${tp.rashiId}`,
        planetName: tp.name,
        planetEnglishName: tp.englishName || 'Jupiter',
        glyph,
        transitRashi: tp.rashiName,
        transitRashiId: tp.rashiId,
        degree: deg,
        formattedDegree,
        isRetrograde: !!tp.isRetrograde,
        ingressType: 'major_slow',
        ingressTitleNepali: title,
        timingDescriptionNepali: `१ वर्षको बृहत् गोचर चक्र ${tp.isRetrograde ? '• वक्री (Retrograde)' : '• मार्गी'}`,
        houseFromMoon,
        houseFromLagna,
        nature,
        impactCategory: impactCat,
        personalizedImpactNepali: desc,
        remedyNepali: remedy,
        mantraNepali: mantra,
        themeColor: 'text-yellow-600 dark:text-yellow-400',
        badgeBg: 'bg-yellow-100 dark:bg-yellow-950/80 border-yellow-300'
      });
    }

    // 3. RAHU & KETU (राहु / केतु)
    else if (tp.name === 'राहु' || tp.name === 'केतु') {
      const isAuspicious = [3, 6, 11].includes(houseFromMoon);
      events.push({
        id: `ingress_${tp.name}_${tp.rashiId}`,
        planetName: tp.name,
        planetEnglishName: tp.englishName || tp.name,
        glyph,
        transitRashi: tp.rashiName,
        transitRashiId: tp.rashiId,
        degree: deg,
        formattedDegree,
        isRetrograde: true,
        ingressType: 'major_slow',
        ingressTitleNepali: `${tp.name}को ${tp.rashiName} राशि भ्रमण (भाव ${toDevanagariNumerals(houseFromMoon)})`,
        timingDescriptionNepali: `१८ महिने गोचर चक्र (सधैं वक्री)`,
        houseFromMoon,
        houseFromLagna,
        nature: isAuspicious ? 'शुभ' : 'सावधानी',
        impactCategory: isAuspicious ? 'career' : 'health',
        personalizedImpactNepali: isAuspicious 
          ? `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा ${tp.name} गोचरले आकस्मिक लाभ, साहस र वैदेशिक क्षेत्रमा सफलता दिलाउनेछ।`
          : `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा रहेकाले मानसिक भ्रम, अत्यधिक सोच र जोखिमपूर्ण निर्णयबाट बच्नुहोला।`,
        remedyNepali: tp.name === 'राहु' ? 'भगवान् शिवको पूजा, चराचुरुङ्गीलाई चारो अर्पण।' : 'गणेश अथर्वशीर्ष पाठ तथा कुकुरलाई भोजन।',
        mantraNepali: tp.name === 'राहु' ? 'ॐ रां राहवे नमः' : 'ॐ कें केतवे नमः',
        themeColor: 'text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-100 dark:bg-purple-950/80 border-purple-300'
      });
    }

    // 4. SUN (सूर्य) - Sankranti / Monthly Solar Ingress
    else if (tp.name === 'सूर्य') {
      const isSunAuspicious = [3, 6, 10, 11].includes(houseFromMoon);
      const isSankrantiTime = degInt === 0 || degInt >= 29;

      events.push({
        id: `ingress_surya_${tp.rashiId}`,
        planetName: tp.name,
        planetEnglishName: 'Sun',
        glyph,
        transitRashi: tp.rashiName,
        transitRashiId: tp.rashiId,
        degree: deg,
        formattedDegree,
        isRetrograde: false,
        ingressType: isSankrantiTime ? 'sankranti_solar' : 'sandhi_critical',
        ingressTitleNepali: isSankrantiTime ? `सूर्यदेवको ${tp.rashiName} सङ्क्रान्ति प्रवेश` : `सूर्यदेवको ${tp.rashiName} राशि गोचर (मासिक सौर प्रभाव)`,
        timingDescriptionNepali: isSankrantiTime ? `✨ भर्खरै नयाँ राशि प्रवेश (सङ्क्रान्ति काल)` : `३० दिने सौर महिना गोचर`,
        houseFromMoon,
        houseFromLagna,
        nature: isSunAuspicious ? 'अत्यन्त शुभ' : 'मध्यम',
        impactCategory: 'career',
        personalizedImpactNepali: isSunAuspicious
          ? `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा सूर्यदेवले आत्मबल, सरकारी/प्रशासनिक सम्मान र नेतृत्व क्षमतामा वृद्धि गराउनुहुनेछ।`
          : `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा सूर्यको स्थितिले आँखा/टाउकोको सामान्य स्याहार र पितासँग सुमधुर सम्बन्ध कायम राख्न संकेत गर्दछ।`,
        remedyNepali: 'बिहान तामाको लोटाबाट सूर्यदेवलाई जल अर्घ्य चढाउनुहोस् र आदित्य हृदय स्तोत्र पाठ गर्नुहोस्।',
        mantraNepali: 'ॐ घृणिः सूर्याय नमः (१०८ पटक)',
        themeColor: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300'
      });
    }

    // 5. MARS (मंगल) Ingress
    else if (tp.name === 'मंगल') {
      const isMarsAuspicious = [3, 6, 11].includes(houseFromMoon);
      const isManglikHouse = [1, 4, 7, 8, 12].includes(houseFromMoon);

      events.push({
        id: `ingress_mangal_${tp.rashiId}`,
        planetName: tp.name,
        planetEnglishName: 'Mars',
        glyph,
        transitRashi: tp.rashiName,
        transitRashiId: tp.rashiId,
        degree: deg,
        formattedDegree,
        isRetrograde: !!tp.isRetrograde,
        ingressType: 'major_slow',
        ingressTitleNepali: `भौम (मङ्गल) देवको ${tp.rashiName} राशि गोचर`,
        timingDescriptionNepali: `४५ दिने ऊर्जा चक्र ${tp.isRetrograde ? '• वक्री' : ''}`,
        houseFromMoon,
        houseFromLagna,
        nature: isMarsAuspicious ? 'अत्यन्त शुभ' : (isManglikHouse ? 'सावधानी' : 'मध्यम'),
        impactCategory: 'career',
        personalizedImpactNepali: isMarsAuspicious
          ? `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा मङ्गलले पराक्रम, जग्गा/जमिनको कारोबार र प्रतिस्पर्धीमाथि विजय गराउनेछ।`
          : `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा मङ्गलको स्थितिले रिस/क्रोध नियन्त्रण र सवारी साधन चलाउँदा संयमता अपनाउनुपर्ने देखाउँछ।`,
        remedyNepali: 'मंगलबार हनुमान जीलाई सिन्दूर/मिठाई अर्पण र सुन्दरकाण्ड पाठ।',
        mantraNepali: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
        themeColor: 'text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/80 border-rose-300'
      });
    }

    // 6. MOON (चन्द्र) Daily Ingress / Chandrachar
    else if (tp.name === 'चन्द्र') {
      const isMoonAuspicious = [1, 3, 6, 7, 10, 11].includes(houseFromMoon);
      const isChandrashtama = houseFromMoon === 8;
      const is4thMoon = houseFromMoon === 4;

      events.push({
        id: `ingress_chandra_${tp.rashiId}`,
        planetName: tp.name,
        planetEnglishName: 'Moon',
        glyph,
        transitRashi: tp.rashiName,
        transitRashiId: tp.rashiId,
        degree: deg,
        formattedDegree,
        isRetrograde: false,
        ingressType: 'lunar_daily',
        ingressTitleNepali: isChandrashtama ? `चन्द्राष्टम गोचर (अष्टम चन्द्रमा - विशेष सावधानी)` : `आजको चन्द्र राशि गोचर (${tp.rashiName} राशि - भाव ${toDevanagariNumerals(houseFromMoon)})`,
        timingDescriptionNepali: `२.२५ दिनको दैनिक चन्द्र गोचर प्रवाह`,
        houseFromMoon,
        houseFromLagna,
        nature: isChandrashtama ? 'सावधानी' : (is4thMoon ? 'सावधानी' : (isMoonAuspicious ? 'अत्यन्त शुभ' : 'मध्यम')),
        impactCategory: isChandrashtama ? 'health' : 'family',
        personalizedImpactNepali: isChandrashtama
          ? `आज चन्द्रमा तपाईंको जन्म राशिबाट ८औँ भावमा गोचर गर्दै हुनुहुन्छ। मानसिक अस्थिरता र यात्रामा सावधानी आवश्यक छ। नयाँ जोखिम नलिनुहोस्।`
          : (isMoonAuspicious
            ? `चन्द्रमा ${houseFromMoon} औँ भावमा शुभ फलदायी भएकाले मन प्रसन्न, कार्यमा उत्साह र पारिवारिक सहयोग प्राप्त हुनेछ।`
            : `चन्द्रमाको सामान्य गोचर छ, दिनभर नियमित काममा निरन्तरता दिनुहोस्।`),
        remedyNepali: 'शिवजीलाई दूध/जल अर्पण र सेतो वस्तु (दही/दूध) सेवन।',
        mantraNepali: 'ॐ सों सोमाय नमः (१०८ पटक)',
        themeColor: isChandrashtama ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400',
        badgeBg: isChandrashtama ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-300' : 'bg-sky-100 dark:bg-sky-950/80 border-sky-300'
      });
    }

    // 7. VENUS (शुक्र) & MERCURY (बुध) Ingress
    else if (tp.name === 'शुक्र' || tp.name === 'बुध') {
      const isAuspicious = tp.name === 'शुक्र' 
        ? [1, 2, 3, 4, 5, 8, 9, 11, 12].includes(houseFromMoon)
        : [2, 4, 6, 8, 10, 11].includes(houseFromMoon);

      events.push({
        id: `ingress_${tp.name}_${tp.rashiId}`,
        planetName: tp.name,
        planetEnglishName: tp.englishName || tp.name,
        glyph,
        transitRashi: tp.rashiName,
        transitRashiId: tp.rashiId,
        degree: deg,
        formattedDegree,
        isRetrograde: !!tp.isRetrograde,
        ingressType: 'major_slow',
        ingressTitleNepali: `${tp.name}देवको ${tp.rashiName} राशि गोचर (भाव ${toDevanagariNumerals(houseFromMoon)})`,
        timingDescriptionNepali: `मासिक गोचर चक्र ${tp.isRetrograde ? '• वक्री (Retrograde)' : ''}`,
        houseFromMoon,
        houseFromLagna,
        nature: isAuspicious ? 'शुभ' : 'मध्यम',
        impactCategory: tp.name === 'शुक्र' ? 'family' : 'career',
        personalizedImpactNepali: isAuspicious
          ? `चन्द्र राशिबाट ${houseFromMoon} औँ भावमा ${tp.name}ले ${tp.name === 'शुक्र' ? 'सौन्दर्य, भौतिक सुख, प्रेम तथा आर्थिक समृद्धि' : 'व्यापार, सञ्चार, वाणी तथा बौद्धिक कार्यमा सफलता'} दिलाउनेछन्।`
          : `${tp.name}को सामान्य गोचर प्रभाव छ, दैनिक कार्यमा सन्तुलन कायम राख्नुहोस्।`,
        remedyNepali: tp.name === 'शुक्र' ? 'लक्ष्मी माताको आराधना र सेतो कपडा/गुलियो प्रसाद अर्पण।' : 'बुधबार तुलसीमा जल अर्पण र हरियो वस्तु दान।',
        mantraNepali: tp.name === 'शुक्र' ? 'ॐ शुं शुक्राय नमः' : 'ॐ बुं बुधाय नमः',
        themeColor: tp.name === 'शुक्र' ? 'text-pink-600 dark:text-pink-400' : 'text-emerald-600 dark:text-emerald-400',
        badgeBg: tp.name === 'शुक्र' ? 'bg-pink-100 dark:bg-pink-950/80 border-pink-300' : 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300'
      });
    }
  });

  // Sort by astrological priority: Saturn, Jupiter, Sun/Sankranti, Moon/Chandrashtama, Mars, Rahu, Ketu
  const priorityOrder: Record<string, number> = {
    'शनि': 1,
    'गुरु': 2,
    'सूर्य': 3,
    'चन्द्र': 4,
    'मंगल': 5,
    'राहु': 6,
    'केतु': 7,
    'शुक्र': 8,
    'बुध': 9
  };

  events.sort((a, b) => (priorityOrder[a.planetName] || 10) - (priorityOrder[b.planetName] || 10));

  return events;
}

/**
 * Triggers native Web Browser Notification if permitted
 */
export async function requestAndSendBrowserNotification(
  event: PlanetaryIngressEvent,
  userName: string = 'जातक'
): Promise<{ success: boolean; status: 'granted' | 'denied' | 'default' | 'unsupported'; message: string }> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      success: false,
      status: 'unsupported',
      message: 'यो ब्राउजरमा वेब नोटिफिकेसन सुविधा उपलब्ध छैन।'
    };
  }

  let currentPermission: NotificationPermission | 'unsupported' = 'unsupported';
  try {
    currentPermission = Notification.permission;
  } catch {
    return {
      success: false,
      status: 'unsupported',
      message: 'यो ब्राउजरमा वेब नोटिफिकेसन सुविधा उपलब्ध छैन।'
    };
  }

  if (currentPermission === 'default') {
    try {
      currentPermission = await Notification.requestPermission();
    } catch (err) {
      console.warn('Notification permission request error:', err);
    }
  }

  if (currentPermission === 'granted') {
    try {
      const title = `🪐 ग्रह गोचर प्रवेश सूचना: ${event.planetName} ➔ ${event.transitRashi}`;
      const options: NotificationOptions = {
        body: `जातक: ${userName} (${event.nature})\n${event.personalizedImpactNepali}\nउपाय: ${event.remedyNepali}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `ingress_${event.planetName}_${event.transitRashi}`,
      };

      new Notification(title, options);

      return {
        success: true,
        status: 'granted',
        message: `${event.planetName} को गोचर सूचना ब्राउजरमा सफलतापूर्वक पठाइयो!`
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'granted',
        message: `सूचना पठाउन सकिएन: ${err.message || 'Error'}`
      };
    }
  } else if (currentPermission === 'denied') {
    return {
      success: false,
      status: 'denied',
      message: 'ब्राउजर सेटिङमा नोटिफिकेसन अनुमति अस्वीकृत गरिएको छ। कृपया ब्राउजर सेटिङबाट अनुमति खुला गर्नुहोस्।'
    };
  } else {
    return {
      success: false,
      status: 'default',
      message: 'ब्राउजर सूचनाको लागि अनुमति प्रदान गरिएको छैन।'
    };
  }
}
