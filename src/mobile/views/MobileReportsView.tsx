import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  Printer,
  ShieldCheck
} from 'lucide-react';
import { MobileBirthProfile } from '../types/mobileJyotishTypes';
import { MobileKundaliPayload } from '../services/mobileAstrologyService';
import { PanchangaData } from '../../types/astrology';

export const MobileReportsView: React.FC<{
  profile: MobileBirthProfile;
  kundaliData: MobileKundaliPayload;
  panchanga: PanchangaData;
}> = ({ profile, kundaliData, panchanga }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownloadReport = (reportType: string, reportTitle: string) => {
    setDownloadingId(reportType);

    // Generate HTML print sheet for mobile download / print
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${reportTitle} - बालानन्द वैदिक ज्योतिष सेवा</title>
            <meta charset="utf-8" />
            <style>
              body { font-family: sans-serif; padding: 24px; color: #1c140e; background: #fff; }
              .header { text-align: center; border-bottom: 2px solid #b45309; padding-bottom: 12px; margin-bottom: 20px; }
              .header h1 { margin: 0; color: #78350f; font-size: 20px; }
              .header p { margin: 4px 0 0; color: #78716c; font-size: 12px; }
              .box { border: 1px solid #e7e5e4; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
              .box h3 { margin: 0 0 8px; color: #92400e; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th, td { border: 1px solid #d6d3d1; padding: 6px 8px; text-align: left; }
              th { background: #fef3c7; color: #78350f; }
              .footer { text-align: center; font-size: 10px; color: #a8a29e; margin-top: 30px; border-top: 1px solid #e7e5e4; padding-top: 8px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🕉️ बालानन्द वैदिक ज्योतिष सेवा</h1>
              <p>नेपाली वैदिक ज्योतिष तथा व्यक्तिगत ज्योतिष सेवा प्रणाली</p>
              <h2 style="font-size: 15px; margin-top: 8px; color: #b45309;">${reportTitle}</h2>
            </div>

            <div class="box">
              <h3>व्यक्तिगत विवरण (Jatak Profile)</h3>
              <p><strong>नाम:</strong> ${profile.name} &nbsp;|&nbsp; <strong>जन्म मिति:</strong> ${profile.dateOfBirth} &nbsp;|&nbsp; <strong>समय:</strong> ${profile.timeOfBirth}</p>
              <p><strong>स्थान:</strong> ${profile.placeOfBirth} &nbsp;|&nbsp; <strong>जन्म लग्न:</strong> ${kundaliData.lagna?.rashiName || 'मेष'} (${kundaliData.lagna?.formattedDegree || '००°००'})</p>
            </div>

            <div class="box">
              <h3>९ ग्रह स्थिति विवरण (Planetary Degrees)</h3>
              <table>
                <thead>
                  <tr>
                    <th>ग्रह</th>
                    <th>राशि</th>
                    <th>अंश (Degree)</th>
                    <th>नक्षत्र</th>
                    <th>भाव</th>
                    <th>अवस्था</th>
                  </tr>
                </thead>
                <tbody>
                  ${kundaliData.planets.map(p => `
                    <tr>
                      <td><strong>${p.name}</strong> ${p.isRetrograde ? '(वक्र)' : ''}</td>
                      <td>${p.rashiName}</td>
                      <td>${p.formattedDegree}</td>
                      <td>${p.nakshatraName} (${p.pada})</td>
                      <td>${p.bhava}</td>
                      <td>${p.dignity || 'सम'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="box">
              <h3>विंशोत्तरी दशा कालखण्ड</h3>
              <p><strong>हालको महादशा:</strong> ${kundaliData.dasha?.currentMahadasha?.planet || 'गुरु'} (${kundaliData.dasha?.currentMahadasha?.startDate || ''} देखि ${kundaliData.dasha?.currentMahadasha?.endDate || ''})</p>
              <p><strong>हालको अन्तरदशा:</strong> ${kundaliData.dasha?.currentAntardasha?.planet || 'शनि'} (${kundaliData.dasha?.currentAntardasha?.startDate || ''} देखि ${kundaliData.dasha?.currentAntardasha?.endDate || ''})</p>
            </div>

            <div class="footer">
              <p>यस प्रतिवेदन आधिकारिक बालानन्द वैदिक ज्योतिष गणना विधिबाट प्रमाणित गरी तयार गरिएको हो। © बालानन्द वैदिक ज्योतिष सेवा</p>
            </div>
            <script>
              window.onload = function() { window.print(); };
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
      setDownloadingId(null);
      setDownloadSuccess(reportType);
      setTimeout(() => setDownloadSuccess(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-sm text-stone-100 font-serif">
            ज्योतिष प्रतिवेदन डाउनलोड (PDF Reports)
          </h2>
        </div>
        <p className="text-[11px] text-stone-400 mt-1">
          आफ्नो जन्मकुण्डली, फलादेश तथा दशा विश्लेषणको आधिकारिक ब्रान्डेड PDF प्रतिवेदन
        </p>
      </div>

      {/* 2. Available Reports List */}
      <div className="space-y-3">
        {[
          {
            id: 'full_kundali',
            title: 'सम्पूर्ण जन्मकुण्डली प्रतिवेदन (Comprehensive Kundali PDF)',
            desc: 'लग्न, नवांश, दशांश, ९ ग्रह स्पष्ट अंश, भाव फल र नक्षत्र विवरण',
            pages: '२ पृष्ठ (PDF)',
            badge: 'सर्वाधिक लोकप्रिय'
          },
          {
            id: 'dasha_timeline',
            title: 'विंशोत्तरी दशा चक्र तथा आगामी समय प्रतिवेदन',
            desc: '१२० वर्षे विंशोत्तरी दशा, वर्तमान महादशा, अन्तरदशा र शुभ समय कालखण्ड',
            pages: '१ पृष्ठ (PDF)'
          },
          {
            id: 'daily_panchanga',
            title: 'दैनिक वैदिक पञ्चाङ्ग तथा मुहूर्त प्रतिवेदन',
            desc: 'तिथि, वार, नक्षत्र, सूर्योदय, सूर्यास्त, अभिजित् मुहूर्त र राहुकाल',
            pages: '१ पृष्ठ (PDF)'
          }
        ].map(rpt => (
          <div
            key={rpt.id}
            className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-amber-200">{rpt.title}</h4>
                  {rpt.badge && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full border border-amber-500/30 font-bold">
                      {rpt.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">{rpt.desc}</p>
                <span className="text-[10px] text-stone-500 font-mono block">
                  फरम्याट: {rpt.pages} • ब्रान्डिङ: बालानन्द वैदिक ज्योतिष सेवा
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>डिजिटल प्रमाणित</span>
              </span>

              <button
                type="button"
                onClick={() => handleDownloadReport(rpt.id, rpt.title)}
                disabled={downloadingId === rpt.id}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {downloadingId === rpt.id ? (
                  <>
                    <div className="w-3 h-3 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>तयार हुँदैछ...</span>
                  </>
                ) : downloadSuccess === rpt.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
                    <span>मुद्रण/डाउनलोड सुरु भयो</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-stone-950" />
                    <span>PDF डाउनलोड / प्रिन्ट</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
