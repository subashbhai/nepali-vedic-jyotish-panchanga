import React, { memo } from 'react';
import { Layers } from 'lucide-react';
import { LagnaInfo, PlanetPosition } from '../../types/astrology';
import { RASHI_DATA } from '../../utils/astroCalculations';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface BhavaTableProps {
  lagna: LagnaInfo;
  planets: PlanetPosition[];
}

const BHAVA_FRUIT_MAP: Record<number, { name: string; significator: string }> = {
  1: { name: 'प्रथम भाव (तनु भाव)', significator: 'शरीर, व्यक्तित्व, स्वास्थ्य, आत्मबल र स्वभाव' },
  2: { name: 'द्वितीय भाव (धन भाव)', significator: 'धन, कुटुम्ब, वाणी, सम्पत्ति र प्रारम्भिक शिक्षा' },
  3: { name: 'तृतीय भाव (सहज/पराक्रम भाव)', significator: 'पराक्रम, भाइ-बहिनी, साहस, सञ्चार र छोटो यात्रा' },
  4: { name: 'चतुर्थ भाव (सुख/मातृ भाव)', significator: 'माता, गृह सुख, वाहन, भूमि, अचल सम्पत्ति र मानसिक शान्ति' },
  5: { name: 'पञ्चम भाव (पुत्र/बुद्धि भाव)', significator: 'सन्तान, बुद्धि, ज्ञान, प्रेम, मन्त्र र पूर्वपुण्य' },
  6: { name: 'षष्ठ भाव (रिपु/रोग भाव)', significator: 'रोग, ऋण, शत्रु, प्रतिस्पर्धा, मामा र सेवा' },
  7: { name: 'सप्तम भाव (कलत्र/जाया भाव)', significator: 'पति/पत्नी, वैवाहिक सुख, साझेदारी र सार्वजनिक व्यापार' },
  8: { name: 'अष्टम भाव (आयु/रन्ध्र भाव)', significator: 'आयु, गुप्त ज्ञान, संकट, अनुसन्धान र पैतृक धन' },
  9: { name: 'नवम भाव (धर्म/भाग्य भाव)', significator: 'भाग्य, धर्म, पिता, गुरु, उच्च शिक्षा र तीर्थयात्रा' },
  10: { name: 'दशम भाव (कर्म/राज्य भाव)', significator: 'करियर, व्यवसाय, प्रतिष्ठा, पदोन्नति र राजकीय सम्मान' },
  11: { name: 'एकादश भाव (आय/लाभ भाव)', significator: 'आम्दानी, लाभ, इच्छापूर्ति, दाजुभाइ र मित्रमण्डली' },
  12: { name: 'द्वादश भाव (व्यय भाव)', significator: 'खर्च, विदेश यात्रा, मोक्ष, दान र अस्पताल/जेल' },
};

export const BhavaTable: React.FC<BhavaTableProps> = memo(({
  lagna,
  planets,
}) => {
  const lagnaRashiId = lagna.rashiId || 1;

  const housesList = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const rashiId = ((lagnaRashiId - 1 + i) % 12) + 1;
    const rData = RASHI_DATA.find((r) => r.id === rashiId);
    const houseLord = rData ? rData.lord : '—';

    // Find planets in this house
    const posPlanets = planets.filter((p) => {
      let hNum = p.bhava;
      if (!hNum || hNum < 1 || hNum > 12) {
        hNum = ((p.rashiId - lagnaRashiId + 12) % 12) + 1;
      }
      return hNum === houseNum;
    });

    const planetNames = posPlanets.length > 0 ? posPlanets.map((p) => p.name).join(', ') : 'खाली (शुभ दृष्टि)';

    return {
      houseNum: toDevanagariNumerals(houseNum),
      rashiName: rData ? rData.name : '—',
      houseLord,
      planetsInHouse: planetNames,
      fruitDetails: BHAVA_FRUIT_MAP[houseNum] || { name: 'भाव', significator: 'विशेष फल' },
    };
  });

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-3">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
            भाव स्थिति र फल (Bhava System)
          </h3>
        </div>
        <span className="text-[11px] text-stone-500 font-medium">१२ वटा भाव विश्लेषण</span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] dark:bg-stone-800 border-b border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-300 font-extrabold font-serif">
              <th className="py-2 px-3">भाव</th>
              <th className="py-2 px-3">राशि</th>
              <th className="py-2 px-3">भावेश (Lord)</th>
              <th className="py-2 px-3">ग्रह स्थिति</th>
              <th className="py-2 px-3">कारक तथा फल क्षेत्र</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
            {housesList.map((h, idx) => (
              <tr key={idx} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-stone-800/40 transition-colors">
                <td className="py-2 px-3 font-bold text-[#7A1C1C] dark:text-amber-300">
                  {h.houseNum}
                </td>
                <td className="py-2 px-3 font-semibold">{h.rashiName}</td>
                <td className="py-2 px-3 font-bold text-amber-900 dark:text-amber-300">{h.houseLord}</td>
                <td className="py-2 px-3 font-medium text-stone-800 dark:text-stone-200">{h.planetsInHouse}</td>
                <td className="py-2 px-3 text-stone-600 dark:text-stone-400">{h.fruitDetails.significator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
