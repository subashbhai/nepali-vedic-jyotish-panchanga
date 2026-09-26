import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Palette,
  Eye,
  Info,
  SlidersHorizontal,
  X,
  Compass,
  ArrowRight,
  ShieldAlert,
  Star,
  CheckCircle2,
  HelpCircle,
  Sun,
  Moon,
  Flame,
  Zap,
  Globe,
  Sparkle
} from 'lucide-react';
import { LagnaInfo, PlanetPosition, RashiName } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import {
  calculateSinglePlanetAspects,
  calculateAspectArrowPath,
  CalculatedAspectItem,
  formatPlanetDegreesMinutes,
  getPlanetStateDescriptionNepali,
  getPlanetStatusSuffix
} from '../../utils/aspectEngine';
import { evaluateGrahaPhalList, evaluateBhavaPhalList } from '../../utils/faladeshEngine';
import { evaluateAllYogasAndDoshas } from '../../utils/yogaEngine';

export interface KundaliChartPanelProps {
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  chartTitle?: string;
  showControlBar?: boolean;
  interactive?: boolean;
  showLegendBar?: boolean;
}

type ColorMode = 'shastric' | 'planet' | 'classic' | 'monochrome';
type DegreeDisplayMode = 'ddmm' | 'deg' | 'none';

export interface PlanetShastricColor {
  textColorLight: string;
  textColorDark: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  shastricName: string;
}

export const VEDIC_SHASTRIC_COLORS: Record<string, PlanetShastricColor> = {
  'सूर्य': {
    textColorLight: '#991B1B', // माणिक्य / रक्त ताम्र
    textColorDark: '#FCA5A5',
    bgLight: '#FEF2F2',
    bgDark: '#450A0A',
    borderLight: '#FECACA',
    borderDark: '#7F1D1D',
    shastricName: 'माणिक्य (Ruby Red)',
  },
  'चन्द्र': {
    textColorLight: '#1D4ED8', // मोती / चन्द्रकान्त
    textColorDark: '#93C5FD',
    bgLight: '#EFF6FF',
    bgDark: '#172554',
    borderLight: '#BFDBFE',
    borderDark: '#1E3A8A',
    shastricName: 'मुक्ता / मोती (Pearl White)',
  },
  'मंगल': {
    textColorLight: '#C2410C', // विद्रुम / प्रवाल / मुगा
    textColorDark: '#FDBA74',
    bgLight: '#FFF7ED',
    bgDark: '#431407',
    borderLight: '#FED7AA',
    borderDark: '#9A3412',
    shastricName: 'प्रवाल / मुगा (Coral Red)',
  },
  'बुध': {
    textColorLight: '#047857', // मरकत / पन्ना / हरित
    textColorDark: '#6EE7B7',
    bgLight: '#ECFDF5',
    bgDark: '#064E3B',
    borderLight: '#A7F3D0',
    borderDark: '#065F46',
    shastricName: 'मरकत / पन्ना (Emerald Green)',
  },
  'गुरु': {
    textColorLight: '#B45309', // पुष्पराज / पुखराज / पीतमणि
    textColorDark: '#FCD34D',
    bgLight: '#FFFBEB',
    bgDark: '#451A03',
    borderLight: '#FDE68A',
    borderDark: '#78350F',
    shastricName: 'पुष्पराज / पुखराज (Topaz Yellow)',
  },
  'शुक्र': {
    textColorLight: '#BE185D', // वज्र / हीरा / स्फटिक
    textColorDark: '#F472B6',
    bgLight: '#FDF2F8',
    bgDark: '#500724',
    borderLight: '#FBCFE8',
    borderDark: '#831843',
    shastricName: 'वज्र / हीरा (Diamond Pink)',
  },
  'शनि': {
    textColorLight: '#312E81', // नीलम / इन्द्रनील / नीलवर्ण
    textColorDark: '#A5B4FC',
    bgLight: '#EEF2FF',
    bgDark: '#1E1B4B',
    borderLight: '#C7D2FE',
    borderDark: '#3730A3',
    shastricName: 'नीलम / इन्द्रनील (Sapphire Blue)',
  },
  'राहु': {
    textColorLight: '#334155', // गोमेद / धूम्रवर्ण
    textColorDark: '#94A3B8',
    bgLight: '#F1F5F9',
    bgDark: '#0F172A',
    borderLight: '#CBD5E1',
    borderDark: '#334155',
    shastricName: 'गोमेद / धूम्र (Hessonite Slate)',
  },
  'केतु': {
    textColorLight: '#78350F', // वैदूर्य / लहुसनियां / कर्बुर
    textColorDark: '#FBBF24',
    bgLight: '#FEF3C7',
    bgDark: '#451A03',
    borderLight: '#FDE68A',
    borderDark: '#78350F',
    shastricName: 'वैदूर्य / लसुनियां (Cat\'s Eye Amber)',
  },
  'लग्न': {
    textColorLight: '#7A1C1C', // सिन्दूर / केसरी
    textColorDark: '#FCA5A5',
    bgLight: '#FFF1F2',
    bgDark: '#4C0519',
    borderLight: '#FECDD3',
    borderDark: '#9F1239',
    shastricName: 'सिन्दूरी (Vermilion)',
  },
};

interface HouseAnchor {
  rashiX: number;
  rashiY: number;
  rashiNameX: number;
  rashiNameY: number;
  planetX: number;
  planetY: number;
  stepY: number;
}

const HOUSE_ANCHORS: Record<number, HouseAnchor> = {
  1:  { rashiX: 200, rashiY: 34,  rashiNameX: 200, rashiNameY: 50,  planetX: 200, planetY: 72,  stepY: 18 },
  2:  { rashiX: 104, rashiY: 22,  rashiNameX: 104, rashiNameY: 34,  planetX: 104, planetY: 52,  stepY: 17 },
  3:  { rashiX: 28,  rashiY: 65,  rashiNameX: 28,  rashiNameY: 80,  planetX: 42,  planetY: 104, stepY: 18 },
  4:  { rashiX: 104, rashiY: 148, rashiNameX: 104, rashiNameY: 164, planetX: 104, planetY: 186, stepY: 18 },
  5:  { rashiX: 28,  rashiY: 236, rashiNameX: 28,  rashiNameY: 251, planetX: 44,  planetY: 278, stepY: 18 },
  6:  { rashiX: 104, rashiY: 320, rashiNameX: 104, rashiNameY: 334, planetX: 104, planetY: 354, stepY: 18 },
  7:  { rashiX: 200, rashiY: 244, rashiNameX: 200, rashiNameY: 260, planetX: 200, planetY: 280, stepY: 18 },
  8:  { rashiX: 296, rashiY: 320, rashiNameX: 296, rashiNameY: 334, planetX: 296, planetY: 354, stepY: 18 },
  9:  { rashiX: 372, rashiY: 236, rashiNameX: 372, rashiNameY: 251, planetX: 356, planetY: 278, stepY: 18 },
  10: { rashiX: 296, rashiY: 148, rashiNameX: 296, rashiNameY: 164, planetX: 296, planetY: 186, stepY: 18 },
  11: { rashiX: 372, rashiY: 65,  rashiNameX: 372, rashiNameY: 80,  planetX: 356, planetY: 104, stepY: 18 },
  12: { rashiX: 296, rashiY: 22,  rashiNameX: 296, rashiNameY: 34,  planetX: 296, planetY: 52,  stepY: 17 },
};

