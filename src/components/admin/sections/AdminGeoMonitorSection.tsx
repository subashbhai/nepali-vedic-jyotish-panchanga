import React from 'react';
import { MapPin, Navigation, Radio, CheckCircle2, Clock, Users, Activity } from 'lucide-react';

export const AdminGeoMonitorSection: React.FC = () => {
  const radiusSteps = [
    { radiusKm: 3, label: '३ कि.मी. (प्राथमिकता १ - नजिकको)', activeCount: 14, speed: '< ३ सेकेन्ड' },
    { radiusKm: 5, label: '५ कि.मी. (प्राथमिकता २ - स्थानीय)', activeCount: 28, speed: '< ५ सेकेन्ड' },
    { radiusKm: 10, label: '१० कि.मी. (प्राथमिकता ३ - नगर क्षेत्र)', activeCount: 45, speed: '< ८ सेकेन्ड' },
    { radiusKm: 20, label: '२० कि.मी. (प्राथमिकता ४ - उपत्यका/जिल्ला)', activeCount: 62, speed: '< १२ सेकेन्ड' },
    { radiusKm: 30, label: '३० कि.मी. (प्राथमिकता ५ - क्षेत्रीय)', activeCount: 89, speed: '< १५ सेकेन्ड' },
  ];

  const recentGeoMatches = [
    { id: 'geo_1', time: '१० मिनेट अघि', location: 'काठमाडौं, बानेश्वर', service: 'गृहप्रवेश पूजा', radius: '५ कि.मी.', assigned: 'पं. रामेश्वर शर्मा', status: 'Matched (2.4 km)' },
    { id: 'geo_2', time: '२५ मिनेट अघि', location: 'ललितपुर, पाटन', service: 'ज्योतिष परामर्श', radius: '३ कि.मी.', assigned: 'ज्योतिषाचार्य देवराज', status: 'Matched (1.8 km)' },
    { id: 'geo_3', time: '४५ मिनेट अघि', location: 'भक्तपुर, सूर्यविनायक', service: 'वास्तु निरीक्षण', radius: '१० कि.मी.', assigned: 'ई. वास्तुविद् केदार', status: 'Matched (7.2 km)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <span>भौगोलिक दूरी र म्याचिङ अनुगमन (Geolocation Radius Monitor)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            यजमानको लोकेसन अनुसार ३ देखि ३० कि.मी. रेडियसमा उपलब्ध नजिकका पुरोहित/ज्योतिषी स्वतः म्याच हुने प्रणाली।
          </p>
        </div>

        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-bold font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          GEO MATCHING ENGINE ACTIVE
        </span>
      </div>

      {/* Radius Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {radiusSteps.map(step => (
          <div key={step.radiusKm} className="bg-stone-900 border border-stone-800 p-3.5 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 font-mono font-bold text-xs">
                {step.radiusKm} KM
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">{step.speed}</span>
            </div>

            <div>
              <p className="text-xs font-bold text-stone-200">{step.label}</p>
              <p className="text-xl font-mono font-black text-amber-300 mt-1">{step.activeCount} <span className="text-xs font-normal text-stone-400">विशेषज्ञ</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Matches Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2 border-b border-stone-800 pb-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>हालैका म्याचिङ इतिहास (Recent Real-time Matches)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">समय</th>
                <th className="p-3">यजमान लोकेसन</th>
                <th className="p-3">अनुरोध सेवा</th>
                <th className="p-3">खोज रेडियस</th>
                <th className="p-3">तोकिएका विशेषज्ञ</th>
                <th className="p-3 text-right">नतिजा</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {recentGeoMatches.map(m => (
                <tr key={m.id} className="hover:bg-stone-800/40">
                  <td className="p-3 font-mono text-stone-400">{m.time}</td>
                  <td className="p-3 font-bold text-stone-200">{m.location}</td>
                  <td className="p-3 text-amber-300">{m.service}</td>
                  <td className="p-3 font-mono">{m.radius}</td>
                  <td className="p-3 font-bold text-stone-100">{m.assigned}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-mono font-bold text-[10px] border border-emerald-800">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
