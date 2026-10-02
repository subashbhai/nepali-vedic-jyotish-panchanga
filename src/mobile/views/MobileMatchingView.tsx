import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Compass
} from 'lucide-react';
import { BirthDetails, VivahMilanResult } from '../../types/astrology';
import { calculateMobileKundaliMatch } from '../services/mobileAstrologyService';

export const MobileMatchingView: React.FC = () => {
  // Sample Boy & Girl details
  const [boy, setBoy] = useState<BirthDetails>({
    id: 'boy_01',
    name: 'रामचन्द्र शर्मा',
    gender: 'male',
    dateAD: '1996-03-12',
    dateBS: '२०५२ फागुन २९',
    time: '07:15',
    location: {
      name: 'काठमाडौं, नेपाल',
      latitude: 27.7172,
      longitude: 85.3240,
      timeZone: 5.75,
      country: 'नेपाल'
    }
  });

  const [girl, setGirl] = useState<BirthDetails>({
    id: 'girl_01',
    name: 'सीता कुमारी पौडेल',
    gender: 'female',
    dateAD: '1998-07-25',
    dateBS: '२०५५ श्रावण ०९',
    time: '11:40',
    location: {
      name: 'ललितपुर, नेपाल',
      latitude: 27.6667,
      longitude: 85.3167,
      timeZone: 5.75,
      country: 'नेपाल'
    }
  });

  const [result, setResult] = useState<VivahMilanResult | null>(() => {
    try {
      return calculateMobileKundaliMatch(boy, girl);
    } catch {
      return null;
    }
  });

  const handleRecalculate = () => {
    try {
      const res = calculateMobileKundaliMatch(boy, girl);
      setResult(res);
    } catch (e) {
      console.error('Matching calculation error', e);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-rose-950/40 border border-stone-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <h2 className="font-bold text-sm text-stone-100 font-serif">
            वैदिक विवाह तथा गुण मिलान (३६ गुण)
          </h2>
        </div>
        <p className="text-[11px] text-stone-400 mt-1">
          वर र कन्याको जन्मकुण्डली, अष्टकूट ३६ गुण र मङ्गल दोषको प्रामाणिक विश्लेषण
        </p>
      </div>

      {/* 2. Boy & Girl Quick Inputs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Boy Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 space-y-2">
          <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>वर (Boy)</span>
          </span>
          <input
            type="text"
            value={boy.name}
            onChange={(e) => setBoy({ ...boy, name: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-1.5 text-xs text-stone-200"
            placeholder="वरको नाम"
          />
          <input
            type="date"
            value={boy.dateAD}
            onChange={(e) => setBoy({ ...boy, dateAD: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-1 text-[11px] text-stone-300"
          />
          <input
            type="time"
            value={boy.time}
            onChange={(e) => setBoy({ ...boy, time: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-1 text-[11px] text-stone-300"
          />
        </div>

        {/* Girl Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 space-y-2">
          <span className="font-bold text-rose-300 text-[11px] flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-rose-400" />
            <span>कन्या (Girl)</span>
          </span>
          <input
            type="text"
            value={girl.name}
            onChange={(e) => setGirl({ ...girl, name: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-1.5 text-xs text-stone-200"
            placeholder="कन्याको नाम"
          />
          <input
            type="date"
            value={girl.dateAD}
            onChange={(e) => setGirl({ ...girl, dateAD: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-1 text-[11px] text-stone-300"
          />
          <input
            type="time"
            value={girl.time}
            onChange={(e) => setGirl({ ...girl, time: e.target.value })}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-1 text-[11px] text-stone-300"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleRecalculate}
        className="w-full py-2.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span>गुण मिलान पुनर्गणना गर्नुहोस्</span>
      </button>

      {/* 3. Matching Result Card */}
      {result && (
        <div className="bg-gradient-to-br from-stone-900 to-[#1F0C0E] border border-rose-500/40 rounded-2xl p-4.5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                प्राप्त कुल गुण
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-rose-400 font-serif">
                  {result.totalScore}
                </span>
                <span className="text-xs text-stone-400">/ ३६ गुण</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                result.totalScore >= 18
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {result.totalScore >= 18 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>{result.overallCompatibility || (result.totalScore >= 18 ? 'विवाहको लागि शुभ' : 'मध्यम / शान्ति आवश्यक')}</span>
              </span>
              <p className="text-[10px] text-stone-400 mt-1">१८ गुण भन्दा माथि शुभ मानिन्छ</p>
            </div>
          </div>

          {/* 8 Kootas Table */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-amber-300 block">
              अष्टकूट गुण विवरण (८ मुख्य अङ्गहरू):
            </span>
            <div className="bg-stone-950 rounded-xl border border-stone-800 divide-y divide-stone-800/60 text-xs">
              {result.ashtakoot?.map((k, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-200">{k.kootNepali || k.kootName}</span>
                    <span className="text-[10px] text-stone-500 block">{k.descriptionNepali}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-300">
                      {k.obtainedPoints} / {k.maxPoints}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
