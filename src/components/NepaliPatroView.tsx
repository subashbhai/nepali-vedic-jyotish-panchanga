import React, { useState } from 'react';
import { 
  CalendarDays, 
  Sun, 
  Moon, 
  Clock, 
  Sparkles, 
  Compass, 
  Award, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw,
  Flame,
  Sunrise,
  Sunset
} from 'lucide-react';
import { PanchangaData, LocationData } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface NepaliPatroViewProps {
  todayPanchanga: PanchangaData;
  location?: LocationData;
  onNavigateToPanchanga?: () => void;
  onNavigateToCalendar?: () => void;
}

// 7 Planetary Horas of the day
const HORA_PLANETS = [
  { name: 'सूर्य होरा', planet: 'सूर्य', nature: 'राजकीय, प्रशासनिक, औषधि सेवनका लागि शुभ', auspicious: true },
  { name: 'शुक्र होरा', planet: 'शुक्र', nature: 'नयाँ वस्त्र, आभूषण, विवाह, सौन्दर्य कार्यका लागि अति शुभ', auspicious: true },
  { name: 'बुध होरा', planet: 'बुध', nature: 'व्यापार, अध्ययन, लेखन, सञ्चार, हिसाब-किताबका लागि शुभ', auspicious: true },
  { name: 'चन्द्र होरा', planet: 'चन्द्रमा', nature: 'यात्रा, गृहप्रवेश, जल सम्बन्धी कार्यका लागि शुभ', auspicious: true },
  { name: 'शनि होरा', planet: 'शनि', nature: 'श्रम, यन्त्र निर्माण, जग्गाजमिन सम्बन्धी कार्यका लागि मध्यम', auspicious: false },
  { name: 'बृहस्पति होरा', planet: 'बृहस्पति', nature: 'विद्यारम्भ, यज्ञ, धार्मिक अनुष्ठान, मन्त्र दीक्षाका लागि सर्वश्रेष्ठ', auspicious: true },
  { name: 'मंगल होरा', planet: 'मंगल', nature: 'साहसिक कार्य, विवाद समाधान, शल्यक्रियाका लागि उपयुक्त', auspicious: false }
];

// Chaughadiya Muhurtas
const CHAUGHADIYA_DAY = [
  { name: 'उद्वेग (सूर्य)', type: 'अशुभ', color: 'text-rose-700 bg-rose-50' },
  { name: 'चर (शुक्र)', type: 'सामान्य शुभ', color: 'text-blue-700 bg-blue-50' },
  { name: 'लाभ (बुध)', type: 'उत्तम शुभ', color: 'text-emerald-700 bg-emerald-50' },
  { name: 'अमृत (चन्द्र)', type: 'सर्वश्रेष्ठ', color: 'text-amber-700 bg-amber-50' },
  { name: 'काल (शनि)', type: 'अशुभ / कष्ट', color: 'text-rose-700 bg-rose-50' },
  { name: 'शुभ (गुरु)', type: 'अति शुभ', color: 'text-emerald-700 bg-emerald-50' },
  { name: 'रोग (मंगल)', type: 'अशुभ / हानी', color: 'text-rose-700 bg-rose-50' },
  { name: 'उद्वेग (सूर्य)', type: 'अशुभ', color: 'text-rose-700 bg-rose-50' }
];

