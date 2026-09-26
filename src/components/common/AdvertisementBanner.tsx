import React, { useState } from 'react';
import { Megaphone, Phone, MessageCircle, Mail, Sparkles, X } from 'lucide-react';

interface AdvertisementBannerProps {
  contactPhone?: string;
  contactEmail?: string;
}

export const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  contactPhone = '९७६४४००५३३',
  contactEmail = 'suwashdmk@gmail.com'
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const rawPhone = contactPhone.replace(/[^0-9+]/g, '') || '9764400533';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=977${rawPhone.replace(/^(\+?977)/, '')}&text=${encodeURIComponent('नमस्ते, म बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग प्रणालीमा विज्ञापन प्रकाशन तथा प्रायोजन सम्बन्धी जानकारी लिन चाहन्छु।')}`;

  if (isDismissed) {
    return (
      <div className="no-print mb-4 flex items-center justify-between px-3.5 py-1.5 bg-amber-500/10 dark:bg-stone-900/80 border border-amber-400/40 dark:border-amber-700/40 rounded-xl text-xs text-amber-950 dark:text-amber-200 transition-all">
        <div className="flex items-center gap-2">
          <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
          <span className="font-bold">विज्ञापनको लागि सम्पर्क : {contactPhone}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${rawPhone}`}
            className="px-2.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition-colors"
          >
            कल गर्नुहोस्
          </a>
          <button
            onClick={() => setIsDismissed(false)}
            className="text-[11px] text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline cursor-pointer"
          >
            विस्तार
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="विज्ञापन तथा प्रायोजन ब्यानर"
      className="no-print mb-5 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1C140E] via-[#2D1B0F] to-[#120B06] border-2 border-amber-500/50 dark:border-amber-600/40 text-white shadow-md transition-all"
    >
      {/* Background ambient glow & pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Section: Megaphone Icon & Text */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 flex items-center justify-center text-stone-950 font-black shrink-0 shadow-lg ring-2 ring-amber-400/40 relative mt-0.5 sm:mt-0">
            <Megaphone className="w-6 h-6 text-stone-950 animate-bounce" />
            <div className="absolute -bottom-1 -right-1 bg-amber-300 text-stone-950 p-0.5 rounded-full ring-2 ring-stone-900">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>व्यावसायिक विज्ञापन तथा प्रायोजन</span>
              </span>
              <span className="text-[11px] text-amber-200/70 hidden sm:inline">• बालानन्द ज्योतिष तथा पञ्चाङ्ग सेवा</span>
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-bold font-serif text-amber-100 flex flex-wrap items-center gap-1.5 tracking-wide">
              <span>विज्ञापनको लागि सम्पर्क :</span>
              <a
                href={`tel:${rawPhone}`}
                className="text-amber-300 hover:text-amber-200 underline decoration-amber-400/60 font-black tracking-wider transition-colors"
              >
                {contactPhone}
              </a>
            </h2>

            <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
              यस लोकप्रिय नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग पोर्टलमा तपाईंको संस्था, व्यवसाय, धार्मिक अनुष्ठान वा सेवाको विज्ञापन प्रकाशन गरी लाखौँ श्रद्धालु तथा ज्योतिष प्रेमीहरूमाझ पुग्नुहोस्।
            </p>
          </div>
        </div>

        {/* Right Section: Contact CTAs & Dismiss */}
        <div className="flex flex-wrap sm:flex-nowrap md:flex-col lg:flex-row items-center gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href={`tel:${rawPhone}`}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            title="सिधै फोन कल गर्नुहोस्"
          >
            <Phone className="w-4 h-4 text-stone-950" />
            <span>{contactPhone}</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-400/30"
            title="WhatsApp मा कुराकानी सुरु गर्नुहोस्"
          >
            <MessageCircle className="w-4 h-4 text-emerald-200" />
            <span>WhatsApp च्याट</span>
          </a>

          <a
            href={`mailto:${contactEmail}?subject=${encodeURIComponent('विज्ञापन प्रकाशन सम्बन्धी सोधपुछ')}&body=${encodeURIComponent('नमस्ते, म बालानन्द पञ्चाङ्ग पोर्टलमा विज्ञापन प्रकाशन सम्बन्धी सोधपुछ गर्न चाहन्छु।')}`}
            className="hidden lg:flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-800/80 hover:bg-stone-700/80 text-amber-200 border border-stone-700 text-xs rounded-xl font-semibold transition-colors cursor-pointer"
            title="ईमेल पठाउनुहोस्"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>ईमेल</span>
          </a>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-auto md:ml-0"
            title="ब्यानर हटाउनुहोस् / बन्द गर्नुहोस्"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
