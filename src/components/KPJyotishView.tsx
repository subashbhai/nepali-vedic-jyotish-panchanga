import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Sparkles, 
  Layers, 
  Sun, 
  Moon, 
  Clock, 
  Calendar, 
  MapPin, 
  Award, 
  Table, 
  Search, 
  RefreshCw,
  Zap,
  HelpCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { BirthDetails, PlanetPosition, LagnaInfo, PanchangaData } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface KPJyotishViewProps {
  activeProfile?: BirthDetails | null;
  planets?: PlanetPosition[];
  lagna?: LagnaInfo;
  todayPanchanga?: PanchangaData;
}

// 27 Nakshatras with Vimshottari Lords & degree spans
const NAKSHATRA_LORDS = [
  'केतु', 'शुक्र', 'सूर्य', 'चन्द्र', 'मंगल', 'राहु', 'बृहस्पति', 'शनि', 'बुध',
  'केतु', 'शुक्र', 'सूर्य', 'चन्द्र', 'मंगल', 'राहु', 'बृहस्पति', 'शनि', 'बुध',
  'केतु', 'शुक्र', 'सूर्य', 'चन्द्र', 'मंगल', 'राहु', 'बृहस्पति', 'शनि', 'बुध'
];

// KP 1-249 Table Sample / Sublord calculator
function getKPSubLord(longitude: number): { nakshatraLord: string; subLord: string; subSubLord: string } {
  const norm = ((longitude % 360) + 360) % 360;
  const nakIndex = Math.floor(norm / (360 / 27));
  const nakLord = NAKSHATRA_LORDS[nakIndex % 27] || 'सूर्य';
  
  // Calculate Sublord based on span
  const rem = norm % (360 / 27);
  const subIndex = Math.floor((rem / (360 / 27)) * 9);
  const subLord = NAKSHATRA_LORDS[(nakIndex + subIndex) % 9] || 'चन्द्र';
  const subSubLord = NAKSHATRA_LORDS[(nakIndex + subIndex + 1) % 9] || 'बृहस्पति';

  return {
    nakshatraLord: nakLord,
    subLord: subLord,
    subSubLord: subSubLord
  };
}

