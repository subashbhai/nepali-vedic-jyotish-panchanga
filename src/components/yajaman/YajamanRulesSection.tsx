import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Scale, 
  Users, 
  Lock, 
  Slash,
  Sparkles
} from 'lucide-react';

export const YajamanRulesSection: React.FC = () => {
  const rules = [
    {
      no: '१',
      title: 'सही तथा तथ्यपरक जानकारी (Accurate Information)',
      desc: 'आफ्नो नाम, ठेगाना, योग्यता, अनुभव र सेवाको प्रकारमा कुनै पनि भ्रामक वा झुटो विवरण राख्न पाइने छैन।',
      type: 'DO',
    },
    {
      no: '२',
      title: 'झुटो प्रोफाइल तथा सेवा निषेध (Anti-Fraud Policy)',
      desc: 'नक्कली नाम, अरूको तस्बिर वा काल्पनिक संस्थाको नाममा प्रोफाइल बनाउनु कडा रूपमा निषेधित छ।',
      type: 'DONT',
    },
    {
      no: '३',
      title: 'अमर्यादित तथा अभद्र भाषा निषेध (Civility & Respect)',
      desc: 'पोस्ट, कमेन्ट वा सन्देशमा कुनै पनि किसिमको अश्लील, गालीगलौज, धार्मिक विद्वेष वा अपमानजनक शब्द प्रयोग गर्न पाइने छैन।',
      type: 'DONT',
    },
    {
      no: '४',
      title: 'स्पाम तथा अवाञ्छित सन्देश निषेध (No Spamming)',
      desc: 'एउटै पोस्ट पटक-पटक गर्ने, असान्दर्भिक व्यावसायिक विज्ञापन वा अन्य बाह्य लिङ्कहरू राख्न निषेध गरिएको छ।',
      type: 'DONT',
    },
    {
      no: '५',
      title: 'व्यक्तिगत गोपनीयताको सम्मान (Privacy Protection)',
      desc: 'कसैको सहमति बिना निजको फोन नम्बर, पारिवारिक विवरण वा निजी तस्बिरहरू सार्वजनिक फिडमा खुलाउन पाइने छैन।',
      type: 'DO',
    },
    {
      no: '६',
      title: 'अनुचित तस्बिर तथा सामग्री निषेध (Appropriate Content)',
      desc: 'केवल वैदिक कर्मकाण्ड, पूजा-पाठ, अनुष्ठान र धार्मिक विषयसँग सम्बन्धित शालीन तस्बिरहरू मात्र प्रयोग गर्नुपर्नेछ।',
      type: 'DO',
    },
    {
      no: '७',
      title: 'सामुदायिक उजुरी तथा रिपोर्टिङ (Community Reporting)',
      desc: 'कुनै पनि पोस्ट वा कमेन्ट नियम विपरीत देखिएमा कुनै पनि प्रयोगकर्ताले सिधै "Report" गर्न सक्नेछन्।',
      type: 'DO',
    },
    {
      no: '८',
      title: 'प्रशासकीय निगरानी तथा सामग्री हटाउने अधिकार (Moderation)',
      desc: 'उजुरी परेका वा नियम उल्लङ्घन गरेका पोस्ट र कमेन्टहरूलाई प्रशासनले पूर्वसूचना बिना हटाउन वा सम्पादन गर्न सक्नेछ।',
      type: 'DO',
    },
    {
      no: '९',
      title: 'खाता निलम्बन तथा कालोसूची (Account Suspension)',
      desc: 'निरन्तर नियम उल्लङ्घन गर्ने वा ठगीजन्य कार्यमा संलग्न प्रयोगकर्ताको खाता तत्काल निलम्बन गरी कालोसूचीमा राखिनेछ।',
      type: 'DONT',
    },
    {
      no: '१०',
      title: 'शास्त्रीय मर्यादा र आचारसंहिता (Vedic Ethics)',
      desc: 'यजमान र पुरोहित दुवै पक्षले सनातन धर्म, संस्कृति र पारस्परिक सम्मानको मर्यादा पूर्ण रूपमा पालना गर्नुपर्नेछ।',
      type: 'DO',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-amber-200 dark:border-stone-700 shadow-xl p-5 sm:p-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
          <Scale className="w-3.5 h-3.5 text-rose-600" />
          सामुदायिक नीति तथा आचारसंहिता
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
          यजमान सेवा पोर्टलका १० मुख्य नियम तथा सर्तहरू
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          धार्मिक पवित्रता, सामाजिक मर्यादा र प्रयोगकर्ताको सुरक्षाका लागि यी नियमहरूको पूर्ण पालना अनिवार्य छ।
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((r) => (
          <div 
            key={r.no}
            className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 transition-all ${
              r.type === 'DONT' 
                ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40' 
                : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {r.type === 'DONT' ? (
                <XCircle className="w-5 h-5 text-rose-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span className="font-mono text-xs opacity-75">{r.no}.</span>
                <span>{r.title}</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {r.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Support Notice */}
      <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400">
        <span>कुनै समस्या वा उजुरी भए सिधै हाम्रो सहयोग केन्द्रमा सम्पर्क गर्नुहोस्।</span>
        <span className="font-bold text-[#7A1C1C] dark:text-amber-400">
          गोपनीयता तथा सर्तहरू वि.सं. २०८१ अद्यावधिक
        </span>
      </div>
    </div>
  );
};
