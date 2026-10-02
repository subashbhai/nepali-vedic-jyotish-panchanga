import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Globe,
  Sliders,
  Image as ImageIcon,
  Type,
  Eye,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
  ExternalLink,
  ShieldCheck,
  Info,
  Check,
  Smartphone,
  Monitor
} from 'lucide-react';
import {
  AdvertisementConfig,
  AdDisplayMode,
  AdThemeType,
  getStoredAdConfig,
  saveAdConfig,
  resetAdConfig
} from '../../../db/advertisementStore';

export const AdminAdvertisementSection: React.FC = () => {
  const [config, setConfig] = useState<AdvertisementConfig>(getStoredAdConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    setConfig(getStoredAdConfig());
  }, []);

  const handleSave = () => {
    saveAdConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('के तपाईं विज्ञापन सेटिङ्सलाई पूर्ववत (Default) अवस्थामा फर्काउन चाहनुहुन्छ?')) {
      const reset = resetAdConfig();
      setConfig(reset);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Image upload handler (converts to base64 data URL for local persistence)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'bannerImageUrl' | 'sideCardImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('फोटोको साइज २.५ MB भन्दा सानो हुनुपर्छ।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setConfig(prev => ({
          ...prev,
          customAd: {
            ...prev.customAd,
            [field]: result
          }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Theme background styles for live preview
  const getThemeStyles = (theme: AdThemeType) => {
    switch (theme) {
      case 'royal_gold':
        return {
          wrapper: 'bg-gradient-to-r from-[#291B03] via-[#3D2805] to-[#1F1401] border-amber-500/60 text-amber-50',
          accent: 'from-amber-400 to-yellow-500 text-stone-950',
          badge: 'bg-amber-400/20 text-amber-300 border-amber-400/50',
          sideCard: 'bg-stone-950/70 border-amber-500/30'
        };
      case 'deep_crimson':
        return {
          wrapper: 'bg-gradient-to-r from-[#240A0A] via-[#380E0E] to-[#170505] border-rose-500/50 text-rose-50',
          accent: 'from-rose-500 to-amber-600 text-white',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-400/50',
          sideCard: 'bg-stone-950/70 border-rose-500/30'
        };
      case 'emerald_forest':
        return {
          wrapper: 'bg-gradient-to-r from-[#061C14] via-[#0B2C20] to-[#04120D] border-emerald-500/50 text-emerald-50',
          accent: 'from-emerald-500 to-teal-600 text-white',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
          sideCard: 'bg-stone-950/70 border-emerald-500/30'
        };
      case 'midnight_blue':
        return {
          wrapper: 'bg-gradient-to-r from-[#081528] via-[#0E223D] to-[#050D1A] border-sky-500/50 text-sky-50',
          accent: 'from-sky-500 to-blue-600 text-white',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-400/50',
          sideCard: 'bg-stone-950/70 border-sky-500/30'
        };
      case 'vedic_dark':
      default:
        return {
          wrapper: 'bg-gradient-to-r from-[#1C140E] via-[#2D1B0F] to-[#120B06] border-amber-500/50 text-white',
          accent: 'from-amber-500 to-amber-600 text-stone-950',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          sideCard: 'bg-stone-950/70 border-amber-500/30'
        };
    }
  };

  const currentTheme = getThemeStyles(config.customAd.theme);

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header Card */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-md">
              <Megaphone className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                <span>विज्ञापन तथा Google AdSense व्यवस्थापन कक्ष</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  Ad & Monetization Hub
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Google AdSense Client ID प्रविष्टि, लचकदार स्वतः खाली-ठाउँ नियन्त्रण र कस्टम प्रायोजक विज्ञापन डिजाइन प्यानल।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
            title="डिफल्ट सेटिङ्स फर्काउनुहोस्"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>डिफल्ट</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-stone-950" />
                <span>सफलतापूर्वक सुरक्षित भयो!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>सेटिङ्स सुरक्षित गर्नुहोस्</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notice Card on Zero Blank Space Logic */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">
            💡 खाली ठाउँ नराख्ने स्मार्ट प्रविधि (Zero-Blank-Space Technology):
          </p>
          <p className="text-stone-300 leading-relaxed text-[11.5px]">
            तपाईंले Google AdSense वा कस्टम विज्ञापन सक्रिय गर्दा, वास्तविक विज्ञापन लोड भएपछि मात्र त्यो स्थान वेबसाइटमा खुल्नेछ। विज्ञापन नआएसम्म वेबसाइटमा कुनै खाली/कुरुप ग्याप देखिने छैन। जसले गर्दा साइट सधैं सफा र व्यावसायिक देखिन्छ।
          </p>
        </div>
      </div>

      {/* Grid: AdSense + Display Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Google AdSense Setup */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-stone-100 text-sm">Google AdSense कन्फिगरेसन</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.adsense.enabled}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  adsense: { ...prev.adsense, enabled: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-300 font-bold mb-1.5 flex items-center justify-between">
                <span>Google AdSense Client ID :</span>
                <span className="text-[10px] text-amber-400 font-normal">उदाहरण: ca-pub-1955279955732879</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  value={config.adsense.clientId}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    adsense: { ...prev.adsense, clientId: e.target.value.trim() }
                  }))}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-stone-100 font-mono text-xs outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                आफ्नो Google AdSense खाताको प्रकाशक परिचय (Publisher ID / Client ID) यहाँ राख्नुहोस्।
              </p>
            </div>

            <div>
              <label className="block text-stone-300 font-bold mb-1.5">
                Ad Slot ID (ऐच्छिक / डिफल्ट: auto):
              </label>
              <input
                type="text"
                placeholder="auto"
                value={config.adsense.slotId}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  adsense: { ...prev.adsense, slotId: e.target.value.trim() || 'auto' }
                }))}
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-stone-100 font-mono text-xs outline-none transition-colors"
              />
            </div>

            <div className="pt-2 space-y-2 border-t border-stone-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoCollapseEmptySpace}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    autoCollapseEmptySpace: e.target.checked
                  }))}
                  className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-stone-300 font-semibold">
                  विज्ञापन नआउँदा खाली ठाउँ ० पिक्सेल बनाउने (कुनै खाली ठाउँ नराख्ने)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.adsense.autoAdsEnabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    adsense: { ...prev.adsense, autoAdsEnabled: e.target.checked }
                  }))}
                  className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-stone-300 font-semibold">
                  Google Auto Ads स्वतः सक्रिय राख्ने
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 2: Ad Display Mode Selection */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="pb-3 border-b border-stone-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-stone-100 text-sm">वेबसाइटमा विज्ञापन प्रदर्शन मोड (Display Mode)</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                id: 'adsense_flexible' as AdDisplayMode,
                title: '🌟 गुगल एडसेन्स लचकदार (सिफारिस गरिएको)',
                desc: 'AdSense विज्ञापन आएमा AdSense देखाउने, नआउँदा कस्टम प्रायोजक विज्ञापन देखाउने।'
              },
              {
                id: 'custom_ad' as AdDisplayMode,
                title: '🎨 आफ्नै कस्टम/प्रायोजक डिजाइन विज्ञापन मात्र',
                desc: 'Google AdSense नदेखाउने, तल सिर्जना गरिएको प्रायोजक विज्ञापन मात्र देखाउने।'
              },
              {
                id: 'default_banner' as AdDisplayMode,
                title: '📞 बालानन्द आधिकारिक विज्ञापन सम्पर्क ब्यानर मात्र',
                desc: '“विज्ञापनको लागि सम्पर्क : ९७६४४००५३३” सम्पर्क ब्यानर मात्र प्रदर्शन गर्ने।'
              },
              {
                id: 'hidden' as AdDisplayMode,
                title: '🚫 विज्ञापन पूर्ण रूपमा बन्द गर्ने',
                desc: 'वेबसाइटमा कुनै विज्ञापन वा खाली ठाउँ देखिने छैन। (Site 100% clean)'
              }
            ].map((mode) => {
              const isSelected = config.displayMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => setConfig(prev => ({ ...prev, displayMode: mode.id }))}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-xs'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-amber-400 bg-amber-400' : 'border-stone-600'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-stone-950 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className={`font-bold ${isSelected ? 'text-amber-300' : 'text-stone-200'}`}>
                      {mode.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                      {mode.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card 3: Custom Sponsor Ad Form (Text or Image) */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-5 shadow-xl">
        <div className="pb-3 border-b border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-sm">
                प्रायोजक विज्ञापन डिजाइन तथा सम्पादन फारम (Sponsor Ad Creator)
              </h3>
              <p className="text-[11px] text-stone-400">
                ग्राहकले केवल टेक्स्ट मात्र पठाए पनि यहाँ विवरण भर्दा प्रणालीले स्वतः आकर्षक ग्राफिक ब्यानर सिर्जना गर्छ।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-semibold">प्रदर्शन शैली:</span>
            <button
              type="button"
              onClick={() => setConfig(prev => ({
                ...prev,
                customAd: { ...prev.customAd, isImageOnly: false }
              }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                !config.customAd.isImageOnly
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              📝 टेक्स्ट + कार्ड डिजाइन
            </button>
            <button
              type="button"
              onClick={() => setConfig(prev => ({
                ...prev,
                customAd: { ...prev.customAd, isImageOnly: true }
              }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                config.customAd.isImageOnly
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              🖼️ फोटो ब्यानर मात्र
            </button>
          </div>
        </div>

        {/* Option 1: Image Only / Image Upload */}
        <div className="p-4 bg-stone-950/80 rounded-xl border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-stone-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>ब्यानर फोटो वा इमेज (Banner Image Option)</span>
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60">
              सिफारिस साइज: 1200x250 px (Desktop) / 728x90 px
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-stone-400 mb-1">फोटो URL (Image Link)</label>
              <input
                type="text"
                placeholder="https://example.com/banner.jpg"
                value={config.customAd.bannerImageUrl}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  customAd: { ...prev.customAd, bannerImageUrl: e.target.value }
                }))}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 text-xs outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1">वा कम्प्युटरबाट फोटो छान्नुहोस् (Upload Image)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'bannerImageUrl')}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2 text-stone-300 text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-stone-950 hover:file:bg-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Dimension Specifications Guidance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-stone-400">
            <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800 text-center">
              <span className="text-amber-400 font-bold block">1200 × 250 px</span>
              <span className="text-[10px]">मुख्य हेडर ब्यानर</span>
            </div>
            <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800 text-center">
              <span className="text-amber-400 font-bold block">728 × 90 px</span>
              <span className="text-[10px]">लिडबोर्ड ब्यानर</span>
            </div>
            <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800 text-center">
              <span className="text-amber-400 font-bold block">360 × 120 px</span>
              <span className="text-[10px]">मोबाइल स्क्रिन ब्यानर</span>
            </div>
            <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800 text-center">
              <span className="text-amber-400 font-bold block">16:9 वा 4:1</span>
              <span className="text-[10px]">इमेज पक्ष अनुपात</span>
            </div>
          </div>
        </div>

        {/* Option 2: Text-based Form (Smart Generator) */}
        {!config.customAd.isImageOnly && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  विज्ञापन शीर्षक वा संस्थाको नाम (Title):
                </label>
                <input
                  type="text"
                  placeholder="उदा: विज्ञापनको लागि सम्पर्क : ९७६४४००५३३"
                  value={config.customAd.title}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customAd: { ...prev.customAd, title: e.target.value }
                  }))}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">
                  माथिल्लो ट्याग (Badge Text):
                </label>
                <input
                  type="text"
                  placeholder="उदा: व्यावसायिक विज्ञापन तथा प्रायोजन स्थान"
                  value={config.customAd.badgeText}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customAd: { ...prev.customAd, badgeText: e.target.value }
                  }))}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-stone-300 font-bold mb-1">
                  विज्ञापनको विस्तृत विवरण (Description):
                </label>
                <textarea
                  rows={2}
                  placeholder="यस लोकप्रिय नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग पोर्टलमा तपाईंको व्यवसाय वा सेवाको प्रचार गर्नुहोस्..."
                  value={config.customAd.description}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customAd: { ...prev.customAd, description: e.target.value }
                  }))}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 outline-none text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">सम्पर्क फोन नम्बर (Phone):</label>
                <input
                  type="text"
                  placeholder="९७६४४००५३३"
                  value={config.customAd.phone}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customAd: { ...prev.customAd, phone: e.target.value }
                  }))}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">WhatsApp नम्बर:</label>
                <input
                  type="text"
                  placeholder="९७६४४००५३३"
                  value={config.customAd.whatsappNumber}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customAd: { ...prev.customAd, whatsappNumber: e.target.value }
                  }))}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">ईमेल ठेगाना (Email):</label>
                <input
                  type="email"
                  placeholder="suwashdmk@gmail.com"
                  value={config.customAd.email}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customAd: { ...prev.customAd, email: e.target.value }
                  }))}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">वेबसाइट वा बाह्य लिङ्क (Website URL):</label>
                <input
                  type="url"
                  placeholder="https://yourbrand.com.np"
                  value={config.customAd.websiteUrl}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customAd: { ...prev.customAd, websiteUrl: e.target.value }
                  }))}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 outline-none"
                />
              </div>
            </div>

            {/* Design & Theme Color Selector */}
            <div className="pt-3 border-t border-stone-800 space-y-2">
              <label className="block text-xs font-bold text-stone-300">
                रङ संयोजन तथा ब्यानर थिम (Color Theme):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                {[
                  { id: 'vedic_dark' as AdThemeType, label: '🟤 वैदिक एम्बर', color: 'from-[#1C140E] to-[#2D1B0F]' },
                  { id: 'royal_gold' as AdThemeType, label: '🟡 शाही सुनौलो', color: 'from-[#291B03] to-[#3D2805]' },
                  { id: 'deep_crimson' as AdThemeType, label: '🔴 सिन्दूरी रातो', color: 'from-[#240A0A] to-[#380E0E]' },
                  { id: 'emerald_forest' as AdThemeType, label: '🟢 समृद्ध हरियो', color: 'from-[#061C14] to-[#0B2C20]' },
                  { id: 'midnight_blue' as AdThemeType, label: '🔵 मध्यरात निलो', color: 'from-[#081528] to-[#0E223D]' },
                ].map((th) => {
                  const isCur = config.customAd.theme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        customAd: { ...prev.customAd, theme: th.id }
                      }))}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer bg-gradient-to-r ${th.color} ${
                        isCur
                          ? 'border-amber-400 ring-2 ring-amber-400/30 text-white'
                          : 'border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      {th.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side Brand Card Options */}
            <div className="pt-3 border-t border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-200">
                  दायाँ तर्फको ब्राण्ड कार्ड (Right Side Brand Card)
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                  <input
                    type="checkbox"
                    checked={config.customAd.showSideCard}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      customAd: { ...prev.customAd, showSideCard: e.target.checked }
                    }))}
                    className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>दायाँ कार्ड देखाउने</span>
                </label>
              </div>

              {config.customAd.showSideCard && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
                  <div>
                    <label className="block text-stone-400 mb-1">कार्ड ट्याग (Badge):</label>
                    <input
                      type="text"
                      placeholder="विज्ञापन स्थान (Ad Space)"
                      value={config.customAd.sideCardBadge}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        customAd: { ...prev.customAd, sideCardBadge: e.target.value }
                      }))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">कार्ड शीर्षक (Brand / Name):</label>
                    <input
                      type="text"
                      placeholder="बालानन्द ज्योतिष, वास्तु सेवा"
                      value={config.customAd.sideCardTitle}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        customAd: { ...prev.customAd, sideCardTitle: e.target.value }
                      }))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">कार्ड उप-शीर्षक (Tagline):</label>
                    <input
                      type="text"
                      placeholder="नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा"
                      value={config.customAd.sideCardSubtitle}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        customAd: { ...prev.customAd, sideCardSubtitle: e.target.value }
                      }))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-stone-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Container */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-stone-100 text-sm">
              प्रत्यक्ष लाइभ प्रिभ्यु (Live Website Preview)
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                previewDevice === 'desktop'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>कम्प्युटर (Desktop)</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                previewDevice === 'mobile'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>मोबाइल (Mobile)</span>
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className={`p-4 bg-stone-950 rounded-2xl border border-stone-800/80 overflow-hidden mx-auto transition-all ${
          previewDevice === 'mobile' ? 'max-w-md' : 'w-full'
        }`}>
          {config.displayMode === 'hidden' ? (
            <div className="py-8 text-center text-stone-500 text-xs border border-dashed border-stone-800 rounded-xl">
              🚫 विज्ञापन पूर्ण रूपमा बन्द गरिएको छ — वेबसाइटमा ० पिक्सेल खाली ठाउँ रहनेछ।
            </div>
          ) : config.customAd.isImageOnly && config.customAd.bannerImageUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 shadow-lg">
              <img
                src={config.customAd.bannerImageUrl}
                alt={config.customAd.title || 'Advertisement'}
                className="w-full h-auto object-cover max-h-64 rounded-2xl"
              />
            </div>
          ) : (
            /* Render Designed Custom Ad Preview */
            <aside className={`relative overflow-hidden rounded-2xl border-2 text-white shadow-xl transition-all ${currentTheme.wrapper}`}>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Left Section */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${currentTheme.badge}`}>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{config.customAd.badgeText || 'व्यावसायिक विज्ञापन तथा प्रायोजन स्थान'}</span>
                    </span>
                    {config.customAd.subBadgeText && (
                      <span className="text-[11px] text-amber-200/70 hidden sm:inline">
                        • {config.customAd.subBadgeText}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base sm:text-lg md:text-xl font-bold font-serif text-amber-100 flex flex-wrap items-center gap-1.5 tracking-wide">
                    <span>{config.customAd.title || 'विज्ञापनको लागि सम्पर्क : ९७६४४००५३३'}</span>
                  </h2>

                  <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
                    {config.customAd.description || 'यस लोकप्रिय नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग पोर्टलमा तपाईंको व्यवसायको विज्ञापन गर्नुहोस्।'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {config.customAd.phone && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-xs">
                        <Phone className="w-3.5 h-3.5 text-stone-950" />
                        <span>कल गर्नुहोस् : {config.customAd.phone}</span>
                      </div>
                    )}

                    {config.customAd.whatsappNumber && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-xs border border-emerald-400/30">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                        <span>WhatsApp च्याट</span>
                      </div>
                    )}

                    {config.customAd.email && (
                      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-900/80 text-stone-300 border border-stone-700 text-xs rounded-xl">
                        <Mail className="w-3 h-3 text-amber-400" />
                        <span>{config.customAd.email}</span>
                      </div>
                    )}

                    {config.customAd.websiteUrl && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 text-amber-300 border border-amber-500/40 text-xs rounded-xl font-bold">
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                        <span>वेबसाइट</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Card (Exact Match to screenshot) */}
                {config.customAd.showSideCard && (
                  <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center shrink-0 w-full md:w-64 space-y-1.5 ${currentTheme.sideCard}`}>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/30">
                      {config.customAd.sideCardBadge || 'विज्ञापन स्थान (Ad Space)'}
                    </span>

                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-400/50 flex items-center justify-center my-1 bg-amber-500/10 shadow-inner">
                      {config.customAd.sideCardImageUrl ? (
                        <img
                          src={config.customAd.sideCardImageUrl}
                          alt="Brand Logo"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-amber-400">ॐ</span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-amber-100 font-serif leading-tight">
                      {config.customAd.sideCardTitle || 'बालानन्द ज्योतिष, वास्तु सेवा'}
                    </h4>
                    <p className="text-[10px] text-stone-400">
                      {config.customAd.sideCardSubtitle || 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा'}
                    </p>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
