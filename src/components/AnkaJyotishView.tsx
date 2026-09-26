import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Hash, 
  User, 
  Calendar, 
  Layers, 
  Award, 
  Heart, 
  ShieldCheck, 
  Gem, 
  Palette, 
  Sun, 
  Moon, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { BirthDetails } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface AnkaJyotishViewProps {
  activeProfile: BirthDetails | null;
  onSelectProfile?: (profile: BirthDetails) => void;
}

// Chaldean Numerology Chart
const CHALDEAN_MAP: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8
};

// Vedic Planetary Ruler, Qualities & Recommendations for Numbers 1 - 9
const NUMBER_PROFILES: Record<number, {
  ruler: string;
  rulerIcon: string;
  title: string;
  qualities: string;
  luckyColors: string[];
  luckyDays: string[];
  luckyGems: string[];
  luckyDates: number[];
  deity: string;
  direction: string;
  compatibleNumbers: number[];
  neutralNumbers: number[];
  challengingNumbers: number[];
}> = {
  1: {
    ruler: 'सूर्य (Sun)',
    rulerIcon: '☀️',
    title: 'नेतृत्व, आत्मविश्वास तथा ऊर्जा',
    qualities: 'दृढ निश्चयी, महत्वाकांक्षी, जन्मजात नेता, रचनात्मक तथा स्वाभिमानी।',
    luckyColors: ['सुन्तला', 'पहेंलो', 'रातो', 'सुनौलो'],
    luckyDays: ['आइतबार', 'सोमबार'],
    luckyGems: ['माणिक्य (Ruby)', 'गार्नेट'],
    luckyDates: [1, 10, 19, 28],
    deity: 'भगवान् सूर्य नारायण / गायत्री',
    direction: 'पूर्व (East)',
    compatibleNumbers: [1, 2, 3, 5, 9],
    neutralNumbers: [4, 7],
    challengingNumbers: [6, 8]
  },
  2: {
    ruler: 'चन्द्रमा (Moon)',
    rulerIcon: '🌙',
    title: 'सहानुभूति, सौम्यता तथा कल्पनाशीलता',
    qualities: 'भावुक, शान्तिप्रिय, सहयोगी, कलाप्रेमी, कूटनीतिज्ञ तथा दूरदर्शी।',
    luckyColors: ['सेतो', 'क्रिम', 'हल्का हरियो'],
    luckyDays: ['सोमबार', 'आइतबार'],
    luckyGems: ['मोती (Pearl)', 'चन्द्रकान्त (Moonstone)'],
    luckyDates: [2, 11, 20, 29],
    deity: 'भगवान् शिव / माता पार्वती',
    direction: 'उत्तर-पश्चिम (North-West)',
    compatibleNumbers: [1, 2, 3, 4, 7],
    neutralNumbers: [6, 8],
    challengingNumbers: [5, 9]
  },
  3: {
    ruler: 'बृहस्पति (Jupiter)',
    rulerIcon: '🪐',
    title: 'ज्ञान, विवेक, गुरुत्व तथा समृद्धि',
    qualities: 'विद्वान, दार्शनिक, नीतिवान, आशावादी, उत्साही तथा धार्मिक प्रवृत्ति।',
    luckyColors: ['पहेंलो', 'हलेदो', 'केशरी'],
    luckyDays: ['बिहीबार', 'मङ्गलबार'],
    luckyGems: ['पुखराज (Yellow Sapphire)', 'सुन'],
    luckyDates: [3, 12, 21, 30],
    deity: 'भगवान् विष्णु / बृहस्पति देव',
    direction: 'ईशान (North-East)',
    compatibleNumbers: [1, 2, 3, 5, 7, 9],
    neutralNumbers: [8],
    challengingNumbers: [4, 6]
  },
  4: {
    ruler: 'राहु (North Node)',
    rulerIcon: '🌪️',
    title: 'क्रान्तिकारी सोच, व्यवहारिकता तथा कूटनीति',
    qualities: 'विश्लेषणात्मक, अनुशासनप्रिय, अपरम्परागत, कडा परिश्रमी तथा खोजकर्ता।',
    luckyColors: ['नीलो', 'खैरो', 'हल्का स्लेटी'],
    luckyDays: ['शनिबार', 'आइतबार'],
    luckyGems: ['गोमेद (Hessonite)'],
    luckyDates: [4, 13, 22, 31],
    deity: 'माता दुर्गा / भैरव',
    direction: 'नैऋत्य (South-West)',
    compatibleNumbers: [1, 2, 5, 6, 7],
    neutralNumbers: [8],
    challengingNumbers: [3, 4, 9]
  },
  5: {
    ruler: 'बुध (Mercury)',
    rulerIcon: '🟢',
    title: 'बुद्धिमत्ता, व्यापार, सञ्चार तथा चञ्चलता',
    qualities: 'तार्किक, बहुमुखी प्रतिभा, हाँसमुख, व्यापारिक चातुर्य तथा सञ्चारकुशल।',
    luckyColors: ['हरियो', 'फिरोजा', 'हल्का खैरो'],
    luckyDays: ['बुधबार', 'शुक्रबार'],
    luckyGems: ['पन्ना (Emerald)', 'ओनेक्स'],
    luckyDates: [5, 14, 23],
    deity: 'भगवान् गणेश / बुध देव',
    direction: 'उत्तर (North)',
    compatibleNumbers: [1, 3, 5, 6, 7, 8],
    neutralNumbers: [4, 9],
    challengingNumbers: [2]
  },
  6: {
    ruler: 'शुक्र (Venus)',
    rulerIcon: '💎',
    title: 'सौन्दर्य, कला, ऐश्वर्य तथा प्रेम',
    qualities: 'आकर्षक, रसिक, पारिवारिक, संगीत-कला प्रेमी तथा भौतिक सुखप्रिय।',
    luckyColors: ['सेतो', 'गुलाबी', 'चम्किलो नीलो'],
    luckyDays: ['शुक्रबार', 'बुधबार'],
    luckyGems: ['हीरा (Diamond)', 'ओपल', 'जर्कन'],
    luckyDates: [6, 15, 24],
    deity: 'माता महालक्ष्मी / सन्तोषी माता',
    direction: 'आग्नेय (South-East)',
    compatibleNumbers: [4, 5, 6, 7, 8],
    neutralNumbers: [2, 9],
    challengingNumbers: [1, 3]
  },
  7: {
    ruler: 'केतु (South Node)',
    rulerIcon: '🕉️',
    title: 'अध्यात्म, शोध, रहस्य तथा अन्तर्ज्ञान',
    qualities: 'दार्शनिक, एकाकी, गूढ विद्या प्रेमी, अन्तर्मुखी तथा तीक्ष्ण बुद्धि।',
    luckyColors: ['हल्का पहेंलो', 'चित्राङ्ग', 'सेतो'],
    luckyDays: ['सोमबार', 'बिहीबार'],
    luckyGems: ['लहसुनिया (Cat’s Eye)'],
    luckyDates: [7, 16, 25],
    deity: 'भगवान् गणेश / मत्स्य अवतार',
    direction: 'उत्तर-पूर्व / आन्तरिक',
    compatibleNumbers: [1, 2, 3, 5, 6],
    neutralNumbers: [4, 8],
    challengingNumbers: [7, 9]
  },
  8: {
    ruler: 'शनि (Saturn)',
    rulerIcon: '⚖️',
    title: 'न्याय, धैर्य, कडा परिश्रम तथा अनुशासन',
    qualities: 'गम्भीर, दृढ संकल्पी, संघर्षशील, न्यायप्रिय, दूरदर्शी तथा स्थिर।',
    luckyColors: ['कालो', 'गाढा नीलो', 'बैजनी'],
    luckyDays: ['शनिबार', 'शुक्रबार'],
    luckyGems: ['नीलम (Blue Sapphire)', 'एमेथिस्ट'],
    luckyDates: [8, 17, 26],
    deity: 'भगवान् शनिदेव / हनुमान् जी',
    direction: 'पश्चिम (West)',
    compatibleNumbers: [3, 5, 6, 7],
    neutralNumbers: [4, 8],
    challengingNumbers: [1, 2, 9]
  },
  9: {
    ruler: 'मंगल (Mars)',
    rulerIcon: '🔥',
    title: 'साहस, पराक्रम, गतिशीलता तथा नेतृत्व',
    qualities: 'उर्जावान, निडर, स्पष्टवक्ता, परोपकारी, संरक्षक तथा योद्धा स्वभाव।',
    luckyColors: ['रातो', 'गुलाबी', 'केशरी'],
    luckyDays: ['मङ्गलबार', 'बिहीबार'],
    luckyGems: ['मूंगा (Red Coral)'],
    luckyDates: [9, 18, 27],
    deity: 'भगवान् हनुमान् / कार्तिकेय',
    direction: 'दक्षिण (South)',
    compatibleNumbers: [1, 2, 3, 5],
    neutralNumbers: [6, 7],
    challengingNumbers: [4, 8]
  }
};