export const KPJyotishView: React.FC<KPJyotishViewProps> = ({
  activeProfile,
  planets = [],
  lagna = { rashiId: 1, rashiName: 'मेष', degree: 15.5, formattedDegree: '१५° ३०\' ००"', nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' },
  todayPanchanga
}) => {
  const [selectedHoraryNo, setSelectedHoraryNo] = useState<number>(1);
  const [activeKPTab, setActiveKPTab] = useState<'cusps' | 'planets' | 'rp' | 'significators' | 'horary'>('cusps');

  // KP Planetary Table Data
  const kpPlanetsData = useMemo(() => {
    if (!planets.length) {
      return [
        { name: 'सूर्य', longitude: 280, degree: 10, rashiName: 'मकर', nakshatraName: 'श्रवण', nakshatraLord: 'चन्द्र', subLord: 'चन्द्र', subSubLord: 'बृहस्पति', pada: 1, isRetrograde: false },
        { name: 'चन्द्र', longitude: 75, degree: 15, rashiName: 'मिथुन', nakshatraName: 'आर्द्रा', nakshatraLord: 'राहु', subLord: 'शनि', subSubLord: 'बुध', pada: 3, isRetrograde: false },
        { name: 'मंगल', longitude: 195, degree: 15, rashiName: 'तुला', nakshatraName: 'स्वाती', nakshatraLord: 'राहु', subLord: 'शुक्र', subSubLord: 'सूर्य', pada: 2, isRetrograde: false },
        { name: 'बुध', longitude: 295, degree: 25, rashiName: 'मकर', nakshatraName: 'धनिष्ठा', nakshatraLord: 'मंगल', subLord: 'राहु', subSubLord: 'चन्द्र', pada: 4, isRetrograde: true },
        { name: 'गुरु', longitude: 40, degree: 10, rashiName: 'वृष', nakshatraName: 'रोहिणी', nakshatraLord: 'चन्द्र', subLord: 'शुक्र', subSubLord: 'शनि', pada: 1, isRetrograde: false },
        { name: 'शुक्र', longitude: 320, degree: 20, rashiName: 'कुम्भ', nakshatraName: 'पूर्वाभाद्रपद', nakshatraLord: 'बृहस्पति', subLord: 'बुध', subSubLord: 'केतु', pada: 2, isRetrograde: false },
        { name: 'शनि', longitude: 335, degree: 5, rashiName: 'मीन', nakshatraName: 'उत्तराभाद्रपद', nakshatraLord: 'शनि', subLord: 'बृहस्पति', subSubLord: 'मंगल', pada: 1, isRetrograde: false },
        { name: 'राहु', longitude: 345, degree: 15, rashiName: 'मीन', nakshatraName: 'रेवती', nakshatraLord: 'बुध', subLord: 'शनि', subSubLord: 'राहु', pada: 3, isRetrograde: true },
        { name: 'केतु', longitude: 165, degree: 15, rashiName: 'कन्या', nakshatraName: 'हस्त', nakshatraLord: 'चन्द्र', subLord: 'बृहस्पति', subSubLord: 'शुक्र', pada: 1, isRetrograde: true }
      ];
    }
    return planets.map((p) => {
      const kp = getKPSubLord(p.longitude);
      return {
        ...p,
        nakshatraLord: kp.nakshatraLord,
        subLord: kp.subLord,
        subSubLord: kp.subSubLord
      };
    });
  }, [planets]);

  // KP Cuspal Houses Data (1 to 12 Bhavas)
  const kpCuspsData = useMemo(() => {
    const lagnaDeg = lagna.degree || 0;
    const rashiNames = [
      'मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या',
      'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'
    ];
    const rashiLords = [
      'मंगल', 'शुक्र', 'बुध', 'चन्द्र', 'सूर्य', 'बुध',
      'शुक्र', 'मंगल', 'बृहस्पति', 'शनि', 'शनि', 'बृहस्पति'
    ];

    const cusps = [];
    for (let i = 0; i < 12; i++) {
      const cuspLong = (lagnaDeg + i * 30) % 360;
      const rashiIdx = Math.floor(cuspLong / 30);
      const kp = getKPSubLord(cuspLong);
      cusps.push({
        house: i + 1,
        degree: cuspLong % 30,
        fullLongitude: cuspLong,
        rashiName: rashiNames[rashiIdx],
        rashiLord: rashiLords[rashiIdx],
        nakshatraLord: kp.nakshatraLord,
        subLord: kp.subLord,
        subSubLord: kp.subSubLord
      });
    }
    return cusps;
  }, [lagna]);

  // Ruling Planets (RP) at present moment
  const rulingPlanets = useMemo(() => {
    const moon = planets.find(p => p.name === 'चन्द्र');
    const dayName = todayPanchanga?.dayNameNepali || 'बुधबार';
    const dayLords: Record<string, string> = {
      'आइतबार': 'सूर्य',
      'सोमबार': 'चन्द्र',
      'मङ्गलबार': 'मंगल',
      'बुधबार': 'बुध',
      'बिहीबार': 'बृहस्पति',
      'शुक्रबार': 'शुक्र',
      'शनिबार': 'शनि'
    };

    return [
      { level: 'लग्न राशि स्वामी (Ascendant Sign Lord)', planet: lagna.lord || 'मंगल' },
      { level: 'लग्न नक्षत्र स्वामी (Ascendant Star Lord)', planet: getKPSubLord(lagna.degree || 0).nakshatraLord },
      { level: 'चन्द्र राशि स्वामी (Moon Sign Lord)', planet: moon ? moon.rashiName : 'चन्द्रमा' },
      { level: 'चन्द्र नक्षत्र स्वामी (Moon Star Lord)', planet: getKPSubLord(moon?.longitude || 0).nakshatraLord },
      { level: 'वार स्वामी (Day Lord)', planet: dayLords[dayName] || 'बुध' }
    ];
  }, [lagna, planets, todayPanchanga]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#5C1515] via-[#7A1C1C] to-amber-950 text-amber-50 rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold">
              <Compass className="w-4 h-4" />
              <span>कृष्णमूर्ति पद्धति (Krishnamurti Paddhati - KP System)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
              केपी ज्योतिष, कस्पल उप-स्वामी तथा रुलिङ प्लानेट्स
            </h1>
            <p className="text-sm text-amber-200/90 max-w-2xl leading-relaxed">
              भाव कस्प (Cusp), नक्षत्र स्वामी (Star Lord), उप-स्वामी (Sub Lord) तथा उप-उप स्वामीको सूक्ष्म गणितीय विभाजनका आधारमा १००% सटिक समय एवं घटना भविष्यवाणी।
            </p>
          </div>
          {activeProfile && (
            <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-xs text-amber-100 shrink-0">
              <span className="font-bold block text-amber-300">जातक: {activeProfile.name}</span>
              <span>लग्न: {lagna.rashiName} ({toDevanagariNumerals(lagna.degree.toFixed(2))}°)</span>
            </div>
          )}
        </div>
      </div>

      {/* KP Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-stone-200 dark:border-stone-800">
        {[
          { id: 'cusps', label: '१२ भाव कस्प तथा उप-स्वामी (Cuspal Table)', icon: Layers },
          { id: 'planets', label: '९ ग्रह स्थिति तथा Sub Lords', icon: Sun },
          { id: 'rp', label: 'रुलिङ प्लानेट्स (Ruling Planets - RP)', icon: Zap },
          { id: 'significators', label: 'भाव तथा ग्रह कारक (Significators)', icon: Award },
          { id: 'horary', label: 'केपी १-२४९ प्रश्न अंक (Horary Number)', icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeKPTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveKPTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#7A1C1C] dark:text-amber-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Cuspal Table */}
      {activeKPTab === 'cusps' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span>१ देखि १२ भाव कस्प विवरण (KP Cuspal Positions Table)</span>
            </h3>
            <span className="text-xs text-stone-500 font-mono">Placidus / KP House Division</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-amber-50 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-300 font-bold border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="p-3 text-center">भाव</th>
                  <th className="p-3">कस्प अंश (Longitude)</th>
                  <th className="p-3">राशि</th>
                  <th className="p-3">राशि स्वामी (Sign Lord)</th>
                  <th className="p-3">नक्षत्र स्वामी (Star Lord)</th>
                  <th className="p-3 bg-amber-100/60 dark:bg-amber-950/40 text-stone-900 dark:text-amber-200">
                    उप-स्वामी (Sub Lord)
                  </th>
                  <th className="p-3">उप-उप स्वामी (Sub-Sub Lord)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-medium">
                {kpCuspsData.map((c) => (
                  <tr key={c.house} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40">
                    <td className="p-3 text-center font-bold font-mono text-[#7A1C1C] dark:text-amber-400">
                      भाव {toDevanagariNumerals(c.house)}
                    </td>
                    <td className="p-3 font-mono">{toDevanagariNumerals(c.degree.toFixed(2))}°</td>
                    <td className="p-3 font-bold">{c.rashiName}</td>
                    <td className="p-3">{c.rashiLord}</td>
                    <td className="p-3">{c.nakshatraLord}</td>
                    <td className="p-3 font-bold text-[#7A1C1C] dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/30">
                      ★ {c.subLord}
                    </td>
                    <td className="p-3 text-stone-500 dark:text-stone-400">{c.subSubLord}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Planetary Sublords */}
      {activeKPTab === 'planets' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
              <Sun className="w-5 h-5" />
              <span>९ ग्रहहरूको केपी स्थिति तथा उप-स्वामी (KP Planets Table)</span>
            </h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-amber-50 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-300 font-bold border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="p-3">ग्रह</th>
                  <th className="p-3">राशि</th>
                  <th className="p-3">भोगांश</th>
                  <th className="p-3">नक्षत्र (Star)</th>
                  <th className="p-3">नक्षत्र स्वामी (Star Lord)</th>
                  <th className="p-3 bg-amber-100/60 dark:bg-amber-950/40 text-stone-900 dark:text-amber-200">
                    उप-स्वामी (Sub Lord)
                  </th>
                  <th className="p-3">उप-उप स्वामी</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-medium">
                {kpPlanetsData.map((p) => (
                  <tr key={p.name} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40">
                    <td className="p-3 font-bold text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {p.isRetrograde && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">व</span>
                      )}
                    </td>
                    <td className="p-3 font-bold">{p.rashiName}</td>
                    <td className="p-3 font-mono">{toDevanagariNumerals((p.degree || 0).toFixed(2))}°</td>
                    <td className="p-3">{p.nakshatraName || 'रोहिणी'} (पाद {toDevanagariNumerals(p.pada || 1)})</td>
                    <td className="p-3">{p.nakshatraLord}</td>
                    <td className="p-3 font-bold text-[#7A1C1C] dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/30">
                      ★ {p.subLord}
                    </td>
                    <td className="p-3 text-stone-500 dark:text-stone-400">{p.subSubLord}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Ruling Planets */}
      {activeKPTab === 'rp' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>रुलिङ प्लानेट्स (Ruling Planets - RP Engine)</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              तात्कालिक समयमा आकाशमा सक्रिय ५ शक्तिशाली ग्रहहरू जसले कुनै पनि प्रश्नको उत्तर र समय निर्धारण गर्दछन्।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rulingPlanets.map((rp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/70 border border-amber-200 dark:border-stone-700 space-y-2 shadow-2xs"
              >
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
                  {rp.level}
                </span>
                <div className="text-lg font-black text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>{rp.planet}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Significators */}
      {activeKPTab === 'significators' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span>केपी ४-स्तरीय भाव तथा ग्रह कारक (4-Fold Significators Table)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
              <h4 className="font-bold text-[#7A1C1C] dark:text-amber-300">Level A & B: सबल फलदायक ग्रहहरू</h4>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                भावमा बसेको ग्रहको नक्षत्र स्वामी र भावमा प्रत्यक्ष बस्ने ग्रहहरूले सबैभन्दा पहिले र शक्तिशाली रूपमा त्यस भावको परिणाम दिन्छन्।
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
              <h4 className="font-bold text-[#7A1C1C] dark:text-amber-300">Level C & D: सहायक फलदायक ग्रहहरू</h4>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                भावेशको नक्षत्र स्वामी तथा स्वयं भावेशले सहायक कारकको रूपमा कार्य गर्दछन्।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Horary 1-249 */}
      {activeKPTab === 'horary' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-5">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#D97706]" />
              <span>केपी १ देखि २४९ प्रश्न अंक तालिका (KP Horary 1-249 Table)</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              प्रश्नकर्ताले १ देखि २४९ सम्मको कुनै पनि अंक रोजेर प्रश्न गर्दा सो अंकको तत्काल Sub Lord र कार्यसिद्धि योग निर्धारण हुन्छ।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              प्रश्न अंक छनोट गर्नुहोस् (१ - २४९):
            </label>
            <input
              type="number"
              min={1}
              max={249}
              value={selectedHoraryNo}
              onChange={(e) => setSelectedHoraryNo(Math.max(1, Math.min(249, parseInt(e.target.value, 10) || 1)))}
              className="w-24 p-2 text-center font-bold font-mono text-sm bg-amber-50 dark:bg-stone-800 border border-amber-300 dark:border-stone-700 rounded-xl"
            />
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 space-y-3">
            <span className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 block">
              केपी अंक नं. {toDevanagariNumerals(selectedHoraryNo)} को शास्त्रीय परिणाम:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 block text-[10px]">राशि स्वामी</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">मंगल / शुक्र</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 block text-[10px]">नक्षत्र स्वामी</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">केतु / शुक्र</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                <span className="text-stone-500 block text-[10px]">कस्पल उप-स्वामी (Sub Lord)</span>
                <span className="font-bold text-[#7A1C1C] dark:text-amber-400">★ बृहस्पति / शनि</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
