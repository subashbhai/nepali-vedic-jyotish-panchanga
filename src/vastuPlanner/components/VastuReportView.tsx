// Comprehensive Vastu Analysis Report & Non-Destructive Vedic Remedies
// बालानन्द कर्मकाण्ड
import React from 'react';
import { VastuAnalysisResult, VastuPlannerProject } from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Printer, 
  Download, 
  Compass, 
  Droplets, 
  Flame, 
  Mountain, 
  Wind, 
  Sun,
  FileText,
  AlertOctagon
} from 'lucide-react';
import { canUserPrintDocuments } from '../../db/subscriptionStore';

interface VastuReportViewProps {
  project: VastuPlannerProject;
  analysis: VastuAnalysisResult;
}

export const VastuReportView: React.FC<VastuReportViewProps> = ({
  project,
  analysis
}) => {
  const handlePrint = () => {
    if (!canUserPrintDocuments('vastu')) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { docType: 'vastu' } }));
      return;
    }
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300';
    if (score >= 60) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-300';
    return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-stone-900 border-2 border-amber-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-[#7A1C1C] dark:text-amber-400" />
            <h2 className="text-xl font-black font-serif text-[#7A1C1C] dark:text-amber-400">
              वैदिक वास्तु भवन मूल्याङ्कन प्रतिवेदन
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
            परियोजना: <span className="font-bold text-stone-900 dark:text-stone-100">{project.name}</span> | जग्गा: {project.plotLength} × {project.plotWidth} {project.unit} ({project.plotArea} {project.unit}²)
          </p>
          <p className="text-xs text-stone-500 mt-1">
            अभिमुखीकरण: उत्तर {project.orientationAngle || 0}° | सडक: {project.roads[0]?.direction || 'N'} | तला: {project.floorCount}
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl border-2 text-center min-w-[140px] shadow-sm ${getScoreColor(analysis.overallScore)}`}>
            <span className="text-3xl font-black block font-serif leading-none">
              {analysis.overallScore}%
            </span>
            <span className="text-xs font-bold uppercase tracking-wider mt-1 block">
              श्रेणी: {analysis.grade}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer transition"
          >
            <Printer className="w-4 h-4" />
            <span>प्रतिवेदन प्रिन्ट</span>
          </button>
        </div>
      </div>

      {/* Summary Note */}
      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-stone-800 dark:text-stone-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-1 text-[#7A1C1C] dark:text-amber-300 font-serif">
            मुख्य वास्तु निष्कर्ष (Executive Summary):
          </span>
          <p>{analysis.summaryNepali}</p>
        </div>
      </div>

      {/* Pancha Tattva (5 Elements) Balance */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-600" />
          <span>पञ्चतत्त्व सन्तुलन (Five Elements Balance)</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 text-center">
            <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">जल (Water - ईशान)</span>
            <span className="text-base font-black text-blue-800 dark:text-blue-300">{analysis.elementBalance.water}%</span>
          </div>

          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 text-center">
            <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">अग्नि (Fire - आग्नेय)</span>
            <span className="text-base font-black text-orange-800 dark:text-orange-300">{analysis.elementBalance.fire}%</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-center">
            <Mountain className="w-5 h-5 text-amber-700 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">पृथ्वी (Earth - नैऋत्य)</span>
            <span className="text-base font-black text-amber-800 dark:text-amber-300">{analysis.elementBalance.earth}%</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-center">
            <Wind className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">वायु (Air - वायव्य)</span>
            <span className="text-base font-black text-emerald-800 dark:text-emerald-300">{analysis.elementBalance.air}%</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 text-center col-span-2 sm:col-span-1">
            <Sun className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">आकाश (Space - ब्रह्मस्थान)</span>
            <span className="text-base font-black text-purple-800 dark:text-purple-300">{analysis.elementBalance.space}%</span>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Observations & Remedies Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-serif text-[#7A1C1C] dark:text-amber-400">
          विस्तृत वास्तु परीक्षण तथा तोडफोडविहीन वैदिक उपचार (Detailed Observations & Remedies)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.items.map((item) => {
            const isRec = item.status === 'recommended';
            const isConf = item.status === 'conflict';
            const isCaut = item.status === 'caution';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 transition-all bg-white dark:bg-stone-900 shadow-sm ${
                  isRec
                    ? 'border-emerald-200 dark:border-emerald-900/60'
                    : isConf
                    ? 'border-red-300 dark:border-red-900/60'
                    : 'border-amber-200 dark:border-stone-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    {isRec && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isCaut && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                    {isConf && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      {item.title}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isRec ? 'bg-emerald-100 text-emerald-800' : isConf ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.category}
                  </span>
                </div>

                <div className="pt-2.5 space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                  <p><strong className="text-stone-800 dark:text-stone-200">अवलोकन:</strong> {item.observation}</p>
                  <p><strong className="text-stone-800 dark:text-stone-200">वास्तु प्रभाव:</strong> {item.recommendation}</p>
                  {item.vedicRemedy && (
                    <div className="mt-2 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200">
                      <strong>वैदिक उपचार / समाधान:</strong> {item.vedicRemedy}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vedic Non-destructive General Guidelines */}
      <div className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>तोडफोडविहीन मुख्य वास्तु नियम (Non-Destructive Vedic Harmonization)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600 dark:text-stone-300">
          <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
            <strong className="block text-stone-900 dark:text-stone-100 mb-1">रङ्ग संयोजन (Color Therapy):</strong>
            ईशान र उत्तरमा सेतो वा हल्का पहेँलो, पूर्वमा हल्का हरियो, आग्नेयमा हल्का गुलाफी/सुन्तला, दक्षिणमा हल्का रातो र नैऋत्यमा माटोको रङ्ग (Earth color) शुभ मानिन्छ।
          </div>
          <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
            <strong className="block text-stone-900 dark:text-stone-100 mb-1">ऊर्जा प्रवाह र पिरामिड:</strong>
            कुनै दिशामा वास्तु दोष वा कुना काटिएको भएमा सिमानामा तामाको तार, वास्तु पिरामिड वा पञ्चरत्न विजारोपण गरी दोष शमन गर्न सकिन्छ।
          </div>
          <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
            <strong className="block text-stone-900 dark:text-stone-100 mb-1">जल तथा ढलान व्यवस्था:</strong>
            बगैँचा, रूख तथा भारी भण्डार दक्षिण-पश्चिममा र स्वच्छ पानीको ट्याङ्की, इनार वा पूजास्थल उत्तर-पूर्वमा राख्नुपर्छ।
          </div>
        </div>
      </div>

      {/* Mandatory Professional Legal & Engineering Disclaimer */}
      <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs leading-relaxed flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-stone-800 dark:text-stone-200 font-serif mb-1">
            महत्त्वपूर्ण वैधानिक तथा प्राविधिक सूचना (Engineering & Regulatory Disclaimer):
          </strong>
          <p>{analysis.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
