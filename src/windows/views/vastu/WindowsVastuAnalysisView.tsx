import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Compass, 
  Layers, 
  BookOpen,
  ArrowRight,
  Printer
} from 'lucide-react';
import { VastuAnalysisResult } from '../../../core/vastu/vastuAnalysis';

interface WindowsVastuAnalysisViewProps {
  analysis: VastuAnalysisResult;
  projectName: string;
  onNavigateToReport: () => void;
}

export const WindowsVastuAnalysisView: React.FC<WindowsVastuAnalysisViewProps> = ({
  analysis,
  projectName,
  onNavigateToReport,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md">
            {projectName}
          </span>
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-serif mt-1 flex items-center gap-2">
            <span>📊</span>
            <span>वास्तु विश्लेषण तथा पञ्चमहाभूत मूल्याङ्कन (Vastu Analysis)</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            परम्परागत वास्तुशास्त्रीय मान्यता अनुसार कोठा विन्यास, पञ्चतत्व सन्तुलन र दोष निवारण।
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToReport}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>पूर्ण वास्तु प्रतिवेदन / PDF</span>
        </button>
      </div>

      {/* Main Score & Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-[#F7FAF8] dark:from-stone-900 dark:to-[#121B16] border-2 border-emerald-500/30 dark:border-emerald-600/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>समग्र वास्तु मूल्याङ्कन नतिजा</span>
          </div>
          <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
            {analysis.gradeNepali}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            {analysis.summaryNepali}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm shrink-0 min-w-44 text-center">
          <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {analysis.percentage}%
          </div>
          <span className="text-[11px] font-bold text-stone-500 mt-1">
            कुल अंक: {analysis.totalScore} / {analysis.maxScore}
          </span>
          <span className="text-[10px] text-stone-400 mt-0.5">
            मूल्याङ्कन गरिएका कोठा: {analysis.evaluatedRoomsCount}
          </span>
        </div>
      </div>

      {/* Section 1: Panchamahabhuta Element Balance */}
      <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
              <span>🌀</span>
              <span>पञ्चमहाभूत सन्तुलन विश्लेषण (Panchamahabhuta Elements)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              जल, अग्नि, पृथ्वी, वायु र आकाश तत्वहरूको दिशानुसार सन्तुलन प्रतिशत।
            </p>
          </div>
          <span className="text-xs text-stone-400 italic">परम्परागत मान्यता अनुसार</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {analysis.elementBalances.map((elem) => (
            <div
              key={elem.element}
              className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-stone-800 dark:text-stone-200">
                  {elem.element} तत्व
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${elem.statusColor}`}>
                  {elem.statusNepali}
                </span>
              </div>

              <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, elem.scorePercentage))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>{elem.nameEnglish.split(' ')[0]}</span>
                <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                  {elem.scorePercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Detected Doshas & Remedial Measures (The 4-Step Chain) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
              <span>⚠️</span>
              <span>पहिचान गरिएका वास्तु दोष तथा निवारण उपायहरू ({analysis.doshas.length})</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              तोडफोड नगरिकन गरिने पञ्चतत्व सन्तुलन, रङ्ग, धातु र यन्त्र स्थापना विधि।
            </p>
          </div>
        </div>

        {analysis.doshas.length === 0 ? (
          <div className="p-8 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-3xl border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-stone-900 dark:text-stone-100 font-serif">
              कुनै गम्भीर वास्तु दोष भेटिएन!
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto">
              तपाईंको नक्सामा राखिएका सबै संरचनाहरू शास्त्रोक्त अनुकूल स्थानमा छन्। घरमा सकारात्मक उर्जाको प्रवाह राम्रो रहनेछ।
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.doshas.map((dosha, idx) => (
              <div
                key={idx}
                className="p-5 bg-white dark:bg-stone-900 rounded-3xl border-2 border-amber-300 dark:border-amber-800/60 shadow-sm space-y-3"
              >
                {/* 1. Vastu Observation Header */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      वास्तु स्थिति • Vastu Observation
                    </span>
                    <h4 className="font-bold text-base text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
                      <span>{dosha.roomNameNepali}</span>
                      <span className="text-xs text-stone-500">({dosha.directionNameNepali})</span>
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    dosha.rating === 'severe'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {dosha.ratingLabelNepali}
                  </span>
                </div>

                {/* 2 & 3. Affected Zone & Traditional Interpretation */}
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>परम्परागत वास्तुशास्त्रीय मान्यता:</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-stone-600 dark:text-stone-400">
                    {dosha.traditionalInterpretation}
                  </p>
                </div>

                {/* 4. Suggested Remedies List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>तोडफोडबिनाका सिफारिस गरिएका वैदिक वास्तु उपचारहरू (Remedies):</span>
                  </span>

                  <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400 pl-4 list-disc marker:text-emerald-600">
                    {dosha.suggestedRemedies.map((rem, rIdx) => (
                      <li key={rIdx} className="leading-relaxed">
                        {rem}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Positive Vastu Points */}
      {analysis.positivePoints.length > 0 && (
        <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>शास्त्रसम्मत शुभ स्थानहरू ({analysis.positivePoints.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {analysis.positivePoints.map((pt, pIdx) => (
              <div
                key={pIdx}
                className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 flex items-start gap-2"
              >
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {pt.roomNameNepali} ({pt.directionNameNepali}):
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {pt.remarksNepali}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
