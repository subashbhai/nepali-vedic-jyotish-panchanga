/**
 * Universal Asset URL Helper
 * Resolves static assets correctly across Web, PWA, Electron (app:// protocol),
 * and static filesystem (file://) desktop/mobile installations.
 * Eliminates image blinking and flickering via embedded offline vector fallbacks
 * and user custom logo integration.
 */

import { getStoredCustomLogo } from './logoManager';

/**
 * High-definition, self-contained inline SVG Data URI for the Balananda Vedic emblem.
 * Contains sacred ॐ, golden gradient, sun rays, and Devanagari lettering.
 * Never requires network, never fails with 404, never flickers/blinks.
 */
export const BALANANDA_DEFAULT_EMBLEM_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFBEB" />
        <stop offset="60%" stop-color="#FDE68A" />
        <stop offset="85%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#D97706" />
      </radialGradient>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="50%" stop-color="#B45309" />
        <stop offset="100%" stop-color="#78350F" />
      </linearGradient>
    </defs>
    <!-- Background Circle -->
    <circle cx="100" cy="100" r="96" fill="url(#goldGlow)" stroke="url(#ringGrad)" stroke-width="4" />
    <circle cx="100" cy="100" r="88" fill="none" stroke="#D97706" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" />
    <!-- Sacred Om Motif -->
    <text x="100" y="112" font-family="'Mukta', 'Noto Sans Devanagari', 'Georgia', serif" font-size="64" font-weight="900" fill="#78350F" text-anchor="middle" dominant-baseline="central">ॐ</text>
    <!-- Top & Bottom Text Arcs -->
    <path id="topArc" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
    <text font-family="'Mukta', sans-serif" font-size="12" font-weight="bold" fill="#78350F" letter-spacing="1">
      <textPath href="#topArc" startOffset="50%" text-anchor="middle">॥ बालानन्द वैदिक सेवा ॥</textPath>
    </text>
    <path id="bottomArc" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" />
    <text font-family="'Mukta', sans-serif" font-size="11" font-weight="bold" fill="#92400E" letter-spacing="0.5">
      <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">ज्योतिष • वास्तु • कर्मकाण्ड</textPath>
    </text>
  </svg>`
)}`;

export function getAssetUrl(assetPath: string): string {
  if (!assetPath) return BALANANDA_DEFAULT_EMBLEM_SVG;

  // Remote, Data, or Blob URLs are returned as-is
  if (
    assetPath.startsWith('http://') ||
    assetPath.startsWith('https://') ||
    assetPath.startsWith('data:') ||
    assetPath.startsWith('blob:')
  ) {
    return assetPath;
  }

  // If requesting the application logo, check if user has uploaded a custom logo
  if (
    assetPath === '/logo.png' ||
    assetPath === './logo.png' ||
    assetPath === 'logo.png' ||
    assetPath === '/balananda-logo.png' ||
    assetPath.includes('logo.png')
  ) {
    const customLogo = getStoredCustomLogo();
    if (customLogo) {
      return customLogo;
    }
  }

  // Under file://, app:// (Electron scheme), capacitor://, or ionic:// protocols,
  // convert root-relative '/assets/...' into relative './assets/...'
  if (typeof window !== 'undefined' && window.location) {
    const proto = window.location.protocol;
    if (
      proto === 'file:' ||
      proto === 'app:' ||
      proto === 'capacitor:' ||
      proto === 'ionic:' ||
      window.location.origin === 'null'
    ) {
      const clean = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
      return `./${clean}`;
    }
  }

  return assetPath;
}

export const DEFAULT_LOGO_URL = getAssetUrl('/logo.png');
export const GANESHA_LOTUS_URL = getAssetUrl('/assets/deities/ganesha_lotus.jpg');
export const GANESHA_DEFAULT_URL = getAssetUrl('/assets/deities/ganesha.jpg');

/**
 * Robust image error handler that strictly breaks infinite loops and avoids flickering.
 * Unbinds `target.onerror` immediately and smoothly falls back to user custom logo or embedded SVG.
 */
export function handleImageFallback(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrls: string[] = []
): void {
  const target = event.currentTarget;
  // CRITICAL: Unbind onerror immediately to prevent ANY infinite loops or rapid blinking!
  target.onerror = null;

  // 1. If custom logo exists, try applying it first
  const custom = getStoredCustomLogo();
  if (custom && target.src !== custom) {
    target.src = custom;
    return;
  }

  // 2. Safe step resolution
  const currentStep = parseInt(target.dataset.fallbackStep || '0', 10);
  const fallbacks = fallbackUrls.length > 0 ? fallbackUrls : [
    getAssetUrl('/logo.png'),
    './logo.png',
    './assets/logo.png',
    getAssetUrl('/balananda-logo.png'),
  ];

  if (currentStep < fallbacks.length) {
    target.dataset.fallbackStep = String(currentStep + 1);
    // Attach single-shot fallback before giving up
    target.onerror = () => {
      target.onerror = null;
      target.src = BALANANDA_DEFAULT_EMBLEM_SVG;
    };
    target.src = fallbacks[currentStep];
  } else {
    // If all filesystem paths failed, switch directly to embedded SVG emblem
    target.src = BALANANDA_DEFAULT_EMBLEM_SVG;
  }
}
