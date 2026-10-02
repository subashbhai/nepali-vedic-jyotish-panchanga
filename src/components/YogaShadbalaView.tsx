import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  BarChart3, 
  BookOpen, 
  Network, 
  Printer, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  Monitor,
  Smartphone,
  Globe,
  Layers
} from 'lucide-react';
import { 
  LagnaInfo, 
  PlanetPosition, 
  VimshottariDashaResult, 
  GocharTransitResult 
} from '../types/astrology';
import { 
  DetailedYogaResult, 
  DetailedDoshaResult, 
  YogaCategory, 
  DoshaCategory 
} from '../types/yogaDoshaTypes';
import { evaluateAllYogasAndDoshas } from '../utils/yogaEngine';
import { YOGA_RULE_REGISTRY, DOSHA_RULE_REGISTRY } from '../utils/yogaRuleRegistry';
import { calculateShadbala } from '../utils/shadbalaEngine';
import { calculateAshtakavarga } from '../utils/ashtakavargaEngine';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { executeSharedAstrologyCore, SHARED_DATABASE_DEFINITION } from '../utils/multiPlatformArchitecture';
import { BPHSShlokaSidePanel, ShlokaViewTarget } from './BPHSShlokaSidePanel';
import { BPHSShlokaTooltip } from './BPHSShlokaTooltip';
import { getBPHSYogaShloka } from '../utils/brihatParasharaDatabase';
import { printElement } from '../utils/pdfGenerator';

interface YogaShadbalaViewProps {
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  dashaResult?: VimshottariDashaResult;
  gocharResult?: GocharTransitResult;
}

