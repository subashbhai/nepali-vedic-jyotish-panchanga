import React, { useState, useMemo, useRef } from 'react';
import {
  Download,
  Music,
  Image as ImageIcon,
  Play,
  Pause,
  Sparkles,
  Search,
  CheckCircle2,
  Share2,
  FileText,
  Volume2,
  VolumeX,
  ExternalLink,
  Eye,
  X,
  Layers
} from 'lucide-react';
import { handlePhoneticInputKeyDown, handlePhoneticBlur } from '../../utils/nepaliTransliteration';

export type MediaCategory = 'all' | 'mantra' | 'stotra' | 'wallpaper' | 'infographic';

export interface VedicMediaItem {
  id: string;
  titleNepali: string;
  titleSanskrit?: string;
  category: MediaCategory;
  categoryLabel: string;
  type: 'audio' | 'image';
  descriptionNepali: string;
  fileSizeText: string;
  durationOrDim: string;
  downloadUrl: string;
  fileName: string;
  thumbnailUrl?: string;
  badge?: string;
}

export const VEDIC_MEDIA_ITEMS: VedicMediaItem[] = [
  // 1. Audio: Rudrashtadhyayi
  {
    id: 'rudra_ashtadhyayi',
    titleNepali: 'श्री रुद्राष्टाध्यायी (शुक्ल यजुर्वेद रुद्री पाठ)',
    titleSanskrit: 'श्री रुद्राष्टाध्यायी',
    category: 'mantra',
    categoryLabel: 'वैदिक मन्त्र',
    type: 'audio',
    descriptionNepali: 'शुक्ल यजुर्वेद माध्यमिक शाखाको वैदिक स्वर सहितको प्रामाणिक रुद्री पाठ। भगवान् शिवको अभिषेक तथा नित्य साधनाका लागि उत्तम।',
    fileSizeText: '18.4 MB',
    durationOrDim: '३२:१५ मिनेट',
    downloadUrl: '/assets/audio/rudra_ashtadhyayi.mp3',
    fileName: 'rudra-ashtadhyayi-vedic-path.mp3',
    badge: 'रुद्री पाठ',
  },
  // 2. Audio: Maha Mrityunjaya
  {
    id: 'maha_mrityunjaya_108',
    titleNepali: 'महामृत्युञ्जय मन्त्र (१०८ जप एवं शान्ति पाठ)',
    titleSanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्',
    category: 'mantra',
    categoryLabel: 'वैदिक मन्त्र',
    type: 'audio',
    descriptionNepali: 'अकाल मृत्यु निवारण, आरोग्य लाभ तथा ग्रह शान्तिका लागि १०८ पटक शुद्ध वैदिक उच्चारण सहितको महामृत्युञ्जय मन्त्र।',
    fileSizeText: '14.2 MB',
    durationOrDim: '२४:३० मिनेट',
    downloadUrl: '/assets/audio/maha_mrityunjaya_108.mp3',
    fileName: 'maha-mrityunjaya-mantra-108.mp3',
    badge: 'आरोग्य मन्त्र',
  },
  // 3. Audio: Gayatri Mantra
  {
    id: 'gayatri_mantra_shanti',
    titleNepali: 'गायत्री मन्त्र एवं विश्वशान्ति पाठ',
    titleSanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यम्',
    category: 'mantra',
    categoryLabel: 'वैदिक मन्त्र',
    type: 'audio',
    descriptionNepali: 'ब्रह्मतेज, बुद्धि शुद्धि तथा दैनिक सन्ध्यावन्दनाका लागि सस्वर गायत्री मन्त्र तथा शान्ति मन्त्र पाठ।',
    fileSizeText: '11.5 MB',
    durationOrDim: '१९:४० मिनेट',
    downloadUrl: '/assets/audio/gayatri_mantra_shanti.mp3',
    fileName: 'gayatri-mantra-shanti-path.mp3',
    badge: 'सन्ध्यावन्दना',
  },
  // 4. Audio: Navagraha Stotra
  {
    id: 'navagraha_stotra_beej',
    titleNepali: 'नवग्रह स्तोत्र एवं नवग्रह बीजमन्त्र पाठ',
    titleSanskrit: 'जपाकुसुम संकाशं काश्यपेयं महाद्युतिम्',
    category: 'stotra',
    categoryLabel: 'स्तोत्र पाठ',
    type: 'audio',
    descriptionNepali: 'सूर्यदेखि केतुसम्मका नौवटै ग्रहहरूको दोष निवारण तथा ग्रह शान्तिका लागि व्यास विरचित नवग्रह स्तोत्र एवं बीजमन्त्र।',
    fileSizeText: '9.8 MB',
    durationOrDim: '१६:२० मिनेट',
    downloadUrl: '/assets/audio/navagraha_stotra.mp3',
    fileName: 'navagraha-stotra-beej-mantra.mp3',
    badge: 'ग्रह शान्ति',
  },
  // 5. Audio: Chandi Path
  {
    id: 'durga_saptashati_chandi',
    titleNepali: 'श्री दुर्गा सप्तशती (चण्डी पाठ) - प्रधान मन्त्र',
    titleSanskrit: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे',
    category: 'stotra',
    categoryLabel: 'स्तोत्र पाठ',
    type: 'audio',
    descriptionNepali: 'नवदुर्गा भवानीको कृपा, शत्रु बाधा निवारण तथा कार्य सिद्धिका लागि दुर्गा सप्तशतीका सिद्ध मन्त्र एवं स्तुति।',
    fileSizeText: '21.0 MB',
    durationOrDim: '३८:१० मिनेट',
    downloadUrl: '/assets/audio/durga_saptashati.mp3',
    fileName: 'durga-saptashati-chandi-path.mp3',
    badge: 'देवी उपासना',
  },
  // 6. Audio: Vishnu Sahasranama
  {
    id: 'vishnu_sahasranama',
    titleNepali: 'श्री विष्णु सहस्रनाम स्तोत्रम् (सम्पूर्ण)',
    titleSanskrit: 'शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्',
    category: 'stotra',
    categoryLabel: 'स्तोत्र पाठ',
    type: 'audio',
    descriptionNepali: 'महाभारत अनुशासन पर्व अन्तर्गत भीष्म पितामहद्वारा उपदिष्ट भगवान् विष्णुका १००० पावन नामहरूको अमृतमय पाठ।',
    fileSizeText: '17.6 MB',
    durationOrDim: '३०:४५ मिनेट',
    downloadUrl: '/assets/audio/vishnu_sahasranama.mp3',
    fileName: 'vishnu-sahasranama-stotram.mp3',
    badge: 'विष्णु स्तोत्र',
  },
  // 7. Image: Surya Bhagavan HD
  {
    id: 'surya_bhagavan_hd',
    titleNepali: 'भगवान् श्री सूर्य नारायण देव (Ultra HD Wallpaper)',
    category: 'wallpaper',
    categoryLabel: 'धार्मिक वालपेपर',
    type: 'image',
    descriptionNepali: 'सात घोडाको रथमा आरूढ भगवान् सूर्य नारायणको उच्च रिजोलुसन (4K UHD) कम्प्युटर तथा मोबाइल वालपेपर।',
    fileSizeText: '4.8 MB',
    durationOrDim: '३८४० x २१६० px',
    downloadUrl: '/assets/images/gods/surya.png',
    fileName: 'surya-bhagavan-4k-wallpaper.png',
    thumbnailUrl: '/assets/images/gods/surya.png',
    badge: '4K Wallpaper',
  },
  // 8. Image: Vastu Purusha Mandala
  {
    id: 'vastu_purusha_mandala_chart',
    titleNepali: 'वैदिक वास्तु पुरुष मण्डल (Printable 45 Devata Chart)',
    category: 'infographic',
    categoryLabel: 'इन्फोग्राफिक',
    type: 'image',
    descriptionNepali: '४५ देवता सहितको शुद्ध वैदिक वास्तु पुरुष मण्डल चक्र। घर निर्माण तथा वास्तु परामर्शका लागि A3/A4 प्रिन्ट गर्न मिल्ने हाई-रेजोलुसन चार्ट।',
    fileSizeText: '6.2 MB',
    durationOrDim: '४०९६ x ४०९६ px',
    downloadUrl: '/assets/images/vastu_mandala.png',
    fileName: 'vastu-purusha-mandala-45-devata.png',
    thumbnailUrl: '/assets/images/vastu_mandala.png',
    badge: 'Printable Chart',
  },
  // 9. Image: Navagraha Chakra
  {
    id: 'navagraha_chakra_hd',
    titleNepali: 'नवग्रह मण्डल चक्र एवं दिशा चार्ट (High-Res Poster)',
    category: 'infographic',
    categoryLabel: 'इन्फोग्राफिक',
    type: 'image',
    descriptionNepali: 'नवग्रहका स्वामी, दिशा, वर्ण तथा रत्न विवरण सहितको आकर्षक पञ्चाङ्ग चार्ट पोस्टर।',
    fileSizeText: '5.1 MB',
    durationOrDim: '३५०८ x २४८० px',
    downloadUrl: '/assets/images/navagraha_chakra.png',
    fileName: 'navagraha-mandala-chakra-poster.png',
    thumbnailUrl: '/assets/images/navagraha_chakra.png',
    badge: 'A3 Poster',
  },
  // 10. Image: Shree Yantra
  {
    id: 'shree_yantra_sacred',
    titleNepali: 'अलौकिक श्री यन्त्र (महामेरु मण्डल Sacred Graphic)',
    category: 'wallpaper',
    categoryLabel: 'धार्मिक वालपेपर',
    type: 'image',
    descriptionNepali: 'लक्ष्मी प्राप्ति, समृद्धि एवं वास्तु शुद्धि गराउने प्राचीन ज्यामितीय श्री यन्त्रको डिजिटल स्वरूप।',
    fileSizeText: '5.6 MB',
    durationOrDim: '३००० x ३००० px',
    downloadUrl: '/assets/images/shree_yantra.png',
    fileName: 'shree-yantra-sacred-poster.png',
    thumbnailUrl: '/assets/images/shree_yantra.png',
    badge: 'श्री यन्त्र',
  },
];

