import React, { useState, useMemo } from 'react';
import {
  X,
  Package,
  CheckCircle2,
  Copy,
  Printer,
  ShoppingCart,
  Sparkles,
  Search,
  Check,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Image as ImageIcon,
  ZoomIn
} from 'lucide-react';
import { Product } from '../../types/vedicStoreTypes';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface PujaSamagriListModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
}

const getItemIcon = (text: string): string => {
  if (/धागो|मौली|कच्चा|पोते|डोरी/i.test(text)) return '🧵';
  if (/कलश|पात्र|लोहटा|अर्घ्य|घडा|तामाको|थाली/i.test(text)) return '🏺';
  if (/घ्यू|घृत|दुध|दही|पञ्चामृत/i.test(text)) return '🧈';
  if (/चामल|अक्षता|धान|अन्न/i.test(text)) return '🌾';
  if (/नरिवल|श्रीफल/i.test(text)) return '🥥';
  if (/सिन्दूर|अबीर|केशरी|रोली|टीका/i.test(text)) return '🔴';
  if (/कपूर|कर्पूर/i.test(text)) return '❄️';
  if (/धूप|अगरबत्ती|अगर/i.test(text)) return '🥢';
  if (/दियो|दीप|बत्ती/i.test(text)) return '🪔';
  if (/जौ|तिल|कुश|दुबो|दूर्वा|पात|पत्ता|टुसा|अङ्कुर|समिधा|काठ|पिपल|शमी|वट|बर|पञ्चपल्लव/i.test(text)) return '🌿';
  if (/फूल|पुष्प|माला/i.test(text)) return '🌸';
  if (/जनै|यज्ञोपवीत/i.test(text)) return '🪢';
  if (/सुपारी|ल्वाङ|सुकुमेल|मरिच|जायफल/i.test(text)) return '🌰';
  if (/हवन|कुण्ड/i.test(text)) return '🔥';
  if (/वस्त्र|कपडा|धोती|पहेँलो|रातो/i.test(text)) return '🧣';
  if (/घण्टी|घण्टा/i.test(text)) return '🔔';
  if (/शङ्ख/i.test(text)) return '🐚';
  if (/गंगाजल|जल|गोमूत्र|पानी/i.test(text)) return '💧';
  if (/सिक्का|दक्षिणा|भेटी/i.test(text)) return '🪙';
  if (/शलाका|सियो/i.test(text)) return '🪡';
  if (/काँधियो|काँइयो|दर्पण|ऐना/i.test(text)) return '🪞';
  if (/पुस्तक|पञ्चाङ्ग|ग्रन्थ|विधि/i.test(text)) return '📖';
  if (/शर्करा|सख्खर|मह|गुड/i.test(text)) return '🍯';
  return '✨';
};

