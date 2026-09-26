import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Bot, 
  Sparkles, 
  Compass, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface HelpViewProps {
  onNavigateToAIAssistant?: () => void;
  onNavigateToJyotish?: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'सफ्टवेयर प्रयोग',
    question: 'कुण्डली निर्माण गर्दा जन्म समय कत्तिको सटिक हुनुपर्छ?',
    answer: 'लग्न (Ascendant) करिब २ घण्टामा परिवर्तन हुने भएकाले जन्म समय कम्तीमा १-२ मिनेटको अन्तरमा सटिक हुनु आवश्यक छ। सूक्ष्म नभांश र केपी उप-स्वामी (Sub Lord) विश्लेषणका लागि सेकेण्ड समेत सटिक हुनु लाभदायक हुन्छ।'
  },
  {
    category: 'सफ्टवेयर प्रयोग',
    question: 'ज्योतिष कार्यक्षेत्र (Jyotish Workspace) मा के के सुविधाहरू उपलब्ध छन्?',
    answer: 'ज्योतिष कार्यक्षेत्र भित्र जन्मकुण्डली, प्रश्न कुण्डली, ग्रह गोचर, वार्षिक फल, दशा फल, वर्ग कुण्डली, योग फल, नक्षत्र फल, जीवन उपयोगी सूत्र, प्रतिवेदन तथा मुद्रण, परामर्श रेकर्ड, शुल्क रसिद, कार्यालय सेटिङ र अर्जे जस्ता १४ वटा शक्तिशाली सुविधाहरू एउटै एकीकृत इन्टरफेसमा उपलब्ध छन्।'
  },
  {
    category: 'ज्योतिष सिद्धान्त',
    question: 'केपी पद्धति र पराशर पद्धतिमा के फरक छ?',
    answer: 'पराशर पद्धतिले भाव, राशि र दृष्टि सम्बन्धी समग्र वैदिक नियमहरू प्रयोग गर्दछ। केपी (कृष्णमूर्ति) पद्धतिले भने प्रत्येक नक्षत्रलाई ९ वटा उप-स्वामी (Sub Lord) मा विभाजन गरी घटनाको १००% निश्चितता र समय निर्धारण गर्दछ।'
  },
  {
    category: 'ज्योतिष सिद्धान्त',
    question: 'अंक ज्योतिषमा मूलाङ्क र भाग्याङ्कमा के भिन्नता छ?',
    answer: 'मूलाङ्क (Root Number) जन्म मितिको गते (Day) को एकल योग हो जसले व्यक्तिको मूल स्वभाव र व्यक्तित्व जनाउँछ। भाग्याङ्क (Destiny Number) पूरा जन्म मिति (दिन + महिना + वर्ष) को योग हो जसले जीवनको उद्देश्य र कर्मपथ जनाउँछ।'
  },
  {
    category: 'डेटा र सुरक्षा',
    question: 'के मेरा यजमान तथा ग्राहकहरूको डेटा सुरक्षित रहन्छ?',
    answer: 'हो, सबै कुण्डली विवरण र परामर्श रेकर्डहरू पूर्ण रूपमा इन्क्रिप्टेड स्थानीय भण्डारण र सुरक्षित क्लाउड डेटाबेसमा सुरक्षित रहन्छन्।'
  }
];

export const HelpView: React.FC<HelpViewProps> = ({
  onNavigateToAIAssistant,
  onNavigateToJyotish
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#7A1C1C] via-amber-950 to-stone-900 text-amber-50 rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold">
            <BookOpen className="w-4 h-4" />
            <span>मद्दत तथा प्रयोग निर्देशिका (Help & Knowledge Base)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
            सफ्टवेयर सहायता केन्द्र तथा प्रायः सोधिने प्रश्नहरू
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 max-w-xl">
            नेपाली वैदिक ज्योतिष सफ्टवेयरका सुविधाहरू, गणितीय गणनाका आधार, र प्रयोग विधि सम्बन्धी सम्पूर्ण जानकारी।
          </p>
        </div>

        {onNavigateToAIAssistant && (
          <button
            type="button"
            onClick={onNavigateToAIAssistant}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg border border-amber-300/60 flex items-center gap-2 transition-transform transform active:scale-95 cursor-pointer shrink-0"
          >
            <Bot className="w-5 h-5 text-stone-950" />
            <span>AI ज्योतिषीसँग प्रत्यक्ष कुराकानी</span>
          </button>
        )}
      </div>

      {/* Quick Modules Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 space-y-2.5 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 font-serif">
            ज्योतिष कार्यक्षेत्र
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            १४ वटा व्यावसायिक मोड्युलहरू सहितको पूर्ण स्क्रिन ज्योतिषी प्लेटफर्म।
          </p>
          {onNavigateToJyotish && (
            <button
              type="button"
              onClick={onNavigateToJyotish}
              className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 hover:underline pt-1 block cursor-pointer"
            >
              कार्यक्षेत्र खोल्नुहोस् →
            </button>
          )}
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 space-y-2.5 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 font-serif">
            कुण्डली पत्रिका तथा प्रिन्ट
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            रङ्गीन एवं कृष्ण-धवल शास्त्रीय चक्र, अष्टकवर्ग र विस्तृत फलादेश सहित प्रिन्ट।
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 space-y-2.5 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 font-serif">
            डेटा सुरक्षा तथा गोपनीयता
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            प्रत्येक यजमानको व्यक्तिगत गोपनीयता १००% सुरक्षित रहन्छ।
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
          <HelpCircle className="w-5 h-5" />
          <span>प्रायः सोधिने प्रश्नोत्तर (FAQ)</span>
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 bg-stone-50/70 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    ❓ {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 leading-relaxed border-t border-stone-200 dark:border-stone-800">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