// Reduce number to single digit (1-9)
function reduceToSingleDigit(num: number): number {
  let n = Math.abs(num);
  while (n > 9) {
    let sum = 0;
    while (n > 0) {
      sum += n % 10;
      n = Math.floor(n / 10);
    }
    n = sum;
  }
  return n === 0 ? 9 : n;
}

// Calculate Name Number
function calculateNameNumber(name: string): number {
  const clean = name.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 1;
  let sum = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    sum += CHALDEAN_MAP[char] || 0;
  }
  return reduceToSingleDigit(sum);
}

export const AnkaJyotishView: React.FC<AnkaJyotishViewProps> = ({
  activeProfile,
  onSelectProfile
}) => {
  const [customName, setCustomName] = useState(activeProfile?.name || 'राम प्रसाद शर्मा');
  const [customDob, setCustomDob] = useState(activeProfile?.dateAD || '1995-05-15');

  // Extract day, month, year
  const { mulank, bhagyank, namank, personalYear, loShuGrid } = useMemo(() => {
    let day = 15;
    let month = 5;
    let year = 1995;

    if (customDob && customDob.includes('-')) {
      const parts = customDob.split('-');
      year = parseInt(parts[0], 10) || 1995;
      month = parseInt(parts[1], 10) || 5;
      day = parseInt(parts[2], 10) || 15;
    }

    const calculatedMulank = reduceToSingleDigit(day);

    // Bhagyank = sum of day + month + year
    let fullSum = 0;
    const dateDigits = `${year}${month}${day}`.replace(/[^0-9]/g, '');
    for (let i = 0; i < dateDigits.length; i++) {
      fullSum += parseInt(dateDigits[i], 10);
    }
    const calculatedBhagyank = reduceToSingleDigit(fullSum);

    const calculatedNamank = calculateNameNumber(customName);

    // Current Personal Year Number for 2026
    const currentYear = 2026;
    let pySum = 0;
    const pyDigits = `${currentYear}${month}${day}`;
    for (let i = 0; i < pyDigits.length; i++) {
      pySum += parseInt(pyDigits[i], 10);
    }
    const calculatedPY = reduceToSingleDigit(pySum);

    // Lo-Shu Grid Counts
    // Lo-Shu 3x3 Standard:
    // [4, 9, 2]
    // [3, 5, 7]
    // [8, 1, 6]
    const allDigits = `${year}${month < 10 ? '0' + month : month}${day < 10 ? '0' + day : day}${calculatedMulank}${calculatedBhagyank}`;
    const digitCount: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) digitCount[i] = 0;
    for (let i = 0; i < allDigits.length; i++) {
      const d = parseInt(allDigits[i], 10);
      if (d >= 1 && d <= 9) {
        digitCount[d] = (digitCount[d] || 0) + 1;
      }
    }

    return {
      mulank: calculatedMulank,
      bhagyank: calculatedBhagyank,
      namank: calculatedNamank,
      personalYear: calculatedPY,
      loShuGrid: digitCount
    };
  }, [customName, customDob]);

  const mulankProfile = NUMBER_PROFILES[mulank] || NUMBER_PROFILES[1];
  const bhagyankProfile = NUMBER_PROFILES[bhagyank] || NUMBER_PROFILES[1];
  const namankProfile = NUMBER_PROFILES[namank] || NUMBER_PROFILES[1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-[#7A1C1C] to-stone-900 text-amber-50 rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold">
              <Hash className="w-4 h-4" />
              <span>वैदिक एवं क्याल्डियन अंक ज्योतिष (Vedic Numerology)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
              मूलाङ्क, भाग्याङ्क तथा नामाङ्क विश्लेषण
            </h1>
            <p className="text-sm text-amber-200/90 max-w-2xl leading-relaxed">
              तपाईंको जन्म मिति र नामका अक्षरहरूमा लुकेको ब्रह्माण्डीय ऊर्जा, ९ ग्रहहरूको प्रभाव, शुभ सूचक, लो-शु ग्रिड तथा जीवन मार्गको सूक्ष्म गणितीय विश्लेषण।
            </p>
          </div>
        </div>
      </div>

      {/* Input / Native Selector Bar */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h2 className="text-sm font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>अंक ज्योतिष गणना विवरण</span>
          </h2>
          {activeProfile && (
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
              सक्रिय जातक: <strong className="text-stone-900 dark:text-stone-100">{activeProfile.name}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              पूरा नाम (अंग्रेजीमा क्याल्डियन मानका लागि):
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Ram Prasad Sharma"
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              जन्म मिति (ई.सं. AD YYYY-MM-DD):
            </label>
            <input
              type="date"
              value={customDob}
              onChange={(e) => setCustomDob(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                if (activeProfile) {
                  setCustomName(activeProfile.name);
                  setCustomDob(activeProfile.dateAD);
                }
              }}
              className="w-full py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 text-[#7A1C1C] dark:text-amber-300 font-bold rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>सक्रिय जातकको विवरण पुनः लोड</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Pillar Numbers Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Mulank Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-stone-900 dark:to-stone-800/80 rounded-3xl border border-amber-300 dark:border-amber-800/60 p-5 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#7A1C1C] dark:text-amber-300 border border-amber-300/40">
              जन्म मिति अंक
            </span>
            <span className="text-xl">{mulankProfile.rulerIcon}</span>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-4xl sm:text-5xl font-black font-mono text-[#7A1C1C] dark:text-amber-400">
              {toDevanagariNumerals(mulank)}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                मूलाङ्क (Root Number)
              </h3>
              <p className="text-xs font-bold text-[#D97706] dark:text-amber-400">
                स्वामी: {mulankProfile.ruler}
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed border-t border-amber-200 dark:border-stone-700/80 pt-2.5">
            <strong>मूल स्वभाव:</strong> {mulankProfile.qualities}
          </p>
        </div>

        {/* Bhagyank Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100/60 dark:from-stone-900 dark:to-stone-800/80 rounded-3xl border border-red-300 dark:border-red-800/60 p-5 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-800 dark:text-red-300 border border-red-300/40">
              सम्पूर्ण मिति योग
            </span>
            <span className="text-xl">{bhagyankProfile.rulerIcon}</span>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-4xl sm:text-5xl font-black font-mono text-red-800 dark:text-red-400">
              {toDevanagariNumerals(bhagyank)}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                भाग्याङ्क (Life Path)
              </h3>
              <p className="text-xs font-bold text-red-700 dark:text-red-400">
                स्वामी: {bhagyankProfile.ruler}
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed border-t border-red-200 dark:border-stone-700/80 pt-2.5">
            <strong>जीवन लक्ष्य:</strong> {bhagyankProfile.title}
          </p>
        </div>

        {/* Namank Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-stone-900 dark:to-stone-800/80 rounded-3xl border border-emerald-300 dark:border-emerald-800/60 p-5 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
              नाम कम्पन अंक
            </span>
            <span className="text-xl">{namankProfile.rulerIcon}</span>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-800 dark:text-emerald-400">
              {toDevanagariNumerals(namank)}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                नामाङ्क (Name Number)
              </h3>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                स्वामी: {namankProfile.ruler}
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed border-t border-emerald-200 dark:border-stone-700/80 pt-2.5">
            <strong>सामाजिक प्रभाव:</strong> {namankProfile.qualities}
          </p>
        </div>
      </div>

      {/* Grid: Auspicious Indicators & Lo-Shu Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auspicious Recommendations */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Award className="w-5 h-5 text-[#7A1C1C] dark:text-amber-400" />
            <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif">
              मूलाङ्क {toDevanagariNumerals(mulank)} को शुभ सूचक तथा वैदिक मार्गदर्शन
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 space-y-1.5">
              <span className="font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-1.5">
                <Palette className="w-4 h-4" /> शुभ रङ्गहरू:
              </span>
              <p className="text-stone-800 dark:text-stone-200 font-medium">
                {mulankProfile.luckyColors.join(', ')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 space-y-1.5">
              <span className="font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> शुभ वार तथा मितिहरू:
              </span>
              <p className="text-stone-800 dark:text-stone-200 font-medium">
                वार: {mulankProfile.luckyDays.join(', ')} | मिति: {mulankProfile.luckyDates.map(d => toDevanagariNumerals(d)).join(', ')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 space-y-1.5">
              <span className="font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-1.5">
                <Gem className="w-4 h-4" /> शुभ रत्न तथा धातु:
              </span>
              <p className="text-stone-800 dark:text-stone-200 font-medium">
                {mulankProfile.luckyGems.join(', ')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 space-y-1.5">
              <span className="font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> इष्टदेव तथा शुभ दिशा:
              </span>
              <p className="text-stone-800 dark:text-stone-200 font-medium">
                {mulankProfile.deity} (दिशा: {mulankProfile.direction})
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
            <span className="font-bold text-stone-900 dark:text-stone-100 block">
              🤝 अनुकूल अंक सम्बन्ध (Compatibility Numbers):
            </span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                अति मित्र अंक: {mulankProfile.compatibleNumbers.map(n => toDevanagariNumerals(n)).join(', ')}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 font-bold">
                सम अंक: {mulankProfile.neutralNumbers.map(n => toDevanagariNumerals(n)).join(', ')}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300 font-bold">
                शत्रु / संघर्ष अंक: {mulankProfile.challengingNumbers.map(n => toDevanagariNumerals(n)).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Lo-Shu Vedic 3x3 Grid */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
            <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D97706]" />
              <span>लो-शु ग्रिड (Lo-Shu Grid)</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              जन्म मितिका अंकहरूको ३×३ चक्रमा उपस्थिति
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto py-2">
            {[
              [4, 9, 2],
              [3, 5, 7],
              [8, 1, 6]
            ].flat().map((num) => {
              const count = loShuGrid[num] || 0;
              const hasDigit = count > 0;
              return (
                <div
                  key={num}
                  className={`h-16 rounded-2xl flex flex-col items-center justify-center font-mono border transition-all ${
                    hasDigit
                      ? 'bg-amber-100/90 dark:bg-amber-950/80 border-amber-400 dark:border-amber-700 text-[#7A1C1C] dark:text-amber-300 font-bold shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800/40 border-dashed border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-600'
                  }`}
                >
                  <span className="text-lg font-black">{toDevanagariNumerals(num)}</span>
                  <span className="text-[10px] font-sans">
                    {hasDigit ? `${toDevanagariNumerals(count)} पटक` : '-'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-stone-600 dark:text-stone-400 text-center leading-relaxed">
            💡 ग्रिडमा बारम्बार दोहोरिएका अंकले त्यस ग्रहको बढी प्रभाव र नआएका अंकले जीवनमा सुधार गर्नुपर्ने पक्षलाई जनाउँछन्।
          </div>
        </div>
      </div>
    </div>
  );
};
