import {
  BirthDetails,
  PlanetPosition,
  LagnaInfo,
  PlanetName,
  RashiName
} from '../types/astrology';
import {
  TransitAlertItem,
  TransitAlertCategory,
  TransitAlertSeverity,
  TransitNotificationPreferences,
  TransitNotificationHistoryEntry
} from '../types/transitNotificationTypes';
import { toDevanagariNumerals } from './nepaliCalendar';

const STORAGE_KEYS = {
  PREFS: 'balananda_transit_notification_prefs_v1',
  HISTORY: 'balananda_transit_notification_history_v1',
  LAST_SENT_PREFIX: 'balananda_transit_sent_',
  VIEWED_SIGNATURES: 'balananda_transit_viewed_alert_signatures_v2',
  LAST_VIEWED_TIME: 'balananda_transit_last_viewed_time_v2',
};

export const DEFAULT_TRANSIT_PREFS: TransitNotificationPreferences = {
  enabled: true,
  alertGuru: true,
  alertShani: true,
  alertShaniSadeSati: true,
  alertRahuKetu: true,
  alertSurya: true,
  alertMangal: true,
  alertBudha: true,
  alertShukra: true,
  alertChandraAshtama: true,
  alertVakri: true,
  soundEnabled: true,
};

/**
 * Audio Synthesizer: Plays a brief sacred harmonic bell (e.g. 528Hz Solfeggio or 432Hz Om tone)
 */
export function playTransitChime(frequency: number = 528): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  } catch {
    // Non-fatal if audio context is blocked
  }
}

/**
 * Calculates personalized major planetary transit alerts based on the active profile's birth chart
 */
