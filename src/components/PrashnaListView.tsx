import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Search, 
  Compass, 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Bot, 
  ArrowRight,
  TrendingUp,
  Heart,
  Briefcase,
  GraduationCap,
  Shield,
  Plane,
  Home,
  Coins,
  Smile,
  AlertCircle
} from 'lucide-react';
import { BirthDetails, PanchangaData, PlanetPosition } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { handlePhoneticInputKeyDown } from '../utils/nepaliTransliteration';

interface PrashnaListViewProps {
  activeProfile: BirthDetails | null;
  todayPanchanga?: PanchangaData;
  onNavigateToAIAssistant?: () => void;
  onNavigateToJyotish?: (subTab?: string) => void;
}

interface PrashnaCategory {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    rulingHouse: string;
    significator: string;
    guideline: string;
  }>;
}

const PRASHNA_CATEGORIES: PrashnaCategory[] = [
  {
    id: 'career',
    title: 'नोकरी, पेसा तथा व्यवसाय',
    icon: Briefcase,
    color: 'from-amber-700 to-amber-900',
    description: 'जागिर पदोन्नति, नयाँ व्यापार सुरुवात, सरकारी सेवा र कार्यसिद्धि',
    questions: [
      {
        id: 'c1',
        question: 'के मलाई नयाँ नोकरी वा पदोन्नति मिल्ला?',
        rulingHouse: 'दशम भाव (कर्म) र एकादश भाव (लाभ)',
        significator: 'सूर्य (प्रतिष्ठा), बृहस्पति (ज्ञान), शनि (श्रम)',
        guideline: 'प्रश्न लग्नको दशमेशसँग शुभ दृष्टि वा इत्थशाल भएमा शीघ्र कार्यसिद्धि हुने शास्त्रीय नियम छ।'
      },
      {
        id: 'c2',
        question: 'नयाँ व्यापार सुरु गर्न यो समय उपयुक्त छ?',
        rulingHouse: 'सप्तम भाव (व्यापार) र नवम भाव (भाग्य)',
        significator: 'बुध (वाणिज्य) र शुक्र (धन/लक्ष्मी)',
        guideline: 'लग्न र सप्तमेशको बलियो स्थिति भए व्यापारमा लाभ सुनिश्चित रहन्छ।'
      },
      {
        id: 'c3',
        question: 'सरकारी सेवा वा परीक्षामा सफलता प्राप्त होला?',
        rulingHouse: 'षष्ठ (प्रतिस्पर्धा), दशम (अधिकार) र पञ्चम (बुद्धि)',
        significator: 'सूर्य, मंगल र बृहस्पति',
        guideline: 'सूर्य लग्न वा दशम भावमा स्वगृही वा उच्चको हुँदा राजकीय सफलता प्राप्त हुन्छ।'
      }
    ]
  },
  {
    id: 'finance',
    title: 'धन, सम्पत्ति तथा ऋणमुक्ति',
    icon: Coins,
    color: 'from-emerald-700 to-emerald-900',
    description: 'रोकिएको धन फिर्ता, आर्थिक उन्नति, कर्जा भुक्तानी र लगानी',
    questions: [
      {
        id: 'f1',
        question: 'फसेको वा रोकिएको रकम कहिले फिर्ता आउला?',
        rulingHouse: 'द्वितीय भाव (धन) र एकादश भाव (प्राप्ति)',
        significator: 'बृहस्पति र चन्द्रमा',
        guideline: 'द्वितीयेश र लग्नेशको सम्बन्ध मित्रभावमा भए रोकिएको धन आंशिक वा पूर्ण रूपमा प्राप्त हुन्छ।'
      },
      {
        id: 'f2',
        question: 'ऋण तथा कर्जाबाट कहिले मुक्ति मिल्ला?',
        rulingHouse: 'षष्ठ भाव (ऋण/शत्रु) र द्वादश भाव (व्यय)',
        significator: 'मंगल र शनि',
        guideline: 'षष्ठेश निर्बल भई शुभ ग्रहको दृष्टि पर्दा ऋणमुक्ति सहज हुन्छ।'
      },
      {
        id: 'f3',
        question: 'शेयर बजार वा घरजग्गामा लगानी गर्दा लाभ होला?',
        rulingHouse: 'पञ्चम (सट्टा/अनुमान), चतुर्थ (भूमि) र द्वितीय (सञ्चिति)',
        significator: 'बुध र मंगल',
        guideline: 'पञ्चमेश र नवमेशको शुभ संयोग हुँदा लगानी लाभदायक हुन्छ।'
      }
    ]
  },
  {
    id: 'marriage',
    title: 'विवाह, सन्तान तथा पारिवारिक सुख',
    icon: Heart,
    color: 'from-rose-700 to-rose-900',
    description: 'विवाह सम्भावना, जीवनसाथी चयन, सन्तान योग र पारिवारिक मेलमिलाप',
    questions: [
      {
        id: 'm1',
        question: 'मेरो विवाह कहिले र कस्तो जीवनसाथीसँग होला?',
        rulingHouse: 'सप्तम भाव (दाम्पत्य) र द्वितीय भाव (कुटुम्ब)',
        significator: 'शुक्र (पुरुषका लागि), बृहस्पति (स्त्रीका लागि)',
        guideline: 'सप्तमेश चर राशिमा भए टाढा वा विदेशमा, स्थिर राशिमा भए नजिकै विवाह सम्बन्ध गाँसिन्छ।'
      },
      {
        id: 'm2',
        question: 'सन्तान प्राप्तिमा आइपरेका बाधा कहिले हट्लान्?',
        rulingHouse: 'पञ्चम भाव (सन्तान/गर्भ)',
        significator: 'बृहस्पति (सन्तानकारक)',
        guideline: 'पञ्चम भावमा शुभ ग्रह वा बृहस्पतिको गोचर हुँदा सन्तान सुख फलित हुन्छ।'
      },
      {
        id: 'm3',
        question: 'दाम्पत्य सम्बन्धमा मेलमिलाप कहिले होला?',
        rulingHouse: 'चतुर्थ (सुख), सप्तम (पत्नी/पति) र द्वादश (शय्या)',
        significator: 'शुक्र र चन्द्रमा',
        guideline: 'लग्नेश र सप्तमेशको पारस्परिक शुभ दृष्टि भए सम्बन्धमा सुधार आउँछ।'
      }
    ]
  },
  {
    id: 'health',
    title: 'स्वास्थ्य, दीर्घायु तथा रोग निवारण',
    icon: Shield,
    color: 'from-blue-700 to-blue-900',
    description: 'रोग निदान, शल्यक्रिया समय, मानसिक शान्ति र औषधोपचार',
    questions: [
      {
        id: 'h1',
        question: 'चलिरहेको बिरामी वा रोगबाट कहिले स्वास्थ्यलाभ होला?',
        rulingHouse: 'प्रथम भाव (तनु/शरीर) र षष्ठ भाव (रोग)',
        significator: 'सूर्य (आरोग्य), चन्द्र (मन), धन्वन्तरि',
        guideline: 'लग्नेश बलवान् भई केन्द्रमा बस्दा र षष्ठेश कमजोर हुँदा शीघ्र स्वास्थ्यलाभ हुन्छ।'
      },
      {
        id: 'h2',
        question: 'शल्यक्रिया (Surgery) गराउन कुन समय उत्तम होला?',
        rulingHouse: 'अष्टम भाव (शल्यक्रिया) र षष्ठ भाव',
        significator: 'मंगल (शल्यक्रिया कारक)',
        guideline: 'मंगल अनुकूल दिन र चन्द्रमा बलियो हुँदा शल्यक्रिया सफल रहन्छ।'
      }
    ]
  },
  {
    id: 'travel',
    title: 'विदेश यात्रा तथा स्थानान्तरण',
    icon: Plane,
    color: 'from-purple-700 to-purple-900',
    description: 'विदेश भिसा, उच्च शिक्षा, बसाईँसराइ र सुरक्षित यात्रा',
    questions: [
      {
        id: 't1',
        question: 'विदेश यात्रा वा भिसा आवेदन सफल होला?',
        rulingHouse: 'तृतीय (छोटो यात्रा), नवम (लामो यात्रा), द्वादश (विदेश)',
        significator: 'चन्द्रमा, राहु र शनि',
        guideline: 'द्वादशेश चर राशिमा भई नवमेशसँग सम्बद्ध भएमा विदेश यात्रा १००% सफल हुन्छ।'
      },
      {
        id: 't2',
        question: 'विदेशमा स्थायी बसोबास (PR) प्राप्त होला?',
        rulingHouse: 'चतुर्थ (स्वदेश त्याग) र द्वादश (विदेशी भूमि)',
        significator: 'राहु र शनि',
        guideline: 'द्वादश भावमा स्थिर वा द्विस्वभाव राशिमा शुभ ग्रह बसे स्थायी बसोबास योग बन्दछ।'
      }
    ]
  },
  {
    id: 'court',
    title: 'अदालती मुद्दा, विवाद तथा शत्रु विजय',
    icon: TrendingUp,
    color: 'from-red-700 to-red-900',
    description: 'मुद्दा फैसला, कानुनी विवाद समाधान, शत्रु दमन र न्याय प्राप्ति',
    questions: [
      {
        id: 'ct1',
        question: 'अदालती मुद्दा वा कानुनी विवादमा मेरो पक्षमा फैसला होला?',
        rulingHouse: 'षष्ठ भाव (विवाद) र एकादश भाव (विजय)',
        significator: 'मंगल, सूर्य र शनि (न्याय)',
        guideline: 'षष्ठेशभन्दा लग्नेश बलवान् भएमा मुद्दामा स्पष्ट विजय हासिल हुन्छ।'
      }
    ]
  }
];

