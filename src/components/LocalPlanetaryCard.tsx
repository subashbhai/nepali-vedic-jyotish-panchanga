import React, { useMemo } from 'react';
import { 
  Compass, 
  Sun, 
  Moon, 
  Clock, 
  MapPin, 
  Globe, 
  Info, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { LocationData, PanchangaData } from '../types/astrology';
import { 
  calculateLagna, 
  calculatePlanetaryPositions, 
  getJulianDay, 
  getAyanamsa 
} from '../utils/astroCalculations';
import { formatCoordinatesDevanagari, formatTimeDifferenceFromNepal, formatTimeZoneString } from '../data/worldLocations';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface LocalPlanetaryCardProps {
  selectedLocation: LocationData;
  selectedDateAD: string;
  panchanga: PanchangaData;
  onOpenLocationModal?: () => void;
}

export const LocalPlanetaryCard: React.FC<LocalPlanetaryCardProps> = ({
  selectedLocation,
  selectedDateAD,
  panchanga,
  onOpenLocationModal,
}) => {
  // Compute local sidereal lagna & planetary positions at local morning / sunrise
  const { lagna, planets, ayanamsa } = useMemo(() => {
    // We compute for 06:00 local time or sunrise
    const jd = getJulianDay(selectedDateAD, '06:00', selectedLocation.timeZone);
    const ayan = getAyanamsa(jd, 'Lahiri');
    const lagnaInfo = calculateLagna(jd, selectedLocation.latitude, selectedLocation.longitude, ayan);
    const planetPositions = calculatePlanetaryPositions(jd, ayan, lagnaInfo.rashiId);

    return {
      lagna: lagnaInfo,
      planets: planetPositions,
      ayanamsa: ayan,
    };
  }, [selectedDateAD, selectedLocation]);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-600/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>{selectedLocation.flag || '📍'}</span>
                <span>{selectedLocation.name}</span>
                <span className="text-xs font-normal text-stone-500">
                  ({selectedLocation.country})
                </span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                स्थानीय ग्रह-स्पष्ट तथा तात्कालिक लग्न
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>अक्षांश: {toDevanagariNumerals(selectedLocation.latitude.toFixed(4))}°</span>
              <span>•</span>
              <span>देशान्तर: {toDevanagariNumerals(selectedLocation.longitude.toFixed(4))}°</span>
              <span>•</span>
              <span>समय क्षेत्र: {formatTimeZoneString(selectedLocation.timeZone)}</span>
              <span>•</span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                {formatTimeDifferenceFromNepal(selectedLocation.timeZone)}
              </span>
            </p>
          </div>
        </div>

        {onOpenLocationModal && (
          <button
            onClick={onOpenLocationModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-colors shrink-0"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>अन्य स्थान / देश परिवर्तन गर्नुहोस्</span>
          </button>
        )}
      </div>

      {/* Solar & Day Metrics for this location */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/40">
        <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>स्थानीय सूर्योदय</span>
          </div>
          <div className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
            {panchanga.sunrise}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">प्रातः क्षितिज स्पर्श</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
            <Sun className="w-4 h-4 text-orange-500" />
            <span>स्थानीय सूर्यास्त</span>
          </div>
          <div className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
            {panchanga.sunset}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">सांस्कृतिक दिन समाप्ति</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>स्थानीय दिनमान (Day Length)</span>
          </div>
          <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
            {panchanga.dayDuration || '१२ घण्टा १५ मिनेट'}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">अक्षांश अनुसार कुल दिन काल</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
            <Moon className="w-4 h-4 text-purple-500" />
            <span>स्थानीय रात्रिमान (Night Length)</span>
          </div>
          <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
            {panchanga.nightDuration || '११ घण्टा ४५ मिनेट'}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">कुल रात्रि समय</div>
        </div>
      </div>

      {/* Lagna & Planetary Grid */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Local Lagna Highlight */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-stone-800/60 border border-amber-200/70 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold">
              उदित लग्न (Local Ascendant at Sunrise)
            </span>
            <div className="flex items-center gap-3">
              <div className="text-xl font-black text-amber-900 dark:text-amber-200">
                {lagna.rashiName} लग्न
              </div>
              <div className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/80 dark:bg-stone-800/80 border border-amber-200/50 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                {lagna.formattedDegree}
              </div>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              नक्षत्र: <strong className="font-semibold text-stone-800 dark:text-stone-200">{lagna.nakshatraName}</strong> (चरण {toDevanagariNumerals(lagna.pada)}) • लग्नेश: <strong className="font-semibold text-stone-800 dark:text-stone-200">{lagna.lord}</strong>
            </p>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 sm:text-right max-w-xs border-t sm:border-t-0 sm:border-l sm:pl-4 border-amber-200/50 dark:border-stone-800 pt-2 sm:pt-0">
            चयन गरिएको स्थानको देशान्तर (Longitude) अनुसार स्थानीय क्षितिजमा सूर्योदयको समयमा उदाएको तात्कालिक राशि।
          </div>
        </div>

        {/* 9 Planets Table for this location */}
        <div>
          <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>स्थान-आधारित नवग्रह स्पष्ट (Local Planetary Details)</span>
          </h4>

          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-b border-stone-200 dark:border-stone-800 font-semibold">
                  <th className="py-2.5 px-3">ग्रह (Planet)</th>
                  <th className="py-2.5 px-3">राशि (Rashi)</th>
                  <th className="py-2.5 px-3">स्पष्ट अंश (Degree)</th>
                  <th className="py-2.5 px-3">नक्षत्र व चरण</th>
                  <th className="py-2.5 px-3">भाव (House)</th>
                  <th className="py-2.5 px-3">स्थिति / गति</th>
                  <th className="py-2.5 px-3">गरिमा (Dignity)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 bg-white dark:bg-stone-900">
                {planets.map((planet) => {
                  const isRetro = planet.isRetrograde;
                  const isCombust = planet.isCombust;
                  return (
                    <tr 
                      key={planet.name}
                      className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>{planet.name}</span>
                        {isRetro && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold" title="वक्री गति">
                            (व)
                          </span>
                        )}
                        {isCombust && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 font-bold" title="अस्त">
                            (अ)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-stone-800 dark:text-stone-200">
                        {planet.rashiName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-700 dark:text-stone-300">
                        {planet.formattedDegree}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 dark:text-stone-400">
                        {planet.nakshatraName} ({toDevanagariNumerals(planet.pada)})
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono font-medium text-stone-800 dark:text-stone-200">
                          {toDevanagariNumerals(planet.bhava)} भाव
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[11px] font-medium ${isRetro ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isRetro ? 'वक्री (Retrograde)' : 'मार्गी (Direct)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                          {planet.dignity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informational Guidance on Geographical Astro Variations */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 flex items-start gap-3 text-xs text-stone-600 dark:text-stone-300">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              स्थान-अनुसार पञ्चाङ्ग तथा ज्योतिषीय समय चक्र:
            </span>
            <p className="leading-relaxed">
              वैदिक ज्योतिष सिद्धान्त अनुसार, कुनै पनि स्थानको अक्षांश (Latitude) ले स्थानीय सूर्योदय, सूर्यास्त तथा दिनको लम्बाइ (दिनमान) निर्धारण गर्छ भने देशान्तर (Longitude) ले स्थानीय नाक्षत्र समय (Local Sidereal Time) र उदित हुने लग्न (Ascendant) निर्धारण गर्छ। त्यसैले नेपाल, अमेरिका (USA), बेलायत (UK), वा अस्ट्रेलियामा एकै दिनको सूर्योदय, चौघडिया तथा उदया तिथि समय फरक-फरक हुन्छ।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
