import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Flame,
  Award,
  Layers,
  ChevronDown,
  Info,
  Calendar,
  Clock
} from 'lucide-react';
import { MobileBirthProfile } from '../types/mobileJyotishTypes';
import { MobileKundaliPayload } from '../services/mobileAstrologyService';
import { KundaliChart } from '../../components/KundaliChart';

interface MobileKundaliViewProps {
  profile: MobileBirthProfile;
  kundaliData: MobileKundaliPayload;
}

export const MobileKundaliView: React.FC<MobileKundaliViewProps> = ({
  profile,
  kundaliData
}) => {
  const [selectedVarga, setSelectedVarga] = useState<'D1' | 'D9' | 'D10'>('D1');
  const [activeTab, setActiveTab] = useState<'chart' | 'planets' | 'dasha' | 'yogas'>('chart');

  const { lagna, planets, d1Chart, d9Chart, d10Chart, dasha, yogas } = kundaliData;

  const currentChart =
    selectedVarga === 'D9' ? d9Chart :
    selectedVarga === 'D10' ? d10Chart : d1Chart;

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Profile Summary Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-sm text-stone-100 font-serif">
              {profile.name} को जन्म कुण्डली
            </h2>
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {profile.dateBS || profile.dateAD} • {profile.time} • {profile.location?.name || profile.placeOfBirth || 'काठमाडौं, नेपाल'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800 font-bold block">
            लग्न: {lagna?.rashiName || 'मेष'}
          </span>
          <span className="text-[9px] text-stone-400 font-mono mt-0.5 block">
            {lagna?.formattedDegree || '००°००'}
          </span>
        </div>
      </div>

      {/* 2. Sub Navigation Pills */}
      <div className="grid grid-cols-4 gap-1.5 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 text-xs font-bold text-center">
        <button
          type="button"
          onClick={() => setActiveTab('chart')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'chart'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          कुण्डली चक्र
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('planets')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'planets'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          ग्रह स्थिति
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dasha')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dasha'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          दशा
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('yogas')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'yogas'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          योग
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* Tab A: कुण्डली चक्र (Vedic Chart) */}
      {activeTab === 'chart' && (
        <div className="space-y-3">
          {/* Varga Selector Buttons */}
          <div className="flex items-center justify-between bg-stone-900/80 p-2 rounded-xl border border-stone-800">
            <span className="text-xs text-stone-400 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>वर्ग कुण्डली:</span>
            </span>

            <div className="flex items-center gap-1">
              {[
                { id: 'D1' as const, label: 'D1 लग्न' },
                { id: 'D9' as const, label: 'D9 नवांश' },
                { id: 'D10' as const, label: 'D10 दशांश' }
              ].map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVarga(v.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedVarga === v.id
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* North Indian Diamond Chart */}
          <div className="bg-stone-950 p-2 rounded-2xl border border-amber-500/30 shadow-xl flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-[340px] aspect-square">
              <KundaliChart
                houses={currentChart?.houses}
                lagna={lagna}
                planets={planets}
                chartTitle={`${selectedVarga === 'D1' ? 'लग्न' : selectedVarga === 'D9' ? 'नवांश' : 'दशांश'} कुण्डली`}
              />
            </div>
          </div>

          {/* Lagna & Moon Sign Quick Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
              <span className="text-[10px] text-stone-400 block">जन्म लग्न</span>
              <span className="font-bold text-amber-300">{lagna?.rashiName} ({lagna?.formattedDegree})</span>
              <span className="text-[10px] text-stone-500 block">नक्षत्र: {lagna?.nakshatraName}</span>
            </div>
            <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
              <span className="text-[10px] text-stone-400 block">चन्द्र राशि (नाम राशि)</span>
              <span className="font-bold text-amber-300">
                {kundaliData.moonPlanet?.rashiName || 'कर्कट'} ({kundaliData.moonPlanet?.formattedDegree})
              </span>
              <span className="text-[10px] text-stone-500 block">नक्षत्र: {kundaliData.moonPlanet?.nakshatraName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab B: ९ ग्रह स्थिति (Planetary Degrees & Table) */}
      {activeTab === 'planets' && (
        <div className="space-y-3">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-200">
                <thead className="bg-stone-950 text-stone-400 text-[10px] uppercase font-bold border-b border-stone-800">
                  <tr>
                    <th className="p-2.5">ग्रह</th>
                    <th className="p-2.5">राशि</th>
                    <th className="p-2.5">अंश (Deg)</th>
                    <th className="p-2.5">नक्षत्र (पाद)</th>
                    <th className="p-2.5">भाव</th>
                    <th className="p-2.5">अवस्था</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-[11px]">
                  {planets.map(p => (
                    <tr key={p.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="p-2.5 font-bold flex items-center gap-1.5">
                        <span className="text-amber-400">{p.name}</span>
                        {p.isRetrograde && (
                          <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded border border-rose-500/40">
                            वक्र
                          </span>
                        )}
                        {p.isCombust && (
                          <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1 rounded border border-orange-500/40">
                            अस्त
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-stone-300">{p.rashiName}</td>
                      <td className="p-2.5 font-mono text-amber-200">{p.formattedDegree}</td>
                      <td className="p-2.5 text-stone-300">
                        {p.nakshatraName} ({p.pada})
                      </td>
                      <td className="p-2.5 font-bold text-center">{p.bhava}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          p.dignity === 'उच्च' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          p.dignity === 'नीच' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          p.dignity === 'स्वक्षेत्र' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'text-stone-400'
                        }`}>
                          {p.dignity || 'सम'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab C: विंशोत्तरी दशा कालखण्ड (Dasha Timeline) */}
      {activeTab === 'dasha' && (
        <div className="space-y-3">
          {/* Current Active Dasha Banner */}
          <div className="bg-gradient-to-r from-purple-950/60 via-stone-900 to-stone-900 border border-purple-500/40 rounded-2xl p-4 shadow-md space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/40 inline-flex items-center gap-1">
              <Flame className="w-3 h-3 text-purple-300" />
              <span>हालको सक्रिय दशा कालखण्ड</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block">महादशा</span>
                <span className="font-bold text-amber-300 text-sm">
                  {dasha?.currentMahadasha?.planet || 'गुरु'}
                </span>
                <span className="text-[10px] text-stone-500 block font-mono">
                  {dasha?.currentMahadasha?.startDate} - {dasha?.currentMahadasha?.endDate}
                </span>
              </div>
              <div className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 block">अन्तरदशा</span>
                <span className="font-bold text-amber-300 text-sm">
                  {dasha?.currentAntardasha?.planet || 'शनि'}
                </span>
                <span className="text-[10px] text-stone-500 block font-mono">
                  {dasha?.currentAntardasha?.startDate} - {dasha?.currentAntardasha?.endDate}
                </span>
              </div>
            </div>
          </div>

          {/* Mahadashas List */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-3.5 space-y-2 shadow-md">
            <h4 className="font-bold text-xs text-stone-200 pb-2 border-b border-stone-800">
              १२० वर्षे विंशोत्तरी दशा चक्र
            </h4>

            <div className="space-y-2">
              {dasha?.mahadashas?.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    m.isCurrent
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-xs'
                      : 'bg-stone-950/60 border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                      m.isCurrent ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'
                    }`}>
                      {m.planet[0]}
                    </span>
                    <div>
                      <span className={`font-bold ${m.isCurrent ? 'text-amber-300' : 'text-stone-200'}`}>
                        {m.planet} महादशा ({m.durationYears} वर्ष)
                      </span>
                      <p className="text-[10px] text-stone-400 font-mono">
                        {m.startDate} देखि {m.endDate} सम्म
                      </p>
                    </div>
                  </div>

                  {m.isCurrent && (
                    <span className="text-[9px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full">
                      हाल सक्रिय
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab D: कुण्डलीमा बनेका शुभ/अशुभ योगहरू */}
      {activeTab === 'yogas' && (
        <div className="space-y-3">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 space-y-3 shadow-md">
            <h4 className="font-bold text-xs text-stone-200 flex items-center gap-1.5 pb-2 border-b border-stone-800">
              <Award className="w-4 h-4 text-amber-400" />
              <span>कुण्डलीमा विद्यमान योगहरू</span>
            </h4>

            {yogas && yogas.length > 0 ? (
              <div className="space-y-2">
                {yogas.map((y, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-950/80 rounded-xl border border-stone-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-300">
                        {y.name || y.title}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        {y.type || 'राजयोग / शुभयोग'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      {y.description || y.effectNepali || 'यस योगले जीवनमा मान, प्रतिष्ठा र कार्यक्षेत्रमा उन्नति प्रदान गर्दछ।'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-stone-400">
                यस कुण्डलीमा सामान्य ग्रहस्थिति अनुकूल रहेको छ।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