const RASHI_NAME_MAP: Record<number, RashiName> = {
  1: 'मेष', 2: 'वृष', 3: 'मिथुन', 4: 'कर्कट', 5: 'सिंह', 6: 'कन्या',
  7: 'तुला', 8: 'वृश्चिक', 9: 'धनु', 10: 'मकर', 11: 'कुम्भ', 12: 'मीन',
};

const RASHI_LORD_MAP: Record<number, string> = {
  1: 'मंगल', 2: 'शुक्र', 3: 'बुध', 4: 'चन्द्र', 5: 'सूर्य', 6: 'बुध',
  7: 'शुक्र', 8: 'मंगल', 9: 'गुरु', 10: 'शनि', 11: 'शनि', 12: 'गुरु',
};

// House Significations & Title
const BHAVA_INFO_MAP: Record<number, {
  name: string;
  title: string;
  naturalMeaning: string;
  significations: string[];
}> = {
  1: {
    name: 'प्रथम भाव',
    title: 'लग्न भाव',
    naturalMeaning: 'शरीर, आत्मा, र व्यक्ति स्वयम्‌को मुख्य केन्द्र',
    significations: ['शरीर', 'व्यक्तित्व', 'स्वभाव', 'स्वास्थ्य', 'आत्मविश्वास', 'जीवनको सामान्य अवस्था', 'शारीरिक बनावट', 'रोगप्रतिरोध क्षमता']
  },
  2: {
    name: 'द्वितीय भाव',
    title: 'धन र वाणी भाव',
    naturalMeaning: 'सञ्चित कोष, परिवार र वाक् शक्ति',
    significations: ['धन-सम्पत्ति', 'वाणी र भाषा', 'परिवार र कुटुम्ब', 'खानपान', 'प्राथमिक शिक्षा', 'सञ्चित कोष', 'दाहिने आँखा', 'दाँत र मुख']
  },
  3: {
    name: 'तृतीय भाव',
    title: 'सहज र पराक्रम भाव',
    naturalMeaning: 'साहस, भ्रातृ सुख र सञ्चार',
    significations: ['साहस र पराक्रम', 'दाजुभाइ/सहोदर', 'छोटो दूरीको यात्रा', 'सञ्चार र लेखन', 'हातको सीप', 'कला', 'कँध र पाखुरा']
  },
  4: {
    name: 'चतुर्थ भाव',
    title: 'सुख र माता भाव',
    naturalMeaning: 'मानसिक सुख, आमा र अचल सम्पत्ति',
    significations: ['माता र मातृसुख', 'घर-जग्गा र अचल सम्पत्ति', 'सवारी साधन सुख', 'मानसिक शान्ति', 'उच्च शिक्षा', 'मातृभूमि', 'छाती र हृदय']
  },
  5: {
    name: 'पञ्चम भाव',
    title: 'बुद्धि र सन्तान भाव',
    naturalMeaning: 'ज्ञान, बुद्धि र पूर्वपुण्य',
    significations: ['सन्तान सुख', 'बुद्धि र विवेक', 'ज्ञान र विद्या', 'पूर्वपुण्य', 'मन्त्र र साधना', 'प्रेम र सिर्जनशीलता', 'पेट र पाचन प्रणाली']
  },
  6: {
    name: 'षष्ठ भाव',
    title: 'रिपु, रोग र ऋण भाव',
    naturalMeaning: 'प्रतिस्पर्धा, स्वास्थ्य चुनौती र दायित्व',
    significations: ['रोग र स्वास्थ्य समस्या', 'ऋण र दायित्व', 'शत्रु र प्रतिद्वन्द्वी', 'प्रतिस्पर्धा', 'सेवा र कार्यक्षेत्र', 'मामावली', 'आन्द्रा']
  },
  7: {
    name: 'सप्तम भाव',
    title: 'विवाह र साझेदारी भाव',
    naturalMeaning: 'जीवनसाथी, व्यापार र जनसम्पर्क',
    significations: ['विवाह र जीवनसाथी', 'व्यापारिक साझेदारी', 'कामवासना र आकर्षण', 'दैनिक व्यापार', 'जनसम्पर्क', 'विदेश यात्रा', 'मूत्र प्रणाली']
  },
  8: {
    name: 'अष्टम भाव',
    title: 'आयु र संकट भाव',
    naturalMeaning: 'आयु, गुप्त ज्ञान र रूपान्तरण',
    significations: ['आयु र जीवनकाल', 'गुप्त धन र वसीयत', 'अनुसन्धान र गूढ विद्या', 'अकस्मात् संकट/लाभ', 'रूपान्तरण', 'ससुराली', 'दीर्घकालीन विषय']
  },
  9: {
    name: 'नवम भाव',
    title: 'धर्म र भाग्य भाव',
    naturalMeaning: 'भाग्य, धर्म र उच्च ज्ञान',
    significations: ['भाग्य र समृद्धि', 'धर्म र अध्यात्म', 'पिता र गुरु', 'तीर्थयात्रा र लामो यात्रा', 'उच्च अध्ययन', 'सत्कर्म', 'तिघ्रा र जोर्नी']
  },
  10: {
    name: 'दशम भाव',
    title: 'कर्म र राज्य भाव',
    naturalMeaning: 'करियर, पद-प्रतिष्ठा र सार्वजनिक जीवन',
    significations: ['करियर र पेशा', 'पद र प्रतिष्ठा', 'राजकीय सम्मान', 'व्यापारिक सफलता', 'उत्तरदायित्व', 'पितृसुख', 'घोँडा र घुँडा']
  },
  11: {
    name: 'एकादश भाव',
    title: 'आय र लाभ भाव',
    naturalMeaning: 'आम्दानी, सिद्धि र मित्र मण्डली',
    significations: ['आम्दानी र लाभ', 'इच्छा पूर्ति', 'ज्येष्ठ भ्राता/भगिनी', 'मित्र मण्डली र सञ्जाल', 'सफलता', 'उपलब्धि', 'पिँडुला']
  },
  12: {
    name: 'द्वादश भाव',
    title: 'व्यय र मोक्ष भाव',
    naturalMeaning: 'खर्च, विदेश र मोक्ष',
    significations: ['खर्च र हानि', 'विदेश वास र यात्रा', 'अस्पताल वा एकान्त वास', 'मोक्ष र अध्यात्म', 'शयन सुख', 'त्याग', 'पाखुरा र पैताला']
  }
};

const PLANET_KARAKATVA_MAP: Record<string, string> = {
  'सूर्य': 'आत्मा, पिता, अधिकार, नेतृत्व, स्वास्थ्य, आत्मबल, सरकारी पद, हड्डी',
  'चन्द्र': 'मन, माता, भावना, मानसिक शान्ति, जल, सौन्दर्य, रक्तसञ्चार',
  'मंगल': 'साहस, भ्राता, भूमि, पराक्रम, रक्त, सेना/प्रहरी, ऊर्जा, सहनशीलता',
  'बुध': 'बुद्धि, वाणी, व्यापार, गणित, तर्क, सञ्चार, छाला, मित्र',
  'गुरु': 'ज्ञान, धर्म, गुरु, सन्तान, भाग्य, सुख, धन, विवेक, कलेजो',
  'शुक्र': 'सौन्दर्य, कला, विवाह, जीवनसाथी, प्रेम, वाहन, विलासिता, कामदेव',
  'शनि': 'आयु, कर्म, न्याय, सेवक, अनुशासन, दुःख, धैर्य, जोर्नी/स्नायु',
  'राहु': 'अनुसन्धान, प्रविधि, विदेश, भ्रम, महत्त्वाकांक्षा, अकस्मात् सफलता/अवरोध',
  'केतु': 'अध्यात्म, मोक्ष, गूढ ज्ञान, वैराग्य, त्याग, अनुसन्धान, अन्तर्दृष्टि'
};

