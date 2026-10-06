import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Download, Sparkles, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';

export interface DeityInfo {
  id: string;
  name: string;
  deityNepali: string;
  iconSymbol: string;
  shloka: string;
  bgGradient: [string, string, string];
  accentColor: string;
  borderColor: string;
}

/**
 * Intelligent Deity Detector from Book Title
 */
export function detectDeityFromTitle(title: string): DeityInfo {
  const t = title.toLowerCase();

  // 1. Lord Ganesha (गणेश)
  if (t.includes('गणेश') || t.includes('विनायक') || t.includes('गजानन') || t.includes('लम्बोदर')) {
    return {
      id: 'ganesha',
      name: 'Ganesha',
      deityNepali: 'भगवान् श्रीगणेश',
      iconSymbol: '🐘',
      shloka: 'वक्रतुण्ड महाकाय सूर्यकोटिसमप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
      bgGradient: ['#7F1D1D', '#991B1B', '#450A0A'],
      accentColor: '#F59E0B',
      borderColor: '#D97706',
    };
  }

  // 2. Lord Shiva (शिव / रुद्री / महारुद्र)
  if (t.includes('शिव') || t.includes('रुद्र') || t.includes('रुद्री') || t.includes('शङ्कर') || t.includes('भोले') || t.includes('महामृत्युञ्जय')) {
    return {
      id: 'shiva',
      name: 'Shiva',
      deityNepali: 'भगवान् सदाशिव (महारुद्र)',
      iconSymbol: '🔱',
      shloka: 'ध्यायेन्नित्यं महेशं रजतगिरिनिभं चारुचन्द्रावतंसं पञ्चवक्त्रं त्रिनेत्रम्॥',
      bgGradient: ['#1E1B4B', '#312E81', '#0F172A'],
      accentColor: '#38BDF8',
      borderColor: '#0284C7',
    };
  }

  // 3. Lord Vishnu / Narayan / Krishna / Satyanarayan
  if (t.includes('विष्णु') || t.includes('नारायण') || t.includes('सत्यनारायण') || t.includes('कृष्ण') || t.includes('राम') || t.includes('गीता')) {
    return {
      id: 'vishnu',
      name: 'Vishnu',
      deityNepali: 'भगवान् श्रीहरि नारायण',
      iconSymbol: '🪷',
      shloka: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशम्॥',
      bgGradient: ['#78350F', '#92400E', '#451A03'],
      accentColor: '#FBBF24',
      borderColor: '#D97706',
    };
  }

  // 4. Divine Devi / Durga / Bagalamukhi / Kali / Chandi
  if (t.includes('बगलामुखी') || t.includes('दुर्गा') || t.includes('काली') || t.includes('चण्डी') || t.includes('भवानी') || t.includes('लक्ष्मी') || t.includes('सरस्वती')) {
    return {
      id: 'devi',
      name: 'Devi',
      deityNepali: 'भगवती जगज्जननी आद्यशक्ति',
      iconSymbol: '👑',
      shloka: 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥',
      bgGradient: ['#831843', '#9D174D', '#500724'],
      accentColor: '#F472B6',
      borderColor: '#DB2777',
    };
  }

  // 5. Lord Vishwakarma (विश्वकर्मा / शिल्प / वास्तु)
  if (t.includes('विश्वकर्मा') || t.includes('शिल्प') || t.includes('वास्तु') || t.includes('औजार')) {
    return {
      id: 'vishwakarma',
      name: 'Vishwakarma',
      deityNepali: 'भगवान् श्रीविश्वकर्मा देव',
      iconSymbol: '⚙️',
      shloka: 'विश्वकर्मन् नमस्तुभ्यं विश्वनिर्माणकारक। शिल्पविद्याप्रणेतारं नमामि जगदीश्वरम्॥',
      bgGradient: ['#7C2D12', '#9A3412', '#431407'],
      accentColor: '#FB923C',
      borderColor: '#EA580C',
    };
  }

  // 6. Lord Hanuman (हनुमान / सुन्दरकाण्ड / बाहुक)
  if (t.includes('हनुमान') || t.includes('बजरङ्ग') || t.includes('मारुति') || t.includes('सुन्दरकाण्ड') || t.includes('बाहुक')) {
    return {
      id: 'hanuman',
      name: 'Hanuman',
      deityNepali: 'श्री रामभक्त वीर हनुमान',
      iconSymbol: '🚩',
      shloka: 'मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्। वातात्मजं श्रीरामदूतं शरणं प्रपद्ये॥',
      bgGradient: ['#9A3412', '#C2410C', '#7C2D12'],
      accentColor: '#FDE047',
      borderColor: '#F59E0B',
    };
  }

  // 7. Saptarshi / Rishi Panchami
  if (t.includes('ऋषि') || t.includes('पञ्चमी') || t.includes('सप्तर्षि') || t.includes('मुनि')) {
    return {
      id: 'rishi',
      name: 'Rishi',
      deityNepali: 'अरुन्धतीसहित सप्तर्षि मण्डल',
      iconSymbol: '🪔',
      shloka: 'कश्यपोऽत्रिर्भरद्वाजो विश्वामित्रोऽथ गौतमः। जमदग्निर्वसिष्ठश्च सप्तानां ऋषयः स्मृताः॥',
      bgGradient: ['#064E3B', '#065F46', '#022C22'],
      accentColor: '#34D399',
      borderColor: '#059669',
    };
  }

  // 8. Astrology / Remedies / Totke
  if (t.includes('टोटके') || t.includes('उपाय') || t.includes('ज्योतिष') || t.includes('ग्रह') || t.includes('लाल किताब')) {
    return {
      id: 'jyotish',
      name: 'Jyotish',
      deityNepali: 'नवग्रह मण्डल एवं कालचक्र',
      iconSymbol: '🪐',
      shloka: 'ब्रह्मामुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च। गुरुश्च शुक्रः शनिराहुकेतवः॥',
      bgGradient: ['#312E81', '#3730A3', '#1E1B4B'],
      accentColor: '#A78BFA',
      borderColor: '#8B5CF6',
    };
  }

  // 9. Sanskar / Namakarana / Vivah
  if (t.includes('संस्कार') || t.includes('नामकरण') || t.includes('विवाह') || t.includes('व्रतबन्ध')) {
    return {
      id: 'sanskar',
      name: 'Sanskar',
      deityNepali: 'वैदिक षोडश संस्कार',
      iconSymbol: '🏺',
      shloka: 'आयुः प्रजां धनं विद्यां स्वर्गं मोक्षं सुखानि च। प्रयच्छन्तु महाभागाः संस्कारैः संस्कृता नराः॥',
      bgGradient: ['#14532D', '#166534', '#052E16'],
      accentColor: '#FDE047',
      borderColor: '#15803D',
    };
  }

  // Default Vedic Theme
  return {
    id: 'vedic',
    name: 'Vedic',
    deityNepali: 'वैदिक सनातन धर्मपीठ',
    iconSymbol: '🕉️',
    shloka: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    bgGradient: ['#881337', '#9F1239', '#4C0519'],
    accentColor: '#FBBF24',
    borderColor: '#E11D48',
  };
}

