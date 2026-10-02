import React from 'react';
import {
  Calendar,
  Sun,
  Moon,
  Clock,
  AlertTriangle,
  Sparkles,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { PanchangaData } from '../../types/astrology';

export const MobilePanchangaView: React.FC<{ panchanga: PanchangaData }> = ({ panchanga }) => {
  return (
    <div className="space-y-4 pb-20">
      {/* 1. Date Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm text-stone-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>दैनिक वैदिक पञ्चाङ्ग</span>
          </h2>
          <p className="text-xs text-amber-300 font-bold mt-1">
            {panchanga.formattedDateBS || panchanga.dateBS}
          </p>
          <p className="text-[10px] text-stone-400 font-mono">
            {panchanga.dateAD} • {panchanga.location?.name || 'काठमाडौं, नेपाल'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-amber-400 bg-amber-950/70 px-2.5 py-1 rounded-full border border-amber-800 font-bold block">
            {panchanga.samvatsara || 'क्रोधी'} संवत्सर
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">
            ऋतु: {panchanga.ritu || 'शरद्'} • {panchanga.ayana || 'दक्षिणायन'}
          </span>
        </div>
      </div>

      {/* 2. Core 5 Limbs (पञ्च-अङ्ग) */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 space-y-3 shadow-md">
        <h3 className="font-bold text-xs text-amber-400 flex items-center gap-1.5 uppercase tracking-wider pb-2 border-b border-stone-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>पञ्चाङ्गका पाँच अङ्गहरू (Five Limbs)</span>
        </h3>

        <div className="grid grid-cols-1 divide-y divide-stone-800 text-xs">
          {/* Tithi */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-400 font-medium">१. तिथि (Tithi)</span>
            <div className="text-right">
              <span className="font-bold text-amber-200 text-sm block">
                {panchanga.tithi?.name}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {panchanga.tithi?.paksha || 'शुक्ल पक्ष'} {panchanga.tithi?.endTime ? `(अन्त: ${panchanga.tithi.endTime})` : ''}
              </span>
            </div>
          </div>

          {/* Vaar */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-400 font-medium">२. वार (Day)</span>
            <div className="text-right">
              <span className="font-bold text-amber-200 text-sm block">
                {panchanga.vaar?.name}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                अधिपति: {panchanga.vaar?.lord || 'सूर्यदेव'}
              </span>
            </div>
          </div>

          {/* Nakshatra */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-400 font-medium">३. नक्षत्र (Nakshatra)</span>
            <div className="text-right">
              <span className="font-bold text-amber-200 text-sm block">
                {panchanga.nakshatra?.name}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                स्वामी: {panchanga.nakshatra?.lord} {panchanga.nakshatra?.endTime ? `(अन्त: ${panchanga.nakshatra.endTime})` : ''}
              </span>
            </div>
          </div>

          {/* Yoga */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-400 font-medium">४. योग (Yoga)</span>
            <div className="text-right">
              <span className="font-bold text-amber-200 text-sm block">
                {panchanga.yoga?.name}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {panchanga.yoga?.endTime ? `(अन्त: ${panchanga.yoga.endTime})` : 'शुभ योग'}
              </span>
            </div>
          </div>

          {/* Karana */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-stone-400 font-medium">५. करण (Karana)</span>
            <div className="text-right">
              <span className="font-bold text-amber-200 text-sm block">
                {panchanga.karana?.name}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {panchanga.karana?.endTime ? `(अन्त: ${panchanga.karana.endTime})` : 'शुभ करण'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sun & Moon Times */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold pb-1 border-b border-stone-800">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>सूर्य गति</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-stone-400">सूर्योदय:</span>
            <span className="font-mono font-bold text-stone-200">{panchanga.sunrise || '०६:०४'}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-stone-400">सूर्यास्त:</span>
            <span className="font-mono font-bold text-stone-200">{panchanga.sunset || '१८:०१'}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-stone-400">सूर्य राशि:</span>
            <span className="font-bold text-amber-300">{panchanga.sunRashi || 'कन्या'}</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-blue-300 font-bold pb-1 border-b border-stone-800">
            <Moon className="w-4 h-4 text-blue-300" />
            <span>चन्द्र गति</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-stone-400">चन्द्रोदय:</span>
            <span className="font-mono font-bold text-stone-200">{panchanga.moonrise || '०९:१२'}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-stone-400">चन्द्रास्त:</span>
            <span className="font-mono font-bold text-stone-200">{panchanga.moonset || '२१:४५'}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-stone-400">चन्द्र राशि:</span>
            <span className="font-bold text-amber-300">{panchanga.moonRashi || 'तुला'}</span>
          </div>
        </div>
      </div>

      {/* 4. Auspicious & Inauspicious Times (राहुकाल, अभिजित्) */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 space-y-3 shadow-md">
        <h3 className="font-bold text-xs text-stone-200 flex items-center gap-1.5 pb-2 border-b border-stone-800">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>शुभ तथा वर्जित समय (Auspicious & Inauspicious Muhurta)</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>अभिजित् मुहूर्त (सर्वोत्तम)</span>
            </span>
            <span className="font-mono font-bold text-stone-100 text-xs block">
              {panchanga.abhijitMuhurta || '११:३८ - १२:२६'}
            </span>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/30 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>राहुकाल (वर्जित)</span>
            </span>
            <span className="font-mono font-bold text-stone-100 text-xs block">
              {panchanga.rahukaal || '०१:३० - ०३:००'}
            </span>
          </div>

          <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[10px] text-stone-400 block">यमघण्ट काल:</span>
            <span className="font-mono font-bold text-stone-200 text-[11px]">
              {panchanga.yamaghanta || '११:४५ - ०१:१५'}
            </span>
          </div>

          <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[10px] text-stone-400 block">गुलिक काल:</span>
            <span className="font-mono font-bold text-stone-200 text-[11px]">
              {panchanga.gulika || '०२:१५ - ०३:४५'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
