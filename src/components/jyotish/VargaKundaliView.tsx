import React, { memo, useState, useMemo } from 'react';
import { Layers, Info, Sparkles } from 'lucide-react';
import { LagnaInfo, PlanetPosition, DivisionalChartType } from '../../types/astrology';
import { generateDivisionalChartEx } from '../../utils/vargaEngine';
import { KundaliChartPanel } from './KundaliChartPanel';

interface VargaKundaliViewProps {
  lagna: LagnaInfo;
  planets: PlanetPosition[];
}

const VARGA_LIST: Array<{ id: DivisionalChartType; nameNepali: string; areaNepali: string }> = [
  { id: 'D1', nameNepali: 'D-1 (जन्म लग्न)', areaNepali: 'समग्र शरीर, स्वास्थ्य र व्यक्तित्व' },
  { id: 'D2', nameNepali: 'D-2 (होरा)', areaNepali: 'धन-सम्पत्ति र आर्थिक स्थिति' },
  { id: 'D3', nameNepali: 'D-3 (द्रेष्काण)', areaNepali: 'भाइ-बहिनी, पराक्रम र साहस' },
  { id: 'D4', nameNepali: 'D-4 (चतुर्थांश)', areaNepali: 'भाग्य, घर-जग्गा र अचल सम्पत्ति' },
  { id: 'D7', nameNepali: 'D-7 (सप्तमांश)', areaNepali: 'सन्तान सुख, नाति-नातिना' },
  { id: 'D9', nameNepali: 'D-9 (नवांश)', areaNepali: 'भाग्य, वैवाहिक सुख र धर्म' },
  { id: 'D10', nameNepali: 'D-10 (दशांश)', areaNepali: 'करियर, व्यवसाय, पदोन्नति र प्रतिष्ठा' },
  { id: 'D12', nameNepali: 'D-12 (द्वादशांश)', areaNepali: 'माता-पिता र पितृ कुल' },
  { id: 'D16', nameNepali: 'D-16 (षोडशांश)', areaNepali: 'वाहन, सुख र भौतिक सुविधा' },
  { id: 'D20', nameNepali: 'D-20 (विंशांश)', areaNepali: 'अध्यात्म, उपासना र साधना' },
  { id: 'D24', nameNepali: 'D-24 (चतुर्विंशांश)', areaNepali: 'उच्च शिक्षा, विद्या र ज्ञान' },
  { id: 'D27', nameNepali: 'D-27 (सप्तविंशांश)', areaNepali: 'मानसिक बल, शारीरिक शक्ति' },
  { id: 'D30', nameNepali: 'D-30 (त्रिंशांश)', areaNepali: 'अरिष्ट, संकट, रोग र दुष्ट फल' },
  { id: 'D40', nameNepali: 'D-40 (खवेदांश)', areaNepali: 'वंश परम्परा र शुभ फल' },
  { id: 'D45', nameNepali: 'D-45 (अक्षवेदांश)', areaNepali: 'नैतिक चरित्र र संस्कार' },
  { id: 'D60', nameNepali: 'D-60 (षष्ट्यंश)', areaNepali: 'पूर्वजन्मको कर्म अधिकार र सूक्ष्म फल' },
];

export const VargaKundaliView: React.FC<VargaKundaliViewProps> = memo(({
  lagna,
  planets,
}) => {
  const [selectedVarga, setSelectedVarga] = useState<DivisionalChartType>('D9');

  const currentVargaInfo = VARGA_LIST.find((v) => v.id === selectedVarga) || VARGA_LIST[5];

  // Calculate varga chart
  const { vargaLagna, vargaPlanetsList } = useMemo(() => {
    const vargaChart = generateDivisionalChartEx(selectedVarga, lagna, planets);
    const vLagna: LagnaInfo = {
      ...lagna,
      rashiId: vargaChart.houses[0]?.rashiId || lagna.rashiId,
      rashiName: vargaChart.houses[0]?.rashiName || lagna.rashiName,
    };
    const vPlanets = vargaChart.houses.flatMap((h) =>
      h.planets.map((p) => ({
        ...p,
        bhava: h.houseNumber,
      }))
    );
    return { vargaLagna: vLagna, vargaPlanetsList: vPlanets };
  }, [selectedVarga, lagna, planets]);

  return (
    <div className="space-y-4">
      {/* Selector Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
              षोडशवर्ग कुण्डली (Shodashvarga 16 Divisional Charts)
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 font-mono">
            महर्षि पराशर वर्ग सिद्धान्त
          </span>
        </div>

        {/* Varga Buttons Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 text-xs">
          {VARGA_LIST.map((v) => {
            const isSelected = selectedVarga === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVarga(v.id)}
                className={`py-1.5 px-2 rounded-xl text-center font-bold transition-all truncate ${
                  isSelected
                    ? 'bg-[#7A1C1C] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#EAE4D9]'
                }`}
              >
                {v.id}
              </button>
            );
          })}
        </div>

        {/* Active Varga Description */}
        <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E6E0D5] dark:border-stone-700 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <div>
            <strong className="text-[#7A1C1C] dark:text-amber-300 font-bold">{currentVargaInfo.nameNepali}: </strong>
            <span className="text-stone-700 dark:text-stone-300">{currentVargaInfo.areaNepali}</span>
          </div>
        </div>
      </div>

      {/* Render Selected Varga Diamond Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7">
          <KundaliChartPanel
            lagna={vargaLagna}
            planets={vargaPlanetsList}
            chartTitle={`${currentVargaInfo.nameNepali}`}
          />
        </div>

        {/* Side Varga Details */}
        <div className="md:col-span-5 bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-3 text-xs">
          <h4 className="font-extrabold text-[#7A1C1C] dark:text-amber-300 border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
            वर्ग स्थिति तालिका ({selectedVarga})
          </h4>
          <div className="space-y-2">
            {vargaPlanetsList.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/50 border border-[#E6E0D5]/60 dark:border-stone-800"
              >
                <span className="font-bold text-[#7A1C1C] dark:text-amber-300">{p.name}</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{p.rashiName} ({p.bhava} भाव)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