// Planet Colors Specification
export const PLANET_COLOR_PALETTE: Record<string, { light: string; dark: string; bg: string; border: string }> = {
  'सूर्य': { light: '#EA580C', dark: '#FB923C', bg: 'bg-orange-100 dark:bg-orange-950/60', border: 'border-orange-300 dark:border-orange-800' },
  'चन्द्र': { light: '#1D4ED8', dark: '#60A5FA', bg: 'bg-blue-100 dark:bg-blue-950/60', border: 'border-blue-300 dark:border-blue-800' },
  'मंगल': { light: '#DC2626', dark: '#F87171', bg: 'bg-red-100 dark:bg-red-950/60', border: 'border-red-300 dark:border-red-800' },
  'बुध': { light: '#059669', dark: '#34D399', bg: 'bg-emerald-100 dark:bg-emerald-950/60', border: 'border-emerald-300 dark:border-emerald-800' },
  'गुरु': { light: '#D97706', dark: '#FBBF24', bg: 'bg-amber-100 dark:bg-amber-950/60', border: 'border-amber-300 dark:border-amber-800' },
  'शुक्र': { light: '#DB2777', dark: '#F472B6', bg: 'bg-pink-100 dark:bg-pink-950/60', border: 'border-pink-300 dark:border-pink-800' },
  'शनि': { light: '#4C1D95', dark: '#C084FC', bg: 'bg-purple-100 dark:bg-purple-950/60', border: 'border-purple-300 dark:border-purple-800' },
  'राहु': { light: '#0284C7', dark: '#38BDF8', bg: 'bg-sky-100 dark:bg-sky-950/60', border: 'border-sky-300 dark:border-sky-800' },
  'केतु': { light: '#78350F', dark: '#F59E0B', bg: 'bg-amber-100 dark:bg-amber-950/60', border: 'border-amber-300 dark:border-amber-800' },
  'लग्न': { light: '#B91C1C', dark: '#FB923C', bg: 'bg-orange-100 dark:bg-orange-950/60', border: 'border-orange-300 dark:border-orange-800' },
};

export function formatDDMM(degree: number, minutes?: number, useDevanagari: boolean = true): string {
  const d = Math.floor(degree || 0);
  let m = minutes !== undefined && minutes !== null ? Math.floor(minutes) : Math.floor(((degree || 0) - d) * 60);
  if (m < 0) m = 0;
  if (m >= 60) m = 59;

  const dStr = useDevanagari ? toDevanagariNumerals(d) : String(d);
  const mStr = useDevanagari ? toDevanagariNumerals(m) : String(m);
  return `${dStr}°${mStr}′`;
}

// 12 House Polygons in 400x400 SVG canvas
const HOUSE_POLYGONS: Record<number, string> = {
  1:  "200,8 296,104 200,200 104,104",
  2:  "8,8 200,8 104,104",
  3:  "8,8 104,104 8,200",
  4:  "104,104 200,200 104,296 8,200",
  5:  "8,200 104,296 8,392",
  6:  "8,392 104,296 200,392",
  7:  "200,200 296,296 200,392 104,296",
  8:  "200,392 296,296 392,392",
  9:  "296,296 392,200 392,392",
  10: "200,200 296,104 392,200 296,296",
  11: "296,104 392,8 392,200",
  12: "200,8 392,8 296,104",
};