const CATEGORY_TABS: { key: MediaCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'सम्पूर्ण मिडिया', icon: '✨' },
  { key: 'mantra', label: 'वैदिक मन्त्र अडियो', icon: '🕉️' },
  { key: 'stotra', label: 'स्तोत्र पाठ', icon: '📜' },
  { key: 'wallpaper', label: 'धार्मिक HD वालपेपर', icon: '🖼️' },
  { key: 'infographic', label: 'चार्ट तथा इन्फोग्राफिक्स', icon: '📊' },
];

export const MediaDownloadView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<VedicMediaItem | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Simulated audio playback state
  const handleTogglePlay = (id: string) => {
    if (activePlayingId === id) {
      setActivePlayingId(null);
    } else {
      setActivePlayingId(id);
    }
  };

  const handleDownload = (item: VedicMediaItem) => {
    setDownloadSuccessMsg(`"${item.titleNepali}" डाउनलोड सुरु भयो...`);
    
    // Direct browser anchor trigger
    const a = document.createElement('a');
    a.href = item.downloadUrl;
    a.setAttribute('download', item.fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloadSuccessMsg(null);
    }, 4000);
  };

  const filteredItems = useMemo(() => {
    return VEDIC_MEDIA_ITEMS.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        item.titleNepali.toLowerCase().includes(q) ||
        (item.titleSanskrit && item.titleSanskrit.toLowerCase().includes(q)) ||
        item.descriptionNepali.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-16 max-w-7xl mx-auto px-3 sm:px-4">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1C2D42] via-[#2B3F5C] to-[#121E2E] text-white p-6 sm:p-10 shadow-2xl border-2 border-cyan-400/50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-sm">
            <Music className="w-4 h-4" />
            <span>वैदिक मिडिया डाउनलोड केन्द्र (Vedic Media Downloads)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight leading-tight text-white">
            मन्त्र स्तोत्र अडियो, एचडी वालपेपर तथा चार्टहरू
          </h1>

          <p className="text-xs sm:text-base text-cyan-100/90 leading-relaxed font-sans">
            शुद्ध वैदिक स्वर सहितका <span className="font-bold text-cyan-300">मन्त्र पाठ, रुद्राष्टाध्यायी, स्तोत्र अडियो</span>, देव-देवीका हाई-रेजोलुसन वालपेपर तथा वास्तु/पञ्चाङ्ग इन्फोग्राफिक्सहरू सिधै १-क्लिकमा डाउनलोड गर्नुहोस्।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-300" />
              <span>हाई-क्वालिटी MP3 अडियो</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 font-bold flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-300" />
              <span>4K UHD वालपेपर एवं चार्ट</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>१००% निःशुल्क डाउनलोड</span>
            </span>
          </div>
        </div>
      </div>

      {/* Download Alert Notice */}
      {downloadSuccessMsg && (
        <div className="p-4 rounded-2xl bg-cyan-100 dark:bg-cyan-950/70 border-2 border-cyan-400 text-cyan-900 dark:text-cyan-200 text-sm font-bold flex items-center gap-3 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

      {/* 2. Search and Category Filter Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handlePhoneticInputKeyDown}
              onBlur={handlePhoneticBlur}
              placeholder="मन्त्र, स्तोत्र, फोटो वा चार्टको नाम खोज्नुहोस् (उदा: रुद्री, गायत्री, सूर्य)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {CATEGORY_TABS.map(tab => {
            const isSelected = selectedCategory === tab.key;
            const count = tab.key === 'all'
              ? VEDIC_MEDIA_ITEMS.length
              : VEDIC_MEDIA_ITEMS.filter(i => i.category === tab.key).length;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-700 shadow-md scale-102'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-cyan-800 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Media Items Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
          <span>कुल {filteredItems.length} वटा मिडिया फाइलहरू उपलब्ध</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 text-stone-500 text-sm">
            कुनै मिडिया फाइल भेटिएन। कृपया अर्को शब्द खोजी गर्नुहोस्।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map(item => {
              const isAudio = item.type === 'audio';
              const isPlaying = activePlayingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Type Badge and Size */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold flex items-center gap-1 ${
                        isAudio
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60'
                          : 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300/60'
                      }`}>
                        {isAudio ? <Music className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        <span>{item.categoryLabel}</span>
                      </span>

                      <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                        {item.fileSizeText}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                        {item.titleNepali}
                      </h3>
                      {item.titleSanskrit && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-serif italic mt-0.5">
                          {item.titleSanskrit}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans line-clamp-3">
                      {item.descriptionNepali}
                    </p>

                    {/* Duration / Dimensions Pill */}
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 pt-1">
                      <span className="font-semibold">{isAudio ? 'समय अवधि:' : 'साइज:'}</span>
                      <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{item.durationOrDim}</span>
                    </div>

                    {/* Audio Player Preview Bar */}
                    {isAudio && isPlaying && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs animate-pulse">
                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                          <Volume2 className="w-4 h-4 animate-spin" />
                          <span>अडियो पूर्वावलोकन बज्दैछ...</span>
                        </span>
                        <span className="font-mono text-[11px] text-amber-600 font-bold">
                          {item.durationOrDim}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-5 flex items-center gap-2 border-t border-stone-100 dark:border-stone-800 mt-4">
                    {isAudio ? (
                      <button
                        type="button"
                        onClick={() => handleTogglePlay(item.id)}
                        className={`flex-1 py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                          isPlaying
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isPlaying ? 'रोक्नुहोस्' : 'सुन्नुहोस्'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(item)}
                        className="flex-1 py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>हेर्नुहोस्</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                      title="सिधै डाउनलोड गर्नुहोस्"
                    >
                      <Download className="w-4 h-4" />
                      <span>डाउनलोड</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden max-w-2xl w-full border-2 border-cyan-400 shadow-2xl space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-serif text-stone-900 dark:text-stone-100 text-lg">
                {previewImage.titleNepali}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 flex items-center justify-center min-h-[300px] max-h-[500px]">
              {previewImage.thumbnailUrl ? (
                <img
                  src={previewImage.thumbnailUrl}
                  alt={previewImage.titleNepali}
                  className="max-h-[480px] w-auto object-contain"
                  onError={(e) => {
                    // Fallback to placeholder if local file is missing
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center p-8 text-stone-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">उच्च रिजोलुसन ग्राफिक फाइल</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-stone-500 font-mono">
                {previewImage.durationOrDim} • {previewImage.fileSizeText}
              </span>
              <button
                type="button"
                onClick={() => {
                  handleDownload(previewImage);
                  setPreviewImage(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>पूर्ण रिजोलुसन डाउनलोड गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