interface BookCoverGeneratorProps {
  title: string;
  subtitle?: string;
  authorOrTradition?: string;
  editionBadge?: string;
  onCoverGenerated?: (dataUrl: string) => void;
}

export const BookCoverGenerator: React.FC<BookCoverGeneratorProps> = ({
  title,
  subtitle = 'शास्त्रीय सस्वर मन्त्र, प्रामाणिक नेपाली टीका एवं पूर्ण विधि',
  authorOrTradition = 'बालानन्द वैदिक अनुसन्धान केन्द्र',
  editionBadge = 'डिजिटल प्रामाणिक संस्करण',
  onCoverGenerated
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const deity = useMemo(() => detectDeityFromTitle(title), [title]);

  const drawCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard high-res book cover (600 x 850 px)
    const W = 600;
    const H = 850;
    canvas.width = W;
    canvas.height = H;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, deity.bgGradient[0]);
    bgGrad.addColorStop(0.5, deity.bgGradient[1]);
    bgGrad.addColorStop(1, deity.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle background mandala rays
    ctx.save();
    ctx.translate(W / 2, 340);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 36; i++) {
      ctx.rotate((Math.PI * 2) / 36);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 360);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Outer Ornamental Borders
    ctx.strokeStyle = '#FBBF24'; // Gold
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, W - 36, H - 36);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(26, 26, W - 52, H - 52);

    // Inner Green / Accent Border
    ctx.strokeStyle = deity.borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, W - 64, H - 64);

    // Four Corner Emblems
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('卐', 45, 45);
    ctx.fillText('卐', W - 45, 45);
    ctx.fillText('卐', 45, H - 45);
    ctx.fillText('卐', W - 45, H - 45);

    // 3. Top Official Balananda Header Banner
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(35, 35, W - 70, 75);

    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ श्रीहरिः ॐ ॥', W / 2, 58);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 21px serif';
    ctx.fillText('बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा', W / 2, 85);

    // 4. Edition Badge
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 140, 125, 280, 30, 15);
    ctx.fill();

    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`★ ${editionBadge} ★`, W / 2, 145);

    // 5. Deity Deity Radiant Aura Circle
    const auraGrad = ctx.createRadialGradient(W / 2, 280, 20, W / 2, 280, 130);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
    auraGrad.addColorStop(0.6, 'rgba(251, 191, 36, 0.15)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(W / 2, 280, 130, 0, Math.PI * 2);
    ctx.fill();

    // Deity Circle Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, 280, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Deity Graphic Symbol (Big radiant icon)
    ctx.font = '72px serif';
    ctx.fillText(deity.iconSymbol, W / 2, 292);

    // Deity Name Label Pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 120, 385, 240, 26, 13);
    ctx.fill();
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`॥ ${deity.deityNepali} ॥`, W / 2, 402);

    // 6. Sacred Shloka in Calligraphy
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'italic 12.5px serif';
    ctx.fillText(deity.shloka, W / 2, 440);

    // Classical Divider Line
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 465);
    ctx.lineTo(W - 80, 465);
    ctx.stroke();
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 14px serif';
    ctx.fillText('❖  ॐ  ❖', W / 2, 466);

    // 7. Grand Book Title (Devanagari Big Bold)
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const titleLength = title.length;
    let titleFontSize = titleLength > 30 ? 28 : titleLength > 20 ? 32 : 38;
    ctx.font = `black ${titleFontSize}px serif`;
    
    // Auto-wrap title if long
    const words = title.split(' ');
    let line1 = '';
    let line2 = '';
    if (words.length > 3 && titleLength > 18) {
      const mid = Math.ceil(words.length / 2);
      line1 = words.slice(0, mid).join(' ');
      line2 = words.slice(mid).join(' ');
      ctx.fillText(line1, W / 2, 530);
      ctx.fillText(line2, W / 2, 580);
    } else {
      ctx.fillText(title || 'वैदिक धार्मिक ग्रन्थ', W / 2, 550);
    }

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 8. Subtitle
    ctx.fillStyle = '#FDE68A';
    ctx.font = '500 15px sans-serif';
    const subWords = subtitle.split(' ');
    if (subWords.length > 6) {
      const subMid = Math.ceil(subWords.length / 2);
      ctx.fillText(subWords.slice(0, subMid).join(' '), W / 2, 640);
      ctx.fillText(subWords.slice(subMid).join(' '), W / 2, 665);
    } else {
      ctx.fillText(subtitle, W / 2, 650);
    }

    // 9. Bottom Publisher & Tradition Footer Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(45, 715, W - 90, 85);
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 1;
    ctx.strokeRect(45, 715, W - 90, 85);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(authorOrTradition, W / 2, 742);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px sans-serif';
    ctx.fillText('सुरुदेखि अन्तिमसम्म पूर्ण पाठ • शुद्ध संस्कृत मन्त्र एवं नेपाली टीका', W / 2, 764);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 11.5px monospace';
    ctx.fillText('BALANANDA DIGITAL RELIGIOUS LIBRARY', W / 2, 785);

    // Export to Data URL
    const url = canvas.toDataURL('image/png');
    setGeneratedUrl(url);
    if (onCoverGenerated) {
      onCoverGenerated(url);
    }
  };

  useEffect(() => {
    drawCover();
  }, [title, subtitle, authorOrTradition, editionBadge, deity]);

  const handleDownloadCover = () => {
    if (!generatedUrl) return;
    const a = document.createElement('a');
    a.href = generatedUrl;
    a.download = `${title.replace(/\s+/g, '_')}_Cover_Balananda.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white dark:bg-stone-900 border-2 border-amber-500/40 rounded-2xl p-4 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 text-lg">
            🎨
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 font-sans">
              <span>अटो फिचर कभर इमेज जेनेरेटर</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {deity.deityNepali}
              </span>
            </h4>
            <p className="text-[11px] text-stone-500">
              शीर्षक लेख्ने बित्तिकै सम्बन्धित भगवान्‌को दिव्य कभर स्वतः निर्माण हुन्छ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={drawCover}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            title="पुनः जेनेरेट गर्नुहोस्"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {generatedUrl && (
            <button
              type="button"
              onClick={handleDownloadCover}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>कभर डाउनलोड</span>
            </button>
          )}
        </div>
      </div>

      {/* Hidden high-res canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Preview Display */}
      {generatedUrl && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8F5EE] dark:bg-stone-800/50 p-3 rounded-xl border border-amber-200/60 dark:border-stone-700">
          <div className="w-36 h-48 rounded-lg overflow-hidden border-2 border-[#D97706] shadow-md shrink-0 bg-stone-900">
            <img
              src={generatedUrl}
              alt="Generated Cover"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#8B1E0F] dark:text-amber-400">पहिचान भएको देवता:</span>
              <span className="font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">
                {deity.iconSymbol} {deity.deityNepali}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              <strong>कभर साइज:</strong> ६०० x ८५० पिक्सेल (A4 ग्रन्थ कभर अनुपात)
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              <strong>विशेषता:</strong> बालानन्द लेटरहेड, मङ्गल स्वस्तिक, दिव्य ज्योति मण्डल, Devanagari क्यालिग्राफी
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                कभर पुस्तकका लागि तयार भयो!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