export const PrashnaListView: React.FC<PrashnaListViewProps> = ({
  activeProfile,
  todayPanchanga,
  onNavigateToAIAssistant,
  onNavigateToJyotish,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  const filteredCategories = useMemo(() => {
    return PRASHNA_CATEGORIES.map(cat => {
      const matchCat = selectedCategory === 'all' || cat.id === selectedCategory;
      const filteredQuestions = cat.questions.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.rulingHouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.significator.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return {
        ...cat,
        isVisible: matchCat && (searchQuery.trim() === '' || filteredQuestions.length > 0),
        filteredQuestions
      };
    }).filter(cat => cat.isVisible);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] text-amber-50 rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold">
              <HelpCircle className="w-4 h-4" />
              <span>वैदिक प्रश्न ज्योतिष विज्ञान (Horary Astrology)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
              शास्त्रीय प्रश्न संग्रह तथा फलादेश मार्गदर्शिका
            </h1>
            <p className="text-sm text-amber-200/90 max-w-2xl leading-relaxed">
              प्रश्न सोधेको समय (तात्कालिक प्रश्न लग्न) र ग्रह स्थितिका आधारमा मानव जीवनका विभिन्न जिज्ञासा, निर्णय तथा कार्यसिद्धिको गणितीय एवं शास्त्रीय विश्लेषण।
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            {onNavigateToAIAssistant && (
              <button
                type="button"
                onClick={onNavigateToAIAssistant}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md border border-amber-300/60 flex items-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-stone-950" />
                <span>AI ज्योतिषीसँग सोध्नुहोस्</span>
              </button>
            )}
            {onNavigateToJyotish && (
              <button
                type="button"
                onClick={() => onNavigateToJyotish('prashna')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-300" />
                <span>प्रश्न कुण्डली कार्यक्षेत्र</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="प्रश्न, भाव वा कारक खोज्नुहोस् (उदा: nokari, biwaha, dhan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => handlePhoneticInputKeyDown(e, searchQuery, setSearchQuery)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium self-end sm:self-center">
            कुल वर्गहरू: <strong className="text-stone-900 dark:text-stone-100">{PRASHNA_CATEGORIES.length}</strong>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#7A1C1C] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            सबै प्रश्नहरू
          </button>
          {PRASHNA_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#7A1C1C] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorized Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories.map(cat => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400/60 dark:hover:border-amber-700/60 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${cat.color} text-amber-200 flex items-center justify-center font-bold shadow-xs shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                      {cat.title}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {cat.filteredQuestions.map(q => (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 hover:bg-amber-50/60 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 transition-all cursor-pointer group space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#7A1C1C] dark:text-amber-300 group-hover:text-amber-600 transition-colors">
                          ❓ {q.question}
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span><strong>सम्बन्धित भाव:</strong> {q.rulingHouse}</span>
                        <span><strong>कारक ग्रह:</strong> {q.significator}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Question Details Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-300/60 dark:border-stone-700 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center font-bold">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                  {selectedQuestion.question}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-stone-700 dark:text-stone-300">
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60">
                <span className="font-bold text-[#7A1C1C] dark:text-amber-300 block mb-1">📖 शास्त्रीय नियम तथा फलादेश सूत्र:</span>
                <p className="leading-relaxed">{selectedQuestion.guideline}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <span className="font-bold text-stone-500 dark:text-stone-400 block text-[10px]">सम्बन्धित भाव</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{selectedQuestion.rulingHouse}</span>
                </div>
                <div className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <span className="font-bold text-stone-500 dark:text-stone-400 block text-[10px]">कारक ग्रह</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{selectedQuestion.significator}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-200 cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
              {onNavigateToJyotish && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuestion(null);
                    onNavigateToJyotish('prashna');
                  }}
                  className="px-4 py-2 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  <span>प्रश्न कुण्डलीमा हेर्नुहोस्</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
