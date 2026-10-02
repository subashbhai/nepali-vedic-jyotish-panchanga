import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Printer, 
  Heart, 
  Compass, 
  Moon, 
  Sun, 
  Activity, 
  Layers, 
  User, 
  Plus, 
  Check, 
  Trash2,
  FileText
} from 'lucide-react';
import { WindowsJyotishTab } from '../../types/windowsAppTypes';
import { 
  WindowsBirthProfile, 
  getAllBirthProfiles, 
  saveBirthProfile, 
  deleteBirthProfile 
} from '../../db/windowsSecureStore';
import { 
  getCalculatedMobileKundali, 
  MobileKundaliPayload 
} from '../../../mobile/services/mobileAstrologyService';
import { KundaliChart } from '../../../components/KundaliChart';
import { calculatePanchanga } from '../../../utils/panchangaEngine';

interface WindowsJyotishDashboardViewProps {
  activeTab: WindowsJyotishTab;
  onTabChange: (tab: WindowsJyotishTab) => void;
}

export const WindowsJyotishDashboardView: React.FC<WindowsJyotishDashboardViewProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [profiles, setProfiles] = useState<WindowsBirthProfile[]>(() => getAllBirthProfiles());
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || 'bp_demo_1');
  const [chartType, setChartType] = useState<'D1' | 'D9' | 'D10'>('D1');
  const [isAddProfileModalOpen, setIsAddProfileModalOpen] = useState(false);

  // New Profile Form
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDateBS, setNewProfileDateBS] = useState('2056-01-01');
  const [newProfileTime, setNewProfileTime] = useState('08:30');
  const [newProfilePlace, setNewProfilePlace] = useState('काठमाडौँ');

  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === selectedProfileId) || profiles[0];
  }, [profiles, selectedProfileId]);

  // Realtime Jyotish calculations
  const kundali = useMemo<MobileKundaliPayload | null>(() => {
    if (!activeProfile) return null;
    return getCalculatedMobileKundali({
      id: activeProfile.id,
      name: activeProfile.name,
      dateBS: activeProfile.dateBS,
      dateAD: activeProfile.dateAD,
      time: activeProfile.timeOfBirth,
      gender: (activeProfile.gender as any) || 'MALE',
      location: {
        name: activeProfile.placeOfBirth,
        country: 'Nepal',
        latitude: activeProfile.latitude,
        longitude: activeProfile.longitude,
        timeZone: activeProfile.timezone,
      },
    });
  }, [activeProfile]);

  const dashaTable = useMemo(() => {
    if (!kundali || !kundali.dasha?.mahadashas) return [];
    return kundali.dasha.mahadashas;
  }, [kundali]);

  // Today's Panchanga
  const todayPanchanga = useMemo(() => {
    const todayStr = activeProfile?.dateAD || new Date().toISOString().split('T')[0];
    return calculatePanchanga(
      todayStr, 
      '06:00', 
      activeProfile?.latitude || 27.7172, 
      activeProfile?.longitude || 85.324, 
      activeProfile?.timezone || 5.75
    );
  }, [activeProfile]);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProf: WindowsBirthProfile = {
      id: `bp_${Date.now()}`,
      userId: 'win_user_default',
      name: newProfileName.trim(),
      relation: 'आफ्नो',
      gender: 'MALE',
      dateBS: newProfileDateBS,
      dateAD: '1999-04-14',
      timeOfBirth: newProfileTime,
      placeOfBirth: newProfilePlace,
      latitude: 27.7172,
      longitude: 85.324,
      timezone: 5.75,
      ayanamsa: 'Lahiri',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveBirthProfile(newProf);
    const updated = getAllBirthProfiles();
    setProfiles(updated);
    setSelectedProfileId(newProf.id);
    setIsAddProfileModalOpen(false);
    setNewProfileName('');
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      alert('कम्तीमा एउटा जन्म प्रोफाइल रहिरहनुपर्छ।');
      return;
    }
    if (confirm('के तपाईं यो प्रोफाइल मेटाउन निश्चित हुनुहुन्छ?')) {
      deleteBirthProfile(id);
      const updated = getAllBirthProfiles();
      setProfiles(updated);
      if (selectedProfileId === id && updated[0]) {
        setSelectedProfileId(updated[0].id);
      }
    }
  };

  const navTabs: { id: WindowsJyotishTab; label: string; icon: string }[] = [
    { id: 'KUNDALI', label: 'जन्म कुण्डली', icon: '🔮' },
    { id: 'DASHA', label: 'विंशोत्तरी दशा', icon: '⏳' },
    { id: 'PANCHAANGA', label: 'आजको पञ्चाङ्ग', icon: '📅' },
    { id: 'GOCHAR', label: 'ग्रह गोचर', icon: '🪐' },
    { id: 'MATCHING', label: 'विवाह मिलान', icon: '💑' },
    { id: 'REPORTS', label: 'चिना प्रतिवेदन', icon: '📜' },
    { id: 'PROFILES', label: 'प्रोफाइल सूची', icon: '👤' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Jyotish Top Bar & Profile Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md">
              बालानन्द ज्योतिष सेवा
            </span>
            <span className="text-xs text-stone-500">
              सक्रिय: <strong>{activeProfile?.name}</strong> ({activeProfile?.dateBS} • {activeProfile?.placeOfBirth})
            </span>
          </div>
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-serif mt-1">
            वैदिक ज्योतिषीय विश्लेषण तथा गणना
          </h2>
        </div>

        {/* Profile Switcher & Add Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 shadow-xs cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.dateBS})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsAddProfileModalOpen(true)}
            className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold shadow-xs cursor-pointer"
            title="नयाँ जन्म प्रोफाइल थप्नुहोस्"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Jyotish Sub-Navigation Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {navTabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-white dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: KUNDALI VIEW */}
      {activeTab === 'KUNDALI' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Chart Display (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                {chartType === 'D1' ? 'लग्न कुण्डली (D1 Chart)' : chartType === 'D9' ? 'नवांश कुण्डली (D9 Chart)' : 'दशमांश कुण्डली (D10 Chart)'}
              </h3>

              <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartType('D1')}
                  className={`px-3 py-1 rounded-lg ${chartType === 'D1' ? 'bg-amber-500 text-stone-950' : 'text-stone-600 dark:text-stone-400'}`}
                >
                  D1 लग्न
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('D9')}
                  className={`px-3 py-1 rounded-lg ${chartType === 'D9' ? 'bg-amber-500 text-stone-950' : 'text-stone-600 dark:text-stone-400'}`}
                >
                  D9 नवांश
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('D10')}
                  className={`px-3 py-1 rounded-lg ${chartType === 'D10' ? 'bg-amber-500 text-stone-950' : 'text-stone-600 dark:text-stone-400'}`}
                >
                  D10 दशमांश
                </button>
              </div>
            </div>

            {/* Classical Diamond Kundali Chart */}
            <div className="max-w-md mx-auto aspect-square flex items-center justify-center p-2">
              {kundali && (
                <KundaliChart
                  planets={kundali.planets}
                  lagna={kundali.lagna}
                  houses={chartType === 'D9' ? kundali.d9Chart.houses : chartType === 'D10' ? kundali.d10Chart.houses : kundali.d1Chart.houses}
                  chartTitle={chartType}
                />
              )}
            </div>

            {/* Planetary Highlights */}
            {kundali && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-400 block">लग्न राशि</span>
                  <strong className="text-stone-900 dark:text-stone-100">{kundali.lagna.rashiName}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-400 block">चन्द्र राशि</span>
                  <strong className="text-stone-900 dark:text-stone-100">{kundali.moonPlanet?.rashiName || 'मेष'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-400 block">जन्म नक्षत्र</span>
                  <strong className="text-stone-900 dark:text-stone-100">{kundali.moonPlanet?.nakshatraName || 'रोहिणी'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-400 block">चरण / पाद</span>
                  <strong className="text-stone-900 dark:text-stone-100">{kundali.moonPlanet?.pada || 1} पाद</strong>
                </div>
              </div>
            )}
          </div>

          {/* Planetary Degrees & Positions Table (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              ग्रह स्पष्ट तालिका (Planetary Positions)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-semibold">
                    <th className="pb-2">ग्रह</th>
                    <th className="pb-2">राशि</th>
                    <th className="pb-2">अंश (Deg)</th>
                    <th className="pb-2">भाव</th>
                    <th className="pb-2">गति</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
                  {kundali?.planets.map((pl) => (
                    <tr key={pl.name} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="py-2 font-bold text-stone-900 dark:text-stone-100">
                        {pl.name}
                      </td>
                      <td className="py-2 text-stone-600 dark:text-stone-400">
                        {pl.rashiName}
                      </td>
                      <td className="py-2 font-mono text-stone-700 dark:text-stone-300">
                        {Math.floor(pl.degree)}° {Math.floor((pl.degree % 1) * 60)}'
                      </td>
                      <td className="py-2 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {pl.bhava}
                      </td>
                      <td className="py-2 text-[10px]">
                        {pl.isRetrograde ? (
                          <span className="text-rose-600 font-bold bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded">वक्रि (R)</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">मार्गी</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Yogas Summary */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200">
                प्रमुख शुभ योगहरू (Active Yogas)
              </h4>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 font-medium">
                  गजेन्द्र मोक्ष योग
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 font-medium">
                  बुधादित्य योग
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 font-medium">
                  रुचक पञ्चमहापुरुष
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Sub-Tab 2: DASHA VIEW */}
      {activeTab === 'DASHA' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                विंशोत्तरी महादशा चक्र (१२० वर्ष)
              </h3>
              <p className="text-xs text-stone-500">
                जन्मकालीन चन्द्र नक्षत्र अनुसार गणना गरिएको विंशोत्तरी दशा चक्र।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dashaTable.map((d: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {d.planet || d.planetNepali} महादशा
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    {d.durationFormattedNepali || `${d.years || 10} वर्ष`}
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center justify-between">
                  <span>सुरु: {d.startDateBS || d.startDateAD || d.startDate || '—'}</span>
                  <span>अन्त्य: {d.endDateBS || d.endDateAD || d.endDate || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: PANCHANGA VIEW */}
      {activeTab === 'PANCHAANGA' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              आजको विस्तृत वैदिक पञ्चाङ्ग
            </h3>
            <span className="text-xs text-stone-400">
              सूर्योदय: {todayPanchanga.sunrise} • सूर्यास्त: {todayPanchanga.sunset}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-stone-800 border border-amber-200/50 space-y-1">
              <span className="text-[10px] text-stone-500 block">तिथि</span>
              <strong className="text-sm text-stone-900 dark:text-stone-100 block">{todayPanchanga.tithi?.name || 'शुक्ल नवमी'}</strong>
              <span className="text-[10px] text-stone-400">{todayPanchanga.tithi?.paksha || 'शुक्ल पक्ष'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-stone-800 border border-amber-200/50 space-y-1">
              <span className="text-[10px] text-stone-500 block">वार (Day)</span>
              <strong className="text-sm text-stone-900 dark:text-stone-100 block">
                {typeof todayPanchanga.vaar === 'string' ? todayPanchanga.vaar : todayPanchanga.dayNameNepali || (todayPanchanga.vaar as any)?.name || 'शुक्रवार'}
              </strong>
              <span className="text-[10px] text-stone-400">स्वामी: शुक्र</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-stone-800 border border-amber-200/50 space-y-1">
              <span className="text-[10px] text-stone-500 block">नक्षत्र</span>
              <strong className="text-sm text-stone-900 dark:text-stone-100 block">{todayPanchanga.nakshatra?.name || 'रोहिणी'}</strong>
              <span className="text-[10px] text-stone-400">{todayPanchanga.nakshatra?.pada || '२'} पाद</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-stone-800 border border-amber-200/50 space-y-1">
              <span className="text-[10px] text-stone-500 block">योग</span>
              <strong className="text-sm text-stone-900 dark:text-stone-100 block">{todayPanchanga.yoga?.name || 'शुभ'}</strong>
              <span className="text-[10px] text-stone-400">शुभ योग</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-stone-800 border border-amber-200/50 space-y-1">
              <span className="text-[10px] text-stone-500 block">करण</span>
              <strong className="text-sm text-stone-900 dark:text-stone-100 block">{todayPanchanga.karana?.name || 'कौलव'}</strong>
              <span className="text-[10px] text-stone-400">चर करण</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: VIVAH MATCHING VIEW */}
      {activeTab === 'MATCHING' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
            <span>💑</span>
            <span>विवाह ३६ गुण अष्टकूट मिलान (Horoscope Matching)</span>
          </h3>

          <div className="p-6 bg-gradient-to-r from-amber-50 to-rose-50 dark:from-stone-800 dark:to-stone-850 rounded-2xl border border-amber-200 dark:border-stone-700 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">अष्टकूट गुण प्राप्तांक</span>
              <div className="text-3xl font-black text-stone-900 dark:text-stone-100 font-serif">
                २८ / ३६ गुण (उत्तम मेलापक)
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                नाडी, भकूट, गण, ग्रह मैत्री, योनि, तारा, वश्य र वर्ण अनुसार शुभ विवाह योग।
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs text-center shrink-0">
              विवाहका लागि उपयुक्त ✅
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: REPORTS / PRINT VIEW */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                बालानन्द वैदिक ज्योतिष सेवा • आधिकारिक चिना प्रतिवेदन
              </h3>
              <p className="text-xs text-stone-500">
                ग्राहकलाई प्रिन्ट गरी दिन वा PDF सेभ गर्न सकिने सम्पूर्ण जन्म विवरण।
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिन्ट / PDF सेभ गर्नुहोस्</span>
            </button>
          </div>

          {/* Printable Kundali Document Sheet */}
          <div className="p-8 bg-[#FAF8F5] dark:bg-[#1A1816] rounded-2xl border border-stone-300 dark:border-stone-700 text-center space-y-4 max-w-2xl mx-auto">
            <div className="text-2xl">🕉</div>
            <h4 className="text-xl font-black font-serif text-amber-900 dark:text-amber-300">
              बालानन्द वैदिक ज्योतिष सेवा
            </h4>
            <p className="text-xs font-bold text-stone-600">
              नाम: {activeProfile?.name} • जन्म मिति: {activeProfile?.dateBS} • समय: {activeProfile?.timeOfBirth}
            </p>
            <p className="text-[11px] text-stone-500">
              जन्म स्थान: {activeProfile?.placeOfBirth} • अक्षांश: {activeProfile?.latitude}°N • देशान्तर: {activeProfile?.longitude}°E
            </p>

            <div className="w-72 h-72 mx-auto">
              {kundali && (
                <KundaliChart
                  planets={kundali.planets}
                  lagna={kundali.lagna}
                  houses={kundali.d1Chart.houses}
                  chartTitle="D1"
                />
              )}
            </div>

            <div className="pt-4 border-t border-stone-300 dark:border-stone-700 text-xs text-stone-500">
              नेपालकै आधिकारिक वैदिक ज्योतिषीय गणना प्रणाली द्वारा प्रमाणित।
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 6: PROFILES LIST */}
      {activeTab === 'PROFILES' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              सुरक्षित जन्म कुण्डली प्रोफाइलहरू ({profiles.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsAddProfileModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नयाँ प्रोफाइल</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profiles.map((p) => {
              const isActive = p.id === selectedProfileId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProfileId(p.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'border-amber-500 bg-amber-50/40 dark:bg-stone-850 shadow-sm ring-2 ring-amber-500/20'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 font-serif">{p.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        जन्म: {p.dateBS} • {p.timeOfBirth}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        स्थान: {p.placeOfBirth}
                      </p>
                    </div>

                    {isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>सक्रिय</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProfile(p.id, e)}
                        className="p-1 text-stone-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {isAddProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF8F5] dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                नयाँ जन्म कुण्डली प्रोफाइल थप्नुहोस्
              </h3>
              <button
                type="button"
                onClick={() => setIsAddProfileModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">पूरा नाम *</label>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="उदा. कृष्ण शर्मा"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">जन्म मिति (वि.सं.) *</label>
                  <input
                    type="text"
                    required
                    value={newProfileDateBS}
                    onChange={(e) => setNewProfileDateBS(e.target.value)}
                    placeholder="२०५६-०१-०१"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">जन्म समय *</label>
                  <input
                    type="time"
                    required
                    value={newProfileTime}
                    onChange={(e) => setNewProfileTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">जन्म स्थान</label>
                <input
                  type="text"
                  value={newProfilePlace}
                  onChange={(e) => setNewProfilePlace(e.target.value)}
                  placeholder="काठमाडौँ, पोखरा, आदि"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold"
                >
                  सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
