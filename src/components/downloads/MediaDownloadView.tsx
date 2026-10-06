import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Layers,
  Maximize2,
  Disc3,
  Radio,
  Check
} from 'lucide-react';
import {
  VEDIC_MEDIA_ITEMS,
  VedicMediaItem,
  MediaCategory
} from '../../data/media/vedicMediaCatalog';
import { handlePhoneticInputKeyDown, handlePhoneticBlur } from '../../utils/nepaliTransliteration';

const CATEGORY_TABS: { key: MediaCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'सम्पूर्ण मिडिया', icon: '✨' },
  { key: 'mantra', label: 'वैदिक मन्त्र (१८)', icon: '🕉️' },
  { key: 'stotra', label: 'स्तोत्र पाठ (२७)', icon: '📜' },
  { key: 'wallpaper', label: 'धार्मिक 4K वालपेपर (३४)', icon: '🖼️' },
  { key: 'infographic', label: 'चार्ट तथा मण्डल (१७)', icon: '📊' },
];

export const MediaDownloadView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePlayingItem, setActivePlayingItem] = useState<VedicMediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<VedicMediaItem | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize audio element playback
  useEffect(() => {
    if (!audioRef.current) return;
    if (activePlayingItem) {
      if (audioRef.current.src !== activePlayingItem.downloadUrl) {
        audioRef.current.src = activePlayingItem.downloadUrl;
        audioRef.current.load();
      }
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [activePlayingItem, isPlaying]);

  const handleTogglePlay = (item: VedicMediaItem) => {
    if (activePlayingItem?.id === item.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActivePlayingItem(item);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec === 0) return '००:००';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '०' + m : m}:${s < 10 ? '०' + s : s}`;
  };

  // Safe guaranteed 1-click Download Trigger
  const handleDownload = (item: VedicMediaItem) => {
    setDownloadNotice(`"${item.titleNepali}" डाउनलोड सुरु भयो...`);

    try {
      const a = document.createElement('a');
      a.href = item.downloadUrl;
      a.setAttribute('download', item.fileName);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(item.downloadUrl, '_blank');
    }

    setTimeout(() => {
      setDownloadNotice(null);
    }, 4500);
  };

  const handleShare = (item: VedicMediaItem) => {
    if (navigator.clipboard) {
      const fullUrl = item.downloadUrl.startsWith('http')
        ? item.downloadUrl
        : `${window.location.origin}${item.downloadUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
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
    <div className="w-full space-y-8 animate-fadeIn pb-32 max-w-7xl mx-auto px-3 sm:px-4">
      {/* Hidden Global Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

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
            मन्त्र स्तोत्र अडियो, 4K देव वालपेपर तथा चार्टहरू
          </h1>

          <p className="text-xs sm:text-base text-cyan-100/90 leading-relaxed font-sans">
            शुद्ध वैदिक स्वर सहितका <span className="font-bold text-cyan-300">४५+ मन्त्र तथा स्तोत्र अडियो पाठ</span> (रुद्राष्टाध्यायी, चण्डी, महामृत्युञ्जय, सहस्रनाम) र विभिन्न देवी-देवताका <span className="text-amber-300 font-bold">५०+ उच्च-रिजोलुसन 4K वालपेपर एवं पूजा मण्डल चार्टहरू</span> १-क्लिकमा निःशुल्क डाउनलोड तथा प्ले गर्नुहोस्।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-300" />
              <span>४५+ मन्त्र एवं स्तोत्र MP3</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 font-bold flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-300" />
              <span>५०+ 4K UHD देव वालपेपर एवं चार्ट</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>१००% निःशुल्क प्रत्यक्ष डाउनलोड</span>
            </span>
          </div>
        </div>
      </div>

      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="p-4 rounded-2xl bg-cyan-100 dark:bg-cyan-950/70 border-2 border-cyan-400 text-cyan-900 dark:text-cyan-200 text-sm font-bold flex items-center gap-3 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>{downloadNotice}</span>
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
              placeholder="मन्त्र, स्तोत्र, शिव, दुर्गा, गणेश वा वालपेपर खोज्नुहोस् (उदा: रुद्री, राम, कृष्ण)..."
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

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
        <span>
          कुल <strong className="text-stone-800 dark:text-stone-200">{filteredItems.length}</strong> वटा मिडिया फाइलहरू उपलब्ध
        </span>
        {searchQuery && (
          <span>खोजिएको शब्द: "{searchQuery}"</span>
        )}
      </div>

      {/* 3. Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map(item => {
          const isAudio = item.type === 'audio';
          const isCurrentActive = activePlayingItem?.id === item.id;
          const isCurrentPlaying = isCurrentActive && isPlaying;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl group ${
                isCurrentActive
                  ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/50'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-cyan-300 dark:hover:border-stone-700'
              }`}
            >
              {/* Media Preview (Visual Thumbnail for images / Wave banner for Audio) */}
              <div className="relative">
                {item.thumbnailUrl ? (
                  <div
                    onClick={() => !isAudio && setPreviewImage(item)}
                    className="relative h-56 sm:h-64 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer group/thumb"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.titleNepali}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <span className="px-3 py-1.5 rounded-xl bg-white/90 text-stone-900 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <Eye className="w-3.5 h-3.5" />
                        <span>4K पूर्ण दृश्य हेर्नुहोस्</span>
                      </span>
                    </div>

                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                      {item.durationOrDim}
                    </span>
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-br from-cyan-900/40 to-blue-900/30 dark:from-stone-800 dark:to-cyan-950/30 p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Music className="w-28 h-28" />
                    </div>
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 bg-white/80 dark:bg-stone-800/80 px-2 py-0.5 rounded">
                        {item.fileSizeText}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCurrentPlaying ? 'bg-cyan-600 text-white animate-spin' : 'bg-white/80 dark:bg-stone-700 text-cyan-700'
                      }`}>
                        <Disc3 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-stone-600 dark:text-stone-300">
                        समय अवधि: {item.durationOrDim}
                      </span>
                    </div>
                  </div>
                )}

                {item.badge && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-amber-400 text-stone-950 text-[10px] font-bold shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-bold font-serif text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
                    {item.titleNepali}
                  </h3>

                  {item.titleSanskrit && (
                    <p className="text-[11px] font-serif text-amber-800 dark:text-amber-400 italic line-clamp-1">
                      {item.titleSanskrit}
                    </p>
                  )}

                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {item.descriptionNepali}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                  {isAudio ? (
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(item)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isCurrentPlaying
                          ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md'
                          : 'bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>रोक्नुहोस्</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>सुन्नुहोस्</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(item)}
                      className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>प्रिभ्यु</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    className="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
                    title={`${item.titleNepali} डाउनलोड गर्नुहोस्`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>डाउनलोड</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(item)}
                    className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 cursor-pointer"
                    title="लिङ्क कपी गर्नुहोस्"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Persistent Bottom Audio Player Bar (Plays when an audio track is active) */}
      {activePlayingItem && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-md text-white border-t-2 border-cyan-400 p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <div className={`w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400 text-stone-950 font-bold uppercase">
                    Live Audio
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {activePlayingItem.titleNepali}
                  </span>
                </div>
                <p className="text-[11px] text-cyan-200/80 truncate font-serif">
                  {activePlayingItem.titleSanskrit || activePlayingItem.categoryLabel}
                </p>
              </div>
            </div>

            {/* Playback Controls & Progress */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
              <span className="text-[11px] font-mono text-cyan-300">
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </span>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold flex items-center justify-center cursor-pointer shadow-md transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="p-2 rounded-xl text-stone-300 hover:text-white cursor-pointer"
                title={isMuted ? 'अनम्युट' : 'म्युट'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => handleDownload(activePlayingItem)}
                className="py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>डाउनलोड</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePlayingItem(null);
                  setIsPlaying(false);
                }}
                className="p-2 text-stone-400 hover:text-white cursor-pointer"
                title="प्लेयर बन्द गर्नुहोस्"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 4K Wallpaper Preview Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/80 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-stone-950/80 flex items-center justify-between border-b border-stone-800 text-white">
              <div className="min-w-0 pr-4">
                <h3 className="font-bold font-serif text-base text-amber-300 truncate">
                  {previewImage.titleNepali}
                </h3>
                <p className="text-xs text-stone-400 font-mono">
                  {previewImage.durationOrDim} • {previewImage.fileSizeText}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(previewImage)}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>4K डाउनलोड गर्नुहोस्</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Full Container */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black/60">
              <img
                src={previewImage.downloadUrl}
                alt={previewImage.titleNepali}
                className="max-h-[72vh] w-auto object-contain rounded-xl shadow-2xl border border-stone-800"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-stone-950 text-xs text-stone-400 flex items-center justify-between">
              <span>{previewImage.descriptionNepali}</span>
              <span className="font-bold text-emerald-400">१००% उच्च गुणस्तर (Ultra High Definition)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