export const YogaShadbalaView: React.FC<YogaShadbalaViewProps> = ({ 
  lagna, 
  planets, 
  dashaResult, 
  gocharResult 
}) => {
  const [activeTab, setActiveTab] = useState<'yogas' | 'doshas' | 'graph' | 'registry' | 'shadbala' | 'ashtakavarga' | 'multiplatform'>('yogas');
  const [yogaCategoryFilter, setYogaCategoryFilter] = useState<string>('सबै');
  const [selectedYoga, setSelectedYoga] = useState<DetailedYogaResult | null>(null);
  const [selectedDosha, setSelectedDosha] = useState<DetailedDoshaResult | null>(null);

  // BPHS Shloka Side Panel state
  const [isShlokaPanelOpen, setIsShlokaPanelOpen] = useState<boolean>(false);
  const [shlokaTarget, setShlokaTarget] = useState<ShlokaViewTarget | null>(null);

  const handleOpenShloka = (target: ShlokaViewTarget) => {
    setShlokaTarget(target);
    setIsShlokaPanelOpen(true);
  };

  const evaluationResult = evaluateAllYogasAndDoshas(lagna, planets, dashaResult, gocharResult);
  const { yogas, doshas, relationshipGraph, summaryNepali } = evaluationResult;

  const shadbala = calculateShadbala(planets);
  const ashtakavarga = calculateAshtakavarga(planets);

  const filteredYogas = yogaCategoryFilter === 'सबै' 
    ? yogas 
    : yogas.filter((y) => y.category === yogaCategoryFilter);

  const handlePrintReport = () => {
    printElement('yoga-shadbala-printable-report');
  };

  return (
    <div id="yoga-shadbala-printable-report" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-orange-950 rounded-3xl border border-amber-700/60 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-amber-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>शास्त्रीय योग, दोष, ग्रहसम्बन्ध तथा नियम इन्जिन</span>
          </h2>
          <p className="text-xs text-amber-300/80 mt-1">
            बृहत्पाराशर होराशास्त्र, फलदीपिका, सारवली र उत्तरकालामृतमा आधारित प्रमाणित गणितीय तथा नियम विश्लेषण
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-900/60 border border-amber-700/60 rounded-2xl px-4 py-2 text-center">
            <span className="text-[10px] text-amber-400 block font-semibold">सक्रिय योगहरू</span>
            <span className="text-lg font-extrabold text-amber-100">{toDevanagariNumerals(summaryNepali.activeYogasCount)} / {toDevanagariNumerals(summaryNepali.totalYogasCount)}</span>
          </div>

          <div className="bg-amber-900/60 border border-amber-700/60 rounded-2xl px-4 py-2 text-center">
            <span className="text-[10px] text-amber-400 block font-semibold">सक्रिय दोषहरू</span>
            <span className="text-lg font-extrabold text-amber-100">{toDevanagariNumerals(summaryNepali.activeDoshasCount)} / {toDevanagariNumerals(summaryNepali.totalDoshasCount)}</span>
          </div>

          <button
            onClick={() => handleOpenShloka({ type: 'browser', defaultQuery: 'योग' })}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md border border-amber-400/50"
            title="बृहत्पाराशर होराशास्त्रका प्रमाण श्लोकहरू सङ्ग्रह हेर्नुहोस्"
          >
            <BookOpen className="w-4 h-4 text-amber-200" />
            <span>पाराशर प्रमाण श्लोक सङ्ग्रह</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>प्रतिवेदन छाप्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="bg-amber-950/80 backdrop-blur-md rounded-2xl border border-amber-800/80 p-2 shadow-lg flex flex-wrap items-center justify-center gap-1.5">
        <button
          onClick={() => setActiveTab('yogas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'yogas'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 shadow-md'
              : 'text-amber-200 hover:text-white hover:bg-amber-900/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>पहिचान भएका योगहरू ({toDevanagariNumerals(yogas.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('doshas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'doshas'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 shadow-md'
              : 'text-amber-200 hover:text-white hover:bg-amber-900/60'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>पहिचान भएका दोषहरू ({toDevanagariNumerals(doshas.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'graph'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 shadow-md'
              : 'text-amber-200 hover:text-white hover:bg-amber-900/60'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>ग्रहसम्बन्ध ग्राफ</span>
        </button>

        <button
          onClick={() => setActiveTab('registry')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'registry'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 shadow-md'
              : 'text-amber-200 hover:text-white hover:bg-amber-900/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>नियम अभिलेख र प्रमाण</span>
        </button>

        <button
          onClick={() => setActiveTab('shadbala')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'shadbala'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 shadow-md'
              : 'text-amber-200 hover:text-white hover:bg-amber-900/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>षड्बल (Shadbala)</span>
        </button>

        <button
          onClick={() => setActiveTab('ashtakavarga')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'ashtakavarga'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 shadow-md'
              : 'text-amber-200 hover:text-white hover:bg-amber-900/60'
          }`}
        >
          <span>अष्टकवर्ग</span>
        </button>

        <button
          onClick={() => setActiveTab('multiplatform')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'multiplatform'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 shadow-md'
              : 'text-amber-200 hover:text-white hover:bg-amber-900/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>बहु-मञ्च वास्तुकला</span>
        </button>
      </div>

      {/* Zero AI Hallucination Architecture Banner */}
      <div className="bg-amber-900/40 rounded-xl border border-amber-800/60 p-3 text-xs text-amber-200 flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>सफ्टवेयर वास्तुकला ग्यारेन्टी:</strong> यहाँ देखाइएका सम्पूर्ण योग, दोष र ग्रहसम्बन्धहरू गणितीय सूत्र तथा शास्त्रीय प्रमाण अभिलेखद्वारा मात्र निर्क्योल गरिएका हुन्। AI ले कुनै पनि ग्रहस्थिति वा योग आफैं अनुमान वा परिवर्तन गर्दैन।
        </span>
      </div>

      {/* TAB 1: YOGAS LIST */}
      {activeTab === 'yogas' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-amber-300 font-semibold">वर्ग अनुसार छान्नुहोस्:</span>
            {['सबै', 'राजयोग', 'धनयोग', 'विपरीत राजयोग', 'पंचमहापुरुष', 'सूर्य योग', 'चन्द्र योग', 'राशि परिवर्तन योग'].map((cat) => (
              <button
                key={cat}
                onClick={() => setYogaCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  yogaCategoryFilter === cat
                    ? 'bg-amber-500 text-amber-950 font-bold'
                    : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredYogas.length === 0 ? (
            <div className="bg-amber-950/80 rounded-2xl border border-amber-800/80 p-8 text-center text-amber-300 text-sm">
              यस वर्गमा वा निर्धारित नियमअनुसार कुनै योग पहिचान भएन।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredYogas.map((y) => (
                <div
                  key={y.id}
                  className="bg-amber-950/80 backdrop-blur-md rounded-2xl border border-amber-800/80 p-5 shadow-xl space-y-3 relative hover:border-amber-600 transition-all cursor-pointer"
                  onClick={() => setSelectedYoga(y)}
                >
                  <div className="flex items-center justify-between border-b border-amber-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <div>
                        <h3 className="text-base font-bold text-amber-100">{y.nameNepali}</h3>
                        <p className="text-[10px] text-amber-400 font-semibold">{y.nameSanskrit} ({y.category})</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        y.status === 'सक्रिय'
                          ? 'bg-emerald-900/80 text-emerald-200 border-emerald-700'
                          : 'bg-amber-900/80 text-amber-200 border-amber-700'
                      }`}>
                        {y.status}
                      </span>
                      <span className="bg-amber-900 text-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-700">
                        बल: {toDevanagariNumerals(y.strengthPercentage)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-amber-200 leading-relaxed">{y.descriptionNepali}</p>

                  <div className="space-y-1 text-xs text-amber-300/90 bg-amber-900/40 p-2.5 rounded-xl border border-amber-800/40">
                    <strong className="text-[11px] text-amber-400 block">बन्नुको मुख्य कारण:</strong>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5">
                      {y.formingCausesNepali.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-amber-400/80 pt-1">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <BPHSShlokaTooltip
                        target={{ type: 'yoga', yogaCodeOrName: y.id }}
                        onOpenSidePanel={(t) => handleOpenShloka(t)}
                        inlineBadge={true}
                        customLabel="प्रमाण श्लोक"
                      />
                      <span className="text-[10px] text-stone-400">| {y.classicalProof.textNameNepali}</span>
                    </div>
                    <span className="text-amber-300 font-bold hover:underline">विस्तृत हेर्नुहोस् ➔</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOSHAS LIST */}
      {activeTab === 'doshas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doshas.map((d) => (
              <div
                key={d.id}
                className={`bg-amber-950/80 backdrop-blur-md rounded-2xl border p-5 shadow-xl space-y-3 cursor-pointer transition-all hover:border-amber-600 ${
                  d.isCancelled ? 'border-emerald-800/80' : 'border-rose-900/80'
                }`}
                onClick={() => setSelectedDosha(d)}
              >
                <div className="flex items-center justify-between border-b border-amber-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-5 h-5 ${d.isCancelled ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <div>
                      <h3 className="text-base font-bold text-amber-100">{d.nameNepali}</h3>
                      <p className="text-[10px] text-amber-400 font-semibold">{d.nameSanskrit} ({d.category})</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    d.isCancelled
                      ? 'bg-emerald-950 text-emerald-200 border-emerald-700'
                      : 'bg-rose-950 text-rose-200 border-rose-800'
                  }`}>
                    {d.severityLabel}
                  </span>
                </div>

                <p className="text-xs text-amber-200 leading-relaxed">{d.descriptionNepali}</p>

                <div className="space-y-1 text-xs text-amber-300/90 bg-amber-900/40 p-2.5 rounded-xl border border-amber-800/40">
                  <strong className="text-[11px] text-amber-400 block">लागू भएका नियमहरू:</strong>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5">
                    {d.formingRulesNepali.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>

                {d.cancellationRulesTriggeredNepali.length > 0 && (
                  <div className="space-y-1 text-xs text-emerald-200 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                    <strong className="text-[11px] text-emerald-400 block">शमन तथा भङ्गका सर्तहरू:</strong>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5">
                      {d.cancellationRulesTriggeredNepali.map((cRule, idx) => (
                        <li key={idx}>{cRule}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-amber-400/80 pt-1">
                  <span>📖 सन्दर्भ: {d.classicalProof.textNameNepali}</span>
                  <span className="text-amber-300 font-bold hover:underline">विस्तृत हेर्नुहोस् ➔</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PLANETARY RELATIONSHIP GRAPH */}
      {activeTab === 'graph' && (
        <div className="bg-amber-950/80 backdrop-blur-md rounded-2xl border border-amber-800/80 p-6 shadow-xl space-y-6">
          <div className="border-b border-amber-800 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
              <Network className="w-5 h-5 text-amber-400" />
              <span>ग्रहसम्बन्ध ग्राफ (Planetary Relationships Graph)</span>
            </h3>
            <span className="text-xs text-amber-400 bg-amber-900 px-3 py-1 rounded-full border border-amber-700">
              कुल सम्बन्ध लिङ्कहरू: <strong>{toDevanagariNumerals(relationshipGraph.edges.length)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conjunctions & Aspects */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-amber-300 border-b border-amber-800 pb-2">
                १. युति सम्बन्ध (Conjunctions)
              </h4>
              {relationshipGraph.conjunctions.length === 0 ? (
                <p className="text-xs text-amber-400/70 italic">कुनै पनि भावमा २ वा सोभन्दा बढी ग्रहको युति छैन।</p>
              ) : (
                <div className="space-y-2">
                  {relationshipGraph.conjunctions.map((c, idx) => (
                    <div key={idx} className="bg-amber-900/40 p-3 rounded-xl border border-amber-800/60 text-xs text-amber-200">
                      भाव <strong>{toDevanagariNumerals(c.house)}</strong> मा: <span className="font-bold text-amber-100">{c.planets.join(' + ')}</span> को युति
                    </div>
                  ))}
                </div>
              )}

              <h4 className="text-sm font-bold text-amber-300 border-b border-amber-800 pb-2 pt-2">
                २. दृष्टि सम्बन्ध (Aspects)
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {relationshipGraph.aspects.map((a, idx) => (
                  <div key={idx} className="bg-amber-900/30 p-2.5 rounded-lg border border-amber-800/40 text-xs text-amber-200 flex items-center justify-between">
                    <span><strong>{a.observer}</strong> ➔ <strong>{a.target}</strong> माथि {toDevanagariNumerals(a.houseDistance)} औँ दृष्टि</span>
                    <span className="bg-amber-800 text-amber-200 text-[10px] px-2 py-0.5 rounded font-bold">{toDevanagariNumerals(a.percentage)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Parivartana & Nakshatra Lords */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-amber-300 border-b border-amber-800 pb-2">
                ३. राशि परिवर्तन योग (Parivartana Yogas)
              </h4>
              {relationshipGraph.parivartanaYogas.length === 0 ? (
                <p className="text-xs text-amber-400/70 italic">कुनै पनि ग्रहहरू बीच आपसी राशि परिवर्तन छैन।</p>
              ) : (
                <div className="space-y-2">
                  {relationshipGraph.parivartanaYogas.map((p, idx) => (
                    <div key={idx} className="bg-amber-900/40 p-3 rounded-xl border border-amber-800/60 text-xs text-amber-200">
                      <strong>{p.planet1}</strong> (भाव {toDevanagariNumerals(p.house1)}) ↔ <strong>{p.planet2}</strong> (भाव {toDevanagariNumerals(p.house2)}) - <span className="font-bold text-amber-300">{p.type} परिवर्तन</span>
                    </div>
                  ))}
                </div>
              )}

              <h4 className="text-sm font-bold text-amber-300 border-b border-amber-800 pb-2 pt-2">
                ४. नक्षत्र स्वामी सम्बन्ध (Nakshatra Lord Links)
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {relationshipGraph.nakshatraLordLinks.map((n, idx) => (
                  <div key={idx} className="bg-amber-900/30 p-2.5 rounded-lg border border-amber-800/40 text-xs text-amber-200 flex items-center justify-between">
                    <span><strong>{n.planet}</strong> को नक्षत्र स्वामी <strong>{n.nakshatraLord}</strong></span>
                    <span className="text-amber-400 text-[11px]">भाव {toDevanagariNumerals(n.lordHouse)} ({n.lordRashi})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RULE REGISTRY & PROOFS */}
      {activeTab === 'registry' && (
        <div className="bg-amber-950/80 backdrop-blur-md rounded-2xl border border-amber-800/80 p-6 shadow-xl space-y-6">
          <div className="border-b border-amber-800 pb-3">
            <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>ज्योतिषीय नियम अभिलेख तथा शास्त्रीय प्रमाण कोष</span>
            </h3>
            <p className="text-xs text-amber-300/80 mt-1">
              प्रणालीमा सूचीकृत सम्पूर्ण शास्त्रीय नियमहरू र तिनका प्रमाण ग्रन्थ सन्दर्भहरू
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-amber-300 border-b border-amber-800 pb-1">क) योग नियम अभिलेख (Yoga Rules)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {YOGA_RULE_REGISTRY.map((rule) => (
                <div key={rule.ruleCode} className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-100 text-sm">{rule.nameNepali}</span>
                    <span className="bg-amber-800 text-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">{rule.category}</span>
                  </div>
                  <p className="text-amber-200/90">{rule.descriptionNepali}</p>
                  <div className="bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/40 text-[11px] text-amber-300/90 italic space-y-1">
                    <p><strong>📖 प्रमाण:</strong> {rule.classicalProof.textNameNepali} ({rule.classicalProof.chapter}, {rule.classicalProof.shlokaOrVerse})</p>
                    {rule.classicalProof.originalSanskritText && (
                      <p className="text-amber-200 font-serif font-medium">{rule.classicalProof.originalSanskritText}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-bold text-amber-300 border-b border-amber-800 pb-1 pt-4">ख) दोष नियम तथा शमन अभिलेख (Dosha Rules)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOSHA_RULE_REGISTRY.map((rule) => (
                <div key={rule.ruleCode} className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-100 text-sm">{rule.nameNepali}</span>
                    <span className="bg-rose-950 text-rose-200 px-2 py-0.5 rounded text-[10px] font-semibold border border-rose-800">{rule.category}</span>
                  </div>
                  <p className="text-amber-200/90">{rule.descriptionNepali}</p>
                  <div className="bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/40 text-[11px] text-amber-300/90 italic">
                    <p><strong>📖 प्रमाण:</strong> {rule.classicalProof.textNameNepali} ({rule.classicalProof.chapter})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SHADBALA */}
      {activeTab === 'shadbala' && (
        <div className="bg-amber-950/80 backdrop-blur-md rounded-2xl border border-amber-800/80 p-5 shadow-xl overflow-x-auto space-y-4">
          <h3 className="text-base font-bold font-serif text-amber-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>षड्बल ६ प्रकारका बलहरूको गणितीय विश्लेषण (Shadbala Evaluation)</span>
          </h3>

          <table className="w-full text-left text-xs text-amber-100 border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-amber-800 bg-amber-900/60 text-amber-300">
                <th className="p-2.5">ग्रह</th>
                <th className="p-2.5">स्थान बल</th>
                <th className="p-2.5">दिक् बल</th>
                <th className="p-2.5">काल बल</th>
                <th className="p-2.5">चेष्टा बल</th>
                <th className="p-2.5">नैसर्गिक बल</th>
                <th className="p-2.5">दृक् बल</th>
                <th className="p-2.5">कुल रूप (Rupas)</th>
                <th className="p-2.5">आवश्यक रूप</th>
                <th className="p-2.5">परिणाम</th>
              </tr>
            </thead>
            <tbody>
              {shadbala.map((s) => (
                <tr key={s.planet} className="border-b border-amber-900/50 hover:bg-amber-900/40">
                  <td className="p-2.5 font-bold text-amber-100">{s.planet}</td>
                  <td className="p-2.5">{toDevanagariNumerals(s.sthanaBala)}</td>
                  <td className="p-2.5">{toDevanagariNumerals(s.dikBala)}</td>
                  <td className="p-2.5">{toDevanagariNumerals(s.kalaBala)}</td>
                  <td className="p-2.5">{toDevanagariNumerals(s.chestaBala)}</td>
                  <td className="p-2.5">{toDevanagariNumerals(s.naisargikaBala)}</td>
                  <td className="p-2.5">{toDevanagariNumerals(s.drikBala)}</td>
                  <td className="p-2.5 font-bold text-amber-200">{toDevanagariNumerals(s.totalRupas)}</td>
                  <td className="p-2.5 text-amber-300/80">{toDevanagariNumerals(s.requiredRupas)}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.strengthLabel === 'अत्यन्त बलियो'
                        ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                        : s.strengthLabel === 'बलियो'
                        ? 'bg-amber-800 text-amber-100 border border-amber-600'
                        : 'bg-rose-950 text-rose-200 border border-rose-800'
                    }`}>
                      {s.strengthLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: ASHTAKAVARGA */}
      {activeTab === 'ashtakavarga' && (
        <div className="bg-amber-950/80 backdrop-blur-md rounded-2xl border border-amber-800/80 p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold font-serif text-amber-200 flex items-center justify-between border-b border-amber-800 pb-3">
            <span>सर्व-अष्टकवर्ग रेखांश र भाव विन्दुहरू (Sarva Ashtakavarga Points)</span>
            <span className="text-xs text-amber-400 bg-amber-900 px-3 py-1 rounded-full border border-amber-700">
              कुल विन्दु: <strong>{toDevanagariNumerals(ashtakavarga.totalSAVPoints)}</strong> / ३३७
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ashtakavarga.bhavas.map((b) => (
              <div
                key={b.bhava}
                className={`p-3 rounded-xl border text-center space-y-1 ${
                  b.points >= 30
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-100'
                    : b.points >= 25
                    ? 'bg-amber-900/60 border-amber-700 text-amber-100'
                    : 'bg-rose-950/60 border-rose-800 text-rose-200'
                }`}
              >
                <span className="text-[10px] text-amber-400 block font-semibold">
                  भाव {toDevanagariNumerals(b.bhava)} ({b.rashiName})
                </span>
                <span className="text-lg font-bold">{toDevanagariNumerals(b.points)} विन्दु</span>
                <span className="text-[9px] block opacity-80">
                  {b.points >= 28 ? 'शुभ गोचर विन्दु' : 'सामान्य / सतर्क'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: MULTIPLATFORM ARCHITECTURE */}
      {activeTab === 'multiplatform' && (
        <div className="bg-amber-950/80 backdrop-blur-md rounded-2xl border border-amber-800/80 p-6 shadow-xl space-y-6">
          <div className="border-b border-amber-800 pb-3">
            <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>साझा बहु-मञ्च वास्तुकला (Multi-Platform Architecture & Database Schema)</span>
            </h3>
            <p className="text-xs text-amber-300/80 mt-1">
              वेब, कम्प्युटर (Electron/Tauri) र मोबाइल (Android App) तीनै मञ्चका लागि एउटै केन्द्रीय गणना इन्जिन
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/60 text-center space-y-2">
              <Globe className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-amber-100">१. वेब मञ्च (Web System)</h4>
              <p className="text-xs text-amber-300/80">ब्राउजरबाट तत्काल चल्ने र अनलाइन परामर्श सेवा प्रदान गर्ने।</p>
            </div>

            <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/60 text-center space-y-2">
              <Monitor className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-amber-100">२. कम्प्युटर मञ्च (Desktop System)</h4>
              <p className="text-xs text-amber-300/80">विन्डोज/म्याक/लिनक्समा चल्ने, अफलाइन चल्ने र विस्तृत प्रिन्टिङ सुविधायुक्त।</p>
            </div>

            <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/60 text-center space-y-2">
              <Smartphone className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-amber-100">३. मोबाइल मञ्च (Android App)</h4>
              <p className="text-xs text-amber-300/80">एन्ड्रोइड मोबाइलमा छिटो, सरल र तत्काल कुण्डली हेर्न सकिने।</p>
            </div>
          </div>

          <div className="bg-amber-900/30 p-4 rounded-xl border border-amber-800/50 space-y-2 text-xs text-amber-200">
            <strong className="text-amber-400 text-sm block">साझा डाटाबेस तालिका संरचना (Shared Database Schemas):</strong>
            <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 text-[11px]">
              <li><code>clients</code> (ग्राहक सूची)</li>
              <li><code>birth_details</code> (जन्म विवरण)</li>
              <li><code>panchanga_logs</code> (पञ्चाङ्ग अभिलेख)</li>
              <li><code>kundali_records</code> (कुण्डली अभिलेख)</li>
              <li><code>yogas_detected</code> (योग परिणाम)</li>
              <li><code>doshas_detected</code> (दोष परिणाम)</li>
              <li><code>dasha_histories</code> (दशा इतिहास)</li>
              <li><code>rule_registry</code> (नियम अभिलेख)</li>
              <li><code>consultation_reports</code> (परामर्श प्रतिवेदन)</li>
            </ul>
          </div>
        </div>
      )}

      {/* YOGA DETAILS MODAL */}
      {selectedYoga && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-amber-950 border border-amber-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs text-amber-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedYoga(null)}
              className="absolute top-4 right-4 text-amber-400 hover:text-white font-bold text-base"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 border-b border-amber-800 pb-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-lg font-bold text-amber-100">{selectedYoga.nameNepali}</h3>
                <p className="text-xs text-amber-400 font-semibold">{selectedYoga.nameSanskrit} ({selectedYoga.category})</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="leading-relaxed">{selectedYoga.descriptionNepali}</p>
              <div className="bg-amber-900/50 p-3 rounded-xl border border-amber-800/60 space-y-1">
                <strong className="text-amber-400 block">बन्नुको शास्त्रीय कारण:</strong>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {selectedYoga.formingCausesNepali.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              <div className="bg-amber-900/30 p-3 rounded-xl border border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-400 block font-serif text-xs">📖 शास्त्रीय प्रमाण श्लोक:</strong>
                  <button
                    onClick={() => {
                      const yId = selectedYoga.id;
                      setSelectedYoga(null);
                      handleOpenShloka({ type: 'yoga', yogaCodeOrName: yId });
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>पूर्ण श्लोक व पाठ हेर्नुहोस्</span>
                  </button>
                </div>
                <p className="italic text-amber-200/90">{selectedYoga.classicalProof.textNameNepali} - {selectedYoga.classicalProof.chapter} ({selectedYoga.classicalProof.shlokaOrVerse})</p>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">{selectedYoga.classicalProof.nepaliMeaningSummary}</p>
                
                {/* Look up matching BPHS verse */}
                {(() => {
                  const bphsData = getBPHSYogaShloka(selectedYoga.id);
                  if (bphsData) {
                    return (
                      <div className="mt-2 p-2.5 bg-amber-950/80 rounded-lg border border-amber-700/60 space-y-1.5">
                        <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          संस्कृत मूल श्लोक:
                        </div>
                        <p className="font-serif text-xs text-amber-100 italic whitespace-pre-line leading-relaxed">
                          {bphsData.sanskritVerse}
                        </p>
                        <div className="text-[10px] text-amber-300/80">
                          {bphsData.detailedMeaningNepali}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOSHA DETAILS MODAL */}
      {selectedDosha && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-amber-950 border border-amber-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs text-amber-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDosha(null)}
              className="absolute top-4 right-4 text-amber-400 hover:text-white font-bold text-base"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 border-b border-amber-800 pb-3">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
              <div>
                <h3 className="text-lg font-bold text-amber-100">{selectedDosha.nameNepali}</h3>
                <p className="text-xs text-amber-400 font-semibold">{selectedDosha.nameSanskrit} ({selectedDosha.category})</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="leading-relaxed">{selectedDosha.descriptionNepali}</p>
              
              <div className="bg-amber-900/50 p-3 rounded-xl border border-amber-800/60 space-y-1">
                <strong className="text-amber-400 block">लागू नियमहरू:</strong>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {selectedDosha.formingRulesNepali.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

              {selectedDosha.remediesNepali.length > 0 && (
                <div className="bg-rose-950/50 p-3 rounded-xl border border-rose-800/60 space-y-1 text-rose-200">
                  <strong className="text-rose-400 block">शास्त्रीय उपाय तथा शान्ति विधान:</strong>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5">
                    {selectedDosha.remediesNepali.map((rem, i) => <li key={i}>{rem}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BPHS Classical Shloka Side Panel / Drawer */}
      <BPHSShlokaSidePanel
        isOpen={isShlokaPanelOpen}
        onClose={() => setIsShlokaPanelOpen(false)}
        target={shlokaTarget}
        onSelectTarget={(t) => setShlokaTarget(t)}
      />
    </div>
  );
};
