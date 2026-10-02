import React, { useState } from 'react';
import {
  Star,
  Sparkles,
  Compass,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  getAllRashisList,
  getMobileRashiHoroscope,
  MobileRashiHoroscope
} from '../services/mobileAstrologyService';

export const MobileHoroscopeView: React.FC<{ initialRashiId?: number }> = ({ initialRashiId = 1 }) => {
  const [selectedRashiId, setSelectedRashiId] = useState<number>(initialRashiId);
  const rashis = getAllRashisList();
  const horoscope: MobileRashiHoroscope = getMobileRashiHoroscope(selectedRashiId);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm text-stone-100 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span>दैनिक राशिफल तथा ग्रह गोचर प्रभाव</span>
          </h2>
          <p className="text-[11px] text-stone-400 mt-0.5">
            चन्द्र राशि तथा लग्नमा आधारित प्रामाणिक वैदिक फलित
          </p>
        </div>
      </div>

      {/* 2. 12 Rashis Selector Grid */}
      <div className="bg-stone-950 p-2.5 rounded-2xl border border-stone-800 shadow-md">
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {rashis.map(r => {
            const isSel = r.id === selectedRashiId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRashiId(r.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSel
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-xs'
                    : 'bg-stone-900/60 border-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span className="text-base">{r.symbol}</span>
                <span className="text-[11px] font-bold mt-0.5">{r.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Rashi Detailed Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-[#1F1206] border border-amber-500/40 rounded-2xl p-4.5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl text-amber-300">
              {horoscope.symbol}
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-200 font-serif">
                {horoscope.rashiName} राशि
              </h3>
              <p className="text-[11px] text-stone-400">
                राशि स्वामी: <span className="text-amber-400 font-bold">{horoscope.lord}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800 font-bold inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>अनुकूलता {horoscope.favorableScorePercent}%</span>
            </span>
          </div>
        </div>

        {/* Prediction Narrative */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
            आजको समग्र फलादेश
          </span>
          <p className="text-xs text-stone-200 leading-relaxed bg-stone-950/70 p-3.5 rounded-xl border border-stone-800/80">
            {horoscope.predictionNepali}
          </p>
        </div>

        {/* Lucky Factors Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[10px] text-stone-400 block">शुभ रंग</span>
            <span className="font-bold text-amber-300 text-xs mt-0.5 block">
              {horoscope.luckyColor}
            </span>
          </div>
          <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[10px] text-stone-400 block">शुभ अंक</span>
            <span className="font-bold text-amber-300 text-xs mt-0.5 block">
              {horoscope.luckyNumber}
            </span>
          </div>
          <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[10px] text-stone-400 block">शुभ दिशा</span>
            <span className="font-bold text-amber-300 text-xs mt-0.5 block">
              {horoscope.luckyDirection}
            </span>
          </div>
        </div>

        {/* Timing Information */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-xl">
            <span className="text-emerald-400 font-bold block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>शुभ समय</span>
            </span>
            <span className="text-stone-300 text-[10px] mt-0.5 block">
              {horoscope.favorableTime}
            </span>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/30 p-2.5 rounded-xl">
            <span className="text-rose-400 font-bold block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>सतर्क रहने समय</span>
            </span>
            <span className="text-stone-300 text-[10px] mt-0.5 block">
              {horoscope.cautiousTime}
            </span>
          </div>
        </div>

        {/* Astrological Remedy */}
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-1 text-xs">
          <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>आजको ज्योतिषीय उपाय</span>
          </span>
          <p className="text-[11px] text-stone-300 leading-snug">
            दिनको शुभता बढाउन बिहान सूर्यदेवलाई अर्घ्य चढाउनुहोस् वा आफ्ना कुलदेवताको स्मरण गरी कार्य आरम्भ गर्नुहोस्।
          </p>
        </div>
      </div>
    </div>
  );
};
