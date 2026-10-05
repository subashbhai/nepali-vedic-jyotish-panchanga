import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Share2,
  Printer,
  Volume2,
  VolumeX,
  Flame,
  Compass,
  MapPin,
  Calendar,
  Layers,
  HeartHandshake,
  BookOpen,
  Info
} from 'lucide-react';
import { PanchangaData, BirthDetails, PlanetPosition } from '../../types/astrology';
import {
  generateMahaSankalpa,
  SankalpaPujaType,
  PUJA_TYPE_DETAILS,
  COMMON_GOTRAS,
  getSacredLocationInfo
} from '../../utils/vedicSankalpaEngine';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { handlePhoneticInputKeyDown } from '../../utils/nepaliTransliteration';

interface MahaSankalpaModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchanga: PanchangaData;
  activeProfile?: BirthDetails | null;
  planets?: PlanetPosition[];
}

export const MahaSankalpaModal: React.FC<MahaSankalpaModalProps> = ({
  isOpen,
  onClose,
  panchanga,
  activeProfile,
  planets
}) => {
  const [pujaType, setPujaType] = useState<SankalpaPujaType>('daily');
  const [gotra, setGotra] = useState<string>(activeProfile?.gotra || activeProfile?.fatherDetails?.gotra || 'अमुक (आफ्नो गोत्र)');
  const [name, setName] = useState<string>(activeProfile?.name || 'अमुक नामाहम्');
  const [locationName, setLocationName] = useState<string>(activeProfile?.location?.name || 'काठमाडौँ');
  const [includeFamily, setIncludeFamily] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'sanskrit' | 'nepali' | 'steps'>('sanskrit');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Sync profile when opened
  useEffect(() => {
    if (activeProfile) {
      setName(activeProfile.name || 'अमुक नामाहम्');
      const profileGotra = activeProfile.gotra || activeProfile.fatherDetails?.gotra;
      if (profileGotra) setGotra(profileGotra);
      if (activeProfile.location?.name) setLocationName(activeProfile.location.name);
    }
  }, [activeProfile, isOpen]);

  // Stop audio when modal closes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const mahaSankalpa = useMemo(() => {
    return generateMahaSankalpa({
      panchanga,
      profile: activeProfile,
      planets,
      pujaType,
      customGotra: gotra,
      customName: name,
      customLocation: locationName,
      familyMembersIncluded: includeFamily
    });
  }, [panchanga, activeProfile, planets, pujaType, gotra, name, locationName, includeFamily]);

  if (!isOpen) return null;

  const handleCopy = (textToCopy: string, key: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleShare = async () => {
    const shareText = `🕉️ ${mahaSankalpa.title} 🕉️\n\n${mahaSankalpa.sanskritFullText}\n\n॥ नेपाली सरल भावार्थ ॥\n${mahaSankalpa.nepaliFullTranslation}\n\n— बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: mahaSankalpa.title,
          text: shareText
        });
      } catch (err) {}
    } else {
      handleCopy(shareText, 'share');
      alert('सङ्कल्प क्लिपबोर्डमा प्रतिलिपि गरियो। अब ह्वाट्सएप वा सामाजिक सञ्जालमा टाँस्न सक्नुहुन्छ।');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('तपाईंको ब्राउजरमा अडियो वाचन सुविधा उपलब्ध छैन।');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(mahaSankalpa.sanskritFullText);
      utterance.lang = 'hi-IN'; // Sanskrit/Hindi voice model
      utterance.rate = 0.85; // Devotional calm pace
      utterance.pitch = 1.0;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-[#FFFDF7] dark:bg-[#1A1612] border-2 border-amber-400/50 dark:border-stone-700 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative text-[#2D241E] dark:text-stone-100">
        
        {/* Sacred Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-amber-600 via-amber-700 to-[#7A1C1C] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/20 text-white rounded-xl flex items-center justify-center font-bold text-xl border border-amber-300/40 shadow-inner shrink-0">
              ॐ
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif leading-tight text-white flex items-center gap-2">
                <span>बृहत् वैदिक महासङ्कल्प</span>
                <span className="text-[10px] font-sans font-bold bg-white/20 text-amber-100 px-2 py-0.5 rounded-full border border-white/30">
                  शास्त्रोक्त विधि
                </span>
              </h2>
              <p className="text-[11px] text-amber-100 font-medium">
                दैनिक ग्रह गोचर, पञ्चाङ्ग, स्थान, पवित्र नदी एवं तीर्थपीठ सहितको स्वचालित महासङ्कल्प
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Recitation Button */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                isPlayingAudio
                  ? 'bg-amber-400 text-stone-900 border-amber-300 animate-pulse shadow-xs'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/30'
              }`}
              title="मन्त्र वाचन सुन्नुहोस् / बन्द गर्नुहोस्"
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPlayingAudio ? 'वाचन रोक्नुहोस्' : 'मन्त्र वाचन'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold transition-all cursor-pointer"
              title="प्रिन्ट / पीडीएफ"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer ml-1"
              title="बन्द गर्नुहोस्"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Customization Bar */}
        <div className="p-3 sm:p-4 bg-[#FBF8F2] dark:bg-[#231E18] border-b border-[#E6E0D5] dark:border-stone-800 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {/* 1. पूजा / अनुष्ठान प्रकार */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                पूजा / अनुष्ठान प्रकार:
              </label>
              <select
                value={pujaType}
                onChange={(e) => setPujaType(e.target.value as SankalpaPujaType)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              >
                {Object.entries(PUJA_TYPE_DETAILS).map(([key, details]) => (
                  <option key={key} value={key}>
                    {details.labelNepali}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. गोत्र */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                सङ्कल्प कर्ताको गोत्र:
              </label>
              <select
                value={gotra}
                onChange={(e) => setGotra(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              >
                {COMMON_GOTRAS.map((g) => (
                  <option key={g} value={g}>
                    {g.includes('(') || g.includes('गोत्र') ? g : `${g} गोत्र`}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. सङ्कल्प कर्ताको नाम */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                यजमानको पूरा नाम:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => handlePhoneticInputKeyDown(e, name, setName)}
                placeholder="यजमानको पूरा नाम"
                className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 4. स्थान (जिल्ला/शहर) */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
                पूजा स्थान (जिल्ला/शहर):
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                onKeyDown={(e) => handlePhoneticInputKeyDown(e, locationName, setLocationName)}
                placeholder="काठमाडौँ / पोखरा (Kathmandu...)"
                className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Quick Info Badges: River & Temple Auto-detected */}
          <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-3 text-stone-600 dark:text-stone-300">
              <span>🌊 <b>पवित्र नदी:</b> {mahaSankalpa.geoInfo.riverNepali}</span>
              <span>🛕 <b>देवपीठ:</b> {mahaSankalpa.geoInfo.deityNepali}</span>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-amber-800 dark:text-amber-300">
              <input
                type="checkbox"
                checked={includeFamily}
                onChange={(e) => setIncludeFamily(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span>सपरिवार (सपत्नीक सहित)</span>
            </label>
          </div>
        </div>

        {/* View Tabs: Sanskrit / Nepali Meaning / Ritual Steps */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-[#E6E0D5] dark:border-stone-800 bg-[#FFFDF7] dark:bg-[#1A1612]">
          <button
            type="button"
            onClick={() => setActiveTab('sanskrit')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sanskrit'
                ? 'border-[#7A1C1C] text-[#7A1C1C] dark:text-amber-300 dark:border-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            🕉️ संस्कृत मूल महासङ्कल्प
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nepali')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'nepali'
                ? 'border-[#7A1C1C] text-[#7A1C1C] dark:text-amber-300 dark:border-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            📖 सरल नेपाली भावार्थ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'steps'
                ? 'border-[#7A1C1C] text-[#7A1C1C] dark:text-amber-300 dark:border-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            🙏 सङ्कल्प लिने विधि (पूजा नियम)
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Sanskrit Text */}
          {activeTab === 'sanskrit' && (
            <div className="space-y-4">
              <div className="bg-[#FAF7EE] dark:bg-[#231D16] p-4 sm:p-6 rounded-2xl border border-amber-300/60 dark:border-stone-700 shadow-inner relative">
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(mahaSankalpa.sanskritFullText, 'sanskrit')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold hover:bg-stone-100 transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedKey === 'sanskrit' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sanskrit' ? 'प्रतिलिपि भयो' : 'प्रतिलिपि'}</span>
                  </button>
                </div>

                <div className="text-center mb-4">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                    ॥ श्रीहरिः ॐ ॥
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-200 mt-0.5">
                    {mahaSankalpa.title}
                  </h3>
                </div>

                <div className="font-serif text-sm sm:text-base md:text-lg leading-loose text-stone-900 dark:text-amber-50 whitespace-pre-line tracking-wide">
                  {mahaSankalpa.sanskritFullText}
                </div>
              </div>

              {/* Dynamic Graha Status Bar */}
              <div className="bg-white dark:bg-stone-800/80 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                <span className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  🪐 आजको तात्कालिक ग्रह स्थिति (सङ्कल्प आधार):
                </span>
                <div className="flex flex-wrap gap-2 text-stone-600 dark:text-stone-300">
                  {mahaSankalpa.planetsFormattedList.map((p, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700/60 rounded-md border border-stone-200 dark:border-stone-600 text-[11px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Nepali Meaning */}
          {activeTab === 'nepali' && (
            <div className="bg-[#FAF7EE] dark:bg-[#231D16] p-4 sm:p-6 rounded-2xl border border-amber-300/60 dark:border-stone-700 shadow-inner space-y-4">
              <h3 className="text-base font-bold font-serif text-[#7A1C1C] dark:text-amber-200 border-b border-amber-200 dark:border-stone-700 pb-2">
                महासङ्कल्पको सरल नेपाली अनुवाद तथा भावार्थ
              </h3>
              <div className="text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-line space-y-2">
                {mahaSankalpa.nepaliFullTranslation}
              </div>
            </div>
          )}

          {/* TAB 3: Ritual Steps */}
          {activeTab === 'steps' && (
            <div className="bg-[#FAF7EE] dark:bg-[#231D16] p-4 sm:p-6 rounded-2xl border border-amber-300/60 dark:border-stone-700 shadow-inner space-y-4">
              <h3 className="text-base font-bold font-serif text-[#7A1C1C] dark:text-amber-200 border-b border-amber-200 dark:border-stone-700 pb-2">
                सङ्कल्प गर्ने वैदिक विधि एवं सामग्री
              </h3>
              <div className="space-y-3">
                {mahaSankalpa.ritualStepsNepali.map((step, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#FDFCF8] dark:bg-[#211B14] border-t border-[#E6E0D5] dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            बालानन्द वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(mahaSankalpa.sanskritFullText, 'full')}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-300 dark:border-stone-700 shadow-2xs"
            >
              {copiedKey === 'full' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'full' ? 'प्रतिलिपि भयो' : 'सङ्कल्प प्रतिलिपि'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#7A1C1C] hover:bg-[#8B2323] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>सेयर गर्नुहोस्</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