export const PujaSamagriListModal: React.FC<PujaSamagriListModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPosterZoom, setShowPosterZoom] = useState(false);

  if (!isOpen || !product) return null;

  const rawItems = product.packageItems && product.packageItems.length > 0 
    ? product.packageItems 
    : [
        'तामाको कलश – १ थान',
        'तामाको पञ्चपात्र र अर्घ्यपात्र – १ सेट',
        'शुद्ध गाईको घ्यू – ५०० ग्राम',
        'हवन सामग्री प्याकेट – ५०० ग्राम',
        'समिधा काठ (पिपल, शमी, आँप) – २ केजी',
        'केसर र रातो चन्दन काठ – १ सेट',
        'अक्षता (अक्षत धान/चामल) – १ प्याकेट',
        'कपूर, धूप र दीप धागो – १ सेट',
        'मौली धागो (कच्चा धागो र पोते) – ५ थान',
        'जनै (यज्ञोपवीत) – ५ जोर',
        'सुपारी, ल्वाङ, सुकुमेल – १०८ गेडा',
        'सर्वौषधि र सप्तमृत्तिका – १ सेट',
        'पञ्चरत्न र नवग्रह समिधा – १ सेट',
        'रातो/पहेंलो वस्त्र (आसन र कलश ढाक्ने) – २ थान',
        'नरिवल (हवन र कलशका लागि) – २ वटा',
        'जौ, तिल, कुश र दुबो – १ सेट',
        'सिन्दूर, अबीर, केशरी र चन्दन – १ सेट',
        'तामाको थाली र दियो – १ सेट',
        'घण्टी र शङ्ख (पूजा निमित्त) – १ सेट',
        'गंगाजल र गोमूत्र – १/१ बोतल',
      ];

  const filteredItems = rawItems.filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCount = rawItems.length;

  const handleCopyList = () => {
    const listText = `📦 ${product.nameNepali}\nकुल ${totalCount} प्रकारका सामग्री विवरण सूची:\n\n` +
      rawItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n') +
      `\n\nमूल्य: रु. ${(product.discountPrice || product.sellingPrice).toLocaleString('ne-NP')}\n— बालानन्द वैदिक पसल तथा कर्मकाण्ड भण्डार`;

    navigator.clipboard.writeText(listText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFDF7] dark:bg-[#1E1B18] w-full max-w-3xl rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. Modal Sacred Header */}
        <div className="bg-gradient-to-r from-amber-700 via-[#882222] to-amber-900 text-white p-4 sm:p-5 flex items-start justify-between border-b border-amber-500/40 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-300/40 flex items-center justify-center text-amber-300 text-xl font-bold shadow-inner shrink-0 mt-0.5">
              🕉️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-400 text-stone-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wide">
                  पूजा सामग्री विवरण
                </span>
                <span className="bg-white/20 text-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300/30">
                  कुल {toDevanagariNumerals(totalCount)} प्रकारका सामग्री
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white mt-1 leading-snug">
                {product.nameNepali}
              </h2>
              <p className="text-xs text-amber-100/90 font-sans mt-0.5">
                शास्त्रीय विधि अनुसार प्रमाणित, शुद्ध एवं उच्च गुणस्तरका सम्पूर्ण सामग्रीहरूको सूची
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Search Box & Quick Highlights */}
        <div className="p-3.5 sm:p-4 bg-amber-50/70 dark:bg-stone-900 border-b border-[#E6E0D5] dark:border-stone-800 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search items filter */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="यस प्याकेजका सामग्री खोज्नुहोस् (उदा: कलश, घ्यू, चन्दन, तिल, जनै)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Copy & Print Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyList}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="सामग्री सूची क्लिपबोर्डमा कपी गर्नुहोस्"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
                <span>{copied ? 'सूची कपी भयो' : 'कपी गर्नुहोस्'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="सामग्री सूची प्रिन्ट गर्नुहोस्"
              >
                <Printer className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span className="hidden sm:inline">प्रिन्ट</span>
              </button>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">१००% शुद्ध र शास्त्रीय</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">सुरक्षित होम डेलिभरी</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">तयारी प्याकिङ सेट</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <HeartHandshake className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">एडमिनबाट सम्पादन योग्य</span>
            </div>
          </div>
        </div>

        {/* 3. Itemized Samagri Checklist Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 print:p-0">
          {/* HD Poster Preview Banner */}
          {product.imageUrl && (
            <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3 sm:p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 dark:bg-stone-800/80 rounded-2xl border border-amber-400/40 dark:border-amber-800/50 shadow-2xs">
              <div
                onClick={() => setShowPosterZoom(true)}
                className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden shadow-md shrink-0 border-2 border-amber-400 cursor-pointer group bg-stone-900"
                title="पोस्टर ठूलो गरी हेर्नुहोस्"
              >
                <img
                  src={product.imageUrl}
                  alt={product.nameNepali}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white drop-shadow-md group-hover:scale-125 transition-transform" />
                </div>
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-300/60 dark:border-amber-700/60">
                    🖼️ आधिकारिक HD पूजा पोस्टर
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                    (सचित्र सामग्री तालिका सहित)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                  {product.nameNepali} – सम्पूर्ण सचित्र प्याकेज
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 line-clamp-2">
                  सबै पूजा सामग्रीहरूको सचित्र पोस्टर तयार गरिएको छ। पूर्ण पोस्टर हेर्न तलको बटन वा छेउको फोटोमा क्लिक गर्नुहोस्।
                </p>
                <button
                  type="button"
                  onClick={() => setShowPosterZoom(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>पोस्टर ठूलो आकारमा हेर्नुहोस् (Zoom Poster)</span>
                </button>
              </div>
            </div>
          )}

          {/* List Title Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              <span>समावेश गरिएका मुख्य सामग्रीहरूको नामावली ({filteredItems.length} वटा सूचीकृत):</span>
            </h3>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              (परिमाण एवं प्याकेजिङ सहित)
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              खोजिएको शब्दसँग मिल्ने सामग्री फेला परेन।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredItems.map((item, idx) => {
                // Split by '-' or '–' to highlight quantity if present
                const parts = item.split(/[-–:]/);
                const rawName = parts[0]?.trim() || item;
                const itemQty = parts[1]?.trim() || '';

                // Parse bracketed description e.g. "मौली धागो (रातो र पहेँलो धागो)"
                const parenMatch = rawName.match(/^(.*?)\s*\((.*?)\)$/);
                const mainName = parenMatch ? parenMatch[1].trim() : rawName;
                const subDetail = parenMatch ? parenMatch[2].trim() : '';
                const itemIcon = getItemIcon(mainName + ' ' + subDetail);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold font-mono flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/50 shadow-2xs">
                        {toDevanagariNumerals(idx + 1)}
                      </span>
                      <span className="text-base select-none shrink-0" title={mainName}>
                        {itemIcon}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 block truncate group-hover:text-amber-700 dark:group-hover:text-amber-400">
                          {mainName}
                        </span>
                        {subDetail && (
                          <span className="text-[11px] font-medium text-amber-900/70 dark:text-amber-300/70 block truncate">
                            ({subDetail})
                          </span>
                        )}
                      </div>
                    </div>

                    {itemQty ? (
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1 rounded-xl shrink-0 shadow-2xs">
                        {itemQty}
                      </span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Shastriya Note with Official Contact */}
          <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800/80 dark:to-stone-800/40 rounded-2xl border border-amber-300/60 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div>
              <strong>शास्त्रीय विधि:</strong> यो प्याकेज सनातन वैदिक परम्परा, कर्मकाण्ड पद्धति र नेपालका प्रसिद्ध पण्डितहरूको परामर्श अनुसार १००% शुद्ध सामग्री सहित तयार गरिएको हो।
            </div>
            <a
              href="tel:97674244778"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold font-mono text-xs shrink-0 shadow-xs transition-colors"
            >
              <span>📞 सम्पर्क: ९७६७४२४४७७८</span>
            </a>
          </div>
        </div>

        {/* 4. Bottom Action Footer */}
        <div className="p-4 bg-white dark:bg-stone-900 border-t border-[#E6E0D5] dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400">कुल प्याकेज मूल्य:</span>
            <span className="text-xl font-extrabold text-[#D97706] dark:text-amber-400 font-mono">
              रु. {(product.discountPrice || product.sellingPrice).toLocaleString('ne-NP')}
            </span>
            {product.discountPrice && product.discountPrice < product.sellingPrice && (
              <span className="text-xs text-stone-400 line-through font-mono">
                रु. {product.sellingPrice.toLocaleString('ne-NP')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onAddToCart(product, 1);
                onClose();
              }}
              disabled={product.stockQuantity <= 0}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-stone-800 text-[#D97706] dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>कार्टमा थप्नुहोस् (Add to Cart)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBuyNow(product, 1);
                onClose();
              }}
              disabled={product.stockQuantity <= 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-[#D97706] text-white hover:bg-[#B45309] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>अहिले किन्नुहोस् (Buy Now)</span>
            </button>
          </div>
        </div>

        {/* 5. Poster Zoom Lightbox Modal */}
        {showPosterZoom && product.imageUrl && (
          <div 
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
            onClick={() => setShowPosterZoom(false)}
          >
            <div 
              className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/50 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-stone-950/80 px-4 py-3 flex items-center justify-between border-b border-stone-800 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-sm">🖼️ {product.nameNepali} – HD आधिकारिक पोस्टर</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={product.imageUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    डाउनलोड / नयाँ ट्याब
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowPosterZoom(false)}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-auto flex-1 p-2 sm:p-4 flex items-center justify-center bg-stone-950">
                <img
                  src={product.imageUrl}
                  alt={product.nameNepali}
                  className="max-h-[80vh] w-auto object-contain rounded-xl shadow-lg border border-amber-500/30"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
