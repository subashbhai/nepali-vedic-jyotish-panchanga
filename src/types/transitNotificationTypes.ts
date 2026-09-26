import { PlanetName, RashiName } from './astrology';

export type TransitAlertCategory =
  | 'guru' // वृहस्पति गोचर
  | 'shani' // शनि गोचर तथा साढेसाती / ढैय्या
  | 'rahu_ketu' // राहु-केतु अक्ष परिवर्तन
  | 'surya' // सूर्य संक्रान्ति
  | 'mangal' // मङ्गल गोचर
  | 'budha' // बुध गोचर
  | 'shukra' // शुक्र गोचर
  | 'chandra' // चन्द्र गोचर / अष्टम चन्द्र
  | 'vakri'; // वक्री / मार्गी ग्रह

export type TransitAlertSeverity =
  | 'maha_parivartan' // महा-परिवर्तन (High life impact / Major transit)
  | 'shubha' // शुभ तथा लाभकारी
  | 'alert' // सचेत / सावधानी आवश्यक
  | 'madhyam'; // सामान्य / मध्यम प्रभाव

export interface TransitAlertItem {
  id: string;
  category: TransitAlertCategory;
  planet: PlanetName;
  transitRashi: RashiName;
  houseFromMoon: number; // 1 - 12
  houseFromLagna?: number; // 1 - 12
  isRetrograde?: boolean;
  severity: TransitAlertSeverity;
  title: string;
  subtitle: string;
  personalizedSummary: string;
  keyAreas: string[];
  detailedForecast: string;
  remedies: string[];
  dosAndDonts?: {
    do: string[];
    dont: string[];
  };
  validityNoteNepali?: string;
  timestamp: string;
  isRead?: boolean;
  audioFrequency?: number;
}

export interface TransitNotificationPreferences {
  enabled: boolean;
  alertGuru: boolean;
  alertShani: boolean;
  alertShaniSadeSati: boolean;
  alertRahuKetu: boolean;
  alertSurya: boolean;
  alertMangal: boolean;
  alertBudha: boolean;
  alertShukra: boolean;
  alertChandraAshtama: boolean;
  alertVakri: boolean;
  soundEnabled: boolean;
}

export interface TransitNotificationHistoryEntry {
  id: string;
  alertId: string;
  title: string;
  body: string;
  category: TransitAlertCategory;
  planet: PlanetName;
  severity: TransitAlertSeverity;
  sentAt: string;
  read: boolean;
}
