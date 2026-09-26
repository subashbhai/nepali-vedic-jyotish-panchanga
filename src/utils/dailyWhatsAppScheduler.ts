import {
  BirthDetails,
  PanchangaData,
  PlanetPosition,
  LagnaInfo
} from '../types/astrology';
import { RASHI_DATA, calculatePlanetaryPositions, calculateLagna, getJulianDay, getAyanamsa } from './astroCalculations';
import { toDevanagariNumerals } from './nepaliCalendar';
import { calculateBhavaAndDrishtiSystem } from './bhavaDrishtiEngine';
import { calculatePanchanga } from './panchangaEngine';

export interface DailyWhatsAppSubscriber {
  profileId: string;
  name: string;
  phone: string;
  dateBS: string;
  dateAD: string;
  time: string;
  locationName: string;
  moonRashiName: string;
  moonRashiId: number;
  nakshatraName: string;
  enabled: boolean; // Ticked by super admin
  lastSentDateBS?: string;
  lastSentStatus?: 'success' | 'failed' | 'pending';
  lastSentTimestamp?: number;
}

export interface DailyWhatsAppScheduleConfig {
  autoSendEnabled: boolean;
  sendTime: string; // "07:00"
  selectedProfileIds: string[];
  lastDispatchedDateBS?: string;
  gatewayMode: 'whatsapp_web' | 'whatsapp_cloud_api' | 'twilio' | 'green_api';
  apiToken?: string;
  apiInstanceId?: string;
  webhookUrl?: string;
}

const STORAGE_KEYS = {
  CONFIG: 'balananda_daily_whatsapp_schedule_config_v1',
  SUBSCRIBERS: 'balananda_daily_whatsapp_subscribers_v1',
  DISPATCH_LOGS: 'balananda_daily_whatsapp_logs_v1'
};

export const DEFAULT_SCHEDULE_CONFIG: DailyWhatsAppScheduleConfig = {
  autoSendEnabled: true,
  sendTime: '07:00',
  selectedProfileIds: [],
  gatewayMode: 'whatsapp_web'
};

/**
 * Returns the persistent scheduler configuration
 */
export function getStoredScheduleConfig(): DailyWhatsAppScheduleConfig {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) return DEFAULT_SCHEDULE_CONFIG;
    return { ...DEFAULT_SCHEDULE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SCHEDULE_CONFIG;
  }
}

/**
 * Saves scheduler configuration
 */
export function saveScheduleConfig(config: DailyWhatsAppScheduleConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('daily-whatsapp-config-updated', { detail: config }));
  } catch (e) {
    console.error('Failed to save schedule config', e);
  }
}

/**
 * Derives Moon sign and Nakshatra for a user profile
 */
export function getProfileMoonDetails(profile: BirthDetails): { moonRashiName: string; moonRashiId: number; nakshatraName: string } {
  if (!profile.dateAD || !profile.time) {
    return { moonRashiName: 'मेष', moonRashiId: 1, nakshatraName: 'अश्विनी' };
  }
  try {
    const [year, month, day] = profile.dateAD.split('-').map(Number);
    const [hour, minute] = profile.time.split(':').map(Number);
    const lat = profile.location?.latitude || 27.7172;
    const lon = profile.location?.longitude || 85.3240;
    const tz = profile.location?.timeZone || 5.75;

    const jd = getJulianDay(profile.dateAD, profile.time, tz);
    const ayanamsa = getAyanamsa(jd);
    const lagna = calculateLagna(jd, lat, lon, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);
    const moon = planets.find((p) => p.name === 'चन्द्र') || planets[1];

    return {
      moonRashiName: moon?.rashiName || 'मेष',
      moonRashiId: moon?.rashiId || 1,
      nakshatraName: moon?.nakshatraName || 'अश्विनी'
    };
  } catch {
    return { moonRashiName: 'मेष', moonRashiId: 1, nakshatraName: 'अश्विनी' };
  }
}

/**
 * Gathers all subscribers from profiles list that have Date of Birth (DOB)
 */
