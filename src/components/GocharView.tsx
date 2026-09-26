import React, { useState } from 'react';
import { Globe2, ShieldAlert, Sparkles, Calendar, Bell } from 'lucide-react';
import { PlanetPosition, GocharTransitResult, BirthDetails, LagnaInfo } from '../types/astrology';
import { calculateGocharAndSadeSati } from '../utils/gocharEngine';
import { GocharTimeChakra } from './gochar/GocharTimeChakra';

interface GocharViewProps {
  moon: PlanetPosition;
  transitPlanets: PlanetPosition[];
  activeProfile?: BirthDetails | null;
  birthLagna?: LagnaInfo;
  todayBS?: string;
  onOpenNotificationCenter?: () => void;
}

export const GocharView: React.FC<GocharViewProps> = ({
  moon,
  transitPlanets,
  activeProfile,
  birthLagna,
  todayBS,
  onOpenNotificationCenter,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const gocharResult: GocharTransitResult = calculateGocharAndSadeSati(
    moon,
    transitPlanets,
    selectedDate
  );

  return (
    <div className="space-y-6">
      {/* Date Picker & Push Alert Header Bar */}
      <div className="bg-amber-900/60 backdrop-blur-md rounded-2xl border border-amber-700/60 p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-amber-100 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-amber-400" />
            <span>गोचर ग्रह स्थिति तथा साढेसाती विश्लेषण (Transits & Sade Sati)</span>
          </h2>
          <p className="text-xs text-amber-300/80 mt-0.5">
            जन्म चन्द्र राशि <strong>({moon.rashiName})</strong> बाट गोचर ग्रहहरूको स्थिति र साढेसातीको प्रभाव
            {activeProfile?.name && <span> • जातक: <strong>{activeProfile.name}</strong></span>}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onOpenNotificationCenter && (
            <button
              onClick={onOpenNotificationCenter}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="गोचर पुश सूचना सेटिङ तथा अलर्ट केन्द्र खोल्नुहोस्"
            >
              <Bell className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>गोचर पुश अलर्ट केन्द्र</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-amber-950 text-amber-100 border border-amber-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Dynamic 24-Hour Time-Progression Dial (Time Chakra) */}
      <GocharTimeChakra
        birthMoon={moon}
        birthLagna={birthLagna}
        activeProfile={activeProfile}
        baseDateAD={selectedDate}
      />

      {/* Saturn Sade Sati & Dhaiya Status Card */}
      <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md space-y-3 ${
        gocharResult.sadeSati.status.includes('साढेसाती') || gocharResult.sadeSati.status.includes('ढैय्या')
          ? 'bg-rose-950/80 border-rose-800 text-rose-100'
          : 'bg-emerald-950/80 border-emerald-800 text-emerald-100'
      }`}>
        <div className="flex items-center justify-between border-b border-rose-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-bold font-serif">
                शनिदेवको साढेसाती / ढैय्या प्रभाव: {gocharResult.sadeSati.status}
              </h3>
              {gocharResult.sadeSati.phaseName && (
                <p className="text-xs text-amber-300">{gocharResult.sadeSati.phaseName}</p>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs leading-relaxed">{gocharResult.sadeSati.descriptionNepali}</p>

        {gocharResult.sadeSati.remediesNepali && (
          <div className="bg-black/30 p-3 rounded-xl border border-white/10 space-y-1 text-xs">
            <strong className="text-amber-300">उपाय तथा शान्ति मार्गदर्शन:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
              {gocharResult.sadeSati.remediesNepali.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Planetary Transits relative to Moon */}
      <div className="bg-amber-950/80 backdrop-blur-md rounded-2xl border border-amber-800/80 p-5 shadow-xl space-y-4">
        <h3 className="text-base font-bold font-serif text-amber-200 border-b border-amber-800 pb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>ग्रहहरूको गोचर स्थिति (Transits from Birth Moon Sign)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gocharResult.transits.map((t, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border space-y-1.5 text-xs ${
                t.nature === 'शुभ'
                  ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-100'
                  : t.nature === 'अशुभ'
                  ? 'bg-rose-950/50 border-rose-800/80 text-rose-100'
                  : 'bg-amber-900/40 border-amber-800/80 text-amber-100'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{t.planet} ➔ {t.transitRashi} राशिमा</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  t.nature === 'शुभ'
                    ? 'bg-emerald-800 text-emerald-100'
                    : t.nature === 'अशुभ'
                    ? 'bg-rose-800 text-rose-100'
                    : 'bg-amber-800 text-amber-100'
                }`}>
                  चन्द्रमाबाट {t.houseFromMoon} औँ भाव ({t.nature})
                </span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">{t.descriptionNepali}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
