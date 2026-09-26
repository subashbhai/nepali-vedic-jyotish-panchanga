import React, { memo, useState, useMemo } from 'react';
import { 
  Clock,
  List,
  SlidersHorizontal,
  Sparkles,
  LayoutGrid,
  ChevronDown,
  Moon,
  Sun,
  ShieldCheck,
  Award,
  Flame,
  Gem,
  HeartHandshake,
  UserCheck,
  Plus
} from 'lucide-react';
import { BirthDetails, PanchangaData, LagnaInfo, PlanetPosition, DivisionalChartType } from '../../types/astrology';
import { toDevanagariNumerals, fromDevanagariNumerals, convertADToBS } from '../../utils/nepaliCalendar';
import { convertADToBSFull } from '../../utils/bsCalendarData';
import { NAKSHATRA_NAMAKSHARA_MAP } from '../../utils/panchangaEngine';
import { generateDivisionalChartEx } from '../../utils/vargaEngine';
import { evaluateVishaNadi } from '../../utils/vishaNadiEngine';
import { getParvaForDay } from '../../utils/parvaEngine';

export interface PanchangaPanelProps {
  panchanga: PanchangaData;
  profile?: BirthDetails;
  lagna?: LagnaInfo;
  planets?: PlanetPosition[];
  title?: string;
}

// Classical Dagdha Rashi Map by Tithi
const DAGDHA_RASHI_MAP: Record<string, string> = {
  'प्रतिपदा': 'तुला, मकर',
  'द्वितीया': 'धनु, मीन',
  'तृतीया': 'सिंह, मकर',
  'चतुर्थी': 'वृष, कुम्भ',
  'पञ्चमी': 'मिथुन, कन्या',
  'षष्ठी': 'मेष, सिंह',
  'सप्तमी': 'धनु, कर्कट',
  'अष्टमी': 'मिथुन, कन्या',
  'नवमी': 'सिंह, वृश्चिक',
  'दशमी': 'सिंह, वृश्चिक',
  'एकादशी': 'धनु, मीन',
  'द्वादशी': 'तुला, मकर',
  'त्रयोदशी': 'वृष, सिंह',
  'चतुर्दशी': 'मिथुन, कन्या, धनु, मीन',
  'पूर्णिमा': 'कुनै पनि होइन (दोषरहित)',
  'औंसी': 'कुनै पनि होइन (दोषरहित)',
  'अमावस्या': 'कुनै पनि होइन (दोषरहित)',
};

// Classical Visha Nadi / Ghati symbolic animal or element map
const NAKSHATRA_VISHA_MAP: Record<string, string> = {
  'अश्विनी': 'अश्व विष',
  'भरणी': 'सर्पको विष',
  'कृत्तिका': 'गिद्धको विष',
  'रोहिणी': 'बिच्छीको विष',
  'मृगशिरा': 'सिंहको विष',
  'आर्द्रा': 'हात्तीको विष',
  'पुनर्वसु': 'श्वानको विष',
  'पुष्य': 'मयूरको विष',
  'आश्लेषा': 'नागको विष',
  'मघा': 'अग्नि विष',
  'पूर्वाफाल्गुनी': 'व्याघ्रको विष',
  'उत्तराफाल्गुनी': 'अश्वको विष',
  'हस्त': 'भालुको विष',
  'चित्रा': 'मृगको विष',
  'स्वाती': 'गरुडको विष',
  'विशाखा': 'वानरको विष',
  'अनुराधा': 'मकरको विष',
  'ज्येष्ठा': 'मत्स्यको विष',
  'मूल': 'वाराहको विष',
  'पूर्वाषाढा': 'महिषको विष',
  'उत्तराषाढा': 'मण्डूकको विष',
  'श्रवण': 'कपोतको विष',
  'धनिष्ठा': 'वृषभको विष',
  'शतभिषा': 'मूषकको विष',
  'पूर्वाभाद्रपद': 'शशकको विष',
  'उत्तराभाद्रपद': 'वृश्चिकको विष',
  'रेवती': 'भ्रमरको विष',
};

// All 27 Nakshatras in order
const ALL_27_NAKSHATRAS = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा',
  'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी',
  'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्वाषाढा', 'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शतभिषा',
  'पूर्वाभाद्रपद', 'उत्तराभाद्रपद', 'रेवती'
];

const NAKSHATRA_LORDS_CYCLE = [
  'केतु', 'शुक्र', 'सूर्य', 'चन्द्र', 'मंगल', 'राहु', 'बृहस्पति', 'शनि', 'बुध'
];

const TARA_NAMES = [
  { id: 1, name: 'जन्म तारा', color: 'text-blue-700 dark:text-blue-400' },
  { id: 2, name: 'संपत तारा', color: 'text-emerald-700 dark:text-emerald-400' },
  { id: 3, name: 'विपत तारा', color: 'text-rose-700 dark:text-rose-400' },
  { id: 4, name: 'क्षेम तारा', color: 'text-sky-700 dark:text-sky-400' },
  { id: 5, name: 'प्रत्यक्ष तारा', color: 'text-amber-700 dark:text-amber-400' },
  { id: 6, name: 'साधन तारा', color: 'text-purple-700 dark:text-purple-400' },
  { id: 7, name: 'नैधन तारा', color: 'text-red-700 dark:text-red-400' },
  { id: 8, name: 'मित्र तारा', color: 'text-teal-700 dark:text-teal-400' },
  { id: 9, name: 'परम मित्र तारा', color: 'text-indigo-700 dark:text-indigo-400' }
];

// Helper to convert planet names to traditional short Devanagari abbreviation
function getPlanetShortAbbr(name: string): string {
  if (name.includes('सूर्य')) return 'सू';
  if (name.includes('चन्द्र') || name.includes('चन्द्रमा')) return 'च';
  if (name.includes('मंगल') || name.includes('मङ्गल')) return 'म';
  if (name.includes('बुध')) return 'बु';
  if (name.includes('गुरु') || name.includes('बृहस्पति')) return 'बृ';
  if (name.includes('शुक्र')) return 'शु';
  if (name.includes('शनि')) return 'श';
  if (name.includes('राहु')) return 'रा';
  if (name.includes('केतु')) return 'के';
  if (name.includes('लग्न')) return 'ल';
  return name.slice(0, 1);
}