export function getSubscribersFromProfiles(
  profiles: BirthDetails[]
): DailyWhatsAppSubscriber[] {
  const config = getStoredScheduleConfig();
  const tickedIds = new Set(config.selectedProfileIds);

  // Filter only profiles with DOB
  const validProfiles = profiles.filter((p) => Boolean(p.dateBS || p.dateAD));

  return validProfiles.map((p) => {
    const moon = getProfileMoonDetails(p);
    const isTicked = tickedIds.size === 0 ? Boolean(p.phone) : tickedIds.has(p.id || p.name);

    return {
      profileId: p.id || p.name,
      name: p.name,
      phone: p.phone || '',
      dateBS: p.dateBS || '—',
      dateAD: p.dateAD || '—',
      time: p.time || '—',
      locationName: p.location?.name || 'नेपाल',
      moonRashiName: moon.moonRashiName,
      moonRashiId: moon.moonRashiId,
      nakshatraName: moon.nakshatraName,
      enabled: isTicked
    };
  });
}

/**
 * Updates ticks for super admin
 */
export function updateSubscriberSelection(profileIds: string[]): void {
  const config = getStoredScheduleConfig();
  config.selectedProfileIds = profileIds;
  saveScheduleConfig(config);
}

/**
 * Generates personalized daily astrological report data for a user
 */
export interface PersonalizedDailyVedicReport {
  subscriber: DailyWhatsAppSubscriber;
  panchanga: PanchangaData;
  todayBS: string;
  todayAD: string;
  // 1. Personalized Daily Prediction
  dailyForecast: {
    overallScore: number;
    ratingText: string;
    description: string;
    careerMoney: string;
    healthFamily: string;
    cautions: string;
  };
  // 2. Auspicious Timings
  muhurtha: {
    amritBela: string;
    shubhaBela: string;
    rahuKaal: string;
    yamaghanta: string;
    abhijitMuhurtha: string;
    auspiciousGuidance: string;
  };
  // 3. Planetary Transit & Graha Gochara
  grahaGochar: {
    moonPosition: string;
    taraBala: string;
    chandraBala: string;
    transitSummary: string;
  };
  // 4. Lucky Factors
  luckyFactors: {
    color: string;
    number: string;
    direction: string;
    mantra: string;
  };
}

