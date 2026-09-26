/**
 * Universal Asset URL Helper
 * Resolves static assets correctly across Web, PWA, Electron (app:// protocol),
 * and static filesystem (file://) desktop/mobile installations.
 */

export function getAssetUrl(assetPath: string): string {
  if (!assetPath) return '';

  // Remote, Data, or Blob URLs are returned as-is
  if (
    assetPath.startsWith('http://') ||
    assetPath.startsWith('https://') ||
    assetPath.startsWith('data:') ||
    assetPath.startsWith('blob:')
  ) {
    return assetPath;
  }

  // Under file:// protocol (e.g. direct HTML load or legacy mobile wrapper),
  // convert root-relative '/assets/...' into relative './assets/...'
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    const clean = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    return `./${clean}`;
  }

  return assetPath;
}

export const DEFAULT_LOGO_URL = getAssetUrl('/logo.png');
export const GANESHA_LOTUS_URL = getAssetUrl('/assets/deities/ganesha_lotus.jpg');
export const GANESHA_DEFAULT_URL = getAssetUrl('/assets/deities/ganesha.jpg');

/**
 * Robust image error handler to try fallback paths before giving up
 */
export function handleImageFallback(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrls: string[] = ['./logo.png', '/assets/logo.png', '/logo.jpg']
): void {
  const target = event.currentTarget;
  const currentStep = parseInt(target.dataset.fallbackStep || '0', 10);

  if (currentStep < fallbackUrls.length) {
    target.dataset.fallbackStep = String(currentStep + 1);
    target.src = fallbackUrls[currentStep];
  } else {
    // If all fallbacks failed, prevent broken image icon display
    target.style.opacity = '0.85';
  }
}
