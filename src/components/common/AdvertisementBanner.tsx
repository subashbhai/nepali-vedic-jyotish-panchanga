import React, { useEffect, useRef, useState } from 'react';
import { Megaphone, Phone, MessageCircle, Mail, Sparkles, X, ExternalLink } from 'lucide-react';
import { isDesktopApp } from '../../utils/appVersionManager';
import {
  AdvertisementConfig,
  getStoredAdConfig,
  AD_CONFIG_CHANGE_EVENT,
  AdThemeType
} from '../../db/advertisementStore';

/**
 * Detects if the app is running as an installed PWA (standalone mode).
 * In standalone mode, window.matchMedia('(display-mode: standalone)') returns true.
 */
function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isCapacitor = !!(window as any).Capacitor?.isNative;
  return isStandalone || isCapacitor;
}

interface AdvertisementBannerProps {
  contactPhone?: string;
  contactEmail?: string;
}

/**
 * Ensures Google AdSense script is injected with the configured Client ID.
 */
function ensureGoogleAdSenseScript(clientId: string) {
  if (typeof window === 'undefined' || !clientId) return;
  if (isDesktopApp() || isPWAInstalled()) return;

  const cleanClientId = clientId.trim();
  const existingScript = document.querySelector('script[data-adsense-injected="true"]') as HTMLScriptElement;

  if (existingScript) {
    if (existingScript.getAttribute('data-ad-client') === cleanClientId) {
      return; // Already present with matching client ID
    }
    // Updated client ID: remove stale script
    existingScript.remove();
  }

  try {
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(cleanClientId)}`;
    s.setAttribute('data-ad-client', cleanClientId);
    s.setAttribute('data-adsense-injected', 'true');
    document.head.appendChild(s);
  } catch (e) {
    console.error('Error injecting Google AdSense script:', e);
  }
}

/**
 * Smart, Flexible Google AdSense Unit:
 * - Starts completely collapsed (0px height, display: none).
 * - Leaves ZERO empty/blank space until an ad is actually returned and rendered.
 * - Detects 'filled' vs 'unfilled' status via MutationObserver & iframe detection.
 */
const SmartFlexibleAdSenseUnit: React.FC<{
  clientId: string;
  slotId?: string;
  onAdLoaded?: () => void;
  onAdUnfilled?: () => void;
}> = ({ clientId, slotId = 'auto', onAdLoaded, onAdUnfilled }) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adFilled, setAdFilled] = useState<boolean>(false);
  const [hasAttemptedPush, setHasAttemptedPush] = useState<boolean>(false);

  useEffect(() => {
    if (!clientId) return;
    ensureGoogleAdSenseScript(clientId);
  }, [clientId]);

  useEffect(() => {
    if (!clientId || typeof window === 'undefined') return;

    // Observe ad slot mutations to detect when ad has actually loaded
    const insElement = adRef.current;
    if (!insElement) return;

    let observer: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let fallbackTimeout: any = null;

    const checkFilledStatus = () => {
      if (!insElement) return;
      const status = insElement.getAttribute('data-ad-status');
      const hasIframe = insElement.querySelector('iframe');
      const height = insElement.offsetHeight || insElement.clientHeight || 0;

      if (status === 'filled' || (hasIframe && height > 20)) {
        setAdFilled(true);
        if (onAdLoaded) onAdLoaded();
      } else if (status === 'unfilled') {
        setAdFilled(false);
        if (onAdUnfilled) onAdUnfilled();
      }
    };

    try {
      observer = new MutationObserver(() => {
        checkFilledStatus();
      });
      observer.observe(insElement, {
        attributes: true,
        attributeFilter: ['data-ad-status', 'style', 'class'],
        childList: true,
        subtree: true,
      });

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          checkFilledStatus();
        });
        resizeObserver.observe(insElement);
      }
    } catch (e) {
      console.warn('AdSense observer initialization:', e);
    }

    // Push the ad to adsbygoogle
    if (!hasAttemptedPush) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setHasAttemptedPush(true);
      } catch (e) {
        // silently handle adsbygoogle error
      }
    }

    // If after 3.5 seconds no ad is filled, notify unfilled to collapse space
    fallbackTimeout = setTimeout(() => {
      checkFilledStatus();
      if (!insElement.getAttribute('data-ad-status')) {
        // No response yet, keep space clean
        if (onAdUnfilled) onAdUnfilled();
      }
    }, 3500);

    return () => {
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [clientId, hasAttemptedPush, onAdLoaded, onAdUnfilled]);

  // If not filled, keep 0 height and 0 margin (ZERO EMPTY SPACE)
  return (
    <div
      ref={containerRef}
      className="no-print w-full overflow-hidden transition-all duration-300"
      style={{
        display: adFilled ? 'block' : 'none',
        height: adFilled ? 'auto' : 0,
        marginBottom: adFilled ? '0.75rem' : 0,
        opacity: adFilled ? 1 : 0
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: adFilled ? 60 : 0 }}
        data-ad-client={clientId}
        data-ad-slot={slotId || 'auto'}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  contactPhone = '९७६४४००५३३',
  contactEmail = 'suwashdmk@gmail.com'
}) => {
  // Website मा मात्र देखाउने (Electron desktop app वा installed PWA वा APK मा नदेखाउने)
  if (isDesktopApp() || isPWAInstalled()) {
    return null;
  }

  return <AdvertisementBannerInner contactPhone={contactPhone} contactEmail={contactEmail} />;
};

/**
 * Inner component with dynamic AdSense + Custom Sponsor Ad Rendering.
 */
const AdvertisementBannerInner: React.FC<AdvertisementBannerProps> = ({
  contactPhone = '९७६४४००५३३',
  contactEmail = 'suwashdmk@gmail.com'
}) => {
  const [config, setConfig] = useState<AdvertisementConfig>(getStoredAdConfig);
  const [isDismissed, setIsDismissed] = useState(false);
  const [adsenseStatus, setAdsenseStatus] = useState<'waiting' | 'filled' | 'unfilled'>('waiting');

  useEffect(() => {
    const handleConfigUpdate = (e: any) => {
      if (e.detail) {
        setConfig(e.detail);
      } else {
        setConfig(getStoredAdConfig());
      }
    };

    window.addEventListener(AD_CONFIG_CHANGE_EVENT, handleConfigUpdate);
    window.addEventListener('storage', handleConfigUpdate);

    return () => {
      window.removeEventListener(AD_CONFIG_CHANGE_EVENT, handleConfigUpdate);
      window.removeEventListener('storage', handleConfigUpdate);
    };
  }, []);

  // If display mode is set to 'hidden', return null immediately (Zero empty space)
  if (config.displayMode === 'hidden') {
    return null;
  }

  const custom = config.customAd;
  const activePhone = custom.phone || contactPhone || '९७६४४००५३३';
  const rawPhone = activePhone.replace(/[^0-9+]/g, '') || '9764400533';
  const activeWhatsapp = custom.whatsappNumber || rawPhone;
  const rawWhatsapp = activeWhatsapp.replace(/[^0-9+]/g, '') || '9764400533';
  const activeEmail = custom.email || contactEmail || 'suwashdmk@gmail.com';

  const whatsappUrl = `https://api.whatsapp.com/send?phone=977${rawWhatsapp.replace(/^(\+?977)/, '')}&text=${encodeURIComponent(
    `नमस्ते, म बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग प्रणालीमा विज्ञापन (${custom.title || 'प्रायोजन'}) सम्बन्धी जानकारी लिन चाहन्छु।`
  )}`;

  // Determine theme styles
  const getThemeClass = (theme: AdThemeType) => {
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

  const themeStyle = getThemeClass(custom.theme || 'vedic_dark');

  // Should we render custom ad?
  // When displayMode is 'custom_ad' OR
  // When displayMode is 'adsense_flexible' and AdSense is unfilled or waiting
  const shouldRenderCustomOrBanner =
    config.displayMode === 'custom_ad' ||
    config.displayMode === 'default_banner' ||
    (config.displayMode === 'adsense_flexible' && adsenseStatus !== 'filled');

  return (
    <div className="no-print mb-4 transition-all">
      {/* ── 1. Flexible Google AdSense Unit (Only occupies space if filled) ── */}
      {config.adsense.enabled && config.adsense.clientId && config.displayMode === 'adsense_flexible' && (
        <SmartFlexibleAdSenseUnit
          clientId={config.adsense.clientId}
          slotId={config.adsense.slotId}
          onAdLoaded={() => setAdsenseStatus('filled')}
          onAdUnfilled={() => setAdsenseStatus('unfilled')}
        />
      )}

      {/* ── 2. Custom Sponsor Ad or Default Banner ── */}
      {shouldRenderCustomOrBanner && (
        <>
          {isDismissed ? (
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-amber-500/10 dark:bg-stone-900/80 border border-amber-400/40 dark:border-amber-700/40 rounded-xl text-xs text-amber-950 dark:text-amber-200 transition-all">
              <div className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span className="font-bold">
                  {custom.title ? custom.title : `विज्ञापनको लागि सम्पर्क : ${activePhone}`}
                </span>
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
          ) : custom.isImageOnly && custom.bannerImageUrl ? (
            /* Direct Image Banner */
            <aside className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 shadow-lg group">
              <a
                href={custom.websiteUrl || `tel:${rawPhone}`}
                target={custom.websiteUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="block cursor-pointer"
              >
                <img
                  src={custom.bannerImageUrl}
                  alt={custom.title || 'प्रायोजित विज्ञापन'}
                  className="w-full h-auto object-cover max-h-60 rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </a>
              <button
                onClick={() => setIsDismissed(true)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
                title="विज्ञापन हटाउनुहोस्"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </aside>
          ) : (
            /* Designed Text Banner Card (Exact match to screenshot) */
            <aside
              aria-label="विज्ञापन तथा प्रायोजन ब्यानर"
              className={`relative overflow-hidden rounded-2xl border-2 text-white shadow-xl transition-all ${themeStyle.wrapper}`}
            >
              {/* Background ambient glow & pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Left Section: Info & Text */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${themeStyle.badge}`}>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{custom.badgeText || 'व्यावसायिक विज्ञापन तथा प्रायोजन स्थान'}</span>
                    </span>
                    {custom.subBadgeText && (
                      <span className="text-[11px] text-amber-200/70 hidden sm:inline">
                        • {custom.subBadgeText}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base sm:text-lg md:text-xl font-bold font-serif text-amber-100 flex flex-wrap items-center gap-1.5 tracking-wide">
                    <span>{custom.title || `विज्ञापनको लागि सम्पर्क : ${activePhone}`}</span>
                  </h2>

                  <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
                    {custom.description ||
                      'यस लोकप्रिय नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग पोर्टलमा तपाईंको व्यवसाय, ब्रान्ड, धार्मिक संघसंस्था वा सेवाको आधिकारिक विज्ञापन तथा प्रवर्द्धन गरी लाखौँ श्रद्धालु तथा पञ्चाङ्ग प्रेमीहरूमाझ सहजै पुग्नुहोस्।'}
                  </p>

                  {/* Buttons / Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                    {activePhone && (
                      <a
                        href={`tel:${rawPhone}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                        title="सिधै फोन कल गर्नुहोस्"
                      >
                        <Phone className="w-3.5 h-3.5 text-stone-950" />
                        <span>कल गर्नुहोस् : {activePhone}</span>
                      </a>
                    )}

                    {activeWhatsapp && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-400/30"
                        title="WhatsApp मा कुराकानी सुरु गर्नुहोस्"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                        <span>WhatsApp च्याट</span>
                      </a>
                    )}

                    {activeEmail && (
                      <a
                        href={`mailto:${activeEmail}?subject=${encodeURIComponent(
                          'विज्ञापन तथा प्रायोजन सोधपुछ'
                        )}&body=${encodeURIComponent(
                          'नमस्ते, म बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग पोर्टलमा विज्ञापन प्रकाशन सम्बन्धी सोधपुछ गर्न चाहन्छु।'
                        )}`}
                        className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-700 hover:border-amber-500/50 text-xs rounded-xl font-medium transition-colors cursor-pointer"
                        title="ईमेल पठाउनुहोस्"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>{activeEmail}</span>
                      </a>
                    )}

                    {custom.websiteUrl && (
                      <a
                        href={custom.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-800/90 hover:bg-stone-700 text-amber-300 border border-amber-500/40 text-xs rounded-xl font-bold transition-colors cursor-pointer"
                        title="वेबसाइट खोल्नुहोस्"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        <span>{custom.actionButtonText || 'वेबसाइट'}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Side: Visual Badge & Logo Box (Exact match to screenshot) */}
                {custom.showSideCard && (
                  <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center shrink-0 w-full md:w-64 space-y-1.5 relative ${themeStyle.sideCard}`}>
                    <button
                      onClick={() => setIsDismissed(true)}
                      className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="ब्यानर हटाउनुहोस्"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/30">
                      {custom.sideCardBadge || 'विज्ञापन स्थान (Ad Space)'}
                    </span>

                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-400/50 flex items-center justify-center my-1 bg-amber-500/10 shadow-inner">
                      {custom.sideCardImageUrl ? (
                        <img
                          src={custom.sideCardImageUrl}
                          alt="Brand Logo"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-amber-400">ॐ</span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-amber-100 font-serif leading-tight">
                      {custom.sideCardTitle || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'}
                    </h4>
                    <p className="text-[10px] text-stone-400 leading-tight">
                      {custom.sideCardSubtitle || 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा'}
                    </p>
                    <p className="text-[9px] text-stone-500 font-mono pt-0.5">
                      सम्पर्क: {activePhone} | {activeEmail}
                    </p>
                  </div>
                )}
              </div>
            </aside>
          )}
        </>
      )}
    </div>
  );
};