export function generatePersonalizedDailyReport(
  sub: DailyWhatsAppSubscriber,
  todayPanchanga: PanchangaData,
  transitPlanets?: PlanetPosition[]
): PersonalizedDailyVedicReport {
  const rashiId = sub.moonRashiId || 1;
  const tithiName = todayPanchanga.tithi.name;
  const nakshatraName = todayPanchanga.nakshatra.name;

  // Rating algorithm derived from rashi + tithi harmonics
  const score = 70 + ((rashiId * 7 + tithiName.length * 5) % 25);
  const ratingText = score >= 88 ? 'सर्वोत्तम (Excellent)' : score >= 80 ? 'उत्तम (Very Good)' : score >= 72 ? 'शुभ (Favorable)' : 'मध्यम (Moderate)';

  // Personalized forecast texts
  const forecastDescriptions: Record<number, string> = {
    1: `मेष राशिका जातक ${sub.name}का लागि आज पराक्रम र कार्यसिद्धिमा वृद्धि हुनेछ। चन्द्रमाको शुभ दृष्टिले अड्किएका काम बन्नेछन्।`,
    2: `वृष राशिका जातक ${sub.name}का लागि आज आर्थिक उन्नति, पारिवारिक सुख र मिठो भोजनको योग छ। नयाँ अवसर मिल्नेछ।`,
    3: `मिथुन राशिका जातक ${sub.name}का लागि आज बौद्धिक कार्य र व्यापारमा सफलता मिल्नेछ। मित्रजनको सहयोग पाइनेछ।`,
    4: `कर्कट राशिका जातक ${sub.name}का लागि आज मान-सम्मान र आत्मसन्तुष्टि बढ्नेछ। मानसिक शान्ति रहनेछ।`,
    5: `सिंह राशिका जातक ${sub.name}का लागि आज पद-प्रतिष्ठा र नेतृत्व क्षमता उजागर हुनेछ। महत्वपूर्ण निर्णय लिन उपयुक्त दिन छ।`,
    6: `कन्या राशिका जातक ${sub.name}का लागि आज श्रमको उचित मूल्याङ्कन हुनेछ। धनआगम र नयाँ योजनाको थालनी हुनेछ।`,
    7: `तुला राशिका जातक ${sub.name}का लागि आज व्यवसायमा लाभ र दाम्पत्य जीवनमा मधुरता छाउनेछ। यात्रा फलदायी रहनेछ।`,
    8: `वृश्चिक राशिका जातक ${sub.name}का लागि आज गोपनीयता र धैर्यता आवश्यक छ। पराक्रमले कठिन कार्य पनि सम्पन्न हुनेछ।`,
    9: `धनु राशिका जातक ${sub.name}का लागि आज भाग्यले साथ दिनेछ। धार्मिक तथा आध्यात्मिक कार्यमा रुचि बढ्नेछ।`,
    10: `मकर राशिका जातक ${sub.name}का लागि आज कर्मक्षेत्रमा नयाँ जिम्मेवारी प्राप्त हुनेछ। सामाजिक प्रतिष्ठामा वृद्धि हुनेछ।`,
    11: `कुम्भ राशिका जातक ${sub.name}का लागि आज आम्दानीका स्रोतहरू खुल्नेछन्। दीर्घकालीन लगानीका लागि शुभ दिन छ।`,
    12: `मीन राशिका जातक ${sub.name}का लागि आज खर्चमा नियन्त्रण र संयम राख्नुहोला। शुभचिन्तकको सल्लाहले लाभ हुनेछ।`
  };

  const luckyColors = ['रातो (Red)', 'पहेँलो (Yellow)', 'हरियो (Green)', 'सेतो (White)', 'सुन्तला (Orange)', 'गुलाबी (Pink)', 'केशरी (Saffron)'];
  const luckyDirections = ['पूर्व (East)', 'उत्तर (North)', 'ईशान (North-East)', 'उत्तर-पश्चिम (North-West)', 'दक्षिण-पूर्व (South-East)'];
  const mantras = [
    'ॐ सूर्याय नमः',
    'ॐ सोमाय नमः',
    'ॐ भौमाय नमः',
    'ॐ बुधाय नमः',
    'ॐ बृहस्पतये नमः',
    'ॐ शुक्राय नमः',
    'ॐ शं शनैश्चराय नमः',
    'ॐ नमो नारायणाय'
  ];

  const rahuKaalFormatted = typeof todayPanchanga.rahuKaal === 'object'
    ? `${todayPanchanga.rahuKaal.start} देखि ${todayPanchanga.rahuKaal.end} सम्म`
    : (todayPanchanga.rahuKaal || 'अपराह्न ०१:३० देखि ०३:००');

  return {
    subscriber: sub,
    panchanga: todayPanchanga,
    todayBS: todayPanchanga.dateBS || 'आज',
    todayAD: todayPanchanga.dateAD || 'Today',
    dailyForecast: {
      overallScore: score,
      ratingText,
      description: forecastDescriptions[rashiId] || forecastDescriptions[1],
      careerMoney: 'व्यापार तथा नोकरीमा प्रगति, आयआर्जनका नयाँ बाटाहरू खुल्ने योग।',
      healthFamily: 'पारिवारिक सौहार्दता, स्वास्थ्य सबल रहने र मानसिक उत्साह रहनेछ।',
      cautions: 'अनावश्यक वादविवादबाट बच्नुहोला र राहुकालको समयमा नयाँ सम्झौता नगर्नुहोला।'
    },
    muhurtha: {
      amritBela: 'बिहान ०७:०० देखि ०८:३० सम्म',
      shubhaBela: 'बिहान ०९:१५ देखि १०:४५ सम्म',
      rahuKaal: rahuKaalFormatted,
      yamaghanta: 'बिहान ११:०० देखि १२:१५ सम्म',
      abhijitMuhurtha: 'मध्याह्न ११:४२ देखि १२:३२ सम्म (अत्यन्त शुभ)',
      auspiciousGuidance: 'आजको दिन नयाँ काम, मन्त्र जप तथा महत्वपूर्ण यात्राका लागि अभिजित र शुभ वेला उत्तम छ।'
    },
    grahaGochar: {
      moonPosition: `${sub.moonRashiName} राशिमा गोचर स्थिति`,
      taraBala: 'अनुकूल (ताराबल सबल)',
      chandraBala: 'उत्तम चन्द्रबल',
      transitSummary: 'बृहस्पति र सूर्यको अनुकूल दृष्टिले आत्मबल उच्च रहनेछ। शनि तथा मङ्गलको सन्तुलित प्रभाव।'
    },
    luckyFactors: {
      color: luckyColors[(rashiId + 2) % luckyColors.length],
      number: toDevanagariNumerals((rashiId * 3) % 9 + 1),
      direction: luckyDirections[rashiId % luckyDirections.length],
      mantra: mantras[(rashiId) % mantras.length]
    }
  };
}