export const NepaliPatroView: React.FC<NepaliPatroViewProps> = ({
  todayPanchanga,
  location = { name: 'काठमाडौँ, नेपाल', country: 'Nepal', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 },
  onNavigateToPanchanga,
  onNavigateToCalendar
}) => {
  const [activePatroTab, setActivePatroTab] = useState<'panchang' | 'hora' | 'chaughadiya'>('panchang');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-[#7A1C1C] to-amber-950 text-amber-50 rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold">
            <CalendarDays className="w-4 h-4" />
            <span>नेपाली दैनिक पात्रो (Daily Vedic Patro)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
            {todayPanchanga.dateBS} ({todayPanchanga.dayNameNepali})
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 max-w-xl">
            नेपाल राष्ट्रिय समय अनुसार दैनिक पञ्चाङ्ग, सूर्योदय-सूर्यास्त, चौघडिया मुहूर्त, ग्रह होरा चक्र तथा चाडपर्व जानकारी।
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs text-amber-100">
            <span className="font-bold text-amber-300 block">स्थान: {location.name}</span>
            <span>अक्षांश: {location.latitude.toFixed(2)}°, देशान्तर: {location.longitude.toFixed(2)}°</span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToCalendar && (
              <button
                type="button"
                onClick={onNavigateToCalendar}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>हाम्रो पात्रो क्यालेन्डर</span>
              </button>
            )}
            {onNavigateToPanchanga && (
              <button
                type="button"
                onClick={onNavigateToPanchanga}
                className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>विस्तृत पञ्चाङ्ग</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Patro View Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-stone-200 dark:border-stone-800">
        {[
          { id: 'panchang', label: 'दैनिक पञ्चाङ्ग तथा मुहूर्त', icon: Sun },
          { id: 'hora', label: 'दैनिक ग्रह होरा चक्र (Planetary Hora)', icon: Clock },
          { id: 'chaughadiya', label: 'दिन र रातको चौघडिया (Chaughadiya)', icon: Sparkles }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activePatroTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActivePatroTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#7A1C1C] dark:text-amber-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Today's Core Panchanga Cards */}
      {activePatroTab === 'panchang' && (
        <div className="space-y-6">
          {/* 5 Angas Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-300 dark:border-stone-800 text-center space-y-1.5 shadow-2xs">
              <span className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-400">१. तिथि (Tithi)</span>
              <div className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                {todayPanchanga.tithi.name}
              </div>
              <span className="text-[10px] text-stone-500 font-mono block">
                {todayPanchanga.tithi.paksha} पक्ष
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-300 dark:border-stone-800 text-center space-y-1.5 shadow-2xs">
              <span className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-400">२. वार (Vara)</span>
              <div className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                {todayPanchanga.dayNameNepali}
              </div>
              <span className="text-[10px] text-stone-500 block">
                {todayPanchanga.dayNameSanskrit}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-300 dark:border-stone-800 text-center space-y-1.5 shadow-2xs">
              <span className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-400">३. नक्षत्र (Nakshatra)</span>
              <div className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                {todayPanchanga.nakshatra.name}
              </div>
              <span className="text-[10px] text-stone-500 block">
                पाद: {toDevanagariNumerals(todayPanchanga.nakshatra.pada || 1)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-300 dark:border-stone-800 text-center space-y-1.5 shadow-2xs">
              <span className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-400">४. योग (Yoga)</span>
              <div className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                {todayPanchanga.yoga.name}
              </div>
              <span className="text-[10px] text-stone-500 block">
                नित्य योग
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-stone-900 border border-amber-300 dark:border-stone-800 text-center space-y-1.5 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-400">५. करण (Karana)</span>
              <div className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                {todayPanchanga.karana.name}
              </div>
              <span className="text-[10px] text-stone-500 block">
                अर्ध तिथि मान
              </span>
            </div>
          </div>

          {/* Sun & Moon Times & Muhurta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sunrise & Sunset */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
                <Sunrise className="w-5 h-5 text-amber-500" />
                <span>सूर्य तथा चन्द्र समय (Astronomical Timings)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-amber-50/60 dark:bg-stone-800/60 rounded-2xl border border-amber-200 dark:border-stone-700 flex items-center gap-3">
                  <Sunrise className="w-6 h-6 text-amber-600" />
                  <div>
                    <span className="text-[10px] text-stone-500 block">सूर्योदय (Sunrise)</span>
                    <strong className="text-sm text-stone-900 dark:text-stone-100">{todayPanchanga.sunrise}</strong>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 dark:bg-stone-800/60 rounded-2xl border border-amber-200 dark:border-stone-700 flex items-center gap-3">
                  <Sunset className="w-6 h-6 text-red-600" />
                  <div>
                    <span className="text-[10px] text-stone-500 block">सूर्यास्त (Sunset)</span>
                    <strong className="text-sm text-stone-900 dark:text-stone-100">{todayPanchanga.sunset}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Shubha & Ashubha Muhurta */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D97706]" />
                <span>शुभ तथा अशुभ काल विभाजन</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> अभिजित मुहूर्त (शुभ)
                  </span>
                  <strong className="text-sm text-emerald-900 dark:text-emerald-200 block">
                    ११:५५ - १२:४५
                  </strong>
                </div>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800/60 space-y-1">
                  <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> राहुकाल (त्याज्य/अशुभ)
                  </span>
                  <strong className="text-sm text-rose-900 dark:text-rose-200 block">
                    {todayPanchanga.rahuKaal ? `${todayPanchanga.rahuKaal.start} देखि ${todayPanchanga.rahuKaal.end}` : '१२:०० - ०१:३०'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Planetary Hora */}
      {activePatroTab === 'hora' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>२४ घण्टाका ७ ग्रह होरा चक्र (Planetary Hora Guidelines)</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              सूर्योदयदेखि सुरु हुने प्रत्येक १-१ घण्टाको समय एक विशेष ग्रहको अधिनमा हुन्छ।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HORA_PLANETS.map((h, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#7A1C1C] dark:text-amber-300 text-sm">{h.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      h.auspicious
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {h.auspicious ? 'शुभ होरा' : 'सामान्य/मध्यम'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {h.nature}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Chaughadiya */}
      {activePatroTab === 'chaughadiya' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>दिनको चौघडिया मुहूर्त (Day Chaughadiya)</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              शुभ, लाभ र अमृत चौघडियामा यात्रा, व्यापार तथा शुभ कार्य गर्दा पूर्ण सफलता मिल्दछ।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CHAUGHADIYA_DAY.map((c, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 ${c.color} dark:bg-stone-800 space-y-1`}
              >
                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block">
                  मुहूर्त {toDevanagariNumerals(i + 1)}
                </span>
                <div className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                  {c.name}
                </div>
                <span className="text-xs font-bold block">{c.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
