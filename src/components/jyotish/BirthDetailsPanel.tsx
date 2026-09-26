import React, { memo } from 'react';
import { User, MapPin, Clock, Calendar, Edit3, Printer, Globe } from 'lucide-react';
import { BirthDetails, PanchangaData, LagnaInfo } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface BirthDetailsPanelProps {
  profile: BirthDetails;
  onEdit: () => void;
  onPrint: () => void;
  panchanga?: PanchangaData;
  lagna?: LagnaInfo;
}

export const BirthDetailsPanel: React.FC<BirthDetailsPanelProps> = memo(({
  profile,
  onEdit,
  onPrint,
  panchanga,
  lagna,
}) => {
  const genderText = profile.gender === 'male' ? 'पुरुष' : profile.gender === 'female' ? 'महिला' : 'अन्य';

  // Format latitude/longitude into Devanagari format
  const latVal = profile.location?.latitude ?? 27.7172;
  const lngVal = profile.location?.longitude ?? 85.3240;
  const latStr = `${toDevanagariNumerals(latVal.toFixed(2))}° N`;
  const lngStr = `${toDevanagariNumerals(lngVal.toFixed(2))}° E`;

  // Format BS date cleanly without duplicate "वि.सं."
  const rawDateBS = profile.dateBS || '';
  const cleanDateBS = rawDateBS.replace(/^वि\.सं\.?\s*/i, '').trim();
  const bsFormatted = cleanDateBS
    ? `वि.सं. ${toDevanagariNumerals(cleanDateBS)}`
    : 'वि.सं. दर्ता नभएको';

  // Format time
  const timeFormatted = profile.time ? `${toDevanagariNumerals(profile.time)} बजे` : '—';

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
            जन्म विवरण
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onEdit}
            className="p-1.5 text-stone-600 hover:text-[#7A1C1C] dark:text-stone-400 dark:hover:text-amber-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            title="सम्पादन गर्नुहोस्"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onPrint}
            className="p-1.5 text-stone-600 hover:text-[#7A1C1C] dark:text-stone-400 dark:hover:text-amber-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            title="मुद्रण गर्नुहोस्"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Details List */}
      <div className="space-y-2 text-xs flex-1 flex flex-col justify-around py-1">
        {/* Name */}
        <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/50 border border-[#E6E0D5]/60 dark:border-stone-800">
          <span className="text-stone-500 dark:text-stone-400 font-medium">नाम:</span>
          <span className="font-extrabold text-[#7A1C1C] dark:text-amber-300 text-sm text-right">
            {profile.name}
          </span>
        </div>

        {/* Gender */}
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="text-stone-500 dark:text-stone-400 font-medium">लिङ्ग:</span>
          <span className="font-bold text-[#2D241E] dark:text-stone-200">{genderText}</span>
        </div>

        {/* Birth Date BS */}
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            <span>जन्म मिति:</span>
          </span>
          <span className="font-bold text-[#7A1C1C] dark:text-amber-300">
            {bsFormatted}
          </span>
        </div>

        {/* Birth Time */}
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            <span>जन्म समय:</span>
          </span>
          <span className="font-bold text-[#2D241E] dark:text-stone-200">
            {timeFormatted}
          </span>
        </div>

        {/* Birth Location */}
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1 shrink-0">
            <MapPin className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            <span>जन्म स्थान:</span>
          </span>
          <span className="font-bold text-[#2D241E] dark:text-stone-200 text-right max-w-[240px] truncate" title={profile.location?.name || 'काठमाडौँ, नेपाल'}>
            {profile.location?.name || 'काठमाडौँ, नेपाल'}
          </span>
        </div>

        {/* Gotra if present */}
        {(profile.gotra || profile.fatherDetails?.gotra) && (
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <span className="text-stone-500 dark:text-stone-400 font-medium shrink-0">गोत्र:</span>
            <span className="font-bold text-[#7A1C1C] dark:text-amber-400">
              {profile.gotra || profile.fatherDetails?.gotra}
            </span>
          </div>
        )}

        {/* Lat / Long */}
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1 shrink-0">
            <Globe className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            <span>अक्षांश / देशान्तर:</span>
          </span>
          <span className="font-semibold text-stone-700 dark:text-stone-300 font-mono text-[11px]">
            {latStr} / {lngStr}
          </span>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="text-stone-500 dark:text-stone-400 font-medium shrink-0">समय क्षेत्र:</span>
          <span className="font-semibold text-stone-700 dark:text-stone-300">
            नेपाल प्रमाणिक समय (+५:४५)
          </span>
        </div>

        {/* Quick Astrological summary pills if lagna/panchanga passed */}
        {(lagna || panchanga) && (
          <div className="pt-1.5 border-t border-[#E6E0D5]/70 dark:border-stone-800 grid grid-cols-2 gap-1.5 text-[11px]">
            {lagna && (
              <div className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E6E0D5]/60 dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">लग्न:</span>
                <span className="font-bold text-[#7A1C1C] dark:text-amber-400">{lagna.rashiName} ({lagna.formattedDegree})</span>
              </div>
            )}
            {panchanga?.moonRashi && (
              <div className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E6E0D5]/60 dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">चन्द्र राशि:</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">{panchanga.moonRashi}</span>
              </div>
            )}
            {panchanga?.nakshatra && (
              <div className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E6E0D5]/60 dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">नक्षत्र:</span>
                <span className="font-bold text-[#D97706] dark:text-amber-400">{panchanga.nakshatra.name} ({toDevanagariNumerals(panchanga.nakshatra.pada || 1)})</span>
              </div>
            )}
            {panchanga?.gana && (
              <div className="p-1.5 rounded-lg bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E6E0D5]/60 dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">गण / नाडी:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{panchanga.gana} / {panchanga.nadi || 'मध्य'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-2 flex items-center gap-2 border-t border-[#E6E0D5] dark:border-stone-800">
        <button
          onClick={onEdit}
          className="flex-1 py-1.5 px-3 bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 rounded-lg text-xs font-bold border border-[#E6E0D5] dark:border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>सम्पादन</span>
        </button>
        <button
          onClick={onPrint}
          className="flex-1 py-1.5 px-3 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-amber-300" />
          <span>मुद्रण</span>
        </button>
      </div>
    </div>
  );
});
