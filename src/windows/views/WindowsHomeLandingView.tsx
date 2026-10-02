import React from 'react';
import { 
  Sparkles, 
  Home, 
  Compass, 
  Moon, 
  ShieldCheck, 
  WifiOff, 
  ArrowRight,
  BookOpen,
  Layers,
  FileText
} from 'lucide-react';
import { WindowsPrimaryService } from '../types/windowsAppTypes';

interface WindowsHomeLandingViewProps {
  onSelectService: (service: WindowsPrimaryService) => void;
  activeProfileName?: string;
  activeProjectName?: string;
}

export const WindowsHomeLandingView: React.FC<WindowsHomeLandingViewProps> = ({
  onSelectService,
  activeProfileName = 'राम प्रसाद अधिकारी',
  activeProjectName = 'शान्ति निकेतन (आवासीय भवन)',
}) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-5xl mx-auto w-full animate-fadeIn select-none">
      
      {/* Top Auspicious Header Banner */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-bold shadow-xs">
          <span className="text-base">🕉</span>
          <span>बालानन्द वैदिक सेवा • Windows Offline Professional Edition</span>
          <span className="flex items-center gap-1 text-[10px] bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono">
            <WifiOff className="w-3 h-3" />
            <span>१००% अफलाइन सुरक्षित</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-stone-100 font-serif tracking-tight">
          ज्योतिष तथा वास्तु सेवा
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          नेपालकै आधिकारिक वैदिक ज्योतिषीय गणना, जन्म कुण्डली, विंशोत्तरी दशा तथा शास्त्रोक्त गृह वास्तु विश्लेषण प्रणाली।
        </p>
      </div>

      {/* Dual Core Service Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* Service 1: Jyotish Sewa */}
        <div 
          onClick={() => onSelectService('JYOTISH')}
          className="group relative bg-gradient-to-br from-white to-[#FDF8F0] dark:from-stone-900 dark:to-[#1C1814] rounded-3xl p-7 border-2 border-amber-500/30 dark:border-amber-600/30 hover:border-amber-500 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 dark:bg-amber-400/15 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
              🔮
            </div>

            <div>
              <span className="text-[11px] font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase">
                सेवा १ • ज्योतिर्विज्ञान
              </span>
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-serif mt-1 flex items-center gap-2">
                <span>ज्योतिष सेवा</span>
                <span className="text-xs font-normal text-stone-500">(Jyotish Sewa)</span>
              </h2>
            </div>

            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
              सटिक वैदिक लग्न कुण्डली, नवांश (D9), दशमांश (D10), ९ ग्रहस्थिति, विंशोत्तरी महादशा, दैनिक राशिफल, पञ्चाङ्ग, विवाह ३६ गुण मिलान र पूर्ण चिना रिपोर्ट।
            </p>

            <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-stone-800 text-amber-900 dark:text-amber-200 font-medium">जन्म कुण्डली</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-stone-800 text-amber-900 dark:text-amber-200 font-medium">विंशोत्तरी दशा</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-stone-800 text-amber-900 dark:text-amber-200 font-medium">गोचर</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-stone-800 text-amber-900 dark:text-amber-200 font-medium">विवाह मिलान</span>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-amber-500/15 flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>सक्रिय: <strong>{activeProfileName}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>प्रवेश गर्नुहोस्</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Service 2: Vastu Sewa */}
        <div 
          onClick={() => onSelectService('VASTU')}
          className="group relative bg-gradient-to-br from-white to-[#F2F8F5] dark:from-stone-900 dark:to-[#121A16] rounded-3xl p-7 border-2 border-emerald-500/30 dark:border-emerald-600/30 hover:border-emerald-500 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 dark:bg-emerald-400/15 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
              🏠
            </div>

            <div>
              <span className="text-[11px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
                सेवा २ • वास्तुशास्त्र
              </span>
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-serif mt-1 flex items-center gap-2">
                <span>वास्तु सेवा</span>
                <span className="text-xs font-normal text-stone-500">(Vastu Sewa)</span>
              </h2>
            </div>

            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
              घर तथा घडेरीको दिशानिर्देशन, इन्टरएक्टिभ फ्लोर प्लान ग्रिड, १७ कोठाको वास्तु अनुकूलता, पञ्चमहाभूत सन्तुलन, तोडफोडबिनाका वैदिक वास्तु निवारण उपाय र प्रिन्ट प्रतिवेदन।
            </p>

            <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-stone-800 text-emerald-900 dark:text-emerald-200 font-medium">८ दिशा / १६ क्षेत्र</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-stone-800 text-emerald-900 dark:text-emerald-200 font-medium">फ्लोर प्लान नक्सा</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-stone-800 text-emerald-900 dark:text-emerald-200 font-medium">दोष निवारण</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-stone-800 text-emerald-900 dark:text-emerald-200 font-medium">वास्तु रिपोर्ट</span>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-emerald-500/15 flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>प्रोजेक्ट: <strong>{activeProjectName}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>प्रवेश गर्नुहोस्</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

      </div>

      {/* Security & Offline Certification Bar */}
      <div className="mt-8 flex items-center justify-center gap-6 text-xs text-stone-500 dark:text-stone-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>स्थानीय इन्क्रिप्टेड डाटाबेस (AES Secure)</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>बृहत्संहिता तथा मानसार वास्तुशास्त्र सम्मत</span>
        </span>
      </div>

    </div>
  );
};
