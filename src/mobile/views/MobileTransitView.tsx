import React from 'react';
import {
  Activity,
  Sparkles,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';
import { MobileBirthProfile } from '../types/mobileJyotishTypes';
import { getMobileRealtimeTransits } from '../services/mobileAstrologyService';

export const MobileTransitView: React.FC<{ profile: MobileBirthProfile }> = ({ profile }) => {
  const { transits, summaryNepali } = getMobileRealtimeTransits();

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-blue-950/40 border border-stone-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h2 className="font-bold text-sm text-stone-100 font-serif">
            प्रत्यक्ष ग्रह गोचर (Real-time Planetary Transit)
          </h2>
        </div>
        <p className="text-[11px] text-stone-400 mt-1">
          वर्तमान समयमा आकाशमा ९ ग्रहहरूको गति र तपाईंको जन्मराशिमा त्यसको प्रभाव
        </p>
      </div>

      {/* 2. Transit Summary Banner */}
      <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-blue-200">
        <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-stone-300 leading-relaxed text-[11.5px]">
          {summaryNepali}
        </p>
      </div>

      {/* 3. 9 Planets Real-time Transit Table */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
        <div className="p-3 bg-stone-950 border-b border-stone-800 font-bold text-xs text-amber-300 flex items-center justify-between">
          <span>वर्तमान ९ ग्रहहरूको गोचर स्थिति</span>
          <span className="text-[10px] text-stone-500 font-mono">Live Astronomical Ephemeris</span>
        </div>

        <div className="divide-y divide-stone-800 text-xs">
          {transits.map(p => (
            <div key={p.id} className="p-3 flex items-center justify-between hover:bg-stone-800/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center font-bold text-amber-400 text-xs shadow-xs">
                  {p.name[0]}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-100">{p.name} ग्रह</span>
                    {p.isRetrograde && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/40 font-bold">
                        वक्र (R)
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400">
                    नक्षत्र: {p.nakshatraName} (चरण {p.pada})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-amber-300 text-xs block">
                  {p.rashiName} राशिमा
                </span>
                <span className="text-[10px] text-stone-400 font-mono block">
                  {p.formattedDegree}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