/**
 * Formats a WhatsApp message string with rich Vedic markdown
 */
export function formatDailyWhatsAppMessage(
  report: PersonalizedDailyVedicReport,
  orgName: string = 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा',
  orgPhone: string = '+९७७-९७६४४००५३३'
): string {
  const { subscriber: sub, panchanga, dailyForecast, muhurtha, luckyFactors, todayBS } = report;

  return `卐 ॐ नमो भगवते वासुदेवाय। 卐
🌅 *दैनिक बिहान ७:०० बजेको वैदिक फलादेश तथा पञ्चाङ्ग*

आदरणीय जातक: *${sub.name}* ज्यू
📅 *मिति:* वि.सं. ${todayBS} (${panchanga.dayNameNepali})
🌙 *तपाईंको चन्द्र राशि:* ${sub.moonRashiName} (जन्मनक्षत्र: ${sub.nakshatraName})
━━━━━━━━━━━━━━━━━━━━

✨ *१. आजको व्यक्तिगत फलादेश:*
• *शुभता स्तर:* ${dailyForecast.ratingText} (${toDevanagariNumerals(dailyForecast.overallScore)}/१००)
• *दैनिक फल:* ${dailyForecast.description}
• *आर्थिक/कार्य:* ${dailyForecast.careerMoney}
• *पारिवारिक:* ${dailyForecast.healthFamily}
• *सावधानी:* ${dailyForecast.cautions}

⏱️ *२. आजको शुभ मुहूर्त तथा राहुकाल:*
• 🟢 *शुभ/अमृत बेला:* ${muhurtha.shubhaBela}
• 🟢 *अभिजित मुहूर्त:* ${muhurtha.abhijitMuhurtha}
• 🔴 *वर्जित राहुकाल:* ${muhurtha.rahuKaal} (नयाँ काम नथाल्नुहोला)

🪔 *३. आजको पञ्चाङ्ग सारांश:*
• तिथि: ${panchanga.tithi.name} (${panchanga.tithi.paksha} पक्ष)
• नक्षत्र: ${panchanga.nakshatra.name}
• योग: ${panchanga.yoga.name} | करण: ${panchanga.karana.name}
• सूर्योदय: ${panchanga.sunrise || '०५:५४'} | सूर्यास्त: ${panchanga.sunset || '१८:२५'}

🍀 *४. आजको शुभ कारकहरू:*
• शुभ रङ्ग: ${luckyFactors.color}
• शुभ अङ्क: ${luckyFactors.number}
• शुभ दिशा: ${luckyFactors.direction}
• 📿 *दैनिक मन्त्र:* ${luckyFactors.mantra}

━━━━━━━━━━━━━━━━━━━━
📄 *नोट:* तपाईंको दैनिक व्यक्तिगत A4 PDF प्रतिवेदन संलग्न गरिएको छ।
🏛️ *सेवा प्रदायक:* ${orgName}
📞 *सम्पर्क:* ${orgPhone}

✨ *शुभं भवतु! तपाईंको दिन सुखद र मङ्गलमय रहोस्!* ✨`;
}

/**
 * Builds WhatsApp direct send URL
 */
export function buildWhatsAppDirectUrl(phoneNumber: string, message: string): string {
  let digits = phoneNumber.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10 && (digits.startsWith('98') || digits.startsWith('97') || digits.startsWith('96'))) {
    digits = `977${digits}`;
  }
  const encoded = encodeURIComponent(message);
  return digits
    ? `https://api.whatsapp.com/send?phone=${digits}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
}

/**
 * Checks if the 7:00 AM dispatch is due today
 */
export function isDispatchDueToday(schedule: DailyWhatsAppScheduleConfig, todayBS: string): boolean {
  if (!schedule.autoSendEnabled) return false;
  if (schedule.lastDispatchedDateBS === todayBS) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [targetHour, targetMin] = (schedule.sendTime || '07:00').split(':').map(Number);
  const targetMinutes = (targetHour || 7) * 60 + (targetMin || 0);

  return currentMinutes >= targetMinutes;
}