// Classical Shubhachakra and Ashubhachakra Map by Moon Rashi
const SHUBHA_ASHUBHA_CHAKRA_MAP: Record<string, {
  shubha: {
    bhagyanka: string;
    shubhAnka: string;
    shubhRatna: string;
    shubhVaar: string;
    shubhGraha: string;
    shubhRashi: string;
    shubhRanga: string;
    shubhVarsha: string;
    shubhLagna: string;
  };
  ashubha: {
    ashubhMahina: string;
    ashubhLagna: string;
    ashubhVaar: string;
    ashubhNakshatra: string;
    ashubhYoga: string;
    ashubhKarana: string;
    ashubhRanga: string;
    ashubhTithi: string;
    ashubhRashi: string;
    ashubhCharan: string;
  };
}> = {
  'मेष': {
    shubha: {
      bhagyanka: '९',
      shubhAnka: '१, ३, ९',
      shubhRatna: 'मुगा',
      shubhVaar: 'मंगलबार, आइतबार',
      shubhGraha: 'मंगल, सूर्य, गुरु',
      shubhRashi: 'सिंह, धनु',
      shubhRanga: 'रातो, केशरी',
      shubhVarsha: '१८, २७, ३६, ४५',
      shubhLagna: 'मेष, सिंह, धनु'
    },
    ashubha: {
      ashubhMahina: 'कार्तिक',
      ashubhLagna: 'मेष',
      ashubhVaar: 'आइतबार',
      ashubhNakshatra: 'मघा',
      ashubhYoga: 'विष्कम्भ',
      ashubhKarana: 'बव',
      ashubhRanga: 'कालो',
      ashubhTithi: '१, ६, ११',
      ashubhRashi: 'कन्या',
      ashubhCharan: 'मघा (१)'
    }
  },
  'वृष': {
    shubha: {
      bhagyanka: '९',
      shubhAnka: '३, ५, ९',
      shubhRatna: 'हीरा',
      shubhVaar: 'शुक्र, शनि',
      shubhGraha: 'शुक्र, शनि, बुध',
      shubhRashi: 'वृष, तुला, मकर',
      shubhRanga: 'सेतो, गुलाबी',
      shubhVarsha: '२४, ३३, ४२, ५१',
      shubhLagna: 'वृष, कन्या, मकर'
    },
    ashubha: {
      ashubhMahina: 'माघ',
      ashubhLagna: 'मिथुन',
      ashubhVaar: 'शनिवार',
      ashubhNakshatra: 'हस्त',
      ashubhYoga: 'सुकर्मा',
      ashubhKarana: 'बव',
      ashubhRanga: 'रातो',
      ashubhTithi: 'पंचमी, दशमी, पूर्णिमा',
      ashubhRashi: 'मेष, सिंह',
      ashubhCharan: 'हस्त (१)'
    }
  },
  'मिथुन': {
    shubha: {
      bhagyanka: '५',
      shubhAnka: '१, ४, ५, ७',
      shubhRatna: 'पन्ना',
      shubhVaar: 'बुधबार, शुक्रवार',
      shubhGraha: 'बुध, शुक्र, शनि',
      shubhRashi: 'तुला, कुम्भ',
      shubhRanga: 'हरियो, हल्का नीलो',
      shubhVarsha: '२३, ३२, ४१, ५०',
      shubhLagna: 'मिथुन, तुला, कुम्भ'
    },
    ashubha: {
      ashubhMahina: 'पौष',
      ashubhLagna: 'मिथुन',
      ashubhVaar: 'सोमबार',
      ashubhNakshatra: 'स्वाती',
      ashubhYoga: 'गण्ड',
      ashubhKarana: 'तैतिल',
      ashubhRanga: 'पहेंलो',
      ashubhTithi: '२, ७, १२',
      ashubhRashi: 'मकर',
      ashubhCharan: 'स्वाती (२)'
    }
  },
  'कर्कट': {
    shubha: {
      bhagyanka: '२',
      shubhAnka: '२, ४, ७, ९',
      shubhRatna: 'मोती',
      shubhVaar: 'सोमबार, मंगलबार',
      shubhGraha: 'चन्द्र, मंगल, गुरु',
      shubhRashi: 'वृश्चिक, मीन',
      shubhRanga: 'सेतो, क्रिम',
      shubhVarsha: '१६, २४, २५, ३३',
      shubhLagna: 'कर्कट, वृश्चिक, मीन'
    },
    ashubha: {
      ashubhMahina: 'माघ',
      ashubhLagna: 'कन्या',
      ashubhVaar: 'बुधबार',
      ashubhNakshatra: 'अनुराधा',
      ashubhYoga: 'व्याघात',
      ashubhKarana: 'गर',
      ashubhRanga: 'रातो',
      ashubhTithi: '२, ७, १२',
      ashubhRashi: 'कुम्भ',
      ashubhCharan: 'अनुराधा (४)'
    }
  },
  'सिंह': {
    shubha: {
      bhagyanka: '१',
      shubhAnka: '१, ३, ५, ९',
      shubhRatna: 'माणिक्य',
      shubhVaar: 'आइतबार, मंगलबार',
      shubhGraha: 'सूर्य, मंगल, गुरु',
      shubhRashi: 'मेष, धनु',
      shubhRanga: 'रातो, सुन्तला',
      shubhVarsha: '१९, २८, ३७, ४६',
      shubhLagna: 'सिंह, मेष, धनु'
    },
    ashubha: {
      ashubhMahina: 'फाल्गुन',
      ashubhLagna: 'मकर',
      ashubhVaar: 'बिहीबार',
      ashubhNakshatra: 'मूल',
      ashubhYoga: 'वज्र',
      ashubhKarana: 'वणिज',
      ashubhRanga: 'निलो',
      ashubhTithi: '३, ८, १३',
      ashubhRashi: 'मीन',
      ashubhCharan: 'मूल (१)'
    }
  },
  'कन्या': {
    shubha: {
      bhagyanka: '५',
      shubhAnka: '२, ५, ६, ७',
      shubhRatna: 'पन्ना',
      shubhVaar: 'बुधबार, शुक्रवार',
      shubhGraha: 'बुध, शुक्र, शनि',
      shubhRashi: 'वृष, मकर',
      shubhRanga: 'हरियो, हल्का पहेंलो',
      shubhVarsha: '२३, ३२, ४१, ५०',
      shubhLagna: 'कन्या, वृष, मकर'
    },
    ashubha: {
      ashubhMahina: 'चैत्र',
      ashubhLagna: 'मीन',
      ashubhVaar: 'शनिवार',
      ashubhNakshatra: 'श्रवण',
      ashubhYoga: 'व्यतीपात',
      ashubhKarana: 'विष्टि',
      ashubhRanga: 'रातो',
      ashubhTithi: '५, १०, १५',
      ashubhRashi: 'मेष',
      ashubhCharan: 'श्रवण (३)'
    }
  },
  'तुला': {
    shubha: {
      bhagyanka: '६',
      shubhAnka: '३, ६, ९',
      shubhRatna: 'हीरा',
      shubhVaar: 'शुक्रवार, शनिवार',
      shubhGraha: 'शुक्र, शनि, बुध',
      shubhRashi: 'मिथुन, कुम्भ',
      shubhRanga: 'सेतो, हल्का निलो',
      shubhVarsha: '१५, २४, ३३, ४२',
      shubhLagna: 'तुला, मिथुन, कुम्भ'
    },
    ashubha: {
      ashubhMahina: 'वैशाख',
      ashubhLagna: 'धनु',
      ashubhVaar: 'बिहीबार',
      ashubhNakshatra: 'शतभिषा',
      ashubhYoga: 'परिघ',
      ashubhKarana: 'शकुनि',
      ashubhRanga: 'कालो',
      ashubhTithi: '४, ९, १४',
      ashubhRashi: 'वृष',
      ashubhCharan: 'शतभिषा (२)'
    }
  },
  'वृश्चिक': {
    shubha: {
      bhagyanka: '९',
      shubhAnka: '१, ३, ९',
      shubhRatna: 'मुगा',
      shubhVaar: 'मंगलबार, आइतबार',
      shubhGraha: 'मंगल, सूर्य, गुरु',
      shubhRashi: 'कर्कट, मीन',
      shubhRanga: 'रातो, केशरी',
      shubhVarsha: '१८, २७, ३६, ४५',
      shubhLagna: 'वृश्चिक, कर्कट, मीन'
    },
    ashubha: {
      ashubhMahina: 'ज्येष्ठ',
      ashubhLagna: 'वृषभ',
      ashubhVaar: 'शुक्रबार',
      ashubhNakshatra: 'रेवती',
      ashubhYoga: 'वैधृति',
      ashubhKarana: 'चतुष्पद',
      ashubhRanga: 'पहेंलो',
      ashubhTithi: '१, ६, ११',
      ashubhRashi: 'मिथुन',
      ashubhCharan: 'रेवती (४)'
    }
  },
  'धनु': {
    shubha: {
      bhagyanka: '३',
      shubhAnka: '३, ६, ९',
      shubhRatna: 'पुखराज',
      shubhVaar: 'बिहीबार, आइतबार',
      shubhGraha: 'गुरु, सूर्य, मंगल',
      shubhRashi: 'मेष, सिंह',
      shubhRanga: 'पहेंलो, सुनौलो',
      shubhVarsha: '१२, २१, ३०, ४८',
      shubhLagna: 'धनु, मेष, सिंह'
    },
    ashubha: {
      ashubhMahina: 'आषाढ',
      ashubhLagna: 'धनु',
      ashubhVaar: 'शुक्रबार',
      ashubhNakshatra: 'भरणी',
      ashubhYoga: 'वज्र',
      ashubhKarana: 'तैतिल',
      ashubhRanga: 'निलो',
      ashubhTithi: '३, ८, १३',
      ashubhRashi: 'मीन',
      ashubhCharan: 'भरणी (१)'
    }
  },
  'मकर': {
    shubha: {
      bhagyanka: '८',
      shubhAnka: '६, ८, ९',
      shubhRatna: 'नीलम',
      shubhVaar: 'शनिवार, शुक्रवार',
      shubhGraha: 'शनि, शुक्र, बुध',
      shubhRashi: 'वृष, कन्या',
      shubhRanga: 'निलो, कालो, हरियो',
      shubhVarsha: '१७, २६, ३५, ४४',
      shubhLagna: 'मकर, वृष, कन्या'
    },
    ashubha: {
      ashubhMahina: 'श्रावण',
      ashubhLagna: 'कुम्भ',
      ashubhVaar: 'मंगलबार',
      ashubhNakshatra: 'रोहिणी',
      ashubhYoga: 'अतिगण्ड',
      ashubhKarana: 'नाग',
      ashubhRanga: 'पहेंलो',
      ashubhTithi: '४, ९, १४',
      ashubhRashi: 'सिंह',
      ashubhCharan: 'रोहिणी (३)'
    }
  },
  'कुम्भ': {
    shubha: {
      bhagyanka: '८',
      shubhAnka: '३, ७, ८',
      shubhRatna: 'नीलम',
      shubhVaar: 'शनिवार, बुधवार',
      shubhGraha: 'शनि, शुक्र, बुध',
      shubhRashi: 'मिथुन, तुला',
      shubhRanga: 'कालो, हल्का निलो',
      shubhVarsha: '१७, २६, ३५, ४४',
      shubhLagna: 'कुम्भ, मिथुन, तुला'
    },
    ashubha: {
      ashubhMahina: 'भाद्र',
      ashubhLagna: 'मिथुन',
      ashubhVaar: 'बिहीबार',
      ashubhNakshatra: 'आर्द्रा',
      ashubhYoga: 'सुकर्मा',
      ashubhKarana: 'किंस्तुघ्न',
      ashubhRanga: 'हरियो',
      ashubhTithi: '३, ८, १३',
      ashubhRashi: 'कन्या',
      ashubhCharan: 'आर्द्रा (४)'
    }
  },
  'मीन': {
    shubha: {
      bhagyanka: '३',
      shubhAnka: '१, ३, ४, ९',
      shubhRatna: 'पुखराज',
      shubhVaar: 'बिहीबार, सोमबार',
      shubhGraha: 'गुरु, चन्द्र, मंगल',
      shubhRashi: 'कर्कट, वृश्चिक',
      shubhRanga: 'पहेंलो, केशरी',
      shubhVarsha: '१२, २१, ३०, ३९',
      shubhLagna: 'मीन, कर्कट, वृश्चिक'
    },
    ashubha: {
      ashubhMahina: 'आश्विन',
      ashubhLagna: 'कर्कट',
      ashubhVaar: 'शुक्रबार',
      ashubhNakshatra: 'आश्लेषा',
      ashubhYoga: 'धृति',
      ashubhKarana: 'बालव',
      ashubhRanga: 'कालो',
      ashubhTithi: '५, १०, १५',
      ashubhRashi: 'तुला',
      ashubhCharan: 'आश्लेषा (१)'
    }
  }
};

