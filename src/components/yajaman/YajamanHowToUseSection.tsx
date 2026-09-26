import React from 'react';
import { 
  UserPlus, 
  UserCheck, 
  Search, 
  Eye, 
  Send, 
  CheckCircle2, 
  Star,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const YajamanHowToUseSection: React.FC = () => {
  const steps = [
    {
      step: '१',
      title: 'खाता बनाउनुहोस् (Create Account)',
      desc: 'यजमान वा सेवा प्रदायक (पण्डित/ज्योतिष) का रूपमा आफ्नो नाम, फोन नम्बर र जिल्ला राखी सुरक्षित रूपमा दर्ता गर्नुहोस्।',
      icon: UserPlus,
      color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300',
    },
    {
      step: '२',
      title: 'आफ्नो प्रोफाइल पूरा गर्नुहोस् (Complete Profile)',
      desc: 'आफ्नो परिचय, अनुभव, विशेषज्ञता क्षेत्र, सेवा दिने स्थान र आवश्यक परे योग्यता प्रमाणपत्र पेश गरी "प्रमाणित" ब्याज प्राप्त गर्नुहोस्।',
      icon: UserCheck,
      color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300',
    },
    {
      step: '३',
      title: 'सेवा खोज्नुहोस् (Search & Filter)',
      desc: 'गृहप्रवेश, विवाह, रुद्री, कुलपूजा, वास्तु, सप्ताह आदि १२+ वर्गहरूबाट आफ्नो जिल्ला तथा नजिकका दक्ष पण्डित तथा ज्योतिषीहरू खोज्नुहोस्।',
      icon: Search,
      color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300',
    },
    {
      step: '४',
      title: 'सेवा विवरण हेर्नुहोस् (Review Details)',
      desc: 'सेवा प्रदायकको पोस्ट, तस्बिर, पूजा सामग्री सूची, समय तालिका र दक्षिणा सम्बन्धी जानकारी अध्ययन गर्नुहोस्।',
      icon: Eye,
      color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300',
    },
    {
      step: '५',
      title: 'सेवा अनुरोध पठाउनुहोस् (Send Request)',
      desc: 'आफूलाई पायक पर्ने मिति, समय, स्थान र आवश्यक संकल्प विवरण भरी १-क्लिकमा सेवा अनुरोध पठाउनुहोस्।',
      icon: Send,
      color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300',
    },
    {
      step: '६',
      title: 'सेवा प्रदायकबाट पुष्टि (Confirmation)',
      desc: 'पण्डित वा ज्योतिषीले अनुरोध स्वीकार गरेपछि सम्पर्क नम्बर तथा पूर्ण विवरण आदानप्रदान हुन्छ र सिधा संवाद गर्न सकिन्छ।',
      icon: CheckCircle2,
      color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300',
    },
    {
      step: '७',
      title: 'सेवा सम्पन्न र समीक्षा (Review & Rating)',
      desc: 'धार्मिक कार्य सफलतापूर्वक सम्पन्न भएपछि आफ्नो अनुभव अनुसार तारा (Rating) र राम्रो प्रतिक्रिया (Review) दिनुहोस्।',
      icon: Star,
      color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-amber-200 dark:border-stone-700 shadow-xl p-5 sm:p-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#7A1C1C] dark:text-amber-400 bg-amber-100 dark:bg-stone-800 px-3 py-1 rounded-full border border-amber-200 dark:border-stone-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          प्रयोगकर्ता सहयोगी निर्देशिका
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
          यजमान सेवा पोर्टल कसरी प्रयोग गर्ने?
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          वैदिक तथा धार्मिक सेवालाई सहज, मर्यादित र पारदर्शी बनाउन तयार पारिएको ७-चरणीय सरल प्रक्रिया
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div 
              key={st.step}
              className="relative p-5 rounded-2xl bg-stone-50/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between hover:border-amber-400 dark:hover:border-stone-600 transition-all duration-300 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${st.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black font-serif text-stone-300 dark:text-stone-700 group-hover:text-amber-500 transition-colors">
                    ०{st.step}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                    {st.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 dark:border-stone-700 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
        <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          <strong>सुरक्षा ग्यारेन्टी:</strong> कुनै पनि सेवा अनुरोध स्वीकृत नभएसम्म तपाईंको व्यक्तिगत सम्पर्क नम्बर सुरक्षित तथा गोप्य राखिन्छ।
        </div>
      </div>
    </div>
  );
};
