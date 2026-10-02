import React from 'react';
import { 
  Printer, 
  Download, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText
} from 'lucide-react';
import { VastuProjectMetadata } from '../../../core/vastu/vastuReport';
import { VastuAnalysisResult, RoomPlacementEntry } from '../../../core/vastu/vastuAnalysis';
import { compileVastuReportData } from '../../../core/vastu/vastuReport';

interface WindowsVastuReportViewProps {
  project: VastuProjectMetadata;
  placements: RoomPlacementEntry[];
  analysis: VastuAnalysisResult;
}

export const WindowsVastuReportView: React.FC<WindowsVastuReportViewProps> = ({
  project,
  placements,
  analysis,
}) => {
  const reportData = compileVastuReportData(project, placements, analysis);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Ribbon (Hidden when printing) */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800 print:hidden">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
            <span>📜</span>
            <span>वास्तु प्रतिवेदन तथा प्रिन्ट (Vastu Report & PDF)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            बालानन्द वैदिक वास्तु सेवा आधिकारिक प्रतिवेदन • ए४ साइजमा प्रिन्ट वा PDF सेभ गर्नुहोस्।
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>प्रिन्ट / PDF सेभ गर्नुहोस् (Print)</span>
        </button>
      </div>

      {/* Printable Sheet (Standard A4 Print Layout) */}
      <div className="bg-white text-stone-900 rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-xl max-w-4xl mx-auto space-y-6 font-sans print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none">
        
        {/* Report Header */}
        <div className="text-center pb-6 border-b-2 border-stone-800 space-y-2">
          <div className="text-2xl">🕉</div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-emerald-900">
            {reportData.branding.title}
          </h1>
          <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            {reportData.branding.subtitle}
          </p>
          <div className="text-[11px] text-stone-500 font-medium">
            {reportData.branding.organization} • मिति: {reportData.branding.generatedAtNepali}
          </div>
        </div>

        {/* Project & Owner Metadata Summary Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200 text-xs">
          <div>
            <span className="text-[10px] text-stone-500 block">घर / भवनको नाम:</span>
            <strong className="text-stone-900">{project.projectName}</strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">घरधनी:</span>
            <strong className="text-stone-900">{project.ownerName}</strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">मुख्य मोहडा (Facing):</span>
            <strong className="text-stone-900">{project.facingDirection} दिशा</strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">स्थान / ठेगाना:</span>
            <strong className="text-stone-900">{project.address}</strong>
          </div>
        </div>

        {/* Score & Evaluation Ribbon */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase">समग्र वास्तु मूल्याङ्कन</span>
            <div className="text-lg font-black text-emerald-950 font-serif">
              {analysis.gradeNepali}
            </div>
            <p className="text-[11px] text-emerald-900 leading-snug mt-0.5">
              {analysis.summaryNepali}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-3xl font-black text-emerald-800 font-mono">
              {analysis.percentage}%
            </span>
            <div className="text-[10px] text-emerald-700">प्राप्तांक: {analysis.totalScore} / {analysis.maxScore}</div>
          </div>
        </div>

        {/* Room Placement & Compatibility Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-stone-900 font-serif">
            १. कोठा विन्यास तथा दिशागत स्थिति (Room Placements)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 border-b border-stone-200 font-bold">
                  <th className="p-2.5">क्र.सं.</th>
                  <th className="p-2.5">कोठा / संरचना</th>
                  <th className="p-2.5">दिशा</th>
                  <th className="p-2.5">वास्तु अनुकूलता</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {reportData.roomPlacements.map((rp, idx) => (
                  <tr key={idx} className="hover:bg-stone-50">
                    <td className="p-2.5 text-stone-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-stone-800">{rp.roomName}</td>
                    <td className="p-2.5 text-stone-600">{rp.directionName} ({rp.directionCode})</td>
                    <td className="p-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${rp.statusColor}`}>
                        {rp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panchamahabhuta Balance Overview */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-stone-900 font-serif">
            २. पञ्चमहाभूत तत्व सन्तुलन (Element Balances)
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {analysis.elementBalances.map((elem) => (
              <div key={elem.element} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50">
                <span className="font-bold text-stone-800 block">{elem.element} तत्व</span>
                <span className="text-sm font-black text-emerald-800 font-mono mt-0.5 block">
                  {elem.scorePercentage}%
                </span>
                <span className="text-[9px] text-stone-500 font-medium">
                  {elem.statusNepali}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Identified Doshas & Remedies */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-stone-900 font-serif">
            ३. वास्तु दोष तथा वैदिक निवारण उपायहरू (Doshas & Remedies)
          </h3>
          {analysis.doshas.length === 0 ? (
            <p className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl">
              कुनै गम्भीर वास्तु दोष छैन। घरको ऊर्जा सन्तुलन उत्तम छ।
            </p>
          ) : (
            <div className="space-y-2.5 text-xs">
              {analysis.doshas.map((d, idx) => (
                <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-950 font-bold">
                      {idx + 1}. {d.roomNameNepali} ({d.directionNameNepali}): {d.ratingLabelNepali}
                    </strong>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    <strong>मान्यता:</strong> {d.traditionalInterpretation}
                  </p>
                  <div className="text-[11px] text-emerald-900 pl-3">
                    <strong>सिफारिस गरिएका उपाय:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                      {d.suggestedRemedies.map((rem, rIdx) => (
                        <li key={rIdx}>{rem}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seal & Certification Footer */}
        <div className="pt-6 border-t-2 border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <div>
            <span className="font-bold block text-stone-800">बालानन्द वैदिक वास्तु सेवा</span>
            <span className="text-[10px]">{reportData.branding.sealText}</span>
          </div>
          <div className="text-right">
            <span className="block border-b border-stone-400 w-36 mb-1" />
            <span className="text-[10px]">वास्तुविद्को आधिकारिक हस्ताक्षर</span>
          </div>
        </div>

      </div>

    </div>
  );
};
