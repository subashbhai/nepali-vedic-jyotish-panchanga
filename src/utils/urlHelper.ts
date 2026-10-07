/**
 * Universal App Base URL and Link Resolver
 * Correctly detects and formats URLs for GitHub Pages repository deployments,
 * custom domains, Electron/PWA installations, and local development.
 * Prevents 404 errors by guaranteeing that the repository subpath (e.g. /nepali-vedic-jyotish-panchanga/)
 * is never omitted from generated links.
 */

export const GITHUB_REPO_NAME = 'nepali-vedic-jyotish-panchanga';
export const OFFICIAL_GITHUB_PAGES_BASE = `https://subashbhai.github.io/${GITHUB_REPO_NAME}/`;

/**
 * Returns the exact absolute root URL of the running application with a trailing slash.
 * E.g.:
 * - GitHub Pages: 'https://subashbhai.github.io/nepali-vedic-jyotish-panchanga/'
 * - Localhost:    'http://localhost:5173/'
 */
export function getAppBaseUrl(): string {
  if (typeof window === 'undefined' || !window.location) {
    return OFFICIAL_GITHUB_PAGES_BASE;
  }

  const { origin, pathname, hostname } = window.location;

  // 1. Localhost or private IP testing
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return `${origin}/`;
  }

  // 2. Specific GitHub repository detection
  if (pathname.includes(`/${GITHUB_REPO_NAME}`)) {
    return `${origin}/${GITHUB_REPO_NAME}/`;
  }

  // 3. Any GitHub Pages domain (*.github.io)
  if (origin.includes('.github.io') || hostname.includes('.github.io')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0 && !parts[0].includes('.')) {
      return `${origin}/${parts[0]}/`;
    }
    // Fallback for user pages or missing pathname
    return `${origin}/${GITHUB_REPO_NAME}/`;
  }

  // 4. Custom domain or standard root deployment
  let cleanPath = pathname;
  if (cleanPath.endsWith('index.html')) {
    cleanPath = cleanPath.substring(0, cleanPath.lastIndexOf('/') + 1);
  }
  if (!cleanPath.endsWith('/')) {
    cleanPath += '/';
  }

  return `${origin}${cleanPath}`;
}

/**
 * Builds an absolute application link with optional query parameters and/or hash.
 * E.g.: buildAppLink({ search: '?magic_role=STORE_ADMIN&magic_token=...' })
 */
export function buildAppLink(options: {
  search?: string;
  hash?: string;
}): string {
  const base = getAppBaseUrl();
  let query = options.search || '';
  if (query && !query.startsWith('?') && !query.startsWith('&')) {
    query = `?${query}`;
  }

  let hash = options.hash || '';
  if (hash && !hash.startsWith('#')) {
    hash = `#${hash}`;
  }

  return `${base}${query}${hash}`;
}
