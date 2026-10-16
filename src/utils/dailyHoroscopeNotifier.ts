import { BirthDetails, PanchangaData, PlanetPosition } from '../types/astrology';
import { RASHI_DATA } from './astroCalculations';
import { getDailyRashifalForRashi } from '../db/rashifalStore';
import { calculateChandrabala } from './muhurtaEngine';

export interface QuickHoroscopeInsight {
  rashiName: string;
  rashiId: number;
  overallRating: number;
  summary: string;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  luckyTime: string;
}

/**
 * Calculates a quick, personalized daily horoscope summary based on the active profile's Moon sign,
 * Lagna, Chandrabala, and today's Panchanga data using the authentic Vedic engine.
 */
export function generateQuickHoroscopeInsight(
  profile: BirthDetails | null,
  moonRashiName: string = 'मेष',
  todayPanchanga: PanchangaData,
  lagnaRashiName?: string
): QuickHoroscopeInsight {
  const profileName = profile?.name?.trim() || 'जातक';
  const rashi = RASHI_DATA.find((r) => r.name === moonRashiName) || RASHI_DATA[0];
  const rashiId = rashi.id;

  // Retrieve authentic classical Vedic attributes from rashifalStore
  const dailyItem = getDailyRashifalForRashi(rashiId);

  // Determine Transit Moon Rashi from today's Panchanga
  let transitMoonRashiId = 1;
  if (todayPanchanga?.moonRashi) {
    const transitRashi = RASHI_DATA.find((r) => r.name === todayPanchanga.moonRashi);
    if (transitRashi) transitMoonRashiId = transitRashi.id;
  }

  // Calculate authentic Chandrabala
  const chandrabala = calculateChandrabala(rashiId, transitMoonRashiId);

  let overallRating = dailyItem.overallScore || 80;
  let summary = dailyItem.overallSummary;

  if (chandrabala) {
    if (chandrabala.isFavorable) {
      overallRating = Math.max(overallRating, 82);
      summary = `जातक ${profileName}का लागि आज ${moonRashiName} राशिमा ${chandrabala.statusNepali} अनुकूल रहेकाले आत्मबल, पराक्रम र नयाँ योजनाहरू थाल्न अत्यन्त शुभ रहनेछ। सोचेका कार्यहरू उत्साहका साथ सम्पन्न हुनेछन्।`;
    } else if (chandrabala.houseFromMoon === 4 || chandrabala.houseFromMoon === 8 || chandrabala.houseFromMoon === 12) {
      overallRating = Math.min(overallRating, 62);
      summary = `जातक ${profileName}का लागि आज ${moonRashiName} राशिमा ${chandrabala.statusNepali} (भाव ${chandrabala.houseFromMoon}) रहेकाले अनावश्यक खर्च, हतारका निर्णय र वादविवादबाट बच्नुहोला। संयमित भई दिन व्यतीत गर्नु उत्तम हुनेछ।`;
    } else {
      overallRating = 72;
      summary = `जातक ${profileName}का लागि आज ${moonRashiName} राशिमा मध्यम चन्द्रबल रहेकाले दैनिक कार्यहरू सामान्य रूपमा अघि बढ्नेछन्। इष्टदेवको आराधना गरी कर्मशील रहनुहोला।`;
    }
  }

  return {
    rashiName: moonRashiName,
    rashiId,
    overallRating,
    summary,
    luckyColor: dailyItem.luckyColor || 'पहेंलो',
    luckyNumber: dailyItem.luckyNumber || '३',
    luckyDirection: dailyItem.luckyDirection || 'पूर्व',
    luckyTime: dailyItem.favorableTime || 'बिहान ०८:१५ देखि १०:०० सम्म',
  };
}

const STORAGE_KEYS = {
  PUSH_ENABLED: 'daily_horoscope_push_enabled',
  NOTIF_LAST_SENT_PREFIX: 'daily_horoscope_notif_sent_',
  BANNER_DISMISSED_PREFIX: 'daily_horoscope_banner_dismissed_',
};