export const PanchangaPanel: React.FC<PanchangaPanelProps> = memo(({
  panchanga,
  profile,
  lagna,
  planets,
  title = 'जन्मकालीन पञ्चाङ्ग',
}) => {
  // 5 Active Tabs: 'janmakalin' (Clock) | 'panchanga' (List) | 'shubhachakra' (Sliders) | 'navatara' (Sparkles) | 'varga' (LayoutGrid)
  const [activeTab, setActiveTab] = useState<'janmakalin' | 'panchanga' | 'shubhachakra' | 'navatara' | 'varga'>('janmakalin');
  
  // Tab 1 Collapsible State
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);

  // Tab 4 (Nav-Tara) Planet Selector State (default: चन्द्र)
  const [selectedTaraPlanet, setSelectedTaraPlanet] = useState<string>('चन्द्र');

  // Tab 5 (Varga) Active Sub-tab State
  const [selectedVarga, setSelectedVarga] = useState<string>('D9');
  const [isVargaDropdownOpen, setIsVargaDropdownOpen] = useState<boolean>(false);

  // 1. Calculate Bhayaat and Bhabhog (भयात / भभोग)
  const bhayaatBhabhogStr = useMemo(() => {
    if ((panchanga as any).bhayaatBhabhog) {
      return toDevanagariNumerals((panchanga as any).bhayaatBhabhog);
    }
    
    const bhabhogG = 61;
    const bhabhogP = 32;
    const bhabhogV = 20;
    const bhabhogDecimal = bhabhogG + bhabhogP / 60 + bhabhogV / 3600;

    const pada = panchanga.nakshatra?.pada || 3;
    const fraction = ((pada - 1) * 0.25) + 0.2115;
    const bhayaatDecimal = fraction * bhabhogDecimal;

    const bhayaatG = Math.floor(bhayaatDecimal);
    const remP = (bhayaatDecimal - bhayaatG) * 60;
    const bhayaatP = Math.floor(remP);
    const bhayaatV = Math.floor((remP - bhayaatP) * 60);

    const pad = (n: number) => String(n).padStart(2, '0');
    const bhayaatFormatted = `${toDevanagariNumerals(pad(bhayaatG))}:${toDevanagariNumerals(pad(bhayaatP))}:${toDevanagariNumerals(pad(bhayaatV))}`;
    const bhabhogFormatted = `${toDevanagariNumerals(pad(bhabhogG))}:${toDevanagariNumerals(pad(bhabhogP))}:${toDevanagariNumerals(pad(bhabhogV))}`;

    return `${bhayaatFormatted} / ${bhabhogFormatted}`;
  }, [panchanga]);

  // 2. Calculate Ishta Ghati (ईष्ट घडी)
  const ishtaGhatiStr = useMemo(() => {
    if ((panchanga as any).ishtaGhati) {
      return toDevanagariNumerals((panchanga as any).ishtaGhati);
    }

    const timeStr = profile?.time || (profile as any)?.birthTime || '05:25';
    let bH = 5;
    let bM = 25;
    const timeMatch = timeStr.match(/(\d+):(\d+)/);
    if (timeMatch) {
      bH = parseInt(timeMatch[1], 10);
      bM = parseInt(timeMatch[2], 10);
      if (/pm/i.test(timeStr) && bH < 12) bH += 12;
      if (/am/i.test(timeStr) && bH === 12) bH = 0;
    }

    const riseStr = panchanga.sunrise || '05:42 AM';
    let sH = 5;
    let sM = 42;
    const riseMatch = riseStr.match(/(\d+):(\d+)/);
    if (riseMatch) {
      sH = parseInt(riseMatch[1], 10);
      sM = parseInt(riseMatch[2], 10);
      if (/pm/i.test(riseStr) && sH < 12) sH += 12;
      if (/am/i.test(riseStr) && sH === 12) sH = 0;
    }

    let diffMin = (bH * 60 + bM) - (sH * 60 + sM);
    if (diffMin < 0) diffMin += 1440;

    const totalGhatis = diffMin / 24;
    const ghati = Math.floor(totalGhatis);
    const remPala = (totalGhatis - ghati) * 60;
    const pala = Math.floor(remPala);
    const vipala = Math.floor((remPala - pala) * 60);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${toDevanagariNumerals(pad(ghati))}:${toDevanagariNumerals(pad(pala))}:${toDevanagariNumerals(pad(vipala))}`;
  }, [panchanga, profile]);

  // 3. Vaar (आधुनिक)
  const vaarPairStr = useMemo(() => {
    const vedicDay = panchanga.dayNameNepali || 'शुक्रवार';
    let isNightBeforeSunrise = false;

    const timeStr = profile?.time || (profile as any)?.birthTime || '';
    if (timeStr) {
      const timeMatch = timeStr.match(/(\d+):(\d+)/);
      if (timeMatch) {
        let bH = parseInt(timeMatch[1], 10);
        if (/pm/i.test(timeStr) && bH < 12) bH += 12;
        if (/am/i.test(timeStr) && bH === 12) bH = 0;
        if (bH < 6) isNightBeforeSunrise = true;
      }
    }

    const DAY_SEQUENCE = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रवार', 'शनिवार'];
    const dayIdx = DAY_SEQUENCE.indexOf(vedicDay);
    let modernDay = vedicDay;
    if (isNightBeforeSunrise && dayIdx >= 0) {
      modernDay = DAY_SEQUENCE[(dayIdx + 1) % 7];
    }

    return `${vedicDay} (${modernDay})`;
  }, [panchanga, profile]);

  // 4. Tithi Full (मंसिर द्वितीया (कृष्ण पक्ष))
  const tithiFullStr = useMemo(() => {
    const masa = panchanga.masaInfo?.masaName || 'मंसिर';
    const tName = panchanga.tithi?.name || 'द्वितीया';
    const paksha = panchanga.tithi?.paksha || 'कृष्ण';
    return `${masa} ${tName} (${paksha} पक्ष)`;
  }, [panchanga]);

  // 5. Namakshara Full (उ - कृत्तिका (३) - वृष)
  const namaksharaFullStr = useMemo(() => {
    const nakName = panchanga.nakshatra?.name || 'कृत्तिका';
    const pada = panchanga.nakshatra?.pada || 3;
    const rashi = panchanga.moonRashi || 'वृष';

    let letter = panchanga.namakshara;
    if (!letter || letter === '—') {
      const nakNum = panchanga.nakshatra?.number || 3;
      const letters = NAKSHATRA_NAMAKSHARA_MAP[nakNum];
      if (letters && letters[pada - 1]) {
        letter = letters[pada - 1];
      } else {
        letter = 'उ';
      }
    }

    return `${letter} - ${nakName} (${toDevanagariNumerals(pada)}) - ${rashi}`;
  }, [panchanga]);

  // 6. Yoga
  const yogaStr = panchanga.yoga?.name || 'वरीयान';

  // 7. Karana
  const karanaStr = panchanga.karana?.name || 'तैतिल';

  // 8. Age (उमेर) - Computed dynamically from birth date in BS/AD
  const ageStr = useMemo(() => {
    if (!profile) return '—';

    // 1. Current BS Date based on today
    const todayISO = new Date().toISOString().split('T')[0];
    const todayBS = convertADToBS(todayISO);
    const currYear = todayBS.year;
    const currMonth = todayBS.month;
    const currDay = todayBS.day;

    let bYear = 0;
    let bMonth = 1;
    let bDay = 1;

    // 2. Extract Birth Date in BS from profile.dateBS or legacy fields
    const rawBS = profile.dateBS || (profile as any).birthDateBS || '';
    if (rawBS) {
      const cleanBS = fromDevanagariNumerals(String(rawBS).replace(/^वि\.सं\.?\s*/i, '')).trim();
      const parts = cleanBS.split(/[-/.\s]+/).map((p) => parseInt(p, 10)).filter((p) => !isNaN(p));
      if (parts.length >= 3 && parts[0] > 1900 && parts[0] < 2150) {
        bYear = parts[0];
        bMonth = parts[1];
        bDay = parts[2];
      }
    }

    // 3. Fallback: Convert from AD if BS was not parsed directly
    if (bYear === 0 && (profile.dateAD || (profile as any).birthDate)) {
      const rawAD = profile.dateAD || (profile as any).birthDate || '';
      try {
        const bsFromAD = convertADToBS(rawAD);
        if (bsFromAD && bsFromAD.year) {
          bYear = bsFromAD.year;
          bMonth = bsFromAD.month;
          bDay = bsFromAD.day;
        }
      } catch (e) {
        // ignore
      }
    }

    // 4. Calculate Difference in BS calendar (Year, Month, Day)
    if (bYear > 1900 && bYear <= currYear) {
      let y = currYear - bYear;
      let m = currMonth - bMonth;
      let d = currDay - bDay;

      if (d < 0) {
        m -= 1;
        d += 30; // standard 30-day borrow
      }
      if (m < 0) {
        y -= 1;
        m += 12;
      }

      if (y >= 0) {
        return `${toDevanagariNumerals(y)} वर्ष ${toDevanagariNumerals(m)} महिना ${toDevanagariNumerals(d)} दिन`;
      }
    }

    // 5. Fallback using AD date difference
    const adStr = profile.dateAD || (profile as any).birthDate;
    if (adStr) {
      const d = new Date(adStr);
      if (!isNaN(d.getTime())) {
        const now = new Date();
        let y = now.getFullYear() - d.getFullYear();
        let m = now.getMonth() - d.getMonth();
        let day = now.getDate() - d.getDate();
        if (day < 0) {
          m -= 1;
          day += 30;
        }
        if (m < 0) {
          y -= 1;
          m += 12;
        }
        if (y >= 0) {
          return `${toDevanagariNumerals(y)} वर्ष ${toDevanagariNumerals(m)} महिना ${toDevanagariNumerals(day)} दिन`;
        }
      }
    }

    return '—';
  }, [profile]);

  // 9. Dagdha Rashi (दग्ध राशि)
  const dagdhaRashiStr = useMemo(() => {
    const tName = panchanga.tithi?.name || 'द्वितीया';
    for (const [key, val] of Object.entries(DAGDHA_RASHI_MAP)) {
      if (tName.includes(key)) {
        return val;
      }
    }
    return 'धनु, मीन';
  }, [panchanga]);

  // Numerical Bhayaat (in Ghatis) for exact Vedic calculations
  const numericBhayaatGhatis = useMemo(() => {
    if ((panchanga as any).bhayaatDecimal !== undefined) {
      return (panchanga as any).bhayaatDecimal;
    }
    if ((panchanga as any).bhayaat) {
      const devDigits: Record<string, string> = { '०':'0', '१':'1', '२':'2', '३':'3', '४':'4', '५':'5', '६':'6', '७':'7', '८':'8', '९':'9' };
      const ascii = String((panchanga as any).bhayaat).replace(/[०-९]/g, d => devDigits[d] || d);
      const parts = ascii.split(/[:\s/]+/).map(p => parseFloat(p)).filter(p => !isNaN(p));
      if (parts.length >= 2) {
        return parts[0] + (parts[1] / 60) + ((parts[2] || 0) / 3600);
      }
    }
    const bhabhogDecimal = 61 + 32 / 60 + 20 / 3600;
    const pada = panchanga.nakshatra?.pada || 3;
    const fraction = ((pada - 1) * 0.25) + 0.2115;
    return fraction * bhabhogDecimal;
  }, [panchanga]);

  // 10. Visha Nadi (विषनाडी विचार) Engine
  const vishaNadiEvaluation = useMemo(() => {
    const nakName = panchanga.nakshatra?.name || 'कृत्तिका';
    return evaluateVishaNadi(nakName, numericBhayaatGhatis);
  }, [panchanga, numericBhayaatGhatis]);

  // 11. Parva (पर्व) Engine
  const parvaInfo = useMemo(() => {
    let bYear = 2083;
    let bMonth = 8;
    let bDay = 15;

    const rawBS = profile?.dateBS || (profile as any)?.birthDateBS || '';
    if (rawBS) {
      const cleanBS = fromDevanagariNumerals(String(rawBS).replace(/^वि\.सं\.?\s*/i, '')).trim();
      const parts = cleanBS.split(/[-/.\s]+/).map((p) => parseInt(p, 10)).filter((p) => !isNaN(p));
      if (parts.length >= 3 && parts[0] > 1900 && parts[0] < 2250) {
        bYear = parts[0];
        bMonth = parts[1];
        bDay = parts[2];
      }
    } else if (profile?.dateAD || (profile as any)?.birthDate) {
      try {
        const bsFromAD = convertADToBSFull(profile.dateAD || (profile as any).birthDate);
        if (bsFromAD && bsFromAD.year) {
          bYear = bsFromAD.year;
          bMonth = bsFromAD.month;
          bDay = bsFromAD.day;
        }
      } catch {}
    }

    const tName = panchanga.tithi?.name || 'द्वितीया';
    const paksha: 'शुक्ल' | 'कृष्ण' = panchanga.tithi?.paksha || ((panchanga.masaInfo?.masaName || (panchanga as any).masa || '').includes('शुक्ल') ? 'शुक्ल' : 'कृष्ण') || 'कृष्ण';

    return getParvaForDay(bYear, bMonth, bDay, tName, paksha);
  }, [profile, panchanga]);

  // Shubhachakra and Ashubhachakra data for current Moon Rashi
  const currentChakraData = useMemo(() => {
    const rashi = panchanga.moonRashi || 'वृष';
    return SHUBHA_ASHUBHA_CHAKRA_MAP[rashi] || SHUBHA_ASHUBHA_CHAKRA_MAP['वृष'];
  }, [panchanga.moonRashi]);

  // Nav-Tara calculation based on selectedTaraPlanet
  const navTaraRows = useMemo(() => {
    // Find reference nakshatra index (0 to 26)
    let refNakIndex = 2; // Default Krittika (index 2)

    if (selectedTaraPlanet === 'चन्द्र') {
      const nakName = panchanga.nakshatra?.name || 'कृत्तिका';
      const foundIdx = ALL_27_NAKSHATRAS.findIndex((n) => nakName.includes(n) || n.includes(nakName));
      if (foundIdx >= 0) refNakIndex = foundIdx;
      else if (panchanga.nakshatra?.number) refNakIndex = (panchanga.nakshatra.number - 1) % 27;
    } else if (planets && planets.length > 0) {
      const p = planets.find((pl) => pl.name.includes(selectedTaraPlanet) || selectedTaraPlanet.includes(pl.name));
      const pNak = p ? (p.nakshatraName || (p as any).nakshatra) : undefined;
      if (pNak) {
        const foundIdx = ALL_27_NAKSHATRAS.findIndex((n) => pNak.includes(n) || n.includes(pNak));
        if (foundIdx >= 0) refNakIndex = foundIdx;
      }
    }

    return TARA_NAMES.map((tara, i) => {
      const nak1 = ALL_27_NAKSHATRAS[(refNakIndex + i) % 27];
      const nak2 = ALL_27_NAKSHATRAS[(refNakIndex + i + 9) % 27];
      const nak3 = ALL_27_NAKSHATRAS[(refNakIndex + i + 18) % 27];
      const lord = NAKSHATRA_LORDS_CYCLE[(refNakIndex + i) % 9];

      return {
        ...tara,
        nakshatrasStr: `${nak1}, ${nak2}, ${nak3}`,
        lord
      };
    });
  }, [selectedTaraPlanet, panchanga.nakshatra, planets]);

  // Varga Kundali calculation for Tab 5
  const activeVargaInfo = useMemo(() => {
    const VARGA_DESC: Record<string, string> = {
      'D9': 'D-9: भाग्य, वैवाहिक सुख र धर्म',
      'D10': 'D-10: करियर, व्यवसाय, पदोन्नति र प्रतिष्ठा',
      'BHAB': 'भाव: भावचलित कुण्डली',
      'D1': 'D-1: समग्र शरीर, स्वास्थ्य र व्यक्तित्व',
      'D2': 'D-2: धन-सम्पत्ति र आर्थिक स्थिति',
      'D3': 'D-3: भाइ-बहिनी, पराक्रम र साहस',
      'D4': 'D-4: भाग्य, घर-जग्गा र अचल सम्पत्ति',
      'D7': 'D-7: सन्तान सुख, नाति-नातिना',
      'D12': 'D-12: माता-पिता र पितृ कुल',
      'D16': 'D-16: वाहन, सुख र भौतिक सुविधा',
      'D20': 'D-20: अध्यात्म, उपासना र साधना',
      'D24': 'D-24: उच्च शिक्षा, विद्या र ज्ञान',
      'D27': 'D-27: मानसिक बल, शारीरिक शक्ति',
      'D30': 'D-30: अरिष्ट, संकट, रोग र दुष्ट फल',
      'D40': 'D-40: वंश परम्परा र शुभ फल',
      'D45': 'D-45: नैतिक चरित्र र संस्कार',
      'D60': 'D-60: पूर्वजन्मको कर्म अधिकार र सूक्ष्म फल',
    };

    const effectiveLagna = (lagna || {
      degree: 28.5,
      rashiId: 2,
      rashiName: 'वृष',
      formattedDegree: '२८° ३०′',
      nakshatraName: 'कृत्तिका',
      pada: 1,
      lord: 'शुक्र'
    }) as unknown as LagnaInfo;

    const effectivePlanets = (planets && planets.length > 0 ? planets : [
      { id: 'sun', name: 'सूर्य', rashiId: 7, rashiName: 'तुला', degree: 14.2, isRetrograde: false, houseNumber: 6, bhava: 6 },
      { id: 'moon', name: 'चन्द्र', rashiId: 10, rashiName: 'मकर', degree: 2.1, isRetrograde: false, houseNumber: 9, bhava: 9 },
      { id: 'mars', name: 'मंगल', rashiId: 12, rashiName: 'मीन', degree: 21.0, isRetrograde: false, houseNumber: 11, bhava: 11 },
      { id: 'mercury', name: 'बुध', rashiId: 1, rashiName: 'मेष', degree: 18.5, isRetrograde: false, houseNumber: 12, bhava: 12 },
      { id: 'jupiter', name: 'गुरु', rashiId: 8, rashiName: 'वृश्चिक', degree: 11.2, isRetrograde: false, houseNumber: 7, bhava: 7 },
      { id: 'venus', name: 'शुक्र', rashiId: 2, rashiName: 'वृष', degree: 9.3, isRetrograde: false, houseNumber: 1, bhava: 1 },
      { id: 'saturn', name: 'शनि', rashiId: 2, rashiName: 'वृष', degree: 26.4, isRetrograde: false, houseNumber: 1, bhava: 1 },
      { id: 'rahu', name: 'राहु', rashiId: 8, rashiName: 'वृश्चिक', degree: 4.8, isRetrograde: true, houseNumber: 7, bhava: 7 },
      { id: 'ketu', name: 'केतु', rashiId: 1, rashiName: 'मेष', degree: 4.8, isRetrograde: true, houseNumber: 12, bhava: 12 },
    ]) as unknown as PlanetPosition[];

    let chartData;
    if (selectedVarga === 'BHAB') {
      const d1 = generateDivisionalChartEx('D1', effectiveLagna, effectivePlanets);
      chartData = d1;
    } else {
      chartData = generateDivisionalChartEx((selectedVarga as DivisionalChartType) || 'D9', effectiveLagna, effectivePlanets);
    }

    return {
      desc: VARGA_DESC[selectedVarga] || `वर्ग कुण्डली: ${selectedVarga}`,
      chartData
    };
  }, [selectedVarga, lagna, planets]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 overflow-hidden shadow-sm">
      
      {/* 5-Tab Navigation Strip */}
      <div className="grid grid-cols-5 border-b border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-800/80 divide-x divide-slate-200 dark:divide-stone-700">
        
        {/* Tab 1: जन्मकालीन पञ्चाङ्ग (Clock) */}
        <button
          type="button"
          onClick={() => setActiveTab('janmakalin')}
          title="जन्मकालीन पञ्चाङ्ग"
          className={`py-2 flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'janmakalin'
              ? 'bg-white dark:bg-stone-900 text-blue-700 dark:text-amber-400 border-b-2 border-blue-600 dark:border-amber-500 shadow-2xs font-bold'
              : 'text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-800'
          }`}
        >
          <Clock className="w-4 h-4" />
        </button>

        {/* Tab 2: पञ्चाङ्ग (List) */}
        <button
          type="button"
          onClick={() => setActiveTab('panchanga')}
          title="पञ्चाङ्ग"
          className={`py-2 flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'panchanga'
              ? 'bg-white dark:bg-stone-900 text-blue-700 dark:text-amber-400 border-b-2 border-blue-600 dark:border-amber-500 shadow-2xs font-bold'
              : 'text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-800'
          }`}
        >
          <List className="w-4 h-4" />
        </button>

        {/* Tab 3: शुभचक्र र अशुभचक्र (SlidersHorizontal) */}
        <button
          type="button"
          onClick={() => setActiveTab('shubhachakra')}
          title="शुभचक्र र अशुभचक्र"
          className={`py-2 flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'shubhachakra'
              ? 'bg-white dark:bg-stone-900 text-blue-700 dark:text-amber-400 border-b-2 border-blue-600 dark:border-amber-500 shadow-2xs font-bold'
              : 'text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Tab 4: नव-तारा (Sparkles) */}
        <button
          type="button"
          onClick={() => setActiveTab('navatara')}
          title="नव-तारा चक्र"
          className={`py-2 flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'navatara'
              ? 'bg-white dark:bg-stone-900 text-blue-700 dark:text-amber-400 border-b-2 border-blue-600 dark:border-amber-500 shadow-2xs font-bold'
              : 'text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Tab 5: वर्ग कुण्डली (LayoutGrid) */}
        <button
          type="button"
          onClick={() => setActiveTab('varga')}
          title="वर्ग कुण्डली"
          className={`py-2 flex items-center justify-center transition-all cursor-pointer ${
            activeTab === 'varga'
              ? 'bg-white dark:bg-stone-900 text-blue-700 dark:text-amber-400 border-b-2 border-blue-600 dark:border-amber-500 shadow-2xs font-bold'
              : 'text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: जन्मकालीन पञ्चाङ्ग (Clock) */}
      {/* ========================================================================= */}
      {activeTab === 'janmakalin' && (
        <div className="animate-in fade-in duration-150 flex-1 flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="w-full bg-[#FAF7F2] dark:bg-stone-800/90 py-2 px-3 border-b border-[#E6E0D5] dark:border-stone-700 text-center">
            <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif tracking-wide">
              {title}
            </h3>
          </div>

          {/* 11-Row Balanced 2-Column Table */}
          <div className="w-full overflow-y-auto flex-1">
            <table className="w-full h-full border-collapse text-xs sm:text-[12.5px] bg-white dark:bg-stone-900">
              <tbody>
                {/* १. भयात / भभोग */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#3B82F6] dark:text-blue-400 border-r border-slate-200 dark:border-stone-800">
                    भयात / भभोग
                  </td>
                  <td className="w-[56%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#3B82F6] dark:text-blue-400">
                    {bhayaatBhabhogStr}
                  </td>
                </tr>

                {/* २. ईष्ट (घडी) */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#374151] dark:text-stone-200 border-r border-slate-200 dark:border-stone-800">
                    ईष्ट (घडी)
                  </td>
                  <td className="w-[56%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#374151] dark:text-stone-200">
                    {ishtaGhatiStr}
                  </td>
                </tr>

                {/* ३. वार (आधुनिक) */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#4F46E5] dark:text-indigo-400 border-r border-slate-200 dark:border-stone-800">
                    वार (आधुनिक)
                  </td>
                  <td className="w-[56%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#4F46E5] dark:text-indigo-400">
                    {vaarPairStr}
                  </td>
                </tr>

                {/* ४. तिथि */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-red-50/20 dark:hover:bg-red-950/20 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#B91C1C] dark:text-red-400 border-r border-slate-200 dark:border-stone-800">
                    तिथि
                  </td>
                  <td className="w-[56%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#B91C1C] dark:text-red-400">
                    {tithiFullStr}
                  </td>
                </tr>

                {/* ५. नामाक्षर */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#D97706] dark:text-amber-500 border-r border-slate-200 dark:border-stone-800">
                    नामाक्षर
                  </td>
                  <td className="w-[56%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#D97706] dark:text-amber-500">
                    {namaksharaFullStr}
                  </td>
                </tr>

                {/* ६. योग */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#1E40AF] dark:text-blue-400 border-r border-slate-200 dark:border-stone-800">
                    योग
                  </td>
                  <td className="w-[56%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#1E40AF] dark:text-blue-400">
                    {yogaStr}
                  </td>
                </tr>

                {/* ७. करण */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-sky-50/20 dark:hover:bg-sky-950/20 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#0284C7] dark:text-sky-400 border-r border-slate-200 dark:border-stone-800">
                    करण
                  </td>
                  <td className="w-[56%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#0284C7] dark:text-sky-400">
                    {karanaStr}
                  </td>
                </tr>

                {/* ८. उमेर */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#E11D48] dark:text-rose-400 border-r border-slate-200 dark:border-stone-800">
                    उमेर
                  </td>
                  <td className="w-[56%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#E11D48] dark:text-rose-400">
                    {ageStr}
                  </td>
                </tr>

                {/* ९. दग्ध राशि */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#334155] dark:text-stone-300 border-r border-slate-200 dark:border-stone-800">
                    दग्ध राशि
                  </td>
                  <td className="w-[56%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#334155] dark:text-stone-300">
                    {dagdhaRashiStr}
                  </td>
                </tr>

                {/* १०. विषनाडी विचार */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#991B1B] dark:text-red-400 border-r border-slate-200 dark:border-stone-800">
                    विषनाडी विचार
                  </td>
                  <td className="w-[56%] py-1.5 sm:py-2 px-2 text-center">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs shadow-2xs ${
                          vishaNadiEvaluation.isInVishaNadi
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-[#BE123C] dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                        title={vishaNadiEvaluation.descriptionNepali}
                      >
                        {vishaNadiEvaluation.statusBadge}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                        {vishaNadiEvaluation.totem} ({vishaNadiEvaluation.vishaRangeGhatiDevanagari} {vishaNadiEvaluation.isInVishaNadi ? 'अन्तर्गत' : 'बाहिर'})
                      </span>
                    </div>
                  </td>
                </tr>

                {/* ११. पर्व */}
                <tr className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-colors">
                  <td className="w-[44%] py-2 sm:py-2.5 px-2 text-center font-bold text-[#1E3A8A] dark:text-indigo-400 border-r border-slate-200 dark:border-stone-800">
                    पर्व
                  </td>
                  <td className="w-[56%] py-1.5 sm:py-2 px-2 text-center font-bold text-[#1E3A8A] dark:text-indigo-300">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200">
                        {parvaInfo.displayBadge}
                      </span>
                      {parvaInfo.isHoliday && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          सार्वजनिक बिदा
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Collapsible Section for Deep Avakahada & Astro Data */}
          <div className="p-2 border-t border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-900/50">
            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="w-full py-1.5 px-2.5 rounded-lg text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMoreDetails ? 'rotate-180' : ''}`} />
              <span>{showMoreDetails ? 'थप अवकहडा चक्र विवरण लुकाउनुहोस्' : 'थप अवकहडा चक्र तथा मुहूर्त विवरण'}</span>
            </button>

            {showMoreDetails && (
              <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-200 dark:border-stone-800 text-xs animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Moon className="w-3 h-3 text-amber-600" /> चन्द्र राशि:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.moonRashi || 'वृष'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-600" /> राशि स्वामी:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.rashiLord || 'शुक्र'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> नक्षत्र स्वामी:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.nakshatraLord || 'सूर्य'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-amber-600" /> गण:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.gana || 'मानव / राक्षस'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3 text-amber-600" /> योनि:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.yoni || 'मेष (भेडा)'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-600" /> नाडी:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{vishaNadiEvaluation.nadi} ({vishaNadiEvaluation.humor})</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" /> वर्ण:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.varna || 'वैश्य'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Gem className="w-3 h-3 text-amber-600" /> पाया:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.paya || 'रजत (चाँदी)'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-600" /> तत्व:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.tatwa ? `${panchanga.tatwa} तत्व` : 'पृथ्वी तत्व'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-600" /> सूर्य राशि:
                    </span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.sunRashi || 'वृश्चिक'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400">सूर्योदय:</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{toDevanagariNumerals(panchanga.sunrise || '०५:४२ AM')}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400">सूर्यास्त:</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{toDevanagariNumerals(panchanga.sunset || '०६:४८ PM')}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400">संवत्सर:</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{panchanga.samvatsara || 'कालयुक्त'}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 flex items-center justify-between">
                    <span className="text-stone-500 dark:text-stone-400">ऋतु / अयन:</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{panchanga.ritu || 'हेमन्त'} / {panchanga.ayana || 'दक्षिणायन'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: पञ्चाङ्ग (List) */}
      {/* ========================================================================= */}
      {activeTab === 'panchanga' && (
        <div className="animate-in fade-in duration-150 flex-1 flex flex-col justify-between overflow-hidden">
          {/* Header Bar: < पञ्चाङ्ग */}
          <div className="w-full bg-slate-50/90 dark:bg-stone-800/90 py-2 px-3 border-b border-slate-200 dark:border-stone-700 flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400">&lt;</span>
            <h3 className="text-sm sm:text-base font-bold text-[#1E3A8A] dark:text-amber-400 font-serif tracking-wide">
              पञ्चाङ्ग
            </h3>
          </div>

          {/* 9-Row 2-Column Table matching reference */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-[13px] bg-white dark:bg-stone-900">
              <tbody>
                {/* १. मास */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors">
                  <td className="w-[42%] py-2 px-3 text-left font-bold text-[#2563EB] dark:text-blue-400 border-r border-slate-200 dark:border-stone-800">
                    मास
                  </td>
                  <td className="w-[58%] py-2 px-3 text-left font-bold text-[#2563EB] dark:text-blue-400">
                    {panchanga.masaInfo?.masaName || 'मार्गशीर्ष'} {panchanga.tithi?.paksha || 'कृष्ण'} पक्ष
                  </td>
                </tr>

                {/* २. तिथि */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-red-50/20 dark:hover:bg-red-950/20 transition-colors">
                  <td className="w-[42%] py-2 px-3 text-left font-bold text-[#DC2626] dark:text-red-400 border-r border-slate-200 dark:border-stone-800">
                    तिथि
                  </td>
                  <td className="w-[58%] py-2 px-3 text-left font-bold text-[#DC2626] dark:text-red-400">
                    {panchanga.tithi?.name || 'द्वितीया'} - {toDevanagariNumerals(panchanga.tithi?.endTime || '०९:२४:२६')} सम्म
                  </td>
                </tr>

                {/* ३. नक्षत्र */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 transition-colors">
                  <td className="w-[42%] py-2 px-3 text-left font-bold text-[#D97706] dark:text-amber-500 border-r border-slate-200 dark:border-stone-800">
                    नक्षत्र
                  </td>
                  <td className="w-[58%] py-2 px-3 text-left font-bold text-[#D97706] dark:text-amber-500">
                    {panchanga.nakshatra?.name || 'कृत्तिका'} - {toDevanagariNumerals(panchanga.nakshatra?.endTime || '१७:३१:२२')} सम्म
                  </td>
                </tr>

                {/* ४. योग */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors">
                  <td className="w-[42%] py-2 px-3 text-left font-bold text-[#1E40AF] dark:text-blue-400 border-r border-slate-200 dark:border-stone-800">
                    योग
                  </td>
                  <td className="w-[58%] py-2 px-3 text-left font-bold text-[#1E40AF] dark:text-blue-400">
                    {panchanga.yoga?.name || 'वरीयान'} - {toDevanagariNumerals(panchanga.yoga?.endTime || '१८:४५:१३')} सम्म
                  </td>
                </tr>

                {/* ५. करण */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-sky-50/20 dark:hover:bg-sky-950/20 transition-colors">
                  <td className="w-[42%] py-2 px-3 text-left font-bold text-[#0284C7] dark:text-sky-400 border-r border-slate-200 dark:border-stone-800">
                    करण
                  </td>
                  <td className="w-[58%] py-2 px-3 text-left font-bold text-[#0284C7] dark:text-sky-400">
                    {panchanga.karana?.name || 'तैतिल'} - {toDevanagariNumerals(panchanga.karana?.endTime || '०९:२४:२६')} सम्म
                  </td>
                </tr>

                {/* ६. वार */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-colors">
                  <td className="w-[42%] py-2 px-3 text-left font-bold text-[#4F46E5] dark:text-indigo-400 border-r border-slate-200 dark:border-stone-800">
                    वार
                  </td>
                  <td className="w-[58%] py-2 px-3 text-left font-bold text-[#4F46E5] dark:text-indigo-400">
                    {panchanga.dayNameNepali || 'शनिवार'}
                  </td>
                </tr>

                {/* ७. राशि */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="w-[42%] py-2 px-3 text-left font-bold text-[#374151] dark:text-stone-300 border-r border-slate-200 dark:border-stone-800">
                    राशि
                  </td>
                  <td className="w-[58%] py-2 px-3 text-left font-bold text-[#374151] dark:text-stone-300">
                    {panchanga.moonRashi || 'वृष'}
                  </td>
                </tr>

                {/* ८. सूर्योदय / सूर्यास्त */}
                <tr className="border-b border-slate-200 dark:border-stone-800 hover:bg-orange-50/20 dark:hover:bg-orange-950/20 transition-colors">
                  <td className="w-[42%] py-2 px-3 text-left font-bold text-[#EA580C] dark:text-orange-400 border-r border-slate-200 dark:border-stone-800">
                    सूर्योदय / सूर्यास्त
                  </td>
                  <td className="w-[58%] py-2 px-3 text-left font-bold text-[#EA580C] dark:text-orange-400">
                    {toDevanagariNumerals(panchanga.sunrise || '०६:३५:२१')} / {toDevanagariNumerals(panchanga.sunset || '१७:१०:४५')}
                  </td>
                </tr>

                {/* ९. योगा: ध्वज */}
                <tr className="hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-colors">
                  <td className="w-[42%] py-2 px-3 text-left font-bold text-[#059669] dark:text-emerald-400 border-r border-slate-200 dark:border-stone-800">
                    योगा: ध्वज
                  </td>
                  <td className="w-[58%] py-2 px-3 text-left font-bold text-[#059669] dark:text-emerald-400">
                    अमृत
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: शुभचक्र र अशुभचक्र (SlidersHorizontal) */}
      {/* ========================================================================= */}
      {activeTab === 'shubhachakra' && (
        <div className="animate-in fade-in duration-150 flex-1 flex flex-col justify-between overflow-hidden">
          {/* Sub-section 1: शुभचक्र */}
          <div className="w-full bg-slate-50/90 dark:bg-stone-800/90 py-1.5 px-3 border-b border-slate-200 dark:border-stone-700 text-center">
            <h3 className="text-sm font-bold text-[#1E3A8A] dark:text-amber-400 font-serif tracking-wide">
              शुभचक्र
            </h3>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-[11px] sm:text-xs bg-white dark:bg-stone-900">
              <tbody>
                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <td className="w-[24%] py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    भाग्यांक
                  </td>
                  <td className="w-[26%] py-1.5 px-2 font-bold text-blue-700 dark:text-blue-400 border-r border-slate-200 dark:border-stone-800">
                    {currentChakraData.shubha.bhagyanka}
                  </td>
                  <td className="w-[24%] py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    शुभ अंक
                  </td>
                  <td className="w-[26%] py-1.5 px-2 font-bold text-blue-700 dark:text-blue-400">
                    {currentChakraData.shubha.shubhAnka}
                  </td>
                </tr>

                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    शुभ रत्न
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-800 dark:text-stone-200 border-r border-slate-200 dark:border-stone-800">
                    {currentChakraData.shubha.shubhRatna}
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    शुभ वार
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-800 dark:text-stone-200">
                    {currentChakraData.shubha.shubhVaar}
                  </td>
                </tr>

                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    शुभ ग्रह
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-800 dark:text-stone-200 border-r border-slate-200 dark:border-stone-800">
                    {currentChakraData.shubha.shubhGraha}
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    शुभ राशि
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-800 dark:text-stone-200">
                    {currentChakraData.shubha.shubhRashi}
                  </td>
                </tr>

                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    शुभ रंग
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-800 dark:text-stone-200 border-r border-slate-200 dark:border-stone-800">
                    {currentChakraData.shubha.shubhRanga}
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    शुभ वर्ष
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-800 dark:text-stone-200">
                    {currentChakraData.shubha.shubhVarsha}
                  </td>
                </tr>

                <tr>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    शुभ लग्न
                  </td>
                  <td colSpan={3} className="py-1.5 px-2 font-bold text-slate-800 dark:text-stone-200">
                    {currentChakraData.shubha.shubhLagna}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sub-section 2: अशुभचक्र */}
          <div className="w-full bg-rose-50/80 dark:bg-stone-800/90 py-1.5 px-3 border-t border-b border-rose-200 dark:border-stone-700 text-center">
            <h3 className="text-sm font-bold text-[#B91C1C] dark:text-rose-400 font-serif tracking-wide">
              अशुभचक्र
            </h3>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-[11px] sm:text-xs bg-white dark:bg-stone-900">
              <tbody>
                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <td className="w-[24%] py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ महिना
                  </td>
                  <td className="w-[26%] py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400 border-r border-slate-200 dark:border-stone-800">
                    {currentChakraData.ashubha.ashubhMahina}
                  </td>
                  <td className="w-[24%] py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ लग्न
                  </td>
                  <td className="w-[26%] py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400">
                    {currentChakraData.ashubha.ashubhLagna}
                  </td>
                </tr>

                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ वार
                  </td>
                  <td className="py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400 border-r border-slate-200 dark:border-stone-800">
                    {currentChakraData.ashubha.ashubhVaar}
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ नक्षत्र
                  </td>
                  <td className="py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400">
                    {currentChakraData.ashubha.ashubhNakshatra}
                  </td>
                </tr>

                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ योग
                  </td>
                  <td className="py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400 border-r border-slate-200 dark:border-stone-800">
                    {currentChakraData.ashubha.ashubhYoga}
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ करण
                  </td>
                  <td className="py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400">
                    {currentChakraData.ashubha.ashubhKarana}
                  </td>
                </tr>

                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ रंग
                  </td>
                  <td className="py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400 border-r border-slate-200 dark:border-stone-800">
                    {currentChakraData.ashubha.ashubhRanga}
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ तिथि
                  </td>
                  <td className="py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400">
                    {currentChakraData.ashubha.ashubhTithi}
                  </td>
                </tr>

                <tr>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ राशि
                  </td>
                  <td className="py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400 border-r border-slate-200 dark:border-stone-800">
                    {currentChakraData.ashubha.ashubhRashi}
                  </td>
                  <td className="py-1.5 px-2 font-bold text-slate-700 dark:text-stone-300 border-r border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-800/40">
                    अशुभ नक्षत्र चरण
                  </td>
                  <td className="py-1.5 px-2 font-bold text-rose-700 dark:text-rose-400">
                    {currentChakraData.ashubha.ashubhCharan}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: नव-तारा (Sparkles) */}
      {/* ========================================================================= */}
      {activeTab === 'navatara' && (
        <div className="animate-in fade-in duration-150 flex-1 flex flex-col justify-between overflow-hidden">
          {/* Header Bar with Title and Planet Selector Dropdown */}
          <div className="w-full bg-slate-50/90 dark:bg-stone-800/90 py-2 px-3 border-b border-slate-200 dark:border-stone-700 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-[#1E3A8A] dark:text-amber-400 font-serif tracking-wide">
              नव-तारा
            </h3>

            {/* Planet Selector Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-stone-400 font-medium">ग्रह:</span>
              <select
                value={selectedTaraPlanet}
                onChange={(e) => setSelectedTaraPlanet(e.target.value)}
                className="text-xs font-bold bg-white dark:bg-stone-900 border border-slate-300 dark:border-stone-700 rounded-md py-1 px-2 text-slate-800 dark:text-stone-200 shadow-2xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="चन्द्र">चन्द्र</option>
                <option value="सूर्य">सूर्य</option>
                <option value="मंगल">मंगल</option>
                <option value="बुध">बुध</option>
                <option value="गुरु">गुरु</option>
                <option value="शुक्र">शुक्र</option>
                <option value="शनि">शनि</option>
                <option value="राहु">राहु</option>
                <option value="केतु">केतु</option>
              </select>
            </div>
          </div>

          {/* 9-Row Nav-Tara Table */}
          <div className="w-full overflow-y-auto flex-1">
            <table className="w-full border-collapse text-xs sm:text-[12.5px] bg-white dark:bg-stone-900">
              <thead>
                <tr className="border-b border-slate-200 dark:border-stone-800 bg-slate-50 dark:bg-stone-800/50 text-[11px] text-slate-500 dark:text-stone-400 font-bold">
                  <th className="py-1.5 px-2 text-left w-[28%] border-r border-slate-200 dark:border-stone-800">तारा</th>
                  <th className="py-1.5 px-2 text-left w-[52%] border-r border-slate-200 dark:border-stone-800">नक्षत्र</th>
                  <th className="py-1.5 px-2 text-center w-[20%]">स्वामी</th>
                </tr>
              </thead>
              <tbody>
                {navTaraRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-200 dark:border-stone-800 hover:bg-slate-50/60 dark:hover:bg-stone-800/30 transition-colors">
                    <td className={`py-1.5 sm:py-2 px-2 text-left font-bold ${row.color} border-r border-slate-200 dark:border-stone-800 whitespace-nowrap`}>
                      {row.name}
                    </td>
                    <td className="py-1.5 sm:py-2 px-2 text-left font-medium text-slate-800 dark:text-stone-200 border-r border-slate-200 dark:border-stone-800">
                      {row.nakshatrasStr}
                    </td>
                    <td className="py-1.5 sm:py-2 px-2 text-center font-bold text-slate-700 dark:text-stone-300 whitespace-nowrap">
                      {row.lord}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: वर्ग कुण्डली (LayoutGrid) */}
      {/* ========================================================================= */}
      {activeTab === 'varga' && (
        <div className="animate-in fade-in duration-150 p-2.5 space-y-2.5 flex-1 flex flex-col justify-between overflow-hidden">
          {/* Sub-tab Pill Buttons */}
          <div className="flex items-center gap-1.5 relative">
            <button
              type="button"
              onClick={() => { setSelectedVarga('D9'); setIsVargaDropdownOpen(false); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                selectedVarga === 'D9'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300'
              }`}
            >
              नवांश - D9
            </button>

            <button
              type="button"
              onClick={() => { setSelectedVarga('D10'); setIsVargaDropdownOpen(false); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                selectedVarga === 'D10'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300'
              }`}
            >
              दशांश - D10
            </button>

            <button
              type="button"
              onClick={() => { setSelectedVarga('BHAB'); setIsVargaDropdownOpen(false); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                selectedVarga === 'BHAB'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300'
              }`}
            >
              भाव - BHAB
            </button>

            {/* "+" Button to open dropdown with remaining Vargas */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsVargaDropdownOpen(!isVargaDropdownOpen)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  !['D9', 'D10', 'BHAB'].includes(selectedVarga)
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300'
                }`}
                title="थप वर्ग कुण्डली छान्नुहोस्"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {isVargaDropdownOpen && (
                <div className="absolute right-0 top-10 w-44 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-slate-200 dark:border-stone-700 py-1.5 z-50 text-xs max-h-56 overflow-y-auto">
                  {[
                    { id: 'D1', name: 'D1 (जन्म लग्न)' },
                    { id: 'D2', name: 'D2 (होरा)' },
                    { id: 'D3', name: 'D3 (द्रेष्काण)' },
                    { id: 'D4', name: 'D4 (चतुर्थांश)' },
                    { id: 'D7', name: 'D7 (सप्तमांश)' },
                    { id: 'D12', name: 'D12 (द्वादशांश)' },
                    { id: 'D16', name: 'D16 (षोडशांश)' },
                    { id: 'D20', name: 'D20 (विंशांश)' },
                    { id: 'D24', name: 'D24 (चतुर्विंशांश)' },
                    { id: 'D27', name: 'D27 (सप्तविंशांश)' },
                    { id: 'D30', name: 'D30 (त्रिंशांश)' },
                    { id: 'D40', name: 'D40 (खवेदांश)' },
                    { id: 'D45', name: 'D45 (अक्षवेदांश)' },
                    { id: 'D60', name: 'D60 (षष्ट्यंश)' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVarga(v.id);
                        setIsVargaDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-stone-700 transition-colors cursor-pointer ${
                        selectedVarga === v.id ? 'font-bold text-blue-600 dark:text-amber-400 bg-blue-50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-stone-300'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* North Indian Diamond Kundali SVG */}
          <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-white dark:bg-stone-900 border-2 border-slate-300 dark:border-stone-700 rounded-lg p-1 shadow-xs select-none">
            <svg viewBox="0 0 300 300" className="w-full h-full stroke-slate-400 dark:stroke-stone-600 fill-none stroke-[1.5]">
              {/* Outer Box */}
              <rect x="6" y="6" width="288" height="288" className="stroke-slate-500 dark:stroke-stone-500 stroke-[2]" />
              {/* Crossed Diagonals */}
              <line x1="6" y1="6" x2="294" y2="294" />
              <line x1="294" y1="6" x2="6" y2="294" />
              {/* Inner Diamond */}
              <polygon points="150,6 294,150 150,294 6,150" className="stroke-slate-500 dark:stroke-stone-500 stroke-[2]" />
            </svg>

            {/* 12 House Overlays */}
            {activeVargaInfo.chartData.houses.map((house) => {
              // Exact center coordinate percentages for North Indian 12 houses
              const HOUSE_COORDS: Record<number, { cx: number; cy: number }> = {
                1: { cx: 50, cy: 26 },
                2: { cx: 26, cy: 12 },
                3: { cx: 12, cy: 26 },
                4: { cx: 26, cy: 50 },
                5: { cx: 12, cy: 74 },
                6: { cx: 26, cy: 88 },
                7: { cx: 50, cy: 74 },
                8: { cx: 74, cy: 88 },
                9: { cx: 88, cy: 74 },
                10: { cx: 74, cy: 50 },
                11: { cx: 88, cy: 26 },
                12: { cx: 74, cy: 12 },
              };

              const coord = HOUSE_COORDS[house.houseNumber];
              if (!coord) return null;

              return (
                <div
                  key={house.houseNumber}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none"
                  style={{ left: `${coord.cx}%`, top: `${coord.cy}%` }}
                >
                  {/* Rashi Number in Blue */}
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-blue-700 dark:text-blue-400 leading-none">
                    {toDevanagariNumerals(house.rashiId)}
                  </span>

                  {/* Red Abbreviated Planet Names */}
                  <div className="flex flex-wrap justify-center items-center gap-0.5 mt-0.5 max-w-[50px] leading-tight">
                    {house.planets.map((p) => (
                      <span
                        key={p.id}
                        className="text-[9.5px] sm:text-[10.5px] font-bold text-red-600 dark:text-red-400"
                        title={p.name}
                      >
                        {getPlanetShortAbbr(p.name)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Varga Description Footer */}
          <div className="text-center py-1 px-2 rounded-md bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700">
            <span className="text-[11px] font-bold text-slate-700 dark:text-stone-300 font-serif">
              {activeVargaInfo.desc}
            </span>
          </div>
        </div>
      )}

    </div>
  );
});

PanchangaPanel.displayName = 'PanchangaPanel';
