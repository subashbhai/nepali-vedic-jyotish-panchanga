import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';
import { Sparkles, Clock, ShieldAlert, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { PlanetName, BirthDetails, PlanetPosition } from '../types/astrology';
import { DashaNode } from '../utils/dashaEngine';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

export interface PlanetaryRemedy {
  planet: PlanetName;
  englishName: string;
  gemstone: string;
  metal: string;
  mantra: string;
  japCount: string;
  donation: string;
  deity: string;
  rudraksha: string;
  fastingDay: string;
  precaution: string;
  classicalSignificance: string;
  colorHex: string;
}

export const PLANETARY_REMEDIES: Record<PlanetName, PlanetaryRemedy> = {
  'सूर्य': {
    planet: 'सूर्य',
    englishName: 'Sun',
    gemstone: 'माणिक्य (Ruby) - सुन वा तामामा अनामिका औंलामा',
    metal: 'तामा वा सुन',
    mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः (वा ॐ घृणि सूर्याय नमः)',
    japCount: '७,००० पटक (वा दैनिक १०८ पटक)',
    donation: 'गहुँ, तामा, रातो चन्दन, सख्खर (गुँड), रातो वस्त्र वा गाईलाई गहुँ खुवाउने',
    deity: 'भगवान् सूर्य नारायण (आदित्यहृदय स्तोत्र पाठ, नित्य सूर्य अर्घ्य)',
    rudraksha: '१ वा १२ मुखी रुद्राक्ष',
    fastingDay: 'आइतबार (नुन बिनाको भोजन)',
    precaution: 'अहंकार नगर्नुहोस्, बुबाको आदर गर्नुहोस्, आँखा तथा मुटुको स्वास्थ्यमा ध्यान दिनुहोस्।',
    classicalSignificance: 'आत्मबल, सरकारी प्रतिष्ठा, पितासुख, मान-सम्मान र नेतृत्व क्षमतामा वृद्धि।',
    colorHex: '#F59E0B'
  },
  'चन्द्र': {
    planet: 'चन्द्र',
    englishName: 'Moon',
    gemstone: 'मोती (Pearl) वा चन्द्रकान्त मणि - चाँदीमा कान्छी औंलामा',
    metal: 'चाँदी',
    mantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः (वा ॐ सों सोमाय नमः)',
    japCount: '११,००० पटक (वा दैनिक १०८ पटक)',
    donation: 'दूध, चामल, चाँदी, सेतो वस्त्र, कपुर, शङ्ख वा मिश्री',
    deity: 'भगवान् शिवजी (सोमवार शिवलिङ्गमा जल/दूध अर्पण, चन्द्र कवच)',
    rudraksha: '२ मुखी रुद्राक्ष',
    fastingDay: 'सोमबार (भगवान् शिवको उपासना)',
    precaution: 'मानसिक चिन्ता नलिनुहोस्, आमाको नित्य सेवा गर्नुहोस्, चिसो र कफ विकारबाट जोगिनुहोस्।',
    classicalSignificance: 'मानसिक शान्ति, मातृसुख, भावना सन्तुलन, जलयात्रा र जनसम्पर्कमा सफलता।',
    colorHex: '#38BDF8'
  },
  'मंगल': {
    planet: 'मंगल',
    englishName: 'Mars',
    gemstone: 'रातो मुगा (Red Coral) - तामा वा सुनमा अनामिका औंलामा',
    metal: 'तामा वा अष्टधातु',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः (वा ॐ अं अङ्गारकाय नमः)',
    japCount: '१०,००० पटक (वा दैनिक १०८ पटक)',
    donation: 'मुसुरोको दाल, तामाको भाँडो, रातो वस्त्र, सख्खर वा रक्तदान',
    deity: 'श्री हनुमान जी (हनुमान चालिसा, सुन्दरकाण्ड पाठ, मङ्गल चण्डिका स्तोत्र)',
    rudraksha: '३ मुखी रुद्राक्ष',
    fastingDay: 'मंगलबार (हनुमान जीको सेवा)',
    precaution: 'रिस र उत्तेजना नियन्त्रण गर्नुहोस्, सवारी साधन चलाउँदा सतर्क रहनुहोस्, भाइहरूसँग मेलमिलाप राख्नुहोस्।',
    classicalSignificance: 'पराक्रम, भूमि-सम्पत्ति, भ्रातृसुख, सेना/प्रहरी/प्राविधिक क्षेत्रमा विशेष उन्नति।',
    colorHex: '#EF4444'
  },
  'राहु': {
    planet: 'राहु',
    englishName: 'Rahu',
    gemstone: 'गोमेद (Hessonite) - पञ्चधातु वा चाँदीमा मध्यमा औंलामा (परीक्षण पश्चात मात्र)',
    metal: 'सीसा वा चाँदी',
    mantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः (वा ॐ रां राहवे नमः)',
    japCount: '१८,००० पटक (वा दैनिक १०८ पटक साँझको समयमा)',
    donation: 'कालो मासको दाल, तोरीको तेल, कालो छाता, सुक्खा नरिवल, चरालाई सप्तधान्य दाना',
    deity: 'माँ दुर्गा / बटुक भैरव (दुर्गा सप्तशती, महामृत्युञ्जय जप)',
    rudraksha: '८ मुखी रुद्राक्ष',
    fastingDay: 'शनिबार वा औंसीको दिन',
    precaution: 'नशा, जुवा, भ्रमपूर्ण लगानी र अनैतिक कार्यबाट टाढा रहनुहोस्; सफा-सुग्घर रहनुहोस्।',
    classicalSignificance: 'अचानक धनलाभ, वैदेशिक यात्रा, अनुसन्धान, राजनीति र प्रविधिमा चमत्कारिक सफलता।',
    colorHex: '#6366F1'
  },
  'गुरु': {
    planet: 'गुरु',
    englishName: 'Jupiter',
    gemstone: 'पहेंलो पुखराज (Yellow Sapphire) - सुन वा पञ्चधातुमा चोर औंलामा',
    metal: 'सुन वा पित्तल',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः (वा ॐ बृं बृहस्पतये नमः)',
    japCount: '१९,००० पटक (वा दैनिक १०८ पटक बिहान)',
    donation: 'चनाको दाल, बेसार, सुन, पहेंलो वस्त्र, धार्मिक पुस्तक, गाईलाई चना-गुड',
    deity: 'भगवान् श्रीहरि विष्णु (विष्णु सहस्रनाम पाठ, सत्यनारायण कथा)',
    rudraksha: '५ मुखी रुद्राक्ष',
    fastingDay: 'बिहीबार (पहेंलो वस्त्र तथा चनाको दाल सेवन)',
    precaution: 'गुरु-ब्राह्मणको अपमान नगर्नुहोस्, धर्म र नैतिकता नत्याग्नुहोस्, कलेजो र मोटोपनको ख्याल गर्नुहोस्।',
    classicalSignificance: 'उच्च ज्ञान, सन्तान सुख, धर्म-अध्यात्म, धन-सम्पत्ति र सामाजिक प्रतिष्ठा।',
    colorHex: '#EAB308'
  },
  'शनि': {
    planet: 'शनि',
    englishName: 'Saturn',
    gemstone: 'नीलम (Blue Sapphire) - पञ्चधातु वा फलाममा मध्यमा औंलामा (कडा परीक्षण पश्चात मात्र)',
    metal: 'फलाम वा पञ्चधातु',
    mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः (वा ॐ शं शनैश्चराय नमः)',
    japCount: '२३,००० पटक (वा दैनिक १०८ पटक साँझ पीपलको रुखमुनि)',
    donation: 'कालो तिल, फलामको भाँडो, तोरीको तेल, कालो कम्बल, जुत्ता, दीनदुःखीलाई अन्न',
    deity: 'भगवान् शनिदेव तथा हनुमान जी (शनि चालिसा, दशरथकृत शनि स्तोत्र पाठ)',
    rudraksha: '७ वा १४ मुखी रुद्राक्ष',
    fastingDay: 'शनिबार (साँझ एक छाक सादा भोजन)',
    precaution: 'आलस्य त्याग्नुहोस्, मजदुर र कमजोर वर्गको हक नखोस्नुहोस्, निष्ठापूर्वक श्रम गर्नुहोस्।',
    classicalSignificance: 'दीर्घायु, गम्भीर सोच, संगठन क्षमता, जनताको प्रियता, कठोर साधनाबाट उच्च पद।',
    colorHex: '#475569'
  },
  'बुध': {
    planet: 'बुध',
    englishName: 'Mercury',
    gemstone: 'पन्ना (Emerald) - सुन वा चाँदीमा कान्छी औंलामा',
    metal: 'काँस वा सुन',
    mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः (वा ॐ बुं बुधाय नमः)',
    japCount: '९,००० पटक (वा दैनिक १०८ पटक बिहान)',
    donation: 'हरियो मुँग दाल, हरियो वस्त्र, काँसको भाँडो, गाईलाई हरियो घाँस वा पालक',
    deity: 'भगवान् श्री गणेश जी (गणेश अथर्वशीर्ष पाठ, दुर्वा अर्पण)',
    rudraksha: '४ वा १० मुखी रुद्राक्ष',
    fastingDay: 'बुधबार (गणेशजीको उपासना)',
    precaution: 'वाचा पालना गर्नुहोस्, बोलीमा मिठास राख्नुहोस्, कागजात नहेरी हस्ताक्षर नगर्नुहोस्।',
    classicalSignificance: 'व्यापारिक चातुर्य, उत्कृष्ट वाक्शक्ति, गणित, पत्रकारिता र बौद्धिक ख्याति।',
    colorHex: '#10B981'
  },
  'केतु': {
    planet: 'केतु',
    englishName: 'Ketu',
    gemstone: 'लहसुनिया (Cat’s Eye / वैदूर्य) - चाँदी वा अष्टधातुमा कान्छी/मध्यमा औंलामा',
    metal: 'चाँदी वा अष्टधातु',
    mantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः (वा ॐ कें केतवे नमः)',
    japCount: '१७,००० पटक (वा दैनिक १०८ पटक रात्रिकालमा)',
    donation: 'कालो-सेतो तिल, कम्बल, लसुन-प्याज रहित अन्न, कुकुरलाई रोटी खुवाउने',
    deity: 'भगवान् गणेश जी तथा मत्स्य अवतार (सङ्कटनाशन स्तोत्र)',
    rudraksha: '९ मुखी रुद्राक्ष',
    fastingDay: 'मंगलबार वा बिहीबार',
    precaution: 'शंकालु स्वभाव त्याग्नुहोस्, कुकुरलाई नकुट्नुहोस्, आध्यात्मिक चिन्तन र ध्यान बढाउनुहोस्।',
    classicalSignificance: 'मोक्ष, वैराग्य, गूढ ज्ञान, तन्त्र-मन्त्र, अनुसन्धान र गुप्त विद्याको प्राप्ति।',
    colorHex: '#854D0E'
  },
  'शुक्र': {
    planet: 'शुक्र',
    englishName: 'Venus',
    gemstone: 'हीरा (Diamond) वा ओपल / सेतो जरकन - चाँदी वा सेतो सुनमा अनामिका औंलामा',
    metal: 'चाँदी वा प्लेटिनम',
    mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः (वा ॐ शुं शुक्राय नमः)',
    japCount: '१६,००० पटक (वा दैनिक १०८ पटक बिहान)',
    donation: 'खीर, सेतो चन्दन, सेतो वस्त्र, चाँदी, गाईको घिउ, मिश्री वा कन्या पूजा',
    deity: 'माँ महालक्ष्मी (श्रीसूक्त, लक्ष्मी स्तोत्र, कनकधारा स्तोत्र)',
    rudraksha: '६ मुखी रुद्राक्ष',
    fastingDay: 'शुक्रबार (सेतो वस्तुको दान र कन्या पूजा)',
    precaution: 'महिलाको सम्मान गर्नुहोस्, विलासितामा फजुल खर्च नियन्त्रण गर्नुहोस्, चरित्र शुद्ध राख्नुहोस्।',
    classicalSignificance: 'वैवाहिक सुख, वाहन-विलासिता, कला-सङ्गीत, सौन्दर्य र आकर्षणमा पूर्णता।',
    colorHex: '#EC4899'
  }
};

interface DashaTimelineChartProps {
  mahadashas: DashaNode[];
  profile?: BirthDetails;
  currentDateAD?: string;
  onSelectNode?: (node: DashaNode) => void;
  className?: string;
}

interface TimelineItem {
  id: string;
  planet: PlanetName;
  displayName: string;
  durationYears: number;
  durationFormatted: string;
  startDateBS: string;
  endDateBS: string;
  startDateAD: string;
  endDateAD: string;
  isCurrent: boolean;
  ageStart: number;
  ageEnd: number;
  remedy: PlanetaryRemedy;
}

export const DashaTimelineChart: React.FC<DashaTimelineChartProps> = ({
  mahadashas,
  profile,
  currentDateAD = new Date().toISOString().split('T')[0],
  onSelectNode,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'mahadasha' | 'antardasha'>('mahadasha');
  const [hoveredNode, setHoveredNode] = useState<TimelineItem | null>(null);

  // Active Mahadasha
  const activeMD = useMemo(() => {
    return mahadashas.find((m) => m.isCurrent) || mahadashas[0];
  }, [mahadashas]);

  // Antardashas of active Mahadasha
  const antardashas = useMemo(() => {
    return activeMD?.subNodes || [];
  }, [activeMD]);

  // Extract timeline items
  const chartData: TimelineItem[] = useMemo(() => {
    const nodes = viewMode === 'mahadasha' ? mahadashas : antardashas;
    const birthYear = profile?.dateAD ? new Date(profile.dateAD).getFullYear() : 1995;

    return nodes.map((node, idx) => {
      const startY = new Date(node.startDateAD).getFullYear();
      const endY = new Date(node.endDateAD).getFullYear();
      const ageStart = Math.max(0, startY - birthYear);
      const ageEnd = Math.max(ageStart + 0.1, endY - birthYear);
      const durationY = Math.max(0.1, Number((node.durationDays / 365.25).toFixed(2)));
      const remedy = PLANETARY_REMEDIES[node.planet] || PLANETARY_REMEDIES['सूर्य'];

      return {
        id: `${node.planet}-${idx}`,
        planet: node.planet,
        displayName: viewMode === 'mahadasha' ? `${node.planet} महादशा` : `${activeMD.planet}-${node.planet} अन्तरदशा`,
        durationYears: durationY,
        durationFormatted: node.durationFormattedNepali,
        startDateBS: node.startDateBS,
        endDateBS: node.endDateBS,
        startDateAD: node.startDateAD,
        endDateAD: node.endDateAD,
        isCurrent: node.isCurrent,
        ageStart,
        ageEnd,
        remedy
      };
    });
  }, [mahadashas, antardashas, viewMode, activeMD, profile]);

  // Current Item
  const currentItem = useMemo(() => {
    return chartData.find((item) => item.isCurrent) || chartData[0];
  }, [chartData]);

  // Calculate user's current age
  const currentAge = useMemo(() => {
    if (!profile?.dateAD) return 30;
    const birthDate = new Date(profile.dateAD);
    const now = new Date(currentDateAD);
    const diff = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, Number(diff.toFixed(1)));
  }, [profile, currentDateAD]);

  return (
    <div id="dasha-timeline-chart-card" className={`bg-stone-900 border border-amber-800/80 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 text-amber-50 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold font-serif text-amber-300">
              विंशोत्तरी दशा कालक्रम दृश्य (Vimshottari Dasha Timeline)
            </h3>
          </div>
          <p className="text-xs text-amber-200/70 mt-0.5">
            १२० वर्षे सम्पूर्ण दशा चक्र, अवधि र ग्रहशान्ति वैदिक उपायहरूको प्रत्यक्ष रेखाचित्र
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-amber-800/60">
          <button
            type="button"
            onClick={() => setViewMode('mahadasha')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'mahadasha'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>१२० वर्ष महादशा</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('antardasha')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'antardasha'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{activeMD.planet} अन्तरदशा ({antardashas.length})</span>
          </button>
        </div>
      </div>

      {/* Active Highlight Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border border-amber-500/50 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-md">
            <span className="text-base font-black">{currentItem?.planet}</span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-stone-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>वर्तमान सक्रिय काल</span>
              </span>
              <span className="text-xs bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-md font-mono font-bold">
                उमेर: ~{toDevanagariNumerals(Math.round(currentAge))} वर्ष
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-100">
              {currentItem?.displayName} ({currentItem?.startDateBS} देखि {currentItem?.endDateBS})
            </div>
          </div>
        </div>

        <div className="text-xs text-amber-200/80 bg-stone-950/70 border border-amber-800/50 px-3 py-2 rounded-lg space-y-0.5">
          <div><strong className="text-amber-300">अवधि:</strong> {currentItem?.durationFormatted}</div>
          <div><strong className="text-amber-300">रत्न सिफारिस:</strong> {currentItem?.remedy.gemstone.split('-')[0]}</div>
        </div>
      </div>

      {/* Interactive Ribbon Gantt Timeline */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-amber-300/80 font-bold px-1">
          <span>दशा कालक्रम स्ट्रिप (क्रमानुसार अवधि अनुपात)</span>
          <span className="text-[11px] text-amber-400/90">खण्डमा क्लिक वा होभर गरी विशेष उपाय हेर्नुहोस्</span>
        </div>

        {/* Visual ribbon segments */}
        <div className="w-full h-11 bg-stone-950 rounded-xl border border-amber-800/80 p-1 flex gap-1 overflow-x-auto shadow-inner">
          {chartData.map((item) => {
            const isSelected = hoveredNode?.id === item.id || (!hoveredNode && item.isCurrent);
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredNode(item)}
                onClick={() => {
                  setHoveredNode(item);
                  const foundNode = mahadashas.find((m) => m.planet === item.planet);
                  if (foundNode && onSelectNode) onSelectNode(foundNode);
                }}
                style={{
                  flex: `${item.durationYears} 1 0%`,
                  backgroundColor: item.remedy.colorHex,
                  minWidth: '38px'
                }}
                className={`relative h-full rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center font-bold text-xs text-stone-950 select-none shadow-sm ${
                  item.isCurrent
                    ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-stone-900 scale-y-105 z-10'
                    : 'opacity-85 hover:opacity-100 hover:scale-y-105'
                } ${isSelected ? 'ring-2 ring-white shadow-lg' : ''}`}
                title={`${item.displayName}: ${item.durationFormatted} (${item.startDateBS} - ${item.endDateBS})`}
              >
                <span className="truncate px-1 text-[11px] font-black drop-shadow-xs">
                  {item.planet}
                </span>

                {/* Pulsing indicator on current */}
                {item.isCurrent && (
                  <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-amber-400 text-stone-950 text-[9px] font-black px-1 rounded-full shadow-md whitespace-nowrap">
                    सक्रिय
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Start / End years label */}
        <div className="flex items-center justify-between text-[10px] text-amber-400/70 font-mono px-1">
          <span>जन्म वि.सं.: {chartData[0]?.startDateBS}</span>
          <span>समाप्ति वि.सं.: {chartData[chartData.length - 1]?.endDateBS}</span>
        </div>
      </div>

      {/* Recharts Duration Bar Chart */}
      <div className="bg-stone-950/70 border border-amber-800/60 rounded-xl p-3 sm:p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>प्रत्येक ग्रहको अवधि मापन (वर्ष)</span>
          </span>
          <span className="text-[11px] text-amber-400/80 font-mono">
            {viewMode === 'mahadasha' ? '१२० वर्ष चक्र' : `${activeMD.planet} अन्तरदशा चक्र`}
          </span>
        </div>

        <div className="w-full h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
              onClick={(e: any) => {
                if (e?.activePayload?.[0]?.payload) {
                  setHoveredNode(e.activePayload[0].payload as TimelineItem);
                }
              }}
            >
              <XAxis
                dataKey="planet"
                stroke="#d97706"
                tick={{ fill: '#fef3c7', fontSize: 11, fontWeight: 'bold' }}
                interval={0}
              />
              <YAxis
                stroke="#d97706"
                tick={{ fill: '#fde68a', fontSize: 10 }}
                unit={viewMode === 'mahadasha' ? ' वर्ष' : ' व.'}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TimelineItem;
                    return (
                      <div className="bg-stone-900 border-2 border-amber-400 rounded-xl p-3 shadow-2xl text-xs space-y-2 max-w-xs text-amber-50">
                        <div className="flex items-center justify-between border-b border-amber-700/60 pb-1.5">
                          <span className="font-bold text-amber-300 text-sm">{data.displayName}</span>
                          {data.isCurrent && (
                            <span className="bg-emerald-500 text-stone-950 font-black text-[10px] px-1.5 py-0.5 rounded-full">
                              वर्तमान
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 font-mono text-[11px] text-amber-200">
                          <div><strong>अवधि:</strong> {data.durationFormatted} ({data.durationYears} वर्ष)</div>
                          <div><strong>मिति:</strong> {data.startDateBS} देखि {data.endDateBS}</div>
                          <div><strong>उमेर:</strong> {toDevanagariNumerals(data.ageStart)} देखि {toDevanagariNumerals(data.ageEnd)} वर्ष</div>
                        </div>
                        <div className="bg-stone-950 p-2 rounded-lg border border-amber-800/80 space-y-1 text-[11px]">
                          <div className="font-bold text-amber-400 flex items-center gap-1">
                            <span>💎 मुख्य रत्न:</span>
                            <span className="text-amber-100 font-normal">{data.remedy.gemstone}</span>
                          </div>
                          <div className="font-bold text-amber-400 flex items-center gap-1">
                            <span>📿 मन्त्र:</span>
                            <span className="text-amber-100 font-normal">{data.remedy.mantra}</span>
                          </div>
                          <div className="font-bold text-amber-400 flex items-center gap-1">
                            <span>🌾 दान:</span>
                            <span className="text-amber-100 font-normal">{data.remedy.donation}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {viewMode === 'mahadasha' && (
                <ReferenceLine
                  x={currentItem?.planet}
                  stroke="#fbbf24"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    value: 'वर्तमान',
                    fill: '#fbbf24',
                    fontSize: 10,
                    fontWeight: 'bold',
                    position: 'top'
                  }}
                />
              )}
              <Bar dataKey="durationYears" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.remedy.colorHex}
                    stroke={entry.isCurrent ? '#fef08a' : '#78350f'}
                    strokeWidth={entry.isCurrent ? 3 : 1}
                    className="cursor-pointer transition-all hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Dasha Segment Detailed Remedial Measures (UPAY) Card */}
      {(() => {
        const target = hoveredNode || currentItem;
        if (!target) return null;
        const { remedy } = target;

        return (
          <div className="bg-gradient-to-br from-amber-950/60 to-stone-900 border-2 border-amber-500/70 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  style={{ backgroundColor: remedy.colorHex }}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-stone-950 shadow-md"
                >
                  {target.planet}
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-amber-200 flex items-center gap-2">
                    <span>{target.displayName} का विशिष्ट शास्त्रीय उपाय (Upay)</span>
                    {target.isCurrent && (
                      <span className="bg-emerald-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        अहिले चलिरहेको
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-amber-300/80 font-mono">
                    अवधि: {target.durationFormatted} ({target.startDateBS} - {target.endDateBS})
                  </p>
                </div>
              </div>

              <div className="text-xs bg-stone-950 border border-amber-800/80 px-2.5 py-1 rounded-lg text-amber-300 font-medium">
                वार: <strong className="text-amber-100">{remedy.fastingDay}</strong> | धातु: <strong className="text-amber-100">{remedy.metal}</strong>
              </div>
            </div>

            {/* UPAY Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {/* Gemstone */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-800/60 space-y-1">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>💎 अनुकूल रत्न (Gemstone)</span>
                </div>
                <p className="text-xs text-amber-100 leading-relaxed font-medium">
                  {remedy.gemstone}
                </p>
                <span className="text-[10px] text-amber-300/70 block">
                  ज्योतिषीको सल्लाहमा शुभ मुहूर्तमा धारण गर्नुहोस्।
                </span>
              </div>

              {/* Mantra */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-800/60 space-y-1">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>📿 वैदिक मन्त्र जप</span>
                </div>
                <p className="text-xs text-emerald-300 font-mono font-bold leading-relaxed">
                  {remedy.mantra}
                </p>
                <span className="text-[10px] text-amber-300/80 block">
                  जप सङ्ख्या: {remedy.japCount}
                </span>
              </div>

              {/* Charity & Donation */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-800/60 space-y-1">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🌾 दान तथा सेवा (Charity)</span>
                </div>
                <p className="text-xs text-amber-100 leading-relaxed">
                  {remedy.donation}
                </p>
                <span className="text-[10px] text-amber-300/70 block">
                  {remedy.fastingDay} को दिन दान गर्दा विशेष फल मिल्दछ।
                </span>
              </div>

              {/* Deity Worship */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-800/60 space-y-1">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🕉️ इष्टदेवता / उपासना</span>
                </div>
                <p className="text-xs text-amber-100 leading-relaxed">
                  {remedy.deity}
                </p>
              </div>

              {/* Rudraksha */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-800/60 space-y-1">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>📿 रुद्राक्ष सिफारिस</span>
                </div>
                <p className="text-xs text-amber-100 leading-relaxed font-semibold">
                  {remedy.rudraksha}
                </p>
                <span className="text-[10px] text-amber-300/70 block">
                  प्राणप्रतिष्ठा गरी रातो वा पहेँलो धागोमा लगाउनुहोस्।
                </span>
              </div>

              {/* Precaution */}
              <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-800/60 space-y-1">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-300">विशेष सावधानी (Precaution)</span>
                </div>
                <p className="text-xs text-rose-100 leading-relaxed">
                  {remedy.precaution}
                </p>
              </div>
            </div>

            {/* Classical Significance */}
            <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/50 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">बृहत पराशर होराशास्त्र फल:</strong> {remedy.classicalSignificance}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
