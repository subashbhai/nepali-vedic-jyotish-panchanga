import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Globe2, 
  Calendar, 
  Clock, 
  MapPin, 
  Eye, 
  Send,
  MessageCircle,
  Facebook,
  Twitter,
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';
import { 
  BirthDetails, 
  LagnaInfo, 
  PlanetPosition, 
  VimshottariDashaResult, 
  OrganizationProfile 
} from '../types/astrology';
import { KundaliChart } from './KundaliChart';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  dasha: VimshottariDashaResult;
  orgProfile: OrganizationProfile;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  profile,
  lagna,
  planets,
  dasha,
  orgProfile,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [previewTab, setPreviewTab] = useState<'card' | 'text'>('card');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const moon = planets.find((p) => p.name === 'चन्द्र') || planets[1] || planets[0];
  const sun = planets.find((p) => p.name === 'सूर्य') || planets[0];

  // Generate shareable URL with encoded birth details
  const shareUrl = typeof window !== 'undefined' ? (() => {
    const params = new URLSearchParams();
    params.set('shareName', profile.name || '');
    if (profile.dateBS) params.set('shareDobBS', profile.dateBS);
    if (profile.dateAD) params.set('shareDobAD', profile.dateAD);
    if (profile.time) params.set('shareTime', profile.time);
    if (profile.location?.name) params.set('sharePlace', profile.location.name);
    if (profile.gender) params.set('shareGender', profile.gender);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}#kundali`;
  })() : '';

  // Generate formatted Nepali astrological summary text
  const shareText = `🕉️ वैदिक जन्मकुण्डली तथा ग्रह स्थिति 🕉️
━━━━━━━━━━━━━━━━━━━━
👤 जातकको नाम: ${profile.name} (${profile.gender === 'female' ? 'स्त्री' : 'पुरुष'})
📅 जन्म मिति: वि.सं. ${profile.dateBS || '—'} (${profile.dateAD || '—'})
⏰ जन्म समय: ${profile.time || '—'}
📍 जन्मस्थान: ${profile.location?.name || 'नेपाल'}

✨ कुण्डली मुख्य सूचकहरू:
🪔 लग्न: ${lagna.rashiName} (${lagna.formattedDegree})
☽ चन्द्र राशि: ${moon.rashiName} (नक्षत्र: ${moon.nakshatraName || '—'})
☀️ सूर्य राशि: ${sun.rashiName} (${sun.formattedDegree})
⏱️ वर्तमान दशा: ${dasha.currentMahadasha?.planet || '—'} महादशा

🪐 मुख्य ग्रह स्थिति (९ ग्रहहरू):
${planets.map(p => `• ${p.name}: ${p.rashiName} (${p.formattedDegree}) ${p.isRetrograde ? '[वक्री]' : ''}`).join('\n')}

📜 स्रोत: ${orgProfile.name || 'बालानन्द ज्योतिष तथा कर्मकाण्ड सेवा'}
🔗 कुण्डली हेर्नुहोस्: ${shareUrl}`;

  // Copy Link to clipboard
  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  }, [shareUrl]);

  // Copy Text summary to clipboard
  const handleCopyText = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [shareText]);

  // Draw Kundali Card on Canvas and generate image
  const generateCanvasImage = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve('');
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      const width = 1080;
      const height = 1350; // Standard Instagram / Social Post 4:5 ratio
      canvas.width = width;
      canvas.height = height;

      // 1. Background gradient (rich parchment / luxury amber)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#FFFDF8');
      bgGrad.addColorStop(0.5, '#FAF6EE');
      bgGrad.addColorStop(1, '#F3EAD8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Decorative Outer Border
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // 3. Header Banner
      ctx.fillStyle = '#7A1C1C';
      ctx.beginPath();
      ctx.roundRect(50, 50, width - 100, 140, [16, 16, 16, 16]);
      ctx.fill();

      // OM Symbol & Title
      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 36px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('॥ श्री गणेशाय नमः ॥', width / 2, 95);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px "Noto Serif Devanagari", serif';
      ctx.fillText(orgProfile.name || 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग', width / 2, 145);

      ctx.fillStyle = '#FCD34D';
      ctx.font = '20px "Noto Sans Devanagari", sans-serif';
      ctx.fillText('वैदिक जन्मकुण्डली तथा ग्रह स्थिति पत्र', width / 2, 175);

      // 4. Profile Information Box
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(50, 210, width - 100, 160, 16);
      ctx.fill();
      ctx.strokeStyle = '#E6E0D5';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Profile text
      ctx.fillStyle = '#1C1917';
      ctx.textAlign = 'left';
      ctx.font = 'bold 32px "Noto Sans Devanagari", sans-serif';
      ctx.fillText(`👤 जातक: ${profile.name}`, 80, 260);

      ctx.font = '22px "Noto Sans Devanagari", sans-serif';
      ctx.fillStyle = '#44403C';
      ctx.fillText(`📅 जन्म मिति: वि.सं. ${profile.dateBS || '—'} (${profile.dateAD || '—'})`, 80, 300);
      ctx.fillText(`⏰ समय: ${profile.time || '—'}  |  📍 स्थान: ${profile.location?.name || 'नेपाल'}`, 80, 340);

      // 5. Kundali Key Highlights Grid (4 boxes)
      const boxW = (width - 130) / 4;
      const boxY = 390;
      const highlights = [
        { label: '🪔 लग्न राशि', val: `${lagna.rashiName} (${lagna.formattedDegree})`, color: '#92400E', bg: '#FEF3C7' },
        { label: '☽ चन्द्र राशि', val: `${moon.rashiName} (${moon.nakshatraName || '—'})`, color: '#1E40AF', bg: '#DBEAFE' },
        { label: '☀️ सूर्य राशि', val: `${sun.rashiName} (${sun.formattedDegree})`, color: '#B45309', bg: '#FFEDD5' },
        { label: '⏱️ वर्तमान दशा', val: `${dasha.currentMahadasha?.planet || 'गुरु'} महादशा`, color: '#065F46', bg: '#D1FAE5' },
      ];

      highlights.forEach((h, idx) => {
        const x = 50 + idx * (boxW + 10);
        ctx.fillStyle = h.bg;
        ctx.beginPath();
        ctx.roundRect(x, boxY, boxW, 90, 12);
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = h.color;
        ctx.font = 'bold 18px "Noto Sans Devanagari", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(h.label, x + boxW / 2, boxY + 32);

        ctx.font = 'bold 20px "Noto Sans Devanagari", sans-serif';
        ctx.fillStyle = '#0F172A';
        ctx.fillText(h.val, x + boxW / 2, boxY + 68);
      });

      // 6. Draw Traditional Diamond Kundali Chart on Canvas
      const chartSize = 420;
      const chartX = 50;
      const chartY = 500;

      // Chart background
      ctx.fillStyle = '#FFFDF5';
      ctx.fillRect(chartX, chartY, chartSize, chartSize);
      ctx.strokeStyle = '#7A1C1C';
      ctx.lineWidth = 3;
      ctx.strokeRect(chartX, chartY, chartSize, chartSize);

      // Inner diamond lines
      ctx.beginPath();
      ctx.moveTo(chartX + chartSize / 2, chartY);
      ctx.lineTo(chartX + chartSize, chartY + chartSize / 2);
      ctx.lineTo(chartX + chartSize / 2, chartY + chartSize);
      ctx.lineTo(chartX, chartY + chartSize / 2);
      ctx.closePath();
      ctx.stroke();

      // Diagonal cross
      ctx.beginPath();
      ctx.moveTo(chartX, chartY);
      ctx.lineTo(chartX + chartSize, chartY + chartSize);
      ctx.moveTo(chartX + chartSize, chartY);
      ctx.lineTo(chartX, chartY + chartSize);
      ctx.stroke();

      // Draw Lagna sign in 1st house
      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 24px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`१ (लग्न: ${lagna.rashiName})`, chartX + chartSize / 2, chartY + 60);

      // 7. Planetary Positions Table on the right side
      const tableX = 500;
      const tableY = 500;
      const tableW = width - tableX - 50;
      const tableH = chartSize;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(tableX, tableY, tableW, tableH, 16);
      ctx.fill();
      ctx.strokeStyle = '#E6E0D5';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Table Header
      ctx.fillStyle = '#7A1C1C';
      ctx.beginPath();
      ctx.roundRect(tableX, tableY, tableW, 44, [16, 16, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ग्रह', tableX + 20, tableY + 28);
      ctx.fillText('राशि', tableX + 130, tableY + 28);
      ctx.fillText('अंश (Degree)', tableX + 260, tableY + 28);
      ctx.fillText('स्थिति', tableX + 410, tableY + 28);

      // Table rows (9 planets)
      const rowH = (tableH - 44) / 9;
      planets.slice(0, 9).forEach((p, idx) => {
        const ry = tableY + 44 + idx * rowH;
        if (idx % 2 === 1) {
          ctx.fillStyle = '#FAF7F2';
          ctx.fillRect(tableX, ry, tableW, rowH);
        }

        ctx.fillStyle = '#1C1917';
        ctx.font = 'bold 17px "Noto Sans Devanagari", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(p.name, tableX + 20, ry + 26);

        ctx.font = '16px "Noto Sans Devanagari", sans-serif';
        ctx.fillStyle = '#44403C';
        ctx.fillText(p.rashiName, tableX + 130, ry + 26);

        ctx.fillText(p.formattedDegree, tableX + 260, ry + 26);

        ctx.fillStyle = p.isRetrograde ? '#DC2626' : '#16A34A';
        ctx.font = 'bold 15px "Noto Sans Devanagari", sans-serif';
        ctx.fillText(p.isRetrograde ? 'वक्री (R)' : 'मार्गी (D)', tableX + 410, ry + 26);
      });

      // 8. Bottom Auspicious Shloka & Branding
      ctx.fillStyle = '#7A1C1C';
      ctx.beginPath();
      ctx.roundRect(50, 945, width - 100, 160, 16);
      ctx.fill();

      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 22px "Noto Serif Devanagari", serif';
      ctx.textAlign = 'center';
      ctx.fillText('॥ ग्रहा राज्यं प्रयच्छन्ति ग्रहा राज्यं हरन्ति च ॥', width / 2, 995);
      ctx.fillText('॥ ग्रहेभ्यः सर्वमुत्पन्नं त्रैलोक्यं सचराचरम् ॥', width / 2, 1030);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '18px "Noto Sans Devanagari", sans-serif';
      ctx.fillText('ग्रहहरूले नै शुभ फल र समृद्धि प्रदान गर्दछन् । सबैको कल्याण होस् ।', width / 2, 1075);

      // 9. Footer Watermark & URL
      ctx.fillStyle = '#78716C';
      ctx.font = '16px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`सम्पर्क: ${orgProfile.phone || '+९७७-९७६४४००५३३'} | वेबसाइट: balananda-astrology.com`, width / 2, 1145);
      ctx.fillText('नेपाली पञ्चाङ्ग तथा वैदिक ज्योतिष सफ्टवेयर प्रणालीद्वारा प्रमाणित', width / 2, 1175);

      try {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
      } catch (err) {
        console.error('Canvas export error:', err);
        resolve('');
      }
    });
  }, [profile, lagna, planets, dasha, orgProfile, moon, sun]);

  // Download Generated Image
  const handleDownloadImage = async () => {
    setIsGeneratingImage(true);
    try {
      const dataUrl = await generateCanvasImage();
      if (!dataUrl) {
        alert('तस्बिर तयार गर्न सकिएन, कृपया पुन: प्रयास गर्नुहोस्।');
        return;
      }
      const link = document.createElement('a');
      link.download = `${profile.name}_kundali_planetary_positions.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Web Share API (native mobile/desktop share)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        setIsGeneratingImage(true);
        const dataUrl = await generateCanvasImage();
        
        let filesArray: File[] = [];
        if (dataUrl && navigator.canShare) {
          try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `${profile.name}_kundali.png`, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              filesArray = [file];
            }
          } catch (e) {
            console.warn('File share prepare failed, sharing text/url fallback', e);
          }
        }

        if (filesArray.length > 0) {
          await navigator.share({
            title: `${profile.name} - जन्मकुण्डली तथा ग्रह स्थिति`,
            text: shareText,
            files: filesArray,
          });
        } else {
          await navigator.share({
            title: `${profile.name} - जन्मकुण्डली तथा ग्रह स्थिति`,
            text: shareText,
            url: shareUrl,
          });
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Web share error:', err);
        }
      } finally {
        setIsGeneratingImage(false);
      }
    } else {
      handleCopyLink();
    }
  };

  // Social Share Handlers
  const shareToWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const shareToFacebook = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  const shareToTwitter = () => {
    const tweet = encodeURIComponent(`${profile.name}को वैदिक जन्मकुण्डली तथा ग्रह स्थिति विवरण हेर्नुहोस्।`);
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${tweet}&url=${encodedUrl}`, '_blank');
  };

  const shareToTelegram = () => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      {/* Hidden Canvas used for high-res PNG image generation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-white dark:bg-[#1C1917] rounded-3xl shadow-2xl border border-amber-300/60 dark:border-amber-900/60 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#7A1C1C] via-[#922020] to-[#5C1515] text-white flex items-center justify-between shrink-0 border-b border-amber-500/40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-300/50 flex items-center justify-center text-amber-300 font-bold shadow-inner">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-amber-100 flex items-center gap-2">
                <span>जन्मकुण्डली तथा ग्रह स्थिति सेयर</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40">
                  {profile.name}
                </span>
              </h2>
              <p className="text-xs text-amber-200/80">
                सामाजिक सञ्जाल, लिङ्क वा तस्बिर (Image) को रूपमा तुरुन्त सेयर गर्नुहोस्
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 hover:text-white transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-[#2D241E] dark:text-stone-100">
          
          {/* Quick Action 1-Click Social Sharing Bar */}
          <div className="bg-amber-50/70 dark:bg-stone-900/80 rounded-2xl p-4 border border-amber-200/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>१-क्लिक सामाजिक सञ्जाल सेयरिङ (Instant Share)</span>
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                कुनै पनि माध्यम रोज्नुहोस्
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {/* WhatsApp Button */}
              <button
                onClick={shareToWhatsApp}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                title="WhatsApp मा सेयर गर्नुहोस्"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              {/* Facebook Button */}
              <button
                onClick={shareToFacebook}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                title="Facebook मा सेयर गर्नुहोस्"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </button>

              {/* X / Twitter Button */}
              <button
                onClick={shareToTwitter}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-black hover:bg-stone-800 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                title="Twitter / X मा सेयर गर्नुहोस्"
              >
                <Twitter className="w-4 h-4" />
                <span>X (Twitter)</span>
              </button>

              {/* Telegram Button */}
              <button
                onClick={shareToTelegram}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#007ab8] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                title="Telegram मा सेयर गर्नुहोस्"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </button>

              {/* Mobile Web Share Button */}
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-amber-800 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer col-span-2 sm:col-span-1"
                title="अन्य एपहरूमा सेयर गर्नुहोस्"
              >
                <Share2 className="w-4 h-4" />
                <span>थप एपहरू</span>
              </button>
            </div>
          </div>

          {/* View Tab Switcher */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewTab('card')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  previewTab === 'card'
                    ? 'bg-[#7A1C1C] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                🖼️ कुण्डली कार्ड तस्बिर दृश्य
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('text')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  previewTab === 'text'
                    ? 'bg-[#7A1C1C] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                📝 विवरण पाठ (Text Summary)
              </button>
            </div>

            {/* Download Image Button */}
            <button
              onClick={handleDownloadImage}
              disabled={isGeneratingImage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#b45309] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingImage ? 'तस्बिर बन्दैछ...' : 'तस्बिर डाउनलोड (PNG)'}</span>
            </button>
          </div>

          {/* TAB 1: Visual Card Preview */}
          {previewTab === 'card' && (
            <div className="bg-gradient-to-b from-amber-50/50 via-white to-amber-50/40 dark:from-[#262320] dark:to-stone-900 rounded-2xl border-2 border-amber-300/80 dark:border-stone-700 p-4 sm:p-6 shadow-sm space-y-4">
              
              {/* Card Header Banner */}
              <div className="bg-[#7A1C1C] text-white rounded-xl p-3.5 text-center shadow-xs border border-amber-500/40">
                <div className="text-amber-300 text-xs font-bold tracking-wider">॥ श्री गणेशाय नमः ॥</div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-amber-100 mt-0.5">
                  {orgProfile.name || 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग'}
                </h3>
                <p className="text-[11px] text-amber-200/80">वैदिक जन्मकुण्डली तथा मुख्य ग्रह स्थिति विवरण</p>
              </div>

              {/* Profile Details Bar */}
              <div className="bg-white dark:bg-stone-800/80 rounded-xl p-3.5 border border-amber-200/60 dark:border-stone-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">जातकको नाम:</span>
                  <strong className="text-sm text-stone-900 dark:text-stone-100 font-bold block">{profile.name}</strong>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                    {profile.gender === 'female' ? 'स्त्री जातक' : 'पुरुष जातक'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">जन्म मिति:</span>
                  <strong className="text-stone-900 dark:text-stone-100 font-bold block">वि.सं. {profile.dateBS || '—'}</strong>
                  <span className="text-[11px] text-stone-600 dark:text-stone-400">({profile.dateAD || '—'})</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">समय र स्थान:</span>
                  <strong className="text-stone-900 dark:text-stone-100 font-bold block">{profile.time || '—'}</strong>
                  <span className="text-[11px] text-stone-600 dark:text-stone-400">{profile.location?.name || 'नेपाल'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">वर्तमान महादशा:</span>
                  <strong className="text-[#D97706] dark:text-amber-400 font-bold block text-sm">
                    {dasha.currentMahadasha?.planet || 'गुरु'} महादशा
                  </strong>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">विंशोत्तरी दशा पद्धति</span>
                </div>
              </div>

              {/* 4 Main Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-amber-100/70 dark:bg-amber-950/60 p-2.5 rounded-xl border border-amber-300/60 dark:border-amber-800 text-center">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">🪔 लग्न</span>
                  <strong className="text-xs sm:text-sm text-stone-900 dark:text-stone-100 block font-bold mt-0.5">
                    {lagna.rashiName} ({lagna.formattedDegree})
                  </strong>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block">☽ चन्द्र राशि</span>
                  <strong className="text-xs sm:text-sm text-stone-900 dark:text-stone-100 block font-bold mt-0.5">
                    {moon.rashiName} ({moon.nakshatraName || '—'})
                  </strong>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/40 p-2.5 rounded-xl border border-orange-200 dark:border-orange-800 text-center">
                  <span className="text-[10px] font-bold text-orange-800 dark:text-orange-300 block">☀️ सूर्य राशि</span>
                  <strong className="text-xs sm:text-sm text-stone-900 dark:text-stone-100 block font-bold mt-0.5">
                    {sun.rashiName} ({sun.formattedDegree})
                  </strong>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">⏱️ दशा स्वामी</span>
                  <strong className="text-xs sm:text-sm text-stone-900 dark:text-stone-100 block font-bold mt-0.5">
                    {dasha.currentMahadasha?.planet || 'गुरु'} ग्रह
                  </strong>
                </div>
              </div>

              {/* Kundali Chart + 9 Planets Table Split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                {/* Mini Kundali Chart */}
                <div className="md:col-span-5 bg-white dark:bg-stone-800/90 p-3 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-[#7A1C1C] dark:text-amber-300 mb-2">
                    लग्न कुण्डली चक्र (D-1 Chart)
                  </span>
                  <div className="w-full max-w-[280px]">
                    <KundaliChart lagna={lagna} planets={planets} />
                  </div>
                </div>

                {/* 9 Planets Position Grid */}
                <div className="md:col-span-7 bg-white dark:bg-stone-800/90 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col justify-between">
                  <div className="bg-stone-100 dark:bg-stone-700/80 px-3 py-2 border-b border-stone-200 dark:border-stone-600 flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
                    <span>मुख्य ९ ग्रह स्थिति</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">निरायण पद्धति</span>
                  </div>

                  <div className="divide-y divide-stone-100 dark:divide-stone-700/60 overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-stone-50 dark:bg-stone-800 text-[10px] text-stone-500 dark:text-stone-400 uppercase">
                        <tr>
                          <th className="px-2.5 py-1.5">ग्रह</th>
                          <th className="px-2.5 py-1.5">राशि</th>
                          <th className="px-2.5 py-1.5">अंश (Degree)</th>
                          <th className="px-2.5 py-1.5">स्थिति</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planets.slice(0, 9).map((p) => (
                          <tr key={p.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-700/40">
                            <td className="px-2.5 py-1.5 font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                              <span>{p.name}</span>
                            </td>
                            <td className="px-2.5 py-1.5 text-stone-700 dark:text-stone-300">{p.rashiName}</td>
                            <td className="px-2.5 py-1.5 text-stone-600 dark:text-stone-400 font-mono text-[11px]">{p.formattedDegree}</td>
                            <td className="px-2.5 py-1.5">
                              {p.isRetrograde ? (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-sm">वक्री</span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-sm">मार्गी</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Shloka Quote Footer */}
              <div className="bg-amber-100/50 dark:bg-stone-800 p-2.5 rounded-xl border border-amber-300/40 text-center text-[11px] text-stone-700 dark:text-stone-300 font-serif">
                ॥ ग्रहा राज्यं प्रयच्छन्ति ग्रहा राज्यं हरन्ति च । ग्रहेभ्यः सर्वमुत्पन्नं त्रैलोक्यं सचराचरम् ॥
              </div>
            </div>
          )}

          {/* TAB 2: Text Summary Preview */}
          {previewTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  प्रतिलिपि (कपी) गरी सामाजिक सञ्जाल वा च्याटमा पठाउन मिल्ने विवरण:
                </span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#D97706] font-bold text-xs transition-colors cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'कपी गरियो!' : 'विवरण कपी गर्नुहोस्'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={shareText}
                rows={12}
                className="w-full p-3.5 rounded-xl border border-amber-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none select-all leading-relaxed shadow-inner"
              />
            </div>
          )}

          {/* Shareable Link Box */}
          <div className="bg-stone-50 dark:bg-stone-900/90 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 space-y-2">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              🔗 सिधा कुण्डली खोल्ने लिङ्क (Direct Shareable Link):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 select-all font-mono truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7A1C1C] hover:bg-[#5C1515] active:scale-95 text-white font-bold text-xs shrink-0 shadow-xs transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'लिङ्क कपी भयो!' : 'लिङ्क कपी'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-stone-100 dark:bg-[#181614] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>सुरक्षित तथा आधिकारिक वैदिक ज्योतिष प्रमाणीकरण</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold transition-colors cursor-pointer"
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