export function calculateProfileTransitAlerts(params: {
  activeProfile: BirthDetails | null;
  birthMoon: PlanetPosition;
  birthLagna?: LagnaInfo;
  transitPlanets: PlanetPosition[];
  todayAD: string;
  todayBS: string;
}): TransitAlertItem[] {
  const { activeProfile, birthMoon, birthLagna, transitPlanets, todayAD, todayBS } = params;
  const profileName = activeProfile?.name?.trim() || 'जातक';
  const moonRashiId = birthMoon.rashiId;
  const lagnaRashiId = birthLagna?.rashiId ?? birthMoon.rashiId;

  const alerts: TransitAlertItem[] = [];

  // 1. SHANI (SATURN) TRANSIT & SADE SATI / DHAIYYA
  const saturnTransit = transitPlanets.find((p) => p.name === 'शनि');
  if (saturnTransit) {
    const houseFromMoon = ((saturnTransit.rashiId - moonRashiId + 12) % 12) + 1;
    const houseFromLagna = ((saturnTransit.rashiId - lagnaRashiId + 12) % 12) + 1;

    if (houseFromMoon === 12) {
      alerts.push({
        id: `shani_sadesati_1_${todayAD}`,
        category: 'shani',
        planet: 'शनि',
        transitRashi: saturnTransit.rashiName,
        houseFromMoon,
        houseFromLagna,
        isRetrograde: saturnTransit.isRetrograde,
        severity: 'maha_parivartan',
        title: '⚠️ शनि साढेसाती प्रथम चरण अलर्ट (व्यय भाव)',
        subtitle: `शनिदेव जन्म चन्द्र राशिबाट १२औँ भाव (${saturnTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट शनिदेव व्यय भावमा प्रवेश गर्नुभएकाले साढेसातीको पहिलो चरण सुरु भएको छ।`,
        keyAreas: ['खर्च नियन्त्रण', 'वैदेशिक योजना', 'स्वास्थ्य सचेतना', 'मानसिक शान्ति'],
        detailedForecast: `जन्म चन्द्र राशिबाट १२औँ भावमा शनिदेवको गोचर रहँदा अनावश्यक दौडधुप, अनिद्रा र आकस्मिक खर्च बढ्न सक्छ। वैदेशिक कार्य र आध्यात्मिक साधनाका लागि अनुकूलता रहनेछ भने आर्थिक लगानी गर्दा निकै सतर्क रहनुहोला।`,
        remedies: [
          'प्रत्येक शनिबार पीपलको रुखमुनि तोरीको तेलको दीप प्रज्वलन गर्नुहोस्।',
          'दैनिक हनुमान चालीसा वा बजरंग बाणको पाठ गर्नुहोस्।',
          'शनि मन्त्र: "ॐ शं शनैश्चराय नमः" (१०८ पटक)।',
          'कालो तिल, कालो मासको दाल र कालो कपडा गरिब वा असहायलाई दान गर्नुहोस्।'
        ],
        dosAndDonts: {
          do: ['नियमित ध्यान र योग', 'ऋण चुक्ता गर्ने योजना', 'साँझमा हनुमान आराधना'],
          dont: ['अपरिचित व्यक्तिलाई ठूलो ऋण दिने', 'रातको समयमा नचाहिँदो यात्रा', 'अहंकार प्रदर्शन']
        },
        validityNoteNepali: 'यो साढेसातीको प्रथम चरण लगभग २.५ वर्ष रहनेछ।',
        timestamp: todayAD,
        audioFrequency: 432
      });
    } else if (houseFromMoon === 1) {
      alerts.push({
        id: `shani_sadesati_2_${todayAD}`,
        category: 'shani',
        planet: 'शनि',
        transitRashi: saturnTransit.rashiName,
        houseFromMoon,
        houseFromLagna,
        isRetrograde: saturnTransit.isRetrograde,
        severity: 'maha_parivartan',
        title: '⚡ शनि साढेसाती मुख्य शिखर चरण अलर्ट (हृदय/जन्म राशि)',
        subtitle: `शनिदेव जन्म चन्द्र राशिको माथिबाटै (${saturnTransit.rashiName}) भ्रमण गर्दै`,
        personalizedSummary: `${profileName}को चन्द्र राशिमाथि नै शनिदेवको प्रत्यक्ष गोचर भएकाले साढेसातीको मुख्य शिखर (द्वितीय) चरण चलिरहेको छ।`,
        keyAreas: ['मानसिक धैर्यता', 'कठोर परिश्रम', 'शारीरिक तन्दुरुस्ती', 'जीवन शैली'],
        detailedForecast: `साढेसातीको शिखर चरणमा मानसिक दबाब र दायित्व बढ्ने गर्छ। तर इमान्दार र परिश्रमी जातकलाई शनिदेवले स्थायित्व र परिपक्वता प्रदान गर्नुहुन्छ। स्वास्थ्य र महत्वपूर्ण निर्णयमा हतार नगर्नुहोला।`,
        remedies: [
          'दैनिक महामृत्युञ्जय मन्त्रको जप (कम्तिमा ११ वा १०८ पटक)।',
          'शनिबार छायाँपात्र दान (कचौरामा तोरीको तेल हाली आफ्नो अनुहार हेरेर दान गर्ने)।',
          'शनिदेवलाई निलो अपराजिता वा कालो तिल अर्पण गर्नुहोस्।',
          'वृद्ध, अशक्त र मजदुरहरूलाई आदर र सहयोग गर्नुहोस्।'
        ],
        dosAndDonts: {
          do: ['धैर्य र संयमता कायम राख्ने', 'नियमित स्वास्थ्य परीक्षण', 'सत्य र न्यायको पक्ष लिने'],
          dont: ['छिटो धनी बन्ने जुवा वा जोखिमपूर्ण सट्टेबाजी', 'आवेशमा सम्बन्ध बिगार्ने', 'मादक पदार्थ सेवन']
        },
        validityNoteNepali: 'यो साढेसातीको मुख्य २.५ वर्षे शिखर चरण हो।',
        timestamp: todayAD,
        audioFrequency: 432
      });
    } else if (houseFromMoon === 2) {
      alerts.push({
        id: `shani_sadesati_3_${todayAD}`,
        category: 'shani',
        planet: 'शनि',
        transitRashi: saturnTransit.rashiName,
        houseFromMoon,
        houseFromLagna,
        isRetrograde: saturnTransit.isRetrograde,
        severity: 'alert',
        title: '🔔 शनि साढेसाती अन्तिम चरण अलर्ट (धन तथा कुटुम्ब भाव)',
        subtitle: `शनिदेव चन्द्र राशिबाट २औँ भाव (${saturnTransit.rashiName}) मा गोचररत`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट शनिदेव २औँ भावमा रहनुभएकाले साढेसातीको अन्तिम (पाउमा) चरण चलिरहेको छ।`,
        keyAreas: ['वाणी नियन्त्रण', 'पारिवारिक सम्बन्ध', 'सञ्चित धन', 'खानपान'],
        detailedForecast: `साढेसातीको यो अन्तिम चरणमा बिस्तारै कठिनाइहरू हल हुँदै जान्छन्। यद्यपि बोली र आर्थिक लेनदेनमा संयमता नअपनाए पारिवारिक असमझदारी निम्तिन सक्छ।`,
        remedies: [
          'दैनिक बिहान सूर्य नमस्कार र शनि गायत्री मन्त्र पाठ।',
          'कौवा वा कालो कुकुरलाई रोटी/भोजन खुवाउनुहोस्।',
          'मिठो र नम्र वाणी बोल्ने सङ्कल्प गर्नुहोस्।'
        ],
        dosAndDonts: {
          do: ['बचत योजना बनाउने', 'परिवारसँग समय बिताउने', 'सात्विक खानपान'],
          dont: ['कटु वा अपमानजनक शब्द बोल्ने', 'अनावश्यक पैतृक विवाद']
        },
        validityNoteNepali: 'साढेसातीको अन्तिम चरण सम्पन्न भएपछि पूर्ण राहत मिल्नेछ।',
        timestamp: todayAD,
        audioFrequency: 432
      });
    } else if (houseFromMoon === 4) {
      alerts.push({
        id: `shani_kantaka_4_${todayAD}`,
        category: 'shani',
        planet: 'शनि',
        transitRashi: saturnTransit.rashiName,
        houseFromMoon,
        houseFromLagna,
        isRetrograde: saturnTransit.isRetrograde,
        severity: 'alert',
        title: '🛡️ कण्टक शनि ढैय्या अलर्ट (चौथो सुख भाव)',
        subtitle: `शनिदेव चन्द्र राशिबाट चौथो सुख भावमा २.५ वर्षको ढैय्या प्रभावमा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट शनिदेव चौथो भावमा रहेकाले कण्टक शनिको ढैय्या प्रभाव सुरु भएको छ।`,
        keyAreas: ['पारिवारिक सुख', 'माताको स्वास्थ्य', 'सवारी साधन सावधानी', 'जग्गा जमिन'],
        detailedForecast: `चौथो भावमा शनिको गोचरले घरपरिवारमा केही तनाव, स्थान परिवर्तन वा आमाको स्वास्थ्यमा चिन्ता गराउन सक्छ। सवारी साधन चलाउँदा गति नियन्त्रणमा राख्नुहोला।`,
        remedies: [
          'शनिबार शिवजीलाई कालो तिल मिसाएको जल अर्पण गर्नुहोस्।',
          'हनुमान अष्टकको नियमित पाठ।',
          'घरको ईशान वा पश्चिम कोण सफा र पवित्र राख्नुहोस्।'
        ],
        dosAndDonts: {
          do: ['सवारी चलाउँदा संयमता', 'आमाको सेवा र सम्मान', 'घरमा शान्त वातावरण'],
          dont: ['हतासमा घरजग्गा बैना गर्ने', 'पारिवारिक झगडा बढाउने']
        },
        validityNoteNepali: 'कण्टक ढैय्या प्रभाव कुल २.५ वर्षसम्म रहनेछ।',
        timestamp: todayAD,
        audioFrequency: 432
      });
    } else if (houseFromMoon === 8) {
      alerts.push({
        id: `shani_ashtama_8_${todayAD}`,
        category: 'shani',
        planet: 'शनि',
        transitRashi: saturnTransit.rashiName,
        houseFromMoon,
        houseFromLagna,
        isRetrograde: saturnTransit.isRetrograde,
        severity: 'maha_parivartan',
        title: '⚠️ अष्टम शनि ढैय्या विशेष सचेतना (आयु/संकट भाव)',
        subtitle: `शनिदेव चन्द्र राशिबाट आठौँ भावमा २.५ वर्षे अष्टम ढैय्यामा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट शनिदेव आठौँ भावमा रहेकाले अष्टम शनिको ढैय्या चलिरहेको छ।`,
        keyAreas: ['स्वास्थ्य सुरक्षा', 'दुर्घटनाबाट बचाउ', 'गुप्त शत्रु', 'आकस्मिक परिवर्तन'],
        detailedForecast: `अष्टम शनिको समयमा स्वास्थ्य, लामो यात्रा र नयाँ साझेदारीमा विशेष सावधानी आवश्यक छ। गुप्त अनुसन्धान, साधना र पैतृक सम्पत्तिका लागि भने यो गोचर अनुकूल हुन सक्छ।`,
        remedies: [
          'नियमित महामृत्युञ्जय मन्त्र वा रुद्राभिषेक पूजा।',
          'शनिबार कालो कपडा, कालो मास र फलामको सामान दान गर्नुहोस्।',
          'शनि स्तोत्र: "नमस्ते कोणसंस्थाय पिंगलाय नमोऽस्तुते..." पाठ।'
        ],
        dosAndDonts: {
          do: ['स्वास्थ्यमा सामान्य समस्या देखिनासाथ परामर्श', 'सुरक्षित यात्रा', 'भगवान शिवको शरण'],
          dont: ['अति जोखिमपूर्ण यात्रा वा खेल', 'अपरिचितसँग आर्थिक साझेदारी']
        },
        validityNoteNepali: 'अष्टम ढैय्या अवधिमा विशेष सावधानी र धार्मिक अनुष्ठान हितकर हुन्छ।',
        timestamp: todayAD,
        audioFrequency: 432
      });
    } else if ([3, 6, 11].includes(houseFromMoon)) {
      alerts.push({
        id: `shani_shubha_${houseFromMoon}_${todayAD}`,
        category: 'shani',
        planet: 'शनि',
        transitRashi: saturnTransit.rashiName,
        houseFromMoon,
        houseFromLagna,
        isRetrograde: saturnTransit.isRetrograde,
        severity: 'shubha',
        title: '🌟 शनिदेवको अति शुभ तथा बलशाली गोचर!',
        subtitle: `शनिदेव चन्द्र राशिबाट ${houseFromMoon} औँ भावमा पराक्रम तथा लाभको स्थितिमा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट शनिदेव ${houseFromMoon} औँ भावमा हुनुभएकाले शत्रु पराजय र कार्यक्षेत्रमा उच्च सफलता मिल्नेछ।`,
        keyAreas: ['शत्रु विजय', 'अधिकार प्राप्ति', 'आर्थिक उन्नति', 'कठोर प्रयासमा जित'],
        detailedForecast: `३, ६ र ११ औँ भावमा शनिको गोचर सर्वाधिक फलदायी मानिन्छ। रोकिएका मुद्दा मामिला सुल्झिनेछन्, प्रतिस्पर्धीहरू कमजोर हुनेछन् र तपाईँको प्रतिष्ठा समाजमा बढ्नेछ।`,
        remedies: [
          'शनिदेवको कृपाका लागि शनिबार साँझ तोरीको तेलको दीप बाल्नुहोस्।',
          'आफ्नो सफलतामा अरूलाई पनि सहयोग गर्नुहोस्।'
        ],
        dosAndDonts: {
          do: ['नयाँ महत्वाकांक्षी योजना अघि बढाउने', 'प्रतिस्पर्धामा आत्मविश्वास राख्ने'],
          dont: ['कमजोर वर्गलाई हेप्ने']
        },
        validityNoteNepali: 'यो अनुकूल गोचरले तपाईँलाई ठूलो सफलता दिलाउन मद्दत गर्दछ।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    }
  }

  // 2. GURU (JUPITER) TRANSIT
  const guruTransit = transitPlanets.find((p) => p.name === 'गुरु');
  if (guruTransit) {
    const houseFromMoon = ((guruTransit.rashiId - moonRashiId + 12) % 12) + 1;
    const houseFromLagna = ((guruTransit.rashiId - lagnaRashiId + 12) % 12) + 1;

    if ([2, 5, 7, 9, 11].includes(houseFromMoon)) {
      const houseDescriptions: Record<number, string> = {
        2: '२औँ धन तथा वाणी भावमा - आर्थिक वृद्धि र पारिवारिक मांगलिक कार्य',
        5: '५औँ बुद्धि तथा सन्तान भावमा - परीक्षा, उच्च शिक्षा, सन्तान सुख र नयाँ सिर्जना',
        7: '७औँ दाम्पत्य तथा साझेदारी भावमा - विवाह योग, व्यापारिक सफलता र साझेदारी',
        9: '९औँ परम भाग्य भावमा - ईश्वरीय कृपा, तीर्थाटन, भाग्य वृद्धि र गुरु कृपा',
        11: '११औँ लाभ तथा अभिलाषा भावमा - मनोकांक्षा पूर्ति, आर्थिक लाभ र वरिष्ठ जनबाट सहयोग'
      };

      alerts.push({
        id: `guru_shubha_${houseFromMoon}_${todayAD}`,
        category: 'guru',
        planet: 'गुरु',
        transitRashi: guruTransit.rashiName,
        houseFromMoon,
        houseFromLagna,
        isRetrograde: guruTransit.isRetrograde,
        severity: houseFromMoon === 5 || houseFromMoon === 9 ? 'maha_parivartan' : 'shubha',
        title: `✨ वृहस्पति (गुरु) शुभ गोचर अलर्ट (${houseFromMoon}औँ भाव)`,
        subtitle: `देवगुरु वृहस्पति चन्द्र राशिबाट ${houseFromMoon}औँ भाव (${guruTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट देवगुरु वृहस्पति ${houseFromMoon}औँ भावमा गोचर गर्दै हुनुहुन्छ। ${houseDescriptions[houseFromMoon] || ''}।`,
        keyAreas: ['ज्ञान तथा विद्या', 'भाग्य वृद्धि', 'आर्थिक उन्नति', 'मांगलिक कार्य'],
        detailedForecast: `गुरुको यो शुभ गोचरले जीवनमा नयाँ आयाम थप्नेछ। सकारात्मक सोच, धार्मिक अभिरुचि र दीर्घकालीन योजनाहरू सफल हुनेछन्। महत्वपूर्ण निर्णय लिन यो उत्तम समय हो।`,
        remedies: [
          'बिहीबार विष्णु सहस्रनाम वा श्रीसूक्त पाठ गर्नुहोस्।',
          'पहेँलो फल, चनाको दाल वा बेसार मन्दिरमा अर्पण गर्नुहोस्।',
          'गुरु मन्त्र: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः" (१०८ पटक)।',
          'मातापिता, शिक्षक र गुरुजनको आशीर्वाद लिनुहोस्।'
        ],
        dosAndDonts: {
          do: ['नयाँ अध्ययन वा व्यवसाय आरम्भ', 'दान-धर्म र परोपकार', 'शुभ कार्यको आयोजना'],
          dont: ['गुरु वा विद्वानको अनादर', 'अहंकारी व्यवहार']
        },
        validityNoteNepali: 'गुरुको एक राशिमा गोचर लगभग १ वर्षसम्म रहन्छ।',
        timestamp: todayAD,
        audioFrequency: 639
      });
    } else {
      alerts.push({
        id: `guru_madhyam_${houseFromMoon}_${todayAD}`,
        category: 'guru',
        planet: 'गुरु',
        transitRashi: guruTransit.rashiName,
        houseFromMoon,
        houseFromLagna,
        isRetrograde: guruTransit.isRetrograde,
        severity: houseFromMoon === 6 || houseFromMoon === 8 || houseFromMoon === 12 ? 'alert' : 'madhyam',
        title: `🪐 वृहस्पति (गुरु) गोचर सचेतना (${houseFromMoon}औँ भाव)`,
        subtitle: `गुरु चन्द्र राशिबाट ${houseFromMoon}औँ भाव (${guruTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट गुरु ${houseFromMoon}औँ भावमा रहेकाले कार्यमा केही ढिलाइ र अतिरिक्त खर्च हुन सक्छ।`,
        keyAreas: ['बजेट व्यवस्थापन', 'धैर्यता', 'स्वास्थ्य', 'संयम'],
        detailedForecast: `६, ८ वा १२ औँ भावमा गुरुको गोचर रहँदा ऋण, रोग वा अनावश्यक खर्च नियन्त्रणमा राख्नुपर्छ। अध्यात्म, साधना र अध्ययनका लागि भने यो समय फलदायी रहनेछ।`,
        remedies: [
          'बिहीबार केराको बोटको पूजा र जल अर्पण।',
          'दैनिक ॐ नमो भगवते वासुदेवाय मन्त्र जप।',
          'पहेँलो चन्दनको तिलक लगाउनुहोस्।'
        ],
        dosAndDonts: {
          do: ['आर्थिक अनुशासन', 'अध्यात्म र योग', 'नम्र व्यवहार'],
          dont: ['अनावश्यक ठूलो ऋण लिने', 'जोखिमपूर्ण वित्तीय लगानी']
        },
        validityNoteNepali: 'धार्मिक साधना र संयमले गुरुको प्रतिकूलता हट्छ।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    }
  }

  // 3. RAHU & KETU TRANSIT (18-Month Karmic Axis)
  const rahuTransit = transitPlanets.find((p) => p.name === 'राहु');
  const ketuTransit = transitPlanets.find((p) => p.name === 'केतु');
  if (rahuTransit && ketuTransit) {
    const rahuHouseFromMoon = ((rahuTransit.rashiId - moonRashiId + 12) % 12) + 1;
    const ketuHouseFromMoon = ((ketuTransit.rashiId - moonRashiId + 12) % 12) + 1;

    if (rahuHouseFromMoon === 1 || rahuHouseFromMoon === 7) {
      alerts.push({
        id: `rahu_axis_1_7_${todayAD}`,
        category: 'rahu_ketu',
        planet: 'राहु',
        transitRashi: rahuTransit.rashiName,
        houseFromMoon: rahuHouseFromMoon,
        houseFromLagna: ((rahuTransit.rashiId - lagnaRashiId + 12) % 12) + 1,
        severity: 'maha_parivartan',
        title: '🌀 राहु-केतु १/७ अक्ष परिवर्तन (सम्बन्ध तथा आत्म-छवि रूपान्तरण)',
        subtitle: `राहु ${rahuTransit.rashiName} (भाव ${rahuHouseFromMoon}) र केतु ${ketuTransit.rashiName} (भाव ${ketuHouseFromMoon}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट १/७ अक्षमा राहु र केतुको भ्रमणले वैवाहिक जीवन, साझेदारी र व्यक्तिगत निर्णयमा ठूलो परिवर्तन ल्याउँदैछ।`,
        keyAreas: ['दाम्पत्य जीवन', 'साझेदारी व्यापार', 'आत्म-अन्वेषण', 'भ्रमबाट सतर्कता'],
        detailedForecast: `राहु-केतुको १-७ अक्षको १८ महिने यात्राले सम्बन्धहरूमा नयाँ मोड ल्याउँछ। कुनै पनि सम्झौता वा नयाँ सम्बन्ध गाँस्दा भावनात्मक बहकाउमा नपरी यथार्थवादी बन्नुहोला।`,
        remedies: [
          'दुर्गा सप्तशती वा अर्गला स्तोत्र पाठ।',
          'राहु मन्त्र: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः" जप।',
          'गणेशजीको दैनिक आराधना (केतु शान्तिका लागि)।',
          'सफा चाँदीको टुक्रा वा सिक्का खल्तीमा राख्नुहोस्।'
        ],
        dosAndDonts: {
          do: ['स्पष्ट सञ्चार', 'पारदर्शी सम्झौता', 'धार्मिक अनुष्ठान'],
          dont: ['अपरिचितमाथि अन्धविश्वास', 'छलकपट वा दोधारे निर्णय']
        },
        validityNoteNepali: 'राहु-केतुको यो अक्षीय गोचर १८ महिनासम्म चल्नेछ।',
        timestamp: todayAD,
        audioFrequency: 417
      });
    } else if (rahuHouseFromMoon === 3 || rahuHouseFromMoon === 6 || rahuHouseFromMoon === 11) {
      alerts.push({
        id: `rahu_shubha_${rahuHouseFromMoon}_${todayAD}`,
        category: 'rahu_ketu',
        planet: 'राहु',
        transitRashi: rahuTransit.rashiName,
        houseFromMoon: rahuHouseFromMoon,
        houseFromLagna: ((rahuTransit.rashiId - lagnaRashiId + 12) % 12) + 1,
        severity: 'shubha',
        title: '🚀 राहुको अनुकूल गोचर: आकस्मिक लाभ तथा पराक्रम वृद्धि',
        subtitle: `राहु चन्द्र राशिबाट ${rahuHouseFromMoon}औँ भाव (${rahuTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट राहु ${rahuHouseFromMoon}औँ भावमा रहँदा विदेशी अवसर, प्राविधिक सफलता र आकस्मिक लाभ मिल्नेछ।`,
        keyAreas: ['पराक्रम', 'विदेशी कार्य', 'शत्रु पराजय', 'प्राविधिक सफलता'],
        detailedForecast: `३, ६ र ११ औँ भावमा राहु बलवान मानिन्छ। पुराना समस्याहरू हल हुनेछन् र तपाईँको साहसले नयाँ उचाइ चुम्नेछ।`,
        remedies: [
          'सरस्वती वन्दना वा मन्त्र जप गर्नुहोस्।',
          'पक्षाहरूलाई अन्न र चारा खुवाउनुहोस्।'
        ],
        validityNoteNepali: 'अवसरलाई समयमै सदुपयोग गर्नुहोला।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    }
  }

  // 4. SURYA (SUN) MONTHLY SANKRANTI TRANSIT
  const sunTransit = transitPlanets.find((p) => p.name === 'सूर्य');
  if (sunTransit) {
    const sunHouseFromMoon = ((sunTransit.rashiId - moonRashiId + 12) % 12) + 1;
    const sunHouseFromLagna = ((sunTransit.rashiId - lagnaRashiId + 12) % 12) + 1;

    if (sunHouseFromMoon === 8) {
      alerts.push({
        id: `surya_ashtama_8_${todayAD}`,
        category: 'surya',
        planet: 'सूर्य',
        transitRashi: sunTransit.rashiName,
        houseFromMoon: sunHouseFromMoon,
        houseFromLagna: sunHouseFromLagna,
        severity: 'alert',
        title: '☀️ अष्टम सूर्य गोचर सचेतना (स्वास्थ्य र मान-सम्मान)',
        subtitle: `सूर्यदेव चन्द्र राशिबाट ८औँ भाव (${sunTransit.rashiName}) मा संक्रान्ति गोचररत`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट सूर्यदेव ८औँ भावमा रहेकाले यस महिना स्वास्थ्य र सरकारी काममा सतर्क रहनुपर्छ।`,
        keyAreas: ['स्वास्थ्य सुरक्षा', 'पित्त विकार/आँखा', 'अधिकारीहरूसँग सम्बन्ध', 'अपजसबाट जोगिने'],
        detailedForecast: `अष्टम सूर्यको महिनामा रक्तचाप, टाउको दुखाइ वा सरकारी काममा ढिलासुस्ती हुन सक्छ। अधिकारीहरूसँग विवाद नगर्नुहोला र घाममा लामो समय बस्दा ध्यान दिनुहोला।`,
        remedies: [
          'दैनिक बिहान तामाको लोटाबाट सूर्यलाई अर्घ्य (जल, रोली, रातो फूल) चढाउनुहोस्।',
          'आदित्य हृदय स्तोत्रको पाठ गर्नुहोस्।',
          'आइतबार नुनको सेवन कम वा बन्द गर्ने व्रत राख्न सक्नुहुन्छ।'
        ],
        dosAndDonts: {
          do: ['बिहानको सूर्य नमस्कार', 'पिताको सेवा र आदर', 'सात्विक भोजन'],
          dont: ['सरकारी नियम उल्लंघन', 'अनावश्यक क्रोध वा अहंकार']
        },
        validityNoteNepali: 'यो संक्रान्ति गोचर आगामी संक्रान्ति (लगभग १ महिना) सम्म रहनेछ।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    } else if (sunHouseFromMoon === 10) {
      alerts.push({
        id: `surya_digbala_10_${todayAD}`,
        category: 'surya',
        planet: 'सूर्य',
        transitRashi: sunTransit.rashiName,
        houseFromMoon: sunHouseFromMoon,
        houseFromLagna: sunHouseFromLagna,
        severity: 'shubha',
        title: '👑 सूर्यदेवको दशम भाव दिग्विजय गोचर: मान-प्रतिष्ठा र पदोन्नति',
        subtitle: `सूर्यदेव चन्द्र राशिबाट १०औँ कर्म भाव (${sunTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट सूर्यदेव १०औँ भावमा दिग्वली अवस्थामा गोचर गर्दा कार्यक्षेत्रमा नयाँ अधिकार र सम्मान मिल्नेछ।`,
        keyAreas: ['कार्यक्षेत्रमा उन्नति', 'सरकारी लाभ', 'नेतृत्व विकास', 'सामाजिक प्रतिष्ठा'],
        detailedForecast: `दशम सूर्यले कार्यक्षेत्रमा नेतृत्व क्षमता र उच्च अधिकारीहरूको सहयोग दिलाउँछ। नयाँ परियोजना वा जागिरमा पदोन्नतिको प्रबल सम्भावना रहन्छ।`,
        remedies: [
          'सूर्य गायत्री मन्त्र: "ॐ आदित्याय विद्महे प्रभाकराय धीमहि तन्नः सूर्यः प्रचोदयात्" जप।',
          'गुड (सक्खर) र गहुँ दान गर्नुहोस्।'
        ],
        validityNoteNepali: 'यो महिना कर्मक्षेत्रमा उत्कृष्ट साबित हुनेछ।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    }
  }

  // 5. MANGAL (MARS) TRANSIT
  const mangalTransit = transitPlanets.find((p) => p.name === 'मंगल');
  if (mangalTransit) {
    const mangalHouseFromMoon = ((mangalTransit.rashiId - moonRashiId + 12) % 12) + 1;
    const mangalHouseFromLagna = ((mangalTransit.rashiId - lagnaRashiId + 12) % 12) + 1;

    if ([1, 4, 7, 8, 12].includes(mangalHouseFromMoon)) {
      alerts.push({
        id: `mangal_alert_${mangalHouseFromMoon}_${todayAD}`,
        category: 'mangal',
        planet: 'मंगल',
        transitRashi: mangalTransit.rashiName,
        houseFromMoon: mangalHouseFromMoon,
        houseFromLagna: mangalHouseFromLagna,
        severity: 'alert',
        title: `🔥 मङ्गल गोचर सचेतना: ${mangalHouseFromMoon}औँ भावमा आवेश र ऊर्जा नियन्त्रण`,
        subtitle: `मङ्गल चन्द्र राशिबाट ${mangalHouseFromMoon}औँ भाव (${mangalTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट मङ्गल ${mangalHouseFromMoon}औँ भावमा रहेकाले आवेश, वादविवाद र हतारबाट जोगिनुपर्छ।`,
        keyAreas: ['क्रोध नियन्त्रण', 'सवारी र हतियार सुरक्षा', 'दाम्पत्य समन्वय', 'रक्तचाप'],
        detailedForecast: `मङ्गलको १, ४, ७, ८, १२ भावको गोचरले अस्थायी गोचर मङ्गल प्रभाव निम्त्याउँछ। आगो, करेन्ट र सवारी चलाउँदा पूर्ण चनाखो रहनुहोस्। नियमित व्यायामले अतिरिक्त ऊर्जा सन्तुलन गर्न मद्दत पुग्छ।`,
        remedies: [
          'मंगलबार हनुमानजीलाई सिन्दूर वा रातो फूल चढाउनुहोस्।',
          'ऋणमोचक मंगल स्तोत्र पाठ।',
          'रातो दाल (मसुरो) गरिबलाई दान गर्नुहोस्।'
        ],
        dosAndDonts: {
          do: ['शारीरिक कसरत वा खेलकुद', 'शान्त भएर कुरा सुन्ने बानी', 'हनुमान चालिसा पाठ'],
          dont: ['क्रोधमा कठोर निर्णय', 'तिब्र गतिमा सवारी चलाउने']
        },
        validityNoteNepali: 'मङ्गलको एक राशिमा गोचर करिब ४५ दिनसम्म रहन्छ।',
        timestamp: todayAD,
        audioFrequency: 432
      });
    } else if ([3, 6, 10, 11].includes(mangalHouseFromMoon)) {
      alerts.push({
        id: `mangal_shubha_${mangalHouseFromMoon}_${todayAD}`,
        category: 'mangal',
        planet: 'मंगल',
        transitRashi: mangalTransit.rashiName,
        houseFromMoon: mangalHouseFromMoon,
        houseFromLagna: mangalHouseFromLagna,
        severity: 'shubha',
        title: `🗡️ मङ्गल पराक्रम गोचर: साहस, ऊर्जा र प्रतिस्पर्धामा विजय`,
        subtitle: `मङ्गल चन्द्र राशिबाट ${mangalHouseFromMoon}औँ भाव (${mangalTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट मङ्गल ${mangalHouseFromMoon}औँ भावमा गोचर गर्दा आत्मबल, पराक्रम र प्रतिस्पर्धामा विजय मिल्नेछ।`,
        keyAreas: ['साहस र पराक्रम', 'प्रतिस्पर्धा विजय', 'जग्गा जमिन लाभ', 'ऊर्जा'],
        detailedForecast: `३, ६, १० र ११ भावमा मङ्गल अति शुभ मानिन्छ। खेलकुद, परीक्षा, निर्माण कार्य र प्रशासनिक कार्यहरूमा तपाईँको पक्ष बलियो रहनेछ।`,
        remedies: [
          'मङ्गल मन्त्र: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः" जप।',
          'दाजुभाइ तथा सहकर्मीहरूसँग मेलमिलाप राख्नुहोस्।'
        ],
        validityNoteNepali: 'यस ऊर्जालाई सकारात्मक सिर्जनात्मक कार्यमा लगाउनुहोस्।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    }
  }

  // 6. BUDHA (MERCURY) TRANSIT
  const budhaTransit = transitPlanets.find((p) => p.name === 'बुध');
  if (budhaTransit) {
    const budhaHouseFromMoon = ((budhaTransit.rashiId - moonRashiId + 12) % 12) + 1;
    const budhaHouseFromLagna = ((budhaTransit.rashiId - lagnaRashiId + 12) % 12) + 1;
    if ([2, 4, 6, 8, 10, 11].includes(budhaHouseFromMoon)) {
      alerts.push({
        id: `budha_shubha_${budhaHouseFromMoon}_${todayAD}`,
        category: 'budha',
        planet: 'बुध',
        transitRashi: budhaTransit.rashiName,
        houseFromMoon: budhaHouseFromMoon,
        houseFromLagna: budhaHouseFromLagna,
        isRetrograde: budhaTransit.isRetrograde,
        severity: 'shubha',
        title: `🟢 बुध अनुकूल गोचर: बुद्धि, व्यापार तथा वित्तीय लाभ (${budhaHouseFromMoon}औँ भाव)`,
        subtitle: `बुध चन्द्र राशिबाट ${budhaHouseFromMoon}औँ भाव (${budhaTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट बुध ${budhaHouseFromMoon}औँ भावमा अनुकूल गोचरमा रहँदा व्यापार, हिसाबकिताब, शैक्षिक सफलता र वाकचातुर्यमा उन्नति हुनेछ।`,
        keyAreas: ['व्यापारिक लाभ', 'वाणी र सञ्चार', 'अध्ययन र विश्लेषण', 'लेखापरीक्षण'],
        detailedForecast: `बुधको २, ४, ६, ८, १०, ११ भावमा गोचरले आर्थिक हिसाबकिताब सन्तुलित बनाउने, नयाँ सम्झौता र बौद्धिक कार्यमा सफलता दिने गर्दछ।`,
        remedies: [
          'बुधबार हरियो घाँस गाईलाई खुवाउनुहोस्।',
          'गणेशजीलाई २१ मुठा दुबो चढाउनुहोस्।',
          'बुध मन्त्र: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः" जप।'
        ],
        dosAndDonts: {
          do: ['बौद्धिक छलफल र सम्झौता', 'हिसाबकिताब दुरुस्त राख्ने'],
          dont: ['अनावश्यक शंका उपशंका']
        },
        validityNoteNepali: 'बुधको एक राशिमा गोचर करिब २१ दिन रहन्छ।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    } else {
      alerts.push({
        id: `budha_alert_${budhaHouseFromMoon}_${todayAD}`,
        category: 'budha',
        planet: 'बुध',
        transitRashi: budhaTransit.rashiName,
        houseFromMoon: budhaHouseFromMoon,
        houseFromLagna: budhaHouseFromLagna,
        isRetrograde: budhaTransit.isRetrograde,
        severity: 'madhyam',
        title: `🪐 बुध गोचर सचेतना: कागजात र सञ्चारमा सावधानी (${budhaHouseFromMoon}औँ भाव)`,
        subtitle: `बुध चन्द्र राशिबाट ${budhaHouseFromMoon}औँ भाव (${budhaTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}का लागि बुध ${budhaHouseFromMoon}औँ भावमा रहेकाले दस्तावेज हस्ताक्षर गर्दा र बोल्दा विशेष विचार पुर्याउनुहोला।`,
        keyAreas: ['कागजात प्रमाणीकरण', 'वाणी संयम', 'सञ्चार स्पष्टता'],
        detailedForecast: `१, ३, ५, ७, ९ वा १२ औँ भावको बुध गोचरमा छिटो-छिटो निर्णय लिनुभन्दा विश्लेषण गरेर मात्र सम्झौता गर्नु हितकर हुन्छ।`,
        remedies: ['भगवान विष्णु वा गणेशजीको स्मरण गर्नुहोस्।'],
        validityNoteNepali: 'नयाँ सम्झौतामा ध्यान दिनुहोला।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    }
  }

  // 7. SHUKRA (VENUS) TRANSIT
  const shukraTransit = transitPlanets.find((p) => p.name === 'शुक्र');
  if (shukraTransit) {
    const shukraHouseFromMoon = ((shukraTransit.rashiId - moonRashiId + 12) % 12) + 1;
    const shukraHouseFromLagna = ((shukraTransit.rashiId - lagnaRashiId + 12) % 12) + 1;
    if ([1, 2, 3, 4, 5, 8, 9, 11, 12].includes(shukraHouseFromMoon)) {
      alerts.push({
        id: `shukra_shubha_${shukraHouseFromMoon}_${todayAD}`,
        category: 'shukra',
        planet: 'शुक्र',
        transitRashi: shukraTransit.rashiName,
        houseFromMoon: shukraHouseFromMoon,
        houseFromLagna: shukraHouseFromLagna,
        isRetrograde: shukraTransit.isRetrograde,
        severity: 'shubha',
        title: `💖 शुक्र शुभ गोचर: ऐश्वर्य, भौतिक सुख तथा सौन्दर्य लाभ (${shukraHouseFromMoon}औँ भाव)`,
        subtitle: `दैत्यगुरु शुक्र चन्द्र राशिबाट ${shukraHouseFromMoon}औँ भाव (${shukraTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}को चन्द्र राशिबाट शुक्र ${shukraHouseFromMoon}औँ भावमा गोचर गर्दै भौतिक सुख, दाम्पत्य सौहार्द, कला र ऐश्वर्यमा वृद्धि गराउँदै हुनुहुन्छ।`,
        keyAreas: ['भौतिक सुख-सुविधा', 'दाम्पत्य तथा प्रेम', 'नयाँ वस्त्र तथा आभूषण', 'कलात्मक सिर्जना'],
        detailedForecast: `शुक्रको यो गोचरले परिवारमा आनन्द, नयाँ सवारी वा वस्त्र खरिद र सौन्दर्य सम्बन्धी कार्यमा शुभ फल प्रदान गर्दछ।`,
        remedies: [
          'शुक्रबार महालक्ष्मी मन्दिरमा सेतो मिठाई वा खीर अर्पण।',
          'शुक्र मन्त्र: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः" जप।',
          'सफा र सुगन्धित वस्त्र धारण गर्नुहोस्।'
        ],
        dosAndDonts: {
          do: ['कलात्मक कार्य र सौन्दर्य वृद्धि', 'जीवनसाथीको सम्मान'],
          dont: ['अत्यधिक विलासितामा बजेट भन्दा बढी खर्च']
        },
        validityNoteNepali: 'शुक्रको एक राशिमा गोचर करिब २५-३० दिन रहन्छ।',
        timestamp: todayAD,
        audioFrequency: 639
      });
    } else {
      alerts.push({
        id: `shukra_alert_${shukraHouseFromMoon}_${todayAD}`,
        category: 'shukra',
        planet: 'शुक्र',
        transitRashi: shukraTransit.rashiName,
        houseFromMoon: shukraHouseFromMoon,
        houseFromLagna: shukraHouseFromLagna,
        isRetrograde: shukraTransit.isRetrograde,
        severity: 'alert',
        title: `⚠️ शुक्र गोचर सचेतना: सम्बन्ध तथा विलासिता खर्च नियन्त्रण (${shukraHouseFromMoon}औँ भाव)`,
        subtitle: `शुक्र चन्द्र राशिबाट ${shukraHouseFromMoon}औँ भाव (${shukraTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}का लागि शुक्र ${shukraHouseFromMoon}औँ भावमा रहेकाले विलासितामा अत्यधिक खर्च र सम्बन्धमा अनावश्यक अपेक्षाबाट बच्नुहोस्।`,
        keyAreas: ['बजेट अनुशासन', 'सम्बन्ध समन्वय', 'स्वास्थ्य'],
        detailedForecast: `६, ७ वा १० भावमा शुक्र रहँदा कार्यक्षेत्रमा साझेदारी वा सम्बन्धहरूमा संयम अपनाउनु बुद्धिमानी हुन्छ।`,
        remedies: ['शुक्रबार सेतो वस्तु (चामल/चिनी) दान गर्नुहोस्।'],
        validityNoteNepali: 'संयम अपनाउनुहोस्।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    }
  }

  // 8. CHANDRA (MOON) TRANSIT: ASHTAMA CHANDRA (घातचन्द्र) & AUSPICIOUS MOON
  const chandraTransit = transitPlanets.find((p) => p.name === 'चन्द्र');
  if (chandraTransit) {
    const chandraHouseFromMoon = ((chandraTransit.rashiId - moonRashiId + 12) % 12) + 1;
    if (chandraHouseFromMoon === 8) {
      alerts.push({
        id: `chandra_ashtama_8_${todayAD}`,
        category: 'chandra',
        planet: 'चन्द्र',
        transitRashi: chandraTransit.rashiName,
        houseFromMoon: chandraHouseFromMoon,
        severity: 'maha_parivartan',
        title: '🌑 अष्टम चन्द्र (घातचन्द्र) सचेतना: आज महत्वपूर्ण निर्णय स्थगित गर्नुहोस्',
        subtitle: `गोचर चन्द्रमा जन्म चन्द्र राशिबाट ८औँ भाव (${chandraTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}का लागि आज चन्द्रमा आठौँ भावमा रहेकाले 'अष्टम चन्द्र' (घातचन्द्र) परेको छ। मानसिक अशान्ति र हतारको निर्णयबाट बच्नुहोस्।`,
        keyAreas: ['मानसिक शान्ति', 'लगानी स्थगन', 'यात्रा सावधानी', 'भावनात्मक सन्तुलन'],
        detailedForecast: `वैदिक ज्योतिषमा अष्टम चन्द्रको समयमा नयाँ व्यापार सुरु नगर्ने, ठूलो धन लगानी नगर्ने र लामो यात्रा नगर्ने सल्लाह दिइन्छ। मनलाई शान्त राख्न शिवजीको ध्यान गर्नुहोस्।`,
        remedies: [
          'दैनिक ॐ नमः शिवाय मन्त्रको शान्त मनले जप गर्नुहोस्।',
          'शिवलिङ्गमा दूध वा शुद्ध जल अर्पण गर्नुहोस्।',
          'चाँदीको भाडाबाट पानी पिउनु हितकर हुन्छ।'
        ],
        dosAndDonts: {
          do: ['साधना र ध्यान', 'नियमित काम मात्र गर्ने', 'शान्त खानपान'],
          dont: ['नयाँ सम्झौतामा हस्ताक्षर', 'ठूलो शेयर वा घरजग्गा लगानी', 'विवादमा फस्ने']
        },
        validityNoteNepali: 'अष्टम चन्द्रको प्रभाव लगभग २ दिन (चन्द्रमा अर्को राशिमा नपुगुञ्जेल) रहन्छ।',
        timestamp: todayAD,
        audioFrequency: 432
      });
    } else if (chandraHouseFromMoon === 4) {
      alerts.push({
        id: `chandra_kantaka_4_${todayAD}`,
        category: 'chandra',
        planet: 'चन्द्र',
        transitRashi: chandraTransit.rashiName,
        houseFromMoon: chandraHouseFromMoon,
        severity: 'alert',
        title: '🌙 चतुर्थ चन्द्र सचेतना: मनमा चञ्चलता र पारिवारिक ध्यान',
        subtitle: `गोचर चन्द्रमा जन्म चन्द्र राशिबाट चौथो भाव (${chandraTransit.rashiName}) मा`,
        personalizedSummary: `${profileName}का लागि चन्द्रमा चौथो भावमा रहेकाले मनमा केही चञ्चलता र परिवारमा समय दिनुपर्ने देखिन्छ।`,
        keyAreas: ['पारिवारिक सुख', 'मानसिक शान्ति', 'सवारी सावधानी'],
        detailedForecast: `चौथो भावको चन्द्रमाले मनमा अनावश्यक शंका वा भावना उत्पन्न गराउन सक्छ। आमाको स्वास्थ्यमा ध्यान दिनुहोला।`,
        remedies: ['चन्द्र बीज मन्त्र: "ॐ सों सोमाय नमः" जप गर्नुहोस्।'],
        validityNoteNepali: 'यो प्रभाव लगभग २.२५ दिन रहनेछ।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    }
  }

  // 7. RETROGRADE PLANETS ALERT (वक्री ग्रह सचेतना)
  const retrogradePlanets = transitPlanets.filter((p) => p.isRetrograde);
  if (retrogradePlanets.length > 0) {
    const retroNames = retrogradePlanets.map((p) => p.name).join(', ');
    const mercuryRetro = retrogradePlanets.find((p) => p.name === 'बुध');

    if (mercuryRetro) {
      alerts.push({
        id: `budha_retro_${todayAD}`,
        category: 'vakri',
        planet: 'बुध',
        transitRashi: mercuryRetro.rashiName,
        houseFromMoon: ((mercuryRetro.rashiId - moonRashiId + 12) % 12) + 1,
        severity: 'alert',
        title: '🔄 बुध वक्री विशेष सचेतना: सञ्चार, दस्तावेज र प्रविधिमा सतर्कता',
        subtitle: `बुद्धिकारक ग्रह बुध ${mercuryRetro.rashiName} राशिमा वक्री अवस्थामा`,
        personalizedSummary: `${profileName}का लागि बुध वक्री रहेकाले इमेल, सम्झौता, बैंक कारोबार र प्राविधिक सामग्री खरिदमा दुई पटक जाँच गर्नुहोस्।`,
        keyAreas: ['दस्तावेज प्रमाणीकरण', 'प्रविधि सुरक्षा', 'वाणी तथा संवाद', 'हस्ताक्षर सावधानी'],
        detailedForecast: `बुध वक्री हुँदा भ्रमपूर्ण सञ्चार, यात्रा तालिकामा फेरबदल र सफ्टवेयर गडबडी हुन सक्छ। नयाँ सम्झौता गर्दा नियम र सर्तहरू ध्यानपूर्वक पढ्नुहोला।`,
        remedies: [
          'भगवान गणेशजीलाई दुबो र लड्डु अर्पण गर्नुहोस्।',
          'विष्णु सहस्रनाम वा गणपति अथर्वशीर्ष पाठ गर्नुहोस्।'
        ],
        dosAndDonts: {
          do: ['महत्वपूर्ण डेटा ब्याकअप राख्ने', 'कुनै पनि कागजात दुईपटक पढ्ने'],
          dont: ['अपूरो जानकारीमा प्रतिक्रिया दिने', 'महंगा ग्याजेट्स तत्काल किन्ने']
        },
        validityNoteNepali: 'बुध मार्गी नभएसम्म यो सावधानी जारी राख्नुहोला।',
        timestamp: todayAD,
        audioFrequency: 528
      });
    }
  }

  // Sort alerts: 'maha_parivartan' first, then 'alert', then 'shubha', then 'madhyam'
  const severityRank: Record<TransitAlertSeverity, number> = {
    maha_parivartan: 1,
    alert: 2,
    shubha: 3,
    madhyam: 4,
  };

  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

/**
 * Storage management for transit notification preferences
 */
export function getStoredTransitPreferences(): TransitNotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_TRANSIT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
    if (!raw) return DEFAULT_TRANSIT_PREFS;
    return { ...DEFAULT_TRANSIT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TRANSIT_PREFS;
  }
}

export function saveTransitPreferences(prefs: TransitNotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

/**
 * Storage management for transit notification history
 */
export function getStoredTransitHistory(): TransitNotificationHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTransitHistory(history: TransitNotificationHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch {
    // ignore
  }
}

export function markTransitAlertAsRead(alertId: string): void {
  const history = getStoredTransitHistory();
  const updated = history.map((item) => (item.alertId === alertId || item.id === alertId ? { ...item, read: true } : item));
  saveTransitHistory(updated);
}

export function clearTransitHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

/**
 * Generates an event-based signature for a transit alert.
 * Stays identical as long as the planetary sign, house, and retrograde status do not change.
 */
export function getAlertSignature(alert: TransitAlertItem, profileId?: string): string {
  const pid = profileId || 'default';
  return `${pid}_${alert.category}_${alert.planet}_${alert.transitRashi}_${alert.houseFromMoon}_${alert.isRetrograde ? 'r' : 'd'}_${alert.severity}`;
}

export function getStoredViewedAlertSignatures(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIEWED_SIGNATURES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markAlertsAsViewed(alerts: TransitAlertItem[], profileId?: string): void {
  if (typeof window === 'undefined' || !alerts.length) return;
  try {
    const current = new Set(getStoredViewedAlertSignatures());
    alerts.forEach((alert) => {
      current.add(getAlertSignature(alert, profileId));
      current.add(alert.id);
    });
    const list = Array.from(current).slice(-500);
    localStorage.setItem(STORAGE_KEYS.VIEWED_SIGNATURES, JSON.stringify(list));
    localStorage.setItem(STORAGE_KEYS.LAST_VIEWED_TIME, new Date().toISOString());
    window.dispatchEvent(new CustomEvent('transit-alerts-viewed', { detail: { profileId, count: alerts.length } }));
  } catch (e) {
    console.error('Failed to mark alerts as viewed:', e);
  }
}

export function isAlertUnread(alert: TransitAlertItem, profileId?: string): boolean {
  if (typeof window === 'undefined') return true;
  const viewed = getStoredViewedAlertSignatures();
  const sig = getAlertSignature(alert, profileId);
  return !viewed.includes(sig) && !viewed.includes(alert.id);
}

export function getUnreadTransitAlerts(alerts: TransitAlertItem[], profileId?: string): TransitAlertItem[] {
  if (typeof window === 'undefined') return alerts;
  const viewedSet = new Set(getStoredViewedAlertSignatures());
  return alerts.filter((alert) => {
    const sig = getAlertSignature(alert, profileId);
    return !viewedSet.has(sig) && !viewedSet.has(alert.id);
  });
}

export function clearViewedTransitAlerts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.VIEWED_SIGNATURES);
  localStorage.removeItem(STORAGE_KEYS.LAST_VIEWED_TIME);
  window.dispatchEvent(new CustomEvent('transit-alerts-viewed', { detail: { cleared: true } }));
}

/**
 * Native Browser Notification Utilities
 */
export function isBrowserPushSupported(): boolean {
  try {
    return typeof window !== 'undefined' && 'Notification' in window && typeof Notification.requestPermission === 'function';
  } catch {
    return false;
  }
}

export function getBrowserPushPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserPushSupported()) return 'unsupported';
  try {
    return Notification.permission;
  } catch {
    return 'unsupported';
  }
}

export async function requestBrowserPushPermission(): Promise<NotificationPermission> {
  if (!isBrowserPushSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch (e) {
    console.warn('Error requesting browser push permission:', e);
    return 'denied';
  }
}

/**
 * Dispatches a native Web Push notification for a specific transit alert
 */
export async function sendTransitWebPushNotification(params: {
  alert: TransitAlertItem;
  profileName: string;
  onNavigateToGochar?: () => void;
}): Promise<boolean> {
  const { alert, profileName, onNavigateToGochar } = params;

  if (!isBrowserPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const title = alert.title;
  const body = `${profileName}को जन्म कुण्डली: ${alert.personalizedSummary} उपाय: ${alert.remedies[0] || 'धार्मिक साधना गर्नुहोस्।'}`;
  const icon = '/icon.svg';
  const badge = '/icon.svg';
  const tag = `transit_${alert.id}`;

  try {
    // 1. Try ServiceWorkerRegistration.showNotification first
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          const swOptions: NotificationOptions & { vibrate?: number[]; actions?: Array<{ action: string; title: string }> } = {
            body,
            icon,
            badge,
            tag,
            vibrate: [250, 100, 250],
            data: { url: '/?tab=gochar', alertId: alert.id },
            actions: [
              { action: 'open_gochar', title: 'गोचर हेर्नुहोस्' },
              { action: 'dismiss', title: 'बन्द' }
            ]
          };
          await registration.showNotification(title, swOptions as NotificationOptions);

          // Save to history
          logTransitNotificationSent(alert, title, body);
          playTransitChime(alert.audioFrequency || 528);
          return true;
        }
      } catch (swErr) {
        // Fallback to Window Notification below
      }
    }

    // 2. Fallback to Window Notification API
    const notification = new Notification(title, {
      body,
      icon,
      tag,
      requireInteraction: alert.severity === 'maha_parivartan',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (onNavigateToGochar) {
        onNavigateToGochar();
      } else {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'gochar' }));
      }
    };

    logTransitNotificationSent(alert, title, body);
    playTransitChime(alert.audioFrequency || 528);
    return true;
  } catch (err) {
    console.warn('Failed to send transit web push notification:', err);
    return false;
  }
}

function logTransitNotificationSent(alert: TransitAlertItem, title: string, body: string): void {
  const history = getStoredTransitHistory();
  const newEntry: TransitNotificationHistoryEntry = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    alertId: alert.id,
    title,
    body,
    category: alert.category,
    planet: alert.planet,
    severity: alert.severity,
    sentAt: new Date().toISOString(),
    read: false,
  };
  saveTransitHistory([newEntry, ...history]);
}

/**
 * Checks and sends automatic transit notifications based on user preferences and unsent status
 */
export async function checkAndSendAutoTransitNotifications(params: {
  activeProfile: BirthDetails | null;
  alerts: TransitAlertItem[];
  onNavigateToGochar?: () => void;
}): Promise<number> {
  const prefs = getStoredTransitPreferences();
  if (!prefs.enabled) return 0;
  if (!isBrowserPushSupported() || Notification.permission !== 'granted') return 0;

  const profileId = params.activeProfile?.id || 'default';
  const profileName = params.activeProfile?.name?.trim() || 'जातक';
  let sentCount = 0;

  for (const alert of params.alerts) {
    // Filter by preferences
    if (alert.category === 'guru' && !prefs.alertGuru) continue;
    if (alert.category === 'shani' && !prefs.alertShani) continue;
    if (alert.id.includes('shani_sadesati') && prefs.alertShaniSadeSati === false) continue;
    if (alert.category === 'rahu_ketu' && !prefs.alertRahuKetu) continue;
    if (alert.category === 'surya' && !prefs.alertSurya) continue;
    if (alert.category === 'mangal' && !prefs.alertMangal) continue;
    if (alert.category === 'budha' && !prefs.alertBudha) continue;
    if (alert.category === 'shukra' && !prefs.alertShukra) continue;
    if (alert.category === 'chandra' && !prefs.alertChandraAshtama) continue;
    if (alert.category === 'vakri' && !prefs.alertVakri) continue;

    // Check if already sent today for this profile
    const sentKey = `${STORAGE_KEYS.LAST_SENT_PREFIX}${profileId}_${alert.id}`;
    if (localStorage.getItem(sentKey) === 'true') {
      continue;
    }

    // Send notification
    const success = await sendTransitWebPushNotification({
      alert,
      profileName,
      onNavigateToGochar: params.onNavigateToGochar,
    });

    if (success) {
      localStorage.setItem(sentKey, 'true');
      sentCount++;
      // Wait a moment between alerts to avoid flooding the user
      break;
    }
  }

  return sentCount;
}

/**
 * Test push notification trigger: Immediately sends the most relevant transit alert
 */
export async function sendTestTransitPushAlert(params: {
  activeProfile: BirthDetails | null;
  alerts: TransitAlertItem[];
  onNavigateToGochar?: () => void;
}): Promise<{ success: boolean; message: string }> {
  if (!isBrowserPushSupported()) {
    return {
      success: false,
      message: 'तपाईंको ब्राउजरले वेब पुश सूचना समर्थन गर्दैन (Web Notifications unsupported)।'
    };
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await requestBrowserPushPermission();
  }

  if (permission !== 'granted') {
    return {
      success: false,
      message: 'ब्राउजरमा सूचना अनुमति अस्वीकृत वा रोकिएको छ। ब्राउजर सेटिङबाट सूचना खुला गर्नुहोस्।'
    };
  }

  const profileName = params.activeProfile?.name?.trim() || 'जातक';
  const targetAlert = params.alerts[0] || {
    id: `test_transit_${Date.now()}`,
    category: 'guru',
    planet: 'गुरु',
    transitRashi: 'मिथुन',
    houseFromMoon: 5,
    severity: 'shubha',
    title: '🪐 परीक्षण: प्रमुख ग्रह गोचर सचेतना सूचना',
    subtitle: 'बालानन्द ज्योतिष तथा वास्तु सेवा',
    personalizedSummary: `${profileName}को चन्द्र राशि अनुसार वृहस्पति ५औँ भावमा शुभ गोचरमा हुनुहुन्छ।`,
    keyAreas: ['ज्ञान', 'भाग्य', 'सिर्जनाशीलता'],
    detailedForecast: 'यो एक सफल परीक्षण गोचर पुश सूचना हो।',
    remedies: ['विष्णु सहस्रनाम पाठ गर्नुहोस्।'],
    timestamp: new Date().toISOString(),
    audioFrequency: 528
  };

  const sent = await sendTransitWebPushNotification({
    alert: targetAlert,
    profileName,
    onNavigateToGochar: params.onNavigateToGochar,
  });

  if (sent) {
    return {
      success: true,
      message: `सफल! "${targetAlert.title}" सम्बन्धी पुश सूचना पठाइयो।`
    };
  }

  return {
    success: false,
    message: 'सूचना पठाउन सकिएन। कृपया पुनः प्रयास गर्नुहोस्।'
  };
}