export const KundaliChartPanel: React.FC<KundaliChartPanelProps> = memo(({
  lagna,
  planets,
  chartTitle = 'मुख्य जन्मकुण्डली (लग्न)',
  showControlBar = true,
  interactive = true,
  showLegendBar = true,
}) => {
  // Settings State
  const [colorMode, setColorMode] = useState<ColorMode>('shastric');
  const [showPlanetBadges, setShowPlanetBadges] = useState<boolean>(true);
  const [degreeMode, setDegreeMode] = useState<DegreeDisplayMode>('ddmm');
  const [showRashiNames, setShowRashiNames] = useState<boolean>(true);
  const [useDevanagari, setUseDevanagari] = useState<boolean>(true);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dark mode reactive detection for SVG element styling
  const [isDark, setIsDark] = useState<boolean>(false);
  useEffect(() => {
    const checkDark = () => {
      setIsDark(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }
    return () => observer.disconnect();
  }, []);

  // Interactive Hover State (ONLY active when cursor is over an element)
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetPosition | null>(null);

  // Selected Detail State for Modal Popup (ONLY opens on Click)
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);

  const lagnaRashiId = lagna.rashiId || 1;

  // Escape Key Listener to Close Modal Popups or Exit Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedHouse !== null || selectedPlanet !== null) {
          setSelectedHouse(null);
          setSelectedPlanet(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedHouse, selectedPlanet, isFullscreen]);

  // Build house map (1..12)
  const housesMap = useMemo(() => {
    const map: Record<number, { houseNumber: number; rashiId: number; rashiName: RashiName; rashiLord: string; planets: PlanetPosition[] }> = {};

    for (let h = 1; h <= 12; h++) {
      const rId = ((lagnaRashiId - 1 + h - 1) % 12) + 1;
      map[h] = {
        houseNumber: h,
        rashiId: rId,
        rashiName: RASHI_NAME_MAP[rId] || 'मेष',
        rashiLord: RASHI_LORD_MAP[rId] || 'मंगल',
        planets: [],
      };
    }

    // Lagna marker fake planet
    const lagnaPlanet: any = {
      id: 'lagna_marker',
      name: 'लग्न',
      englishName: 'Lagna',
      symbol: 'ल',
      longitude: 0,
      degree: Math.floor(lagna.degree || 0),
      minutes: Math.floor(((lagna.degree || 0) - Math.floor(lagna.degree || 0)) * 60),
      seconds: 0,
      formattedDegree: formatDDMM(lagna.degree || 0, undefined, useDevanagari),
      rashiId: lagna.rashiId,
      rashiName: lagna.rashiName,
      nakshatraId: 1,
      nakshatraName: lagna.nakshatraName,
      nakshatraLord: '',
      pada: lagna.pada,
      bhava: 1,
      speed: 0,
      isRetrograde: false,
      isCombust: false,
      dignity: 'स्वक्षेत्र',
    };

    map[1].planets.push(lagnaPlanet);

    planets.forEach((p) => {
      let houseNum = p.bhava;
      if (!houseNum || houseNum < 1 || houseNum > 12) {
        houseNum = ((p.rashiId - lagnaRashiId + 12) % 12) + 1;
      }
      if (map[houseNum]) {
        map[houseNum].planets.push(p);
      }
    });

    return map;
  }, [lagna, planets, lagnaRashiId, useDevanagari]);

  // Houses list array
  const housesList = useMemo(() => {
    return Object.values(housesMap);
  }, [housesMap]);

  // Evaluate Faladesh Engines
  const grahaPhalReport = useMemo(() => {
    return evaluateGrahaPhalList(planets, lagna);
  }, [planets, lagna]);

  const bhavaPhalReport = useMemo(() => {
    return evaluateBhavaPhalList(planets, lagna);
  }, [planets, lagna]);

  const yogasAndDoshas = useMemo(() => {
    try {
      return evaluateAllYogasAndDoshas(lagna, planets);
    } catch (err) {
      return { yogas: [], doshas: [] };
    }
  }, [lagna, planets]);

  // Compute Active Aspect Items & SVG Arrow Paths (ONLY WHEN HOVERED!)
  const computedAspectArrows = useMemo(() => {
    // RULE #1 & #4: No permanent arrows! Only show when hovering over a planet or house
    if (!hoveredPlanet && !hoveredHouse) {
      return [];
    }

    const arrows: Array<{
      aspectItem: CalculatedAspectItem;
      pathD: string;
      sourceHouse: number;
      targetHouse: number;
    }> = [];

    // Case A: Hovering over a planet -> show arrows to houses aspected by that planet
    if (hoveredPlanet && hoveredPlanet.id !== 'lagna_marker') {
      const srcHouse = hoveredPlanet.bhava;
      const aspects = calculateSinglePlanetAspects(hoveredPlanet, srcHouse, housesList);
      const anchor = HOUSE_ANCHORS[srcHouse];
      const hPlanets = housesMap[srcHouse]?.planets || [];
      const pIdx = Math.max(0, hPlanets.findIndex((p) => p.id === hoveredPlanet.id));

      const planetCoords = anchor
        ? { x: anchor.planetX, y: anchor.planetY + pIdx * anchor.stepY }
        : undefined;

      aspects.forEach((asp, idx) => {
        const arrowGeo = calculateAspectArrowPath(srcHouse, asp.targetHouseNumber, idx, aspects.length, planetCoords);
        if (arrowGeo) {
          arrows.push({
            aspectItem: asp,
            pathD: arrowGeo.pathD,
            sourceHouse: srcHouse,
            targetHouse: asp.targetHouseNumber,
          });
        }
      });
    }
    // Case B: Hovering over a house -> show arrows pointing into this house from aspecting planets
    else if (hoveredHouse) {
      const tgtHouse = hoveredHouse;
      planets.forEach((p) => {
        if (p.id === 'lagna_marker') return;
        const srcHouse = p.bhava;
        const pAspects = calculateSinglePlanetAspects(p, srcHouse, housesList);
        const matchingAspect = pAspects.find((a) => a.targetHouseNumber === tgtHouse);

        if (matchingAspect) {
          const anchor = HOUSE_ANCHORS[srcHouse];
          const hPlanets = housesMap[srcHouse]?.planets || [];
          const pIdx = Math.max(0, hPlanets.findIndex((item) => item.id === p.id));
          const planetCoords = anchor
            ? { x: anchor.planetX, y: anchor.planetY + pIdx * anchor.stepY }
            : undefined;

          const arrowGeo = calculateAspectArrowPath(srcHouse, tgtHouse, 0, 1, planetCoords);
          if (arrowGeo) {
            arrows.push({
              aspectItem: matchingAspect,
              pathD: arrowGeo.pathD,
              sourceHouse: srcHouse,
              targetHouse: tgtHouse,
            });
          }
        }
      });
    }

    return arrows;
  }, [hoveredPlanet, hoveredHouse, planets, housesList, housesMap]);

  // Aspected Houses set for quick highlight during hover
  const aspectedHousesSet = useMemo(() => {
    const set = new Set<number>();
    computedAspectArrows.forEach((a) => set.add(a.targetHouse));
    return set;
  }, [computedAspectArrows]);

  // Selected House Detail for Modal Popup
  const selectedHouseData = useMemo(() => {
    if (!selectedHouse) return null;
    const hData = housesMap[selectedHouse];
    if (!hData) return null;

    const bInfo = BHAVA_INFO_MAP[selectedHouse] || {
      name: `भाव ${toDevanagariNumerals(selectedHouse)}`,
      title: 'भाव',
      naturalMeaning: 'सम्बन्धित जीवन क्षेत्र',
      significations: [],
    };

    const bPhal = bhavaPhalReport.find((b) => b.houseNumber === selectedHouse);

    // Planets aspecting this house
    const aspectingPlanetsList: Array<{ planetName: string; sourceHouse: number; drishtiText: string }> = [];
    planets.forEach((p) => {
      if (p.id === 'lagna_marker') return;
      const pAspects = calculateSinglePlanetAspects(p, p.bhava, housesList);
      const match = pAspects.find((a) => a.targetHouseNumber === selectedHouse);
      if (match) {
        aspectingPlanetsList.push({
          planetName: p.name,
          sourceHouse: p.bhava,
          drishtiText: match.drishtiTypeNepali,
        });
      }
    });

    // Filter relevant yogas for this house
    const relevantYogas = yogasAndDoshas.yogas.filter(
      (y) => y.housesInvolved && y.housesInvolved.includes(selectedHouse)
    );

    return {
      houseNumber: selectedHouse,
      rashiName: hData.rashiName,
      rashiLord: hData.rashiLord,
      info: bInfo,
      planets: hData.planets,
      aspectingPlanetsList,
      phal: bPhal,
      relevantYogas,
    };
  }, [selectedHouse, housesMap, bhavaPhalReport, planets, housesList, yogasAndDoshas]);

  // Selected Planet Detail for Modal Popup
  const selectedPlanetData = useMemo(() => {
    if (!selectedPlanet || selectedPlanet.id === 'lagna_marker') return null;
    const pPhal = grahaPhalReport.find((g) => g.planetNameNepali === selectedPlanet.name);
    const aspects = calculateSinglePlanetAspects(selectedPlanet, selectedPlanet.bhava, housesList);
    const stateDesc = getPlanetStateDescriptionNepali(selectedPlanet);

    // Filter relevant yogas for this planet
    const relevantYogas = yogasAndDoshas.yogas.filter(
      (y) => y.formingPlanets && y.formingPlanets.includes(selectedPlanet.name)
    );

    return {
      planet: selectedPlanet,
      phal: pPhal,
      aspects,
      stateDesc,
      karakatva: PLANET_KARAKATVA_MAP[selectedPlanet.name] || 'सम्बन्धित क्षेत्र',
      relevantYogas,
    };
  }, [selectedPlanet, grahaPhalReport, housesList, yogasAndDoshas]);

  // Planet color fill & badge background styling
  const getPlanetStyle = useCallback((planetName: string) => {
    if (colorMode === 'monochrome') {
      return {
        text: isDark ? '#F5F5F4' : '#1C1917',
        bg: isDark ? '#1C1917' : '#FFFFFF',
        border: isDark ? '#44403C' : '#D6D3D1',
      };
    }
    if (colorMode === 'classic') {
      return {
        text: isDark ? '#FBBF24' : '#7A1C1C',
        bg: isDark ? '#292524' : '#FFFDF9',
        border: isDark ? '#78350F' : '#E6E0D5',
      };
    }
    if (colorMode === 'shastric') {
      const s = VEDIC_SHASTRIC_COLORS[planetName] || VEDIC_SHASTRIC_COLORS['लग्न'];
      return {
        text: isDark ? s.textColorDark : s.textColorLight,
        bg: isDark ? s.bgDark : s.bgLight,
        border: isDark ? s.borderDark : s.borderLight,
      };
    }
    // Modern multi-color ('planet')
    const p = PLANET_COLOR_PALETTE[planetName] || PLANET_COLOR_PALETTE['लग्न'];
    return {
      text: isDark ? p.dark : p.light,
      bg: isDark ? '#292524' : '#FAF7F2',
      border: isDark ? '#44403C' : '#E6E0D5',
    };
  }, [colorMode, isDark]);

  const getPlanetFillStyle = useCallback((planetName: string) => {
    return getPlanetStyle(planetName).text;
  }, [getPlanetStyle]);

  // Hover handlers (ONLY set hover state, NO modal popup!)
  const handleHouseMouseEnter = useCallback((hNum: number) => {
    if (!interactive) return;
    setHoveredHouse(hNum);
  }, [interactive]);

  const handleHouseMouseLeave = useCallback(() => {
    setHoveredHouse(null);
  }, []);

  const handlePlanetMouseEnter = useCallback((p: PlanetPosition, e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    setHoveredPlanet(p);
  }, [interactive]);

  const handlePlanetMouseLeave = useCallback(() => {
    setHoveredPlanet(null);
  }, []);

  // Click handlers (ONLY open Modal Popup!)
  const handleHouseClick = useCallback((hNum: number) => {
    if (!interactive) return;
    setSelectedPlanet(null);
    setSelectedHouse(hNum);
  }, [interactive]);

  const handlePlanetClick = useCallback((p: PlanetPosition, e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    setSelectedHouse(null);
    if (p.id === 'lagna_marker') {
      setSelectedHouse(1);
      return;
    }
    setSelectedPlanet(p);
  }, [interactive]);

  // Reset selection
  const handleCloseModal = useCallback(() => {
    setSelectedHouse(null);
    setSelectedPlanet(null);
  }, []);

  // Backdrop click handler for modal
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  }, [handleCloseModal]);

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-40 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto'
          : 'w-full h-full flex flex-col'
      }
      onClick={(e) => {
        if (isFullscreen && e.target === e.currentTarget) {
          setIsFullscreen(false);
        }
      }}
    >
      <div
        className={`bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm flex flex-col justify-between transition-all ${
          isFullscreen
            ? 'w-full max-w-xl mx-auto shadow-2xl border-amber-400 dark:border-amber-600 my-auto'
            : 'w-full h-full'
        }`}
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif leading-tight">
                {chartTitle} {isFullscreen && <span className="text-xs text-amber-600 dark:text-amber-400 font-sans font-bold">(पूर्ण पर्दा)</span>}
              </h3>
              <div className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <span>उत्तर भारतीय शैली</span>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Interactive अस्थायी दृष्टि</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {showControlBar && (
              <button
                type="button"
                onClick={() => setIsControlsOpen(!isControlsOpen)}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isControlsOpen
                    ? 'bg-[#7A1C1C] text-white'
                    : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#EAE4D9]'
                }`}
                title="विकल्पहरू"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">विकल्प</span>
              </button>
            )}

            {/* Dedicated Fullscreen / Exit Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                isFullscreen
                  ? 'bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-900 dark:text-red-300 border-red-300 dark:border-red-800'
                  : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-[#7A1C1C] dark:text-amber-300 border-amber-300 dark:border-amber-800'
              }`}
              title={isFullscreen ? 'सामान्य दृश्यमा फर्कनुहोस् (Esc)' : 'पूर्ण पर्दा (Full Screen)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>बन्द (Esc)</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>पूर्ण पर्दा</span>
                </>
              )}
            </button>
          </div>
        </div>

      {/* Control Drawer Options */}
      {showControlBar && isControlsOpen && (
        <div className="p-3 bg-[#FAF7F2] dark:bg-stone-800/80 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-xs space-y-2.5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1 flex items-center gap-1">
                <Palette className="w-3 h-3 text-amber-700" />
                <span>रङ योजना (रङ शैली):</span>
              </label>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ColorMode)}
                className="w-full bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-700 rounded-lg p-1.5 text-xs font-bold text-stone-800 dark:text-stone-200"
              >
                <option value="shastric">ग्रहको आफ्नै रङ्ग अनुसार (Vedic Shastric Colors)</option>
                <option value="planet">आधुनिक बहु-रङ्गी (Multi-Color)</option>
                <option value="classic">परम्परागत (Classic Red/Gold)</option>
                <option value="monochrome">प्रिन्ट/ब्ल्याक (Print B&W)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1 flex items-center gap-1">
                <Sparkle className="w-3 h-3 text-amber-700" />
                <span>ग्रह ब्याज (ब्याकग्राउन्ड):</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPlanetBadges(!showPlanetBadges)}
                className={`w-full py-1.5 px-2 rounded-lg font-bold text-center border transition-all ${
                  showPlanetBadges
                    ? 'bg-amber-100 text-[#7A1C1C] border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
                }`}
              >
                {showPlanetBadges ? 'ब्याकग्राउन्ड सहित (अन)' : 'सादा पाठ मात्र (अफ)'}
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1 flex items-center gap-1">
                <Eye className="w-3 h-3 text-amber-700" />
                <span>डिग्री प्रदर्शन:</span>
              </label>
              <select
                value={degreeMode}
                onChange={(e) => setDegreeMode(e.target.value as DegreeDisplayMode)}
                className="w-full bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-700 rounded-lg p-1.5 text-xs font-bold text-stone-800 dark:text-stone-200"
              >
                <option value="ddmm">DD°MM′ (उदा: १८°२५′)</option>
                <option value="deg">डिग्री मात्र (उदा: १८°)</option>
                <option value="none">डिग्री नदेखाउने</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1">
                राशि नाम (मेष, वृष...):
              </label>
              <button
                onClick={() => setShowRashiNames(!showRashiNames)}
                className={`w-full py-1.5 px-2 rounded-lg font-bold text-center border transition-all ${
                  showRashiNames
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-300'
                }`}
              >
                {showRashiNames ? 'देखाइएको छ' : 'लुकाइएको छ'}
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1">
                अङ्क प्रणाली:
              </label>
              <button
                onClick={() => setUseDevanagari(!useDevanagari)}
                className="w-full py-1.5 px-2 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg font-bold text-center"
              >
                {useDevanagari ? 'नेपाली अङ्क (१, २, ३)' : 'अंग्रेजी अंक (1, 2, 3)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Kundali SVG Container (Compact & Static - No Zoom/Pan) */}
      <div
        className={`relative w-full aspect-square mx-auto bg-[#FFFDF9] dark:bg-stone-950 p-2 sm:p-3 rounded-2xl border-2 border-[#E6E0D5] dark:border-stone-800 shadow-md overflow-hidden select-none transition-all duration-200 my-auto ${
          isFullscreen ? 'max-w-[540px]' : 'max-w-[420px]'
        }`}
      >
        {/* Title Badge - Arranged cleanly with background pill badge so it never collides with the SVG frame */}
        <div className="absolute top-1 inset-x-0 flex justify-center pointer-events-none z-10">
          <div className="px-3.5 py-0.5 rounded-full bg-[#FFFDF9] dark:bg-stone-900 border border-[#7A1C1C]/40 dark:border-amber-500/50 shadow-xs flex items-center gap-1.5 backdrop-blur-xs">
            <span className="text-[9px] text-[#7A1C1C]/70 dark:text-amber-400/80 select-none">✦</span>
            <span className="text-[10.5px] sm:text-[11px] font-serif font-black text-[#7A1C1C] dark:text-amber-300 tracking-wider">
              जन्मकुण्डली
            </span>
            <span className="text-[9px] text-[#7A1C1C]/70 dark:text-amber-400/80 select-none">✦</span>
          </div>
        </div>

        <svg viewBox="0 0 400 400" className="w-full h-full stroke-[#7A1C1C] dark:stroke-amber-500/80 fill-none stroke-[1.8]">
          <defs>
            <marker
              id="aspectArrowHead"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" className="fill-amber-600 dark:fill-amber-400" />
            </marker>
          </defs>

          {/* 1. House Polygons */}
          {Object.entries(HOUSE_POLYGONS).map(([hStr, points]) => {
            const hNum = Number(hStr);
            const isHovered = hoveredHouse === hNum;
            const isAspectedTarget = aspectedHousesSet.has(hNum);

            let fillClass = 'fill-transparent hover:fill-amber-100/30 dark:hover:fill-amber-900/20';
            let strokeClass = 'stroke-[#7A1C1C] dark:stroke-amber-500/70 stroke-[1.5]';

            if (isHovered) {
              fillClass = 'fill-amber-200/35 dark:fill-amber-900/40';
              strokeClass = 'stroke-amber-600 dark:stroke-amber-300 stroke-[2.2]';
            } else if (isAspectedTarget) {
              fillClass = 'fill-emerald-100/30 dark:fill-emerald-950/40';
              strokeClass = 'stroke-emerald-600 dark:stroke-emerald-400 stroke-[2.0]';
            }

            return (
              <polygon
                key={`poly-${hNum}`}
                points={points}
                onClick={() => handleHouseClick(hNum)}
                onMouseEnter={() => handleHouseMouseEnter(hNum)}
                onMouseLeave={handleHouseMouseLeave}
                className={`transition-all duration-150 cursor-pointer ${fillClass} ${strokeClass}`}
              />
            );
          })}

          {/* 2. Chart Grid Lines */}
          <rect x="8" y="8" width="384" height="384" rx="4" className="stroke-[#7A1C1C] dark:stroke-amber-400 stroke-[2.8] pointer-events-none" />
          <line x1="8" y1="8" x2="392" y2="392" className="pointer-events-none" />
          <line x1="392" y1="8" x2="8" y2="392" className="pointer-events-none" />
          <polygon points="200,8 392,200 200,392 8,200" className="stroke-[#7A1C1C] dark:stroke-amber-400 stroke-[2.2] pointer-events-none" />

          {/* 3. Subtle Temporary Aspect Animated Arrows (ONLY on Hover!) */}
          {computedAspectArrows.map((a, idx) => {
            return (
              <g key={`aspect-arrow-${idx}`} className="pointer-events-none">
                <path
                  d={a.pathD}
                  className="stroke-amber-600 dark:stroke-amber-400 stroke-[1.5] fill-none transition-all opacity-85"
                  style={{
                    strokeDasharray: '4, 3',
                    animation: 'dash 1.2s linear infinite',
                  }}
                  markerEnd="url(#aspectArrowHead)"
                />
              </g>
            );
          })}

          {/* 4. House Labels, Rashis, and Planets */}
          {Object.entries(housesMap).map(([hStr, hData]) => {
            const houseNum = Number(hStr);
            const anchor = HOUSE_ANCHORS[houseNum];
            if (!anchor) return null;

            const isHouse1 = houseNum === 1;

            return (
              <g key={`house-content-${houseNum}`} className="pointer-events-none select-none">
                {/* Rashi Numeral */}
                <text
                  x={anchor.rashiX}
                  y={anchor.rashiY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-[#7A1C1C] dark:fill-amber-400 font-serif font-black text-[14px] stroke-none"
                >
                  {useDevanagari ? toDevanagariNumerals(hData.rashiId) : hData.rashiId}
                </text>

                {/* Rashi Name in Emerald Green */}
                {showRashiNames && (
                  <text
                    x={anchor.rashiNameX}
                    y={anchor.rashiNameY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-[#15803D] dark:fill-[#34D399] font-sans font-extrabold text-[11px] stroke-none tracking-tight"
                  >
                    {hData.rashiName}
                  </text>
                )}

                {/* Planets inside House */}
                <g className="stroke-none">
                  {hData.planets.map((p, pIdx) => {
                    const isLagnaMarker = p.id === 'lagna_marker';
                    const currentY = anchor.planetY + pIdx * anchor.stepY;
                    const isPHovered = hoveredPlanet?.id === p.id;
                    const planetStyle = getPlanetStyle(p.name);

                    let formattedDeg = '';
                    if (degreeMode === 'ddmm') {
                      formattedDeg = isLagnaMarker
                        ? formatDDMM(lagna.degree || 0, undefined, useDevanagari)
                        : formatDDMM(p.degree, p.minutes, useDevanagari);
                    } else if (degreeMode === 'deg') {
                      const dVal = Math.floor(isLagnaMarker ? (lagna.degree || 0) : (p.degree || 0));
                      formattedDeg = `${useDevanagari ? toDevanagariNumerals(dVal) : dVal}°`;
                    }

                    if (isLagnaMarker && isHouse1) {
                      const lagnaBadgeW = 82;
                      const lagnaBadgeH = formattedDeg ? 32 : 18;
                      const lagnaBadgeX = anchor.planetX - lagnaBadgeW / 2;
                      const lagnaBadgeY = currentY - 9;

                      return (
                        <g
                          key="lagna_text_group"
                          className="pointer-events-auto cursor-pointer"
                          onClick={(e) => handlePlanetClick(p, e)}
                          onMouseEnter={(e) => handlePlanetMouseEnter(p, e)}
                          onMouseLeave={handlePlanetMouseLeave}
                        >
                          {showPlanetBadges && (
                            <rect
                              x={lagnaBadgeX}
                              y={lagnaBadgeY}
                              width={lagnaBadgeW}
                              height={lagnaBadgeH}
                              rx={4}
                              ry={4}
                              fill={planetStyle.bg}
                              stroke={planetStyle.border}
                              strokeWidth={0.8}
                              className="transition-all duration-150"
                            />
                          )}
                          <text
                            x={anchor.planetX}
                            y={currentY}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={planetStyle.text}
                            className="font-sans font-black text-[11.5px] hover:underline"
                          >
                            लग्न ({lagna.rashiName})
                          </text>
                          {formattedDeg && (
                            <text
                              x={anchor.planetX}
                              y={currentY + 14}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={planetStyle.text}
                              className="font-sans font-bold text-[10.5px]"
                            >
                              {lagna.rashiName} {formattedDeg}
                            </text>
                          )}
                        </g>
                      );
                    }

                    const planetLabel = `${p.name}${formattedDeg ? ` ${formattedDeg}` : ''}`;
                    const badgeW = Math.max(48, Math.min(74, planetLabel.length * 6.0 + 8));
                    const badgeH = 15.5;
                    const badgeX = anchor.planetX - badgeW / 2;
                    const badgeY = currentY + (isHouse1 ? 15 : 0) - badgeH / 2;

                    return (
                      <g
                        key={`${p.id}-${pIdx}`}
                        className="pointer-events-auto cursor-pointer"
                        onClick={(e) => handlePlanetClick(p, e)}
                        onMouseEnter={(e) => handlePlanetMouseEnter(p, e)}
                        onMouseLeave={handlePlanetMouseLeave}
                      >
                        {showPlanetBadges && (
                          <rect
                            x={badgeX}
                            y={badgeY}
                            width={badgeW}
                            height={badgeH}
                            rx={3.5}
                            ry={3.5}
                            fill={planetStyle.bg}
                            stroke={planetStyle.border}
                            strokeWidth={0.8}
                            className="transition-all duration-150"
                          />
                        )}
                        <text
                          x={anchor.planetX}
                          y={currentY + (isHouse1 ? 15 : 0)}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={planetStyle.text}
                          className={`font-sans font-bold text-[10.5px] transition-all hover:scale-105 ${
                            isPHovered ? 'underline font-black fill-amber-600 dark:fill-amber-300' : ''
                          }`}
                        >
                          {planetLabel}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay (Small non-modal preview) */}
        {interactive && (hoveredHouse || hoveredPlanet) && (
          <div className="absolute top-2.5 left-2.5 right-2.5 pointer-events-none z-20">
            <div className="p-2 px-3 rounded-xl bg-stone-900/95 dark:bg-stone-100/95 text-white dark:text-stone-900 shadow-lg border border-stone-700/50 backdrop-blur-xs text-xs space-y-0.5 animate-in fade-in duration-100">
              {hoveredPlanet ? (
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 dark:text-amber-700 font-extrabold text-sm">{hoveredPlanet.name}</span>
                    <span className="text-[11px] opacity-90">({hoveredPlanet.rashiName} राशि • भाव {toDevanagariNumerals(hoveredPlanet.bhava)})</span>
                  </div>
                  <span className="font-mono text-[11px] text-amber-300 dark:text-amber-800 font-bold">
                    {formatDDMM(hoveredPlanet.degree, hoveredPlanet.minutes, useDevanagari)}
                  </span>
                </div>
              ) : hoveredHouse ? (
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-400 dark:text-amber-700 font-extrabold text-sm">
                    {BHAVA_INFO_MAP[hoveredHouse]?.name} ({BHAVA_INFO_MAP[hoveredHouse]?.title})
                  </span>
                  <span className="text-[11px] opacity-90">{housesMap[hoveredHouse]?.rashiName} राशि • स्वामी: {housesMap[hoveredHouse]?.rashiLord}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Instructions Banner */}
        {interactive && !selectedHouse && !selectedPlanet && (
          <div className="absolute bottom-1.5 inset-x-0 text-center pointer-events-none">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100/90 dark:bg-stone-800/90 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs">
              💡 {isFullscreen ? 'भाव वा ग्रह विश्लेषण हेर्न क्लिक गर्नुहोस्' : 'पूर्ण पर्दा • भाव वा ग्रह विश्लेषण हेर्न क्लिक गर्नुहोस्'}
            </span>
          </div>
        )}
      </div>

      {/* कुण्डली मुनि ग्रह स्थिति पट्टिका (वक्री / अस्त ग्रह स्थिति) */}
      <div className="w-full mt-2.5 px-3 py-1.5 bg-amber-50/90 dark:bg-stone-800/80 border border-amber-300 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 shadow-2xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
          <strong className="text-red-900 dark:text-red-300 font-bold">वक्री ग्रह (Retrograde):</strong>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {planets.filter((p) => p.isRetrograde).length > 0
              ? planets.filter((p) => p.isRetrograde).map((p) => p.name).join(', ')
              : 'कुनै छैन'}
          </span>
        </span>
        <span className="text-stone-300 dark:text-stone-600 hidden sm:inline">|</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <strong className="text-amber-900 dark:text-amber-300 font-bold">अस्त ग्रह (Combust):</strong>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {planets.filter((p) => p.isCombust).length > 0
              ? planets.filter((p) => p.isCombust).map((p) => p.name).join(', ')
              : 'कुनै छैन'}
          </span>
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. HOUSE DETAIL MODAL POPUP (Opens ONLY on Click)                         */}
      {/* ========================================================================= */}
      {selectedHouseData && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-stone-950/65 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={handleBackdropClick}
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-amber-300 dark:border-amber-700 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 relative text-xs animate-in zoom-in-95 duration-150">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition-all"
              title="बन्द गर्नुहोस् (Escape)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-stone-200 dark:border-stone-800 pb-3 pr-8 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#7A1C1C] text-amber-300 font-black rounded-lg text-sm font-serif">
                  {selectedHouseData.info.name}
                </span>
                <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-300">
                  {selectedHouseData.info.title}
                </h3>
              </div>
              <div className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2 pt-0.5">
                <span>राशि: <strong>{selectedHouseData.rashiName}</strong></span>
                <span>•</span>
                <span>भाव स्वामी: <strong>{selectedHouseData.rashiLord}</strong></span>
              </div>
            </div>

            {/* Natural Meaning & Significations */}
            <div className="p-3 bg-amber-50/80 dark:bg-stone-800/80 rounded-xl border border-amber-200 dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-[11.5px]">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>भावको प्राकृतिक अर्थ र प्रतिनिधित्व गर्ने क्षेत्रहरू:</span>
              </div>
              <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                {selectedHouseData.info.naturalMeaning}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedHouseData.info.significations.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 rounded-lg font-bold text-stone-800 dark:text-stone-200 text-[11px]"
                  >
                    • {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Planets in House Section */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-[#7A1C1C] dark:text-amber-400 text-xs uppercase tracking-wider">
                यस भावमा रहेका ग्रहहरू ({selectedHouseData.planets.length}):
              </h4>
              {selectedHouseData.planets.length === 0 ? (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-stone-500 italic text-center font-medium">
                  यस भावमा कुनै ग्रह स्थित छैन।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedHouseData.planets.map((p, idx) => {
                    if (p.id === 'lagna_marker') {
                      return (
                        <div key={idx} className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 flex items-center justify-between">
                          <span className="font-extrabold text-orange-900 dark:text-orange-200 text-xs"> लग्न ({lagna.rashiName})</span>
                          <span className="font-mono text-stone-800 dark:text-stone-200 font-bold">{formatDDMM(lagna.degree || 0, undefined, useDevanagari)}</span>
                        </div>
                      );
                    }
                    const pal = PLANET_COLOR_PALETTE[p.name] || PLANET_COLOR_PALETTE['लग्न'];
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${pal.bg} ${pal.border}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span style={{ color: pal.light }} className="font-black text-sm">{p.name}</span>
                          {p.isRetrograde && <span className="text-rose-700 dark:text-rose-400 text-[10px] font-bold">(वक्री)</span>}
                          {p.isCombust && <span className="text-amber-800 dark:text-amber-300 text-[10px] font-bold">(अस्त)</span>}
                          {p.dignity && <span className="text-emerald-800 dark:text-emerald-300 text-[10px]">[{p.dignity}]</span>}
                        </div>
                        <span className="font-mono text-stone-800 dark:text-stone-200 font-bold">{formatDDMM(p.degree, p.minutes, useDevanagari)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Aspects Received Section */}
            {selectedHouseData.aspectingPlanetsList.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-[#7A1C1C] dark:text-amber-400 text-xs uppercase tracking-wider">
                  यस भावमा दृष्टि दिने ग्रहहरू ({selectedHouseData.aspectingPlanetsList.length}):
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHouseData.aspectingPlanetsList.map((aspP, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-[#7A1C1C]/10 dark:bg-amber-950/80 border border-[#7A1C1C]/30 dark:border-amber-800 text-[#7A1C1C] dark:text-amber-300 rounded-xl font-bold flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{aspP.planetName}</span>
                      <span className="text-[11px] text-stone-600 dark:text-stone-300">(भाव {toDevanagariNumerals(aspP.sourceHouse)} बाट {aspP.drishtiText})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relevant Yogas */}
            {selectedHouseData.relevantYogas.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1">
                  <Sparkle className="w-3.5 h-3.5" />
                  <span>यस भावसँग सम्बन्धित विशेष योगहरू:</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedHouseData.relevantYogas.map((y, idx) => (
                    <div key={idx} className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800">
                      <strong className="text-emerald-900 dark:text-emerald-300 font-extrabold text-xs block mb-0.5">
                        {y.nameNepali} ({y.status})
                      </strong>
                      <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                        {y.category} • प्रभावित ग्रह/भाव: {y.housesInvolved?.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Classical Interpretation */}
            {selectedHouseData.phal && (
              <div className="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-amber-300 dark:border-amber-700 space-y-1.5">
                <span className="font-extrabold text-[#7A1C1C] dark:text-amber-400 text-xs flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-700 pb-1">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span>वैदिक ज्योतिषअनुसार भाव फलादेश (परम्परागत मान्यता):</span>
                </span>
                <p className="text-stone-800 dark:text-stone-200 leading-relaxed text-xs">
                  {selectedHouseData.phal.classicalInterpretationNepali}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PLANET DETAIL MODAL POPUP (Opens ONLY on Click)                       */}
      {/* ========================================================================= */}
      {selectedPlanetData && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-stone-950/65 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={handleBackdropClick}
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl border-2 border-amber-300 dark:border-amber-700 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 relative text-xs animate-in zoom-in-95 duration-150">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition-all"
              title="बन्द गर्नुहोस् (Escape)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-stone-200 dark:border-stone-800 pb-3 pr-8 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#7A1C1C] text-amber-300 font-black rounded-lg text-sm font-serif">
                  {selectedPlanetData.planet.name} ग्रह
                </span>
                <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-300">
                  भाव {toDevanagariNumerals(selectedPlanetData.planet.bhava)} ({selectedPlanetData.planet.rashiName} राशि)
                </h3>
              </div>
              <div className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2 pt-0.5">
                <span>डिग्री: <strong className="font-mono text-emerald-800 dark:text-emerald-400">{formatDDMM(selectedPlanetData.planet.degree, selectedPlanetData.planet.minutes, useDevanagari)}</strong></span>
                <span>•</span>
                <span>नक्षत्र: <strong>{selectedPlanetData.planet.nakshatraName} (पद {toDevanagariNumerals(selectedPlanetData.planet.pada)})</strong></span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-amber-50 dark:bg-stone-800 rounded-xl border border-amber-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400 block text-[10px] font-bold">राशि स्वामी:</span>
                <strong className="text-stone-800 dark:text-stone-200 text-xs font-black">{RASHI_LORD_MAP[selectedPlanetData.planet.rashiId]}</strong>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-stone-800 rounded-xl border border-amber-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400 block text-[10px] font-bold">अवस्था:</span>
                <strong className="text-amber-900 dark:text-amber-300 text-xs font-black">{selectedPlanetData.planet.dignity || 'समराशि'}</strong>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-stone-800 rounded-xl border border-amber-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400 block text-[10px] font-bold">गति / अवस्था:</span>
                <strong className="text-rose-800 dark:text-rose-300 text-xs font-black">
                  {selectedPlanetData.planet.isRetrograde ? 'वक्री' : 'मार्गी'} {selectedPlanetData.planet.isCombust ? '• अस्त' : ''}
                </strong>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-stone-800 rounded-xl border border-amber-200 dark:border-stone-700">
                <span className="text-stone-500 dark:text-stone-400 block text-[10px] font-bold">स्थिति विवरण:</span>
                <strong className="text-emerald-800 dark:text-emerald-300 text-xs font-black">{selectedPlanetData.stateDesc}</strong>
              </div>
            </div>

            {/* Karakatva */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="font-extrabold text-stone-700 dark:text-stone-300 text-xs uppercase tracking-wider block">
                ग्रहको मुख्य कारकत्व (प्रतिनिधित्व गर्ने विषयहरू):
              </span>
              <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-semibold">
                {selectedPlanetData.karakatva}
              </p>
            </div>

            {/* Aspected Houses */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-[#7A1C1C] dark:text-amber-400 text-xs uppercase tracking-wider">
                यस ग्रहको दृष्टि परेका भावहरू ({selectedPlanetData.aspects.length}):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPlanetData.aspects.map((asp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl font-bold flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="text-stone-800 dark:text-stone-200 text-xs">ભાવ {toDevanagariNumerals(asp.targetHouseNumber)} ({asp.targetRashiName})</span>
                    </div>
                    <span className="text-emerald-800 dark:text-emerald-400 text-[11px] font-extrabold">[{asp.drishtiTypeNepali}]</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Relevant Yogas */}
            {selectedPlanetData.relevantYogas.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1">
                  <Sparkle className="w-3.5 h-3.5" />
                  <span>यस ग्रहले निर्माण गरेका योगहरू:</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedPlanetData.relevantYogas.map((y, idx) => (
                    <div key={idx} className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800">
                      <strong className="text-emerald-900 dark:text-emerald-300 font-extrabold text-xs block mb-0.5">
                        {y.nameNepali} ({y.status})
                      </strong>
                      <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                        {y.category}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Classical Interpretation Section */}
            {selectedPlanetData.phal && (
              <div className="p-3.5 bg-white dark:bg-stone-800 rounded-xl border border-amber-300 dark:border-amber-700 space-y-2.5">
                <span className="font-extrabold text-[#7A1C1C] dark:text-amber-400 text-xs block border-b border-stone-200 dark:border-stone-700 pb-1.5">
                  {selectedPlanetData.planet.name} ग्रहको सम्भावित फल (परम्परागत मान्यताअनुसार):
                </span>
                <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                  {selectedPlanetData.phal.classicalSummaryNepali}
                </p>

                {/* Positive Effects */}
                {selectedPlanetData.phal.positiveEffects.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <strong className="text-emerald-800 dark:text-emerald-400 font-extrabold text-xs block">सकारात्मक पक्ष:</strong>
                    <ul className="list-disc list-inside space-y-1 text-stone-700 dark:text-stone-300 text-[11.5px]">
                      {selectedPlanetData.phal.positiveEffects.map((eff, i) => (
                        <li key={i}>{eff}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Challenges */}
                {selectedPlanetData.phal.challengesToWatch.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <strong className="text-amber-800 dark:text-amber-400 font-extrabold text-xs block">सावधानीका क्षेत्र:</strong>
                    <ul className="list-disc list-inside space-y-1 text-stone-700 dark:text-stone-300 text-[11.5px]">
                      {selectedPlanetData.phal.challengesToWatch.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  );
});

KundaliChartPanel.displayName = 'KundaliChartPanel';
