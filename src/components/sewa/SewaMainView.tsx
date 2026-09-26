import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Compass, 
  ChevronRight, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Shovel, 
  FileCheck, 
  HelpCircle, 
  Hash, 
  HeartHandshake, 
  Users, 
  Building2, 
  Award,
  Crown,
  Lock,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { NavTab, ANYA_FALADESH_ITEMS, VASTU_SUBMENU_ITEMS } from '../Navigation';
import { BirthDetails, OrganizationProfile } from '../../types/astrology';

interface SewaMainViewProps {
  onEnterJyotish: () => void;
  onOpenVastuModal: (subTab?: any) => void;
  onNavigateTab: (tab: NavTab) => void;
  hasFullAccess?: boolean;
  onOpenPurchaseModal?: (featureName?: string) => void;
  activeProfile?: BirthDetails;
  orgProfile?: OrganizationProfile;
}

/**
 * SewaMainView:
 * Comprehensive Vedic Services Hub (सेवाहरू मुख्य केन्द्र)
 * Houses the two primary Vedic service pillars:
 * 1. वैदिक ज्योतिष सेवा (Vedic Astrology Services)
 * 2. वैदिक वास्तुशास्त्र सेवा (Vedic Vastu Shastra Services)
 */
export const SewaMainView: React.FC<SewaMainViewProps> = ({
  onEnterJyotish,
  onOpenVastuModal,
  onNavigateTab,
  hasFullAccess = false,
  onOpenPurchaseModal,
  activeProfile,
  orgProfile,
}) => {
  return (
    <div className="w-full space-y-6 pb-12 font-serif select-none">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#B91C1C] text-white p-6 sm:p-8 shadow-xl border-2 border-amber-400/40">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold font-sans">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>आधिकारिक वैदिक परामर्श तथा अनुसन्धान केन्द्र</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-wide text-amber-100 drop-shadow-sm">
            वैदिक सेवाहरू (Vedic Services Hub)
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 font-sans leading-relaxed">
            प्राचीन पराशर, जैमिनी, वाराहमिहिर तथा मयमत परम्परा अनुसार सञ्चालित उच्च-स्तरीय 
            <strong> ज्योतिष परामर्श</strong> तथा <strong>३६०° वास्तुशास्त्र</strong> सेवा केन्द्र।
          </p>
        </div>

        {/* Decorative background elements */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-amber-200" />
        </div>
      </div>

      {/* 2. Two Main Service Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ========================================================================= */}
        {/* PILLAR 1: वैदिक ज्योतिष सेवा (Vedic Astrology) */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border-2 border-amber-500/40 dark:border-stone-800 p-6 shadow-lg flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            
            {/* Title & Icon Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#7A1C1C] text-amber-300 flex items-center justify-center shadow-md shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-900 dark:text-amber-100 font-serif">
                    वैदिक ज्योतिष सेवा
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
                    Vedic Astrology & Horoscopy Hub
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 font-sans">
                मुख्य स्तम्भ
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-700 dark:text-stone-300 font-sans leading-relaxed">
              चिना, बृहत् जन्मकुण्डली, १६ वर्ग कुण्डली, विंशोत्तरी दशा, अष्टकवर्ग, गोचर, तथा ग्रह फलादेशको विस्तृत विश्लेषण।
            </p>

            {/* Primary Action Button: Enter Jyotish Workspace */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!hasFullAccess && onOpenPurchaseModal) {
                  onOpenPurchaseModal('ज्योतिष');
                  return;
                }
                onEnterJyotish();
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#7A1C1C] hover:from-[#8B1E0F] hover:to-[#8B1E0F] text-white font-bold text-sm flex items-center justify-between shadow-md transition-all cursor-pointer border border-amber-400/50 group font-sans"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>मुख्य ज्योतिष कार्यक्षेत्र प्रवेश गर्नुहोस्</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Sub-branches of Astrology (प्रश्न, अंक, केपी, नेमा) */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-stone-600 dark:text-stone-400 font-sans uppercase tracking-wider">
                अन्य विशिष्ट फलादेश शाखाहरू
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ANYA_FALADESH_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigateTab(item.id)}
                      className="text-left p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 hover:bg-amber-50 dark:hover:bg-stone-700/60 transition-all flex items-center gap-2.5 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-[#7A1C1C] group-hover:text-amber-300 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-amber-300 truncate">
                          {item.labelNepali}
                        </p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                          {item.labelEnglish}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Patrika & Vivah links */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('vivah')}
                className="flex-1 py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-red-600" />
                <span>विवाह तथा गुण मिलान</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('yajaman')}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>यजमान सेवा</span>
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* PILLAR 2: वैदिक वास्तुशास्त्र सेवा (Vedic Vastu Shastra) */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border-2 border-emerald-500/40 dark:border-stone-800 p-6 shadow-lg flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            
            {/* Title & Icon Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-emerald-200 flex items-center justify-center shadow-md shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-900 dark:text-emerald-100 font-serif">
                    वैदिक वास्तुशास्त्र सेवा
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-sans">
                    360° Vedic Architecture & Space Energy Audit
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 font-sans">
                आधुनिक विन्डो
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-700 dark:text-stone-300 font-sans leading-relaxed">
              ३६०° कम्पास, ८१-पद वास्तुपुरुष मण्डल, पञ्चतत्त्व सन्तुलन, भूमि परीक्षण, संरचना अडिट तथा आधिकारिक वास्तु प्रमाणपत्र।
            </p>

            {/* Primary Action Button: Open Vastu Window */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!hasFullAccess && onOpenPurchaseModal) {
                  onOpenPurchaseModal('वास्तुशास्त्र');
                  return;
                }
                onOpenVastuModal('project');
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 hover:from-emerald-900 hover:to-emerald-900 text-white font-bold text-sm flex items-center justify-between shadow-md transition-all cursor-pointer border border-emerald-400/50 group font-sans"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-300 group-hover:rotate-45 transition-transform" />
                <span>वास्तु परियोजना तथा ३६०° विन्डो खोल्नुहोस्</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Vastu Submodules Grid */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-stone-600 dark:text-stone-400 font-sans uppercase tracking-wider">
                वास्तु मोड्युलहरू (Vastu Modules)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VASTU_SUBMENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (!hasFullAccess && onOpenPurchaseModal) {
                          onOpenPurchaseModal(item.labelNepali);
                          return;
                        }
                        onOpenVastuModal(item.id);
                      }}
                      className="text-left p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50 dark:hover:bg-stone-700/60 transition-all flex items-center gap-2.5 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-emerald-100 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate">
                          {item.labelNepali}
                        </p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                          {item.badge}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Vastu Report / Audit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!hasFullAccess && onOpenPurchaseModal) {
                    onOpenPurchaseModal('वास्तु प्रमाणपत्र');
                    return;
                  }
                  onOpenVastuModal('report');
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer font-sans"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>आधिकारिक वास्तु प्रमाणपत्र तथा अडिट प्रतिवेदन</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default SewaMainView;
