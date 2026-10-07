import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Film,
  Image as ImageIcon,
  Play,
  Pause,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Search,
  RotateCcw,
  Eye,
  X,
  ExternalLink,
  Layers,
  Save,
  Video,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  VedicMediaItem,
  MediaCategory,
  getAllVedicMediaItems,
  saveCustomMediaItem,
  saveMediaOverride,
  resetMediaOverride,
  deleteMediaItem,
  restoreMediaItem,
  getDeletedMediaIds,
  formatVideoEmbedUrl,
  getYouTubeThumbnailUrl,
  generateVedicDescription
} from '../../data/media/vedicMediaCatalog';
import { handlePhoneticInputKeyDown, handlePhoneticBlur } from '../../utils/nepaliTransliteration';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';

export const StoreMediaAdminTab: React.FC = () => {
  const [items, setItems] = useState<VedicMediaItem[]>(() => getAllVedicMediaItems());
  const [deletedIds, setDeletedIds] = useState<string[]>(() => getDeletedMediaIds());
  const [activeTab, setActiveTab] = useState<'upload_photo' | 'upload_video' | 'manage_videos' | 'manage_photos'>('upload_photo');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Video Player Test Modal
  const [testingVideo, setTestingVideo] = useState<VedicMediaItem | null>(null);

  // Photo Upload State
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoTitleSanskrit, setPhotoTitleSanskrit] = useState('');
  const [photoCategory, setPhotoCategory] = useState<'wallpaper' | 'infographic'>('wallpaper');
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoBadge, setPhotoBadge] = useState('4K Ultra HD');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState('');
  const [photoDimensions, setPhotoDimensions] = useState('3840 x 2160 (4K UHD)');
  const [photoFileSizeText, setPhotoFileSizeText] = useState('1.5 MB');
  const [applyWatermark, setApplyWatermark] = useState(true);

  // Video Add / Edit State
  const [videoLinkMode, setVideoLinkMode] = useState<'link' | 'file'>('link');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTitleSanskrit, setVideoTitleSanskrit] = useState('');
  const [videoSpeaker, setVideoSpeaker] = useState('पूज्य श्री प्रेमानन्द जी महाराज');
  const [videoDuration, setVideoDuration] = useState('२०:०० मिनेट');
  const [videoLanguage, setVideoLanguage] = useState<'नेपाली' | 'हिन्दी' | 'संस्कृत'>('हिन्दी');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoBadge, setVideoBadge] = useState('सत्सङ्ग वाणी');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');

  // Edit Video Modal State
  const [editingVideoItem, setEditingVideoItem] = useState<VedicMediaItem | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTitleSanskrit, setEditTitleSanskrit] = useState('');
  const [editSpeaker, setEditSpeaker] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editLanguage, setEditLanguage] = useState<'नेपाली' | 'हिन्दी' | 'संस्कृत'>('हिन्दी');
  const [editDescription, setEditDescription] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');

  const photoFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Refresh items list
  const refreshList = () => {
    setItems(getAllVedicMediaItems());
    setDeletedIds(getDeletedMediaIds());
  };

  useEffect(() => {
    const handleUpdate = () => refreshList();
    window.addEventListener('vedic-media-catalog-updated', handleUpdate);
    return () => window.removeEventListener('vedic-media-catalog-updated', handleUpdate);
  }, []);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  // Helper: Burn discreet watermark on canvas
  const stampWatermarkOnImage = (sourceDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!applyWatermark) {
        resolve(sourceDataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(sourceDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0);

        // Watermark style at bottom
        const fontSize = Math.max(18, Math.round(img.width * 0.022));
        ctx.font = `bold ${fontSize}px sans-serif`;
        const watermarkText = '🕉️ बालानन्द वैदिक ज्योतिष एवं पञ्चाङ्ग';
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;

        const padX = fontSize * 0.8;
        const padY = fontSize * 0.5;
        const rectW = textWidth + padX * 2;
        const rectH = fontSize * 1.8;
        const rectX = img.width - rectW - fontSize;
        const rectY = img.height - rectH - fontSize;

        // Semi-transparent dark background pill
        ctx.fillStyle = 'rgba(10, 10, 10, 0.72)';
        ctx.beginPath();
        ctx.roundRect(rectX, rectY, rectW, rectH, fontSize * 0.4);
        ctx.fill();

        // Subtle gold border
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = Math.max(1, fontSize * 0.06);
        ctx.stroke();

        // Gold-tinted text
        ctx.fillStyle = '#FDE68A';
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkText, rectX + padX, rectY + rectH / 2);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(sourceDataUrl);
      img.src = sourceDataUrl;
    });
  };

  // Handle Photo selection & auto description
  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFileName(file.name.replace(/\.[^/.]+$/, ''));
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setPhotoFileSizeText(`${sizeMB} MB`);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawData = event.target?.result as string;
      setPhotoDataUrl(rawData);

      // Auto detect title from filename if empty
      let detectedTitle = photoTitle;
      if (!detectedTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        detectedTitle = cleanName;
        setPhotoTitle(cleanName);
      }

      // Auto generate description
      const autoDesc = generateVedicDescription(detectedTitle, photoCategory);
      setPhotoDescription(autoDesc);
    };
    reader.readAsDataURL(file);
  };

  // Auto generate description on title change
  const handlePhotoTitleChange = (val: string) => {
    setPhotoTitle(val);
    const auto = generateVedicDescription(val, photoCategory);
    setPhotoDescription(auto);
  };

  // Save new Photo to Catalog
  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) {
      alert('कृपया फोटोको शीर्षक भर्नुहोस्।');
      return;
    }
    if (!photoDataUrl) {
      alert('कृपया फोटो फाइल चयन गर्नुहोस्।');
      return;
    }

    const finalImageUri = await stampWatermarkOnImage(photoDataUrl);
    const cleanFileName = (photoFileName || photoTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_');

    const newItem: VedicMediaItem = {
      id: `custom_photo_${Date.now()}`,
      titleNepali: photoTitle,
      titleSanskrit: photoTitleSanskrit || undefined,
      category: photoCategory,
      categoryLabel: photoCategory === 'infographic' ? 'चार्ट तथा मण्डल' : 'धार्मिक HD वालपेपर',
      type: 'image',
      descriptionNepali: photoDescription || generateVedicDescription(photoTitle, photoCategory),
      fileSizeText: photoFileSizeText,
      durationOrDim: photoDimensions,
      downloadUrl: finalImageUri,
      fileName: `balananda_baidik_${cleanFileName}.jpg`,
      thumbnailUrl: finalImageUri,
      badge: photoBadge
    };

    saveCustomMediaItem(newItem);
    refreshList();
    showNotice(`✓ "${photoTitle}" सफलतापूर्वक मिडिया डाउनलोड केन्द्रमा थपियो!`);

    // Reset Form
    setPhotoTitle('');
    setPhotoTitleSanskrit('');
    setPhotoDataUrl(null);
    setPhotoDescription('');
    if (photoFileInputRef.current) photoFileInputRef.current.value = '';
  };

  // Handle Video URL change and auto fetch thumbnail / embed URL
  const handleVideoUrlChange = (url: string) => {
    setVideoUrlInput(url);
    const autoThumb = getYouTubeThumbnailUrl(url);
    if (autoThumb && !videoThumbnailUrl) {
      setVideoThumbnailUrl(autoThumb);
    }
    if (videoTitle && !videoDescription) {
      setVideoDescription(generateVedicDescription(videoTitle, 'video', videoSpeaker));
    }
  };

  // Save new Video to Catalog
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      alert('कृपया भिडियोको शीर्षक भर्नुहोस्।');
      return;
    }
    if (!videoUrlInput.trim()) {
      alert('कृपया भिडियो लिङ्क भर्नुहोस्।');
      return;
    }

    const embedUrl = formatVideoEmbedUrl(videoUrlInput);
    const thumb = videoThumbnailUrl || getYouTubeThumbnailUrl(videoUrlInput) || '/assets/deities/radha_krishna.jpg';
    const cleanFileName = videoTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_');

    const newVideoItem: VedicMediaItem = {
      id: `custom_video_${Date.now()}`,
      titleNepali: videoTitle,
      titleSanskrit: videoTitleSanskrit || undefined,
      category: 'video',
      categoryLabel: 'धार्मिक भिडियो कथा',
      type: 'video',
      descriptionNepali: videoDescription || generateVedicDescription(videoTitle, 'video', videoSpeaker),
      fileSizeText: 'HD भिडियो',
      durationOrDim: videoDuration || '२५:०० मिनेट',
      downloadUrl: videoUrlInput,
      videoEmbedUrl: embedUrl,
      fileName: `balananda_video_${cleanFileName}.mp4`,
      thumbnailUrl: thumb,
      badge: videoBadge || 'भिडियो',
      videoSpeakerOrSource: videoSpeaker || undefined,
      language: videoLanguage
    };

    saveCustomMediaItem(newVideoItem);
    refreshList();
    showNotice(`✓ "${videoTitle}" भिडियो सफलतापूर्वक मिडिया केन्द्रमा थपियो!`);

    // Reset Form
    setVideoTitle('');
    setVideoTitleSanskrit('');
    setVideoUrlInput('');
    setVideoDescription('');
    setVideoThumbnailUrl('');
  };

  // Open Edit Video Modal
  const handleOpenEditVideo = (item: VedicMediaItem) => {
    setEditingVideoItem(item);
    setEditUrl(item.videoEmbedUrl || item.downloadUrl);
    setEditTitle(item.titleNepali);
    setEditTitleSanskrit(item.titleSanskrit || '');
    setEditSpeaker(item.videoSpeakerOrSource || '');
    setEditDuration(item.durationOrDim);
    setEditLanguage(item.language || 'हिन्दी');
    setEditDescription(item.descriptionNepali);
    setEditBadge(item.badge || '');
    setEditThumbnail(item.thumbnailUrl || '');
  };

  // Save Video Overrides
  const handleSaveVideoEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideoItem) return;

    const formattedEmbed = formatVideoEmbedUrl(editUrl);
    const thumb = editThumbnail || getYouTubeThumbnailUrl(editUrl) || editingVideoItem.thumbnailUrl;

    const updates: Partial<VedicMediaItem> = {
      titleNepali: editTitle,
      titleSanskrit: editTitleSanskrit || undefined,
      videoEmbedUrl: formattedEmbed,
      downloadUrl: editUrl,
      videoSpeakerOrSource: editSpeaker,
      durationOrDim: editDuration,
      language: editLanguage,
      descriptionNepali: editDescription,
      badge: editBadge,
      thumbnailUrl: thumb
    };

    saveMediaOverride(editingVideoItem.id, updates);
    refreshList();
    setEditingVideoItem(null);
    showNotice(`✓ "${editTitle}" भिडियो लिङ्क र विवरण सफलतापूर्वक अद्यावधिक गरियो!`);
  };

  // Delete / Hide Item
  const handleDeleteItem = (item: VedicMediaItem) => {
    if (window.confirm(`के तपाईं "${item.titleNepali}" लाई डाउनलोड सूचीबाट हटाउन चाहनुहुन्छ?`)) {
      deleteMediaItem(item.id);
      refreshList();
      showNotice(`✓ "${item.titleNepali}" हटाइयो।`);
    }
  };

  // Restore deleted item
  const handleRestoreItem = (id: string) => {
    restoreMediaItem(id);
    refreshList();
    showNotice(`✓ वस्तु पुनःस्थापना गरियो।`);
  };

  // Reset override back to original catalog
  const handleResetOverride = (id: string) => {
    resetMediaOverride(id);
    refreshList();
    showNotice(`✓ मूल विवरणमा रिसेट गरियो।`);
  };

  const videoItems = items.filter(i => i.type === 'video');
  const photoItems = items.filter(i => i.type === 'image');

  const filteredVideos = videoItems.filter(v => {
    const q = searchQuery.toLowerCase();
    return !q ||
      v.titleNepali.toLowerCase().includes(q) ||
      (v.videoSpeakerOrSource && v.videoSpeakerOrSource.toLowerCase().includes(q)) ||
      v.descriptionNepali.toLowerCase().includes(q);
  });

  const filteredPhotos = photoItems.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q ||
      p.titleNepali.toLowerCase().includes(q) ||
      p.descriptionNepali.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 text-stone-900 dark:text-stone-100 animate-fadeIn">
      {/* 1. Header & Stats */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase mb-2">
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>मिडिया डाउनलोड एवं भिडियो नियन्त्रण केन्द्र</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif">
            फोटो, वालपेपर तथा भिडियो व्यवस्थापन
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-2xl font-sans">
            नयाँ ४K फोटो तथा धार्मिक भिडियोहरू अपलोड गर्नुहोस्, पुराना भिडियोहरूको लिङ्क सम्पादन गर्नुहोस् र स्वचालित विवरण जेनेरेट गर्नुहोस्।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-black/25 backdrop-blur-xs px-3.5 py-1.5 rounded-xl text-center border border-white/20">
            <span className="text-[10px] text-amber-200 block">कुल मिडिया</span>
            <span className="text-lg font-black font-mono">{items.length}</span>
          </div>
          <div className="bg-black/25 backdrop-blur-xs px-3.5 py-1.5 rounded-xl text-center border border-white/20">
            <span className="text-[10px] text-amber-200 block">भिडियोहरू</span>
            <span className="text-lg font-black font-mono">{videoItems.length}</span>
          </div>
          <div className="bg-black/25 backdrop-blur-xs px-3.5 py-1.5 rounded-xl text-center border border-white/20">
            <span className="text-[10px] text-amber-200 block">फोटो/मण्डल</span>
            <span className="text-lg font-black font-mono">{photoItems.length}</span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 text-sm font-bold flex items-center gap-2 shadow-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setActiveTab('upload_photo')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'upload_photo'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>फोटो / मण्डल अपलोड</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload_video')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'upload_video'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>नयाँ भिडियो थप्नुहोस् (लिङ्क/अपलोड)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manage_videos')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'manage_videos'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>भिडियो लिङ्क सम्पादन ({videoItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manage_photos')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'manage_photos'
              ? 'bg-amber-700 text-white shadow-md'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>फोटो सूची व्यवस्थापन ({photoItems.length})</span>
        </button>
      </div>

      {/* 3. Tab: Upload Photo / Wallpaper with Auto Description & Watermark */}
      {activeTab === 'upload_photo' && (
        <form onSubmit={handleSavePhoto} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-600" />
                <span>डाउनलोडका लागि नयाँ ४K फोटो तथा मण्डल अपलोड</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                फोटो छान्नासाथ यसको धार्मिक विवरण स्वचालित रूपमा (Auto Description) तयार हुनेछ।
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
              ४K UHD गुणस्तर
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Upload Box & Preview */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                फोटो वा मण्डल फाइल चयन गर्नुहोस् *
              </label>

              <div
                onClick={() => photoFileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-2xl p-6 text-center hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]"
              >
                {photoDataUrl ? (
                  <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-md">
                    <img
                      src={photoDataUrl}
                      alt="Preview"
                      className="w-full h-full object-contain bg-black/40"
                    />
                    {applyWatermark && (
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur-xs text-[10px] text-amber-300 font-serif border border-amber-500/30">
                        🕉️ बालानन्द वैदिक ज्योतिष
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center mx-auto">
                      <Upload className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                      फोटो छान्नुहोस् वा यहाँ तानेर ल्याउनुहोस् (Drag & Drop)
                    </p>
                    <p className="text-xs text-stone-400">
                      JPG, PNG, WebP वा SVG (४K सम्म उच्च गुणस्तर)
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={photoFileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFileSelect}
                className="hidden"
              />

              {/* Watermark Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <input
                  type="checkbox"
                  id="watermarkCheck"
                  checked={applyWatermark}
                  onChange={(e) => setApplyWatermark(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="watermarkCheck" className="text-xs font-semibold cursor-pointer">
                  तल्लो भागमा हल्का "🕉️ बालानन्द वैदिक ज्योतिष" वाटरमार्क राख्नुहोस् (Watermark)
                </label>
              </div>
            </div>

            {/* Right: Metadata & Auto Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  फोटोको नाम / देव स्वरूप *
                </label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => handlePhotoTitleChange(e.target.value)}
                  onKeyDown={handlePhoneticInputKeyDown}
                  onBlur={handlePhoneticBlur}
                  placeholder="उदा: भगवान् श्री गणेश, शिवजी, सर्वतोभद्र मण्डल, महालक्ष्मी..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    वर्ग (Category)
                  </label>
                  <select
                    value={photoCategory}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setPhotoCategory(cat);
                      if (photoTitle) setPhotoDescription(generateVedicDescription(photoTitle, cat));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold"
                  >
                    <option value="wallpaper">🖼️ धार्मिक ४K वालपेपर</option>
                    <option value="infographic">📊 चार्ट तथा मण्डल / रेखी</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ब्याज (Badge)
                  </label>
                  <input
                    type="text"
                    value={photoBadge}
                    onChange={(e) => setPhotoBadge(e.target.value)}
                    placeholder="उदा: 4K Ultra HD, मण्डल रेखी..."
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    धार्मिक विवरण (स्वचालित Auto Description)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPhotoDescription(generateVedicDescription(photoTitle || 'देवता', photoCategory))}
                    className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>पुनः सिर्जना गर्नुहोस्</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  onKeyDown={handlePhoneticInputKeyDown}
                  onBlur={handlePhoneticBlur}
                  placeholder="फोटो चयन गर्नासाथ शास्त्रीय धार्मिक विवरण यहाँ स्वतः भरिनेछ..."
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!photoDataUrl || !photoTitle.trim()}
                  className="w-full py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>मिडिया डाउनलोड केन्द्रमा सुरक्षित एवं प्रकाशित गर्नुहोस्</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 4. Tab: Add Video (Link or File) */}
      {activeTab === 'upload_video' && (
        <form onSubmit={handleSaveVideo} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <Film className="w-5 h-5 text-red-600" />
                <span>नयाँ धार्मिक भिडियो कथा थप्नुहोस्</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                YouTube लिङ्क, भिडियो स्ट्रिम वा स्थानीय फाइल राख्नुहोस्। एपभित्रै प्ले हुनेछ।
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-bold">
              ५+ मिनेट कथा
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  भिडियो लिङ्क (YouTube / MP4 URL) *
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... वा embed link"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  YouTube को साधारण लिङ्क राखे पनि प्रणालीले यसलाई स्वतः सुरक्षित embed लिङ्कमा बदल्नेछ।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  भिडियोको शीर्षक (नेपाली) *
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => {
                    setVideoTitle(e.target.value);
                    if (!videoDescription) setVideoDescription(generateVedicDescription(e.target.value, 'video', videoSpeaker));
                  }}
                  onKeyDown={handlePhoneticInputKeyDown}
                  onBlur={handlePhoneticBlur}
                  placeholder="उदा: पूज्य प्रेमानन्द जी महाराज - नाम जपको महिमा..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    वाचक / प्रवचनकर्ता / स्रोत
                  </label>
                  <input
                    type="text"
                    value={videoSpeaker}
                    onChange={(e) => setVideoSpeaker(e.target.value)}
                    onKeyDown={handlePhoneticInputKeyDown}
                    onBlur={handlePhoneticBlur}
                    placeholder="उदा: पं. दिनबन्धु पोखरेल, प्रेमानन्द जी महाराज..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    समय अवधि (Duration)
                  </label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="उदा: २५:३० मिनेट"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    भाषा (Language)
                  </label>
                  <select
                    value={videoLanguage}
                    onChange={(e) => setVideoLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold"
                  >
                    <option value="नेपाली">नेपाली</option>
                    <option value="हिन्दी">हिन्दी</option>
                    <option value="संस्कृत">संस्कृत</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ब्याज (Badge)
                  </label>
                  <input
                    type="text"
                    value={videoBadge}
                    onChange={(e) => setVideoBadge(e.target.value)}
                    placeholder="उदा: सत्सङ्ग वाणी, रामलीला..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  थम्बनेल फोटो URL (Thumbnail)
                </label>
                <input
                  type="text"
                  value={videoThumbnailUrl}
                  onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                  placeholder=" स्वतः प्राप्त हुनेछ वा फोटो लिङ्क राख्नुहोस्"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono"
                />
              </div>

              {/* Live Preview of video thumbnail with Watermark */}
              <div className="relative h-44 rounded-xl overflow-hidden bg-black/60 border border-stone-700 flex items-center justify-center">
                {videoThumbnailUrl ? (
                  <>
                    <img
                      src={videoThumbnailUrl}
                      alt="Thumb Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-stone-400">थम्बनेल प्रिभ्यु</span>
                )}

                {/* Bottom RHS Watermark Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] text-amber-300 font-serif border border-amber-500/30">
                  🕉️ बालानन्द
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    धार्मिक कथा विवरण (Description)
                  </label>
                  <button
                    type="button"
                    onClick={() => setVideoDescription(generateVedicDescription(videoTitle || 'धार्मिक कथा', 'video', videoSpeaker))}
                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI विवरण जेनेरेट</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="भिडियोको शास्त्रीय विषयवस्तु र सार..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!videoTitle.trim() || !videoUrlInput.trim()}
                className="w-full py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span>भिडियो सुरक्षित एवं प्रकाशित गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 5. Tab: Manage & Edit Existing Videos */}
      {activeTab === 'manage_videos' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <Film className="w-5 h-5 text-cyan-600" />
                <span>पुराना तथा नयाँ भिडियोहरूको लिङ्क सम्पादन</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                कुनै पनि भिडियोको लिङ्क, वाचक, शीर्षक वा विवरण फेर्न "सम्पादन" थिच्नुहोस्।
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="भिडियो खोज्नुहोस्..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
              />
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredVideos.map((video) => {
              const isOverridden = Boolean(localStorage.getItem('balananda_edited_media_overrides_v2')?.includes(video.id));

              return (
                <div key={video.id} className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/40 p-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-black shrink-0 border border-stone-700">
                      <img
                        src={getAssetUrl(video.thumbnailUrl || '/assets/deities/radha_krishna.jpg')}
                        alt={video.titleNepali}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageFallback(e, ['/assets/deities/radha_krishna.jpg'])}
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 text-[10px] font-bold">
                          {video.badge || 'भिडियो'}
                        </span>
                        {video.language && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                            {video.language}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-stone-400">
                          {video.durationOrDim}
                        </span>
                        {isOverridden && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold">
                            सम्पादित (Edited)
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate mt-0.5">
                        {video.titleNepali}
                      </h4>

                      <p className="text-[11px] text-stone-500 font-mono truncate max-w-md">
                        {video.videoEmbedUrl || video.downloadUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => setTestingVideo(video)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="एपभित्र प्ले टेस्ट गर्नुहोस्"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>प्ले टेस्ट</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditVideo(video)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      title="लिङ्क तथा विवरण सम्पादन"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>सम्पादन</span>
                    </button>

                    {isOverridden && (
                      <button
                        type="button"
                        onClick={() => handleResetOverride(video.id)}
                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs cursor-pointer"
                        title="मूल विवरणमा रिसेट गर्नुहोस्"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(video)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 text-red-600 text-xs cursor-pointer"
                      title="सूचीबाट हटाउनुहोस्"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Tab: Manage Photos List */}
      {activeTab === 'manage_photos' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-600" />
                <span>फोटो, वालपेपर तथा मण्डल सूची</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                डाउनलोड केन्द्रमा उपलब्ध ४K वालपेपर र यन्त्र मण्डलहरू।
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="फोटो खोज्नुहोस्..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-3 bg-stone-50/50 dark:bg-stone-800/30">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-900 shrink-0 border border-stone-700">
                  <img
                    src={getAssetUrl(photo.downloadUrl)}
                    alt={photo.titleNepali}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageFallback(e, ['/assets/deities/shiva_kailash.jpg'])}
                  />
                  <div className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] text-amber-300">
                    ४K
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-amber-600 block truncate">
                    {photo.badge || photo.categoryLabel}
                  </span>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                    {photo.titleNepali}
                  </h4>
                  <p className="text-[10px] text-stone-500 font-mono">
                    {photo.durationOrDim}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(photo)}
                  className="p-1.5 text-stone-400 hover:text-red-600 cursor-pointer"
                  title="हटाउनुहोस्"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Modal: Edit Video Link and Info */}
      {editingVideoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-cyan-500 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gradient-to-r from-cyan-700 to-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-bold text-base">भिडियो लिङ्क तथा विवरण सम्पादन</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingVideoItem(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideoEdit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  भिडियो लिङ्क (YouTube / Embed URL) *
                </label>
                <input
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  भिडियोको शीर्षक (नेपाली) *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handlePhoneticInputKeyDown}
                  onBlur={handlePhoneticBlur}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    वाचक / प्रवचनकर्ता
                  </label>
                  <input
                    type="text"
                    value={editSpeaker}
                    onChange={(e) => setEditSpeaker(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    समय अवधि
                  </label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    भाषा (Language)
                  </label>
                  <select
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  >
                    <option value="नेपाली">नेपाली</option>
                    <option value="हिन्दी">हिन्दी</option>
                    <option value="संस्कृत">संस्कृत</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ब्याज (Badge)
                  </label>
                  <input
                    type="text"
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  थम्बनेल फोटो URL
                </label>
                <input
                  type="text"
                  value={editThumbnail}
                  onChange={(e) => setEditThumbnail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  धार्मिक विवरण
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingVideoItem(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>परिवर्तन सुरक्षित गर्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: In-App Video Player Test with RHS Watermark */}
      {testingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/95 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-red-500/80 flex flex-col max-h-[95vh]">
            {/* Header */}
            <div className="p-4 bg-stone-950 flex items-center justify-between border-b border-stone-800 text-white">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                    {testingVideo.badge || 'भिडियो टेस्ट'}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    अवधि: {testingVideo.durationOrDim}
                  </span>
                </div>
                <h3 className="font-bold text-base text-amber-300 truncate mt-1">
                  {testingVideo.titleNepali}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTestingVideo(null)}
                className="p-2 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Frame with Watermark at RHS */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {testingVideo.videoEmbedUrl ? (
                <iframe
                  src={`${testingVideo.videoEmbedUrl}?autoplay=1&rel=0`}
                  title={testingVideo.titleNepali}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  src={testingVideo.downloadUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}

              {/* Discreet RHS Watermark on Video */}
              <div className="absolute bottom-12 right-3 pointer-events-none z-20 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[11px] text-amber-300 font-serif border border-amber-400/40 shadow-xl flex items-center gap-1.5">
                <span>🕉️ बालानन्द वैदिक ज्योतिष</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-stone-950 text-xs text-stone-300 flex items-center justify-between">
              <span className="truncate pr-4">{testingVideo.descriptionNepali}</span>
              <span className="text-emerald-400 font-bold shrink-0">✓ इन-एप प्लेयर सक्रिय</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