export function isDailyHoroscopePushEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.PUSH_ENABLED) === 'true';
}

export function setDailyHoroscopePushEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PUSH_ENABLED, enabled ? 'true' : 'false');
}

export function isDailyBannerDismissed(todayDateStr: string, profileId: string = 'default'): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${STORAGE_KEYS.BANNER_DISMISSED_PREFIX}${todayDateStr}_${profileId}`) === 'true';
}

export function setDailyBannerDismissed(todayDateStr: string, profileId: string = 'default', dismissed: boolean): void {
  if (typeof window === 'undefined') return;
  if (dismissed) {
    localStorage.setItem(`${STORAGE_KEYS.BANNER_DISMISSED_PREFIX}${todayDateStr}_${profileId}`, 'true');
  } else {
    localStorage.removeItem(`${STORAGE_KEYS.BANNER_DISMISSED_PREFIX}${todayDateStr}_${profileId}`);
  }
}

/**
 * Checks if browser notification API is supported
 */
export function isBrowserNotificationSupported(): boolean {
  try {
    return typeof window !== 'undefined' && 'Notification' in window && typeof Notification.requestPermission === 'function';
  } catch {
    return false;
  }
}

/**
 * Gets current notification permission
 */
export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  try {
    return Notification.permission;
  } catch {
    return 'unsupported';
  }
}

/**
 * Requests browser notification permission
 */
export async function requestHoroscopeNotificationPermission(): Promise<NotificationPermission> {
  if (!isBrowserNotificationSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return 'denied';
  }
}

/**
 * Sends a native Web Notification for the daily horoscope
 */
export function sendHoroscopeWebNotification(params: {
  profileName: string;
  moonRashi: string;
  todayBS: string;
  luckyColor: string;
  luckyNumber: string;
  overallRating: number;
  onNavigateToHoroscope?: () => void;
}): boolean {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = `⭐ ${params.profileName}को दैनिक राशिफल (${params.todayBS})`;
    const body = `चन्द्र राशि: ${params.moonRashi} (अनुकूलता ${params.overallRating}%) | शुभ रङ्ग: ${params.luckyColor}, भाग्य अङ्क: ${params.luckyNumber}। आजको विस्तृत फलादेश हेर्न ट्याप गर्नुहोस्।`;

    const notification = new Notification(title, {
      body,
      tag: `daily_horoscope_${params.todayBS}`,
      icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%2392400E"/><circle cx="50" cy="50" r="38" fill="%23D97706"/><text x="50" y="58" font-size="28" font-family="serif" text-anchor="middle" fill="%23FFF8E7">ॐ</text></svg>',
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (params.onNavigateToHoroscope) {
        params.onNavigateToHoroscope();
      } else {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'rashifal' }));
      }
    };

    return true;
  } catch (err) {
    console.warn('Failed to send daily horoscope notification:', err);
    return false;
  }
}

/**
 * Checks whether an automatic notification should be sent for today, and sends it if eligible
 */
export function checkAndSendAutoDailyHoroscopeNotification(params: {
  todayDateStr: string;
  profileId: string;
  profileName: string;
  moonRashi: string;
  todayBS: string;
  luckyColor: string;
  luckyNumber: string;
  overallRating: number;
  onNavigateToHoroscope?: () => void;
}): boolean {
  if (!isDailyHoroscopePushEnabled()) return false;
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') return false;

  const key = `${STORAGE_KEYS.NOTIF_LAST_SENT_PREFIX}${params.todayDateStr}_${params.profileId}`;
  if (localStorage.getItem(key) === 'true') {
    // Already sent for today
    return false;
  }

  const sent = sendHoroscopeWebNotification(params);
  if (sent) {
    localStorage.setItem(key, 'true');
  }
  return sent;
}
