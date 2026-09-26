export type ClientThemeId = 'vedic_gold' | 'midnight_dark' | 'royal_maroon' | 'temple_ivory' | 'forest_sage';

export interface ClientThemeConfig {
  id: ClientThemeId;
  nameNepali: string;
  nameEnglish: string;
  descriptionNepali: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  previewClass: string;
}

export const CLIENT_THEMES: ClientThemeConfig[] = [
  {
    id: 'vedic_gold',
    nameNepali: '🌟 स्वर्ण वैदिक (Vedic Gold)',
    nameEnglish: 'Vedic Gold',
    descriptionNepali: 'परम्परागत पहेँलो-सुनौलो र मन्दिरको तामा रङ्ग (क्लासिक मानक)',
    primaryColor: '#D97706',
    accentColor: '#B45309',
    bgGradient: 'from-amber-500/10 via-orange-500/5 to-white dark:to-stone-900',
    previewClass: 'bg-amber-600 text-white',
  },
  {
    id: 'royal_maroon',
    nameNepali: '🍷 शाही म्यारून (Royal Maroon)',
    nameEnglish: 'Royal Maroon',
    descriptionNepali: 'सिन्दूर, रक्तचन्दन तथा वैदिक यज्ञको दिव्य म्यारून रङ्ग',
    primaryColor: '#7A1C1C',
    accentColor: '#9B2C2C',
    bgGradient: 'from-red-900/15 via-red-800/10 to-stone-950',
    previewClass: 'bg-[#7A1C1C] text-amber-200',
  },
  {
    id: 'midnight_dark',
    nameNepali: '🌙 खगोलीय कृष्ण (Celestial Midnight)',
    nameEnglish: 'Celestial Midnight',
    descriptionNepali: 'नक्षत्र तथा नवग्रह दृष्टिगोचर हुने गहिरो रातको निलो-कालो रङ्ग',
    primaryColor: '#3B82F6',
    accentColor: '#1D4ED8',
    bgGradient: 'from-blue-950/30 via-slate-900/40 to-stone-950',
    previewClass: 'bg-slate-900 text-blue-300 border border-blue-500/40',
  },
  {
    id: 'temple_ivory',
    nameNepali: '🏛️ मन्दिर आइभोरी (Temple Ivory)',
    nameEnglish: 'Temple Ivory',
    descriptionNepali: 'शान्त शङ्ख, श्रीखण्ड चन्दन र भोजपत्रको सौम्य उज्यालो रङ्ग',
    primaryColor: '#A16207',
    accentColor: '#CA8A04',
    bgGradient: 'from-stone-100 via-amber-50/40 to-white dark:from-stone-900 dark:to-stone-950',
    previewClass: 'bg-stone-200 text-stone-900 border border-stone-300',
  },
  {
    id: 'forest_sage',
    nameNepali: '🍃 हरित तुलसी (Sacred Sage)',
    nameEnglish: 'Sacred Sage',
    descriptionNepali: 'तुलसीपत्र, बेलपत्र तथा दुर्वाङ्कुरको पवित्र हरियो रङ्ग',
    primaryColor: '#059669',
    accentColor: '#047857',
    bgGradient: 'from-emerald-900/15 via-teal-900/10 to-stone-950',
    previewClass: 'bg-emerald-700 text-emerald-100',
  },
];

const STORAGE_KEY_CLIENT_THEME = 'balananda_client_theme_choice_v2';

export function getStoredClientTheme(): ClientThemeId {
  if (typeof window === 'undefined') return 'vedic_gold';
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLIENT_THEME);
    if (raw && CLIENT_THEMES.some((t) => t.id === raw)) {
      return raw as ClientThemeId;
    }
  } catch {}
  return 'vedic_gold';
}

export function setClientTheme(themeId: ClientThemeId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CLIENT_THEME, themeId);
    applyThemeToDOM(themeId);
    window.dispatchEvent(new CustomEvent('client-theme-changed', { detail: { themeId } }));
  } catch (e) {
    console.error('Failed to set client theme:', e);
  }
}

export function applyThemeToDOM(themeId: ClientThemeId): void {
  if (typeof document === 'undefined') return;
  try {
    const root = document.documentElement;
    root.setAttribute('data-client-theme', themeId);

    // Remove previous theme classes
    CLIENT_THEMES.forEach((t) => {
      root.classList.remove(`theme-${t.id}`);
    });
    root.classList.add(`theme-${themeId}`);

    const theme = CLIENT_THEMES.find((t) => t.id === themeId);
    if (theme) {
      root.style.setProperty('--client-primary', theme.primaryColor);
      root.style.setProperty('--client-accent', theme.accentColor);
    }

    if (themeId === 'midnight_dark') {
      root.classList.add('dark');
    } else {
      // Check if user explicitly set dark mode in astrology settings
      try {
        const settingsRaw = localStorage.getItem('balananda_astro_settings');
        if (settingsRaw) {
          const s = JSON.parse(settingsRaw);
          if (s.themeMode !== 'dark') {
            root.classList.remove('dark');
          }
        } else {
          root.classList.remove('dark');
        }
      } catch {
        root.classList.remove('dark');
      }
    }
  } catch (e) {
    console.error('applyThemeToDOM error:', e);
  }
}

export const getClientTheme = getStoredClientTheme;
export const applyClientThemeToDOM = applyThemeToDOM;

