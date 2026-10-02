import React from 'react';
import {
  Sparkles,
  Compass,
  Calendar,
  Heart,
  Activity,
  UserCheck,
  FileText,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  ShieldCheck,
  Phone,
  Flame,
  Star
} from 'lucide-react';
import { MobileTab, MobileUserProfile, MobileBirthProfile } from '../types/mobileJyotishTypes';
import { PanchangaData } from '../../types/astrology';
import { MobileRashiHoroscope } from '../services/mobileAstrologyService';

interface MobileHomeViewProps {
  user: MobileUserProfile | null;
  activeProfile: MobileBirthProfile;
  panchanga: PanchangaData;
  horoscope: MobileRashiHoroscope;
  onNavigateTab: (tab: MobileTab) => void;
  onOpenProfileSelector: () => void;
  onOpenAuth: () => void;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  user,
  activeProfile,
  panchanga,
  horoscope,
  onNavigateTab,
  onOpenProfileSelector,
  onOpenAuth
}) => {
  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header Greeting & Active Profile Bar */}
      <div className="bg-gradient-to-r from-[#2A1208] via-[#3D1A0A] to-[#1F0C05] border border-amber-500/40 rounded-3xl p-4 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 flex items-center justify-center text-stone-950 font-black shadow-lg ring-2 ring-amber-400/40 shrink-0">
              <span className="text-xl">ॐ</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-amber-300 font-medium">
                🙏 नमस्कार, {user?.fullName || 'आदरणीय साधक'}
              </p>
              <h2 className="text-base font-bold font-serif text-amber-100 truncate">
                {activeProfile.name}
              </h2>
              <p className="text-[10px] text-stone-400 font-mono truncate">
                {activeProfile.location?.name || activeProfile.placeOfBirth || 'काठमाडौं, नेपाल'} • {activeProfile.dateBS || activeProfile.dateAD}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProfileSelector}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded-xl text-amber-300 text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>पात्र फेर्नुहोस्</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Today's Auspicious Panchanga Ribbon */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 shadow-md space-y-2">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-stone-200">
              {panchanga.dateBS || panchanga.dateAD}
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
            {panchanga.tithi?.name || 'शुभ तिथि'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="bg-stone-950/70 p-2 rounded-xl border border-stone-800/80">
            <span className="text-stone-400 text-[10px] block">वार</span>
            <span className="font-bold text-amber-200">{panchanga.vaar?.name || 'आइतवार'}</span>
          </div>
          <div className="bg-stone-950/70 p-2 rounded-xl border border-stone-800/80">
            <span className="text-stone-400 text-[10px] block">नक्षत्र</span>
            <span className="font-bold text-amber-200 truncate block">{panchanga.nakshatra?.name || 'अश्विनी'}</span>
          </div>
          <div className="bg-stone-950/70 p-2 rounded-xl border border-stone-800/80">
            <span className="text-stone-400 text-[10px] block">राहुकाल</span>
            <span className="font-bold text-rose-300 text-[10px]">
              {panchanga.rahuKaal ? `${panchanga.rahuKaal.start}-${panchanga.rahuKaal.end}` : '०१:३०-०३:००'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Jyotish Services Grid (8 Dedicated Tiles) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-xs text-stone-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>प्रमुख ज्योतिषीय सेवाहरू</span>
          </h3>
          <span className="text-[10px] text-amber-500 font-mono">Dedicated Jyotish</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: जन्म कुण्डली */}
          <button
            type="button"
            onClick={() => onNavigateTab('kundali')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/50 text-left transition-all active:scale-97 shadow-md group cursor-pointer relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-bold text-sm text-stone-100 font-serif leading-tight">
              जन्म कुण्डली
            </h4>
            <p className="text-[10px] text-stone-400 mt-1 leading-snug">
              लग्न, नवांश, दशांश, ग्रहस्थिति, दृष्टि र भाव फल
            </p>
            <span className="absolute top-3 right-3 text-stone-600 group-hover:text-amber-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          {/* Card 2: आजको राशिफल */}
          <button
            type="button"
            onClick={() => onNavigateTab('horoscope')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/50 text-left transition-all active:scale-97 shadow-md group cursor-pointer relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <h4 className="font-bold text-sm text-stone-100 font-serif leading-tight">
              दैनिक राशिफल
            </h4>
            <p className="text-[10px] text-stone-400 mt-1 leading-snug">
              १२ राशिको फलादेश, शुभ रंग, अंक र समय
            </p>
            <span className="absolute top-3 right-3 text-stone-600 group-hover:text-amber-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          {/* Card 3: ग्रह गोचर */}
          <button
            type="button"
            onClick={() => onNavigateTab('transit')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/50 text-left transition-all active:scale-97 shadow-md group cursor-pointer relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-bold text-sm text-stone-100 font-serif leading-tight">
              ग्रह गोचर चक्र
            </h4>
            <p className="text-[10px] text-stone-400 mt-1 leading-snug">
              वर्तमान ९ ग्रहको स्थिति र जन्मराशि प्रभाव
            </p>
            <span className="absolute top-3 right-3 text-stone-600 group-hover:text-amber-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          {/* Card 4: पञ्चाङ्ग */}
          <button
            type="button"
            onClick={() => onNavigateTab('panchanga')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/50 text-left transition-all active:scale-97 shadow-md group cursor-pointer relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-bold text-sm text-stone-100 font-serif leading-tight">
              दैनिक पञ्चाङ्ग
            </h4>
            <p className="text-[10px] text-stone-400 mt-1 leading-snug">
              सूर्योदय, सूर्यास्त, शुभ मुहूर्त र घडीपला
            </p>
            <span className="absolute top-3 right-3 text-stone-600 group-hover:text-amber-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          {/* Card 5: विवाह तथा गुण मिलान */}
          <button
            type="button"
            onClick={() => onNavigateTab('matching')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/50 text-left transition-all active:scale-97 shadow-md group cursor-pointer relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <h4 className="font-bold text-sm text-stone-100 font-serif leading-tight">
              विवाह मिलान
            </h4>
            <p className="text-[10px] text-stone-400 mt-1 leading-snug">
              ३६ गुण मिलान, नाडी, भकूट र मङ्गल दोष
            </p>
            <span className="absolute top-3 right-3 text-stone-600 group-hover:text-amber-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          {/* Card 6: विंशोत्तरी दशा */}
          <button
            type="button"
            onClick={() => onNavigateTab('kundali')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/50 text-left transition-all active:scale-97 shadow-md group cursor-pointer relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-bold text-sm text-stone-100 font-serif leading-tight">
              विंशोत्तरी दशा
            </h4>
            <p className="text-[10px] text-stone-400 mt-1 leading-snug">
              महादशा, अन्तरदशा र प्रत्यन्तर कालखण्ड
            </p>
            <span className="absolute top-3 right-3 text-stone-600 group-hover:text-amber-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          {/* Card 7: ज्योतिषी परामर्श */}
          <button
            type="button"
            onClick={() => onNavigateTab('consultation')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/50 text-left transition-all active:scale-97 shadow-md group cursor-pointer relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5 text-amber-300" />
            </div>
            <h4 className="font-bold text-sm text-amber-200 font-serif leading-tight">
              ज्योतिषी परामर्श
            </h4>
            <p className="text-[10px] text-stone-400 mt-1 leading-snug">
              वरिष्ठ ज्योतिषीहरूसँग प्रत्यक्ष अडियो/भिडियो सेवा
            </p>
            <span className="absolute top-3 right-3 text-stone-600 group-hover:text-amber-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          {/* Card 8: कुण्डली प्रतिवेदन PDF */}
          <button
            type="button"
            onClick={() => onNavigateTab('reports')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 hover:border-amber-500/50 text-left transition-all active:scale-97 shadow-md group cursor-pointer relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <h4 className="font-bold text-sm text-stone-100 font-serif leading-tight">
              ज्योतिष प्रतिवेदन
            </h4>
            <p className="text-[10px] text-stone-400 mt-1 leading-snug">
              कुण्डली, फलादेश तथा विवाह रिपोर्ट PDF डाउनलोड
            </p>
            <span className="absolute top-3 right-3 text-stone-600 group-hover:text-amber-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>

      {/* 4. Active Rashi Today's Astrological Spotlight */}
      <div className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">{horoscope.symbol}</span>
            <div>
              <h4 className="font-bold text-xs text-amber-200">
                {horoscope.rashiName} राशि — आजको फलादेश
              </h4>
              <p className="text-[10px] text-stone-400">स्वामी: {horoscope.lord}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('horoscope')}
            className="text-[11px] text-amber-400 font-bold hover:underline cursor-pointer"
          >
            सबै राशि हेर्नुहोस् →
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          {horoscope.predictionNepali}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="bg-stone-950/70 p-2 rounded-xl text-center border border-stone-800">
            <span className="text-stone-400 text-[9px] block">शुभ रंग</span>
            <span className="font-bold text-amber-300 text-[10px]">{horoscope.luckyColor}</span>
          </div>
          <div className="bg-stone-950/70 p-2 rounded-xl text-center border border-stone-800">
            <span className="text-stone-400 text-[9px] block">शुभ अंक</span>
            <span className="font-bold text-amber-300 text-[10px]">{horoscope.luckyNumber}</span>
          </div>
          <div className="bg-stone-950/70 p-2 rounded-xl text-center border border-stone-800">
            <span className="text-stone-400 text-[9px] block">शुभ दिशा</span>
            <span className="font-bold text-amber-300 text-[10px]">{horoscope.luckyDirection}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
