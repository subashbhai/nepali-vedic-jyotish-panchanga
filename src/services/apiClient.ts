/**
 * Centralized Authoritative API Client
 * बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा
 * 
 * Provides unified, resilient HTTP communication across:
 * - Web Browser (Production & Dev)
 * - Android Capacitor Shell
 * - Windows Desktop Electron Shell
 * - Node.js Automated Test Runners
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
  [key: string]: any;
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  skipAuth?: boolean;
  queueOffline?: boolean;
}

export interface QueuedOfflineRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  queuedAtISO: string;
}

const STORAGE_KEY_OFFLINE_QUEUE = 'balananda_offline_api_queue_v1';

class ApiClient {
  private customBaseUrl: string = '';
  private isDrainingQueue = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.drainOfflineQueue();
      });
    }
  }

  /**
   * Set an explicit base URL (e.g. for Android Capacitor, tests, or remote backends)
   */
  public setBaseUrl(url: string): void {
    this.customBaseUrl = url.replace(/\/+$/, '');
  }

  /**
   * Get the active authoritative base URL
   */
  public getBaseUrl(): string {
    if (this.customBaseUrl) return this.customBaseUrl;

    if (typeof window !== 'undefined') {
      // 1. Check Vite environment variable FIRST (authoritative for production builds)
      try {
        const envUrl = (import.meta as any)?.env?.VITE_API_URL;
        if (envUrl && typeof envUrl === 'string' && envUrl.trim() && !envUrl.includes('YOUR-DEPLOYED-API-DOMAIN')) {
          return envUrl.trim().replace(/\/+$/, '');
        }
      } catch {}

      // 2. Check local storage for explicitly configured backend URL
      try {
        const stored = localStorage.getItem('balananda_backend_url') || localStorage.getItem('balananda_api_base_url');
        if (stored && stored.trim() && !stored.includes('YOUR-DEPLOYED-API-DOMAIN')) {
          return stored.trim().replace(/\/+$/, '');
        }
      } catch {}

      // 3. Static Hosting Detection (GitHub Pages, Firebase Hosting)
      // Platforms like *.github.io, *.web.app, and *.firebaseapp.com are static CDN hosts.
      // If no explicit remote backend URL is configured, do not attempt relative /api calls
      // that fail with 404 or mixed-content browser rejections.
      const host = window.location.hostname || '';
      const isStaticHost = Boolean(
        host.endsWith('github.io') ||
        host.includes('github.io') ||
        host.endsWith('web.app') ||
        host.includes('web.app') ||
        host.endsWith('firebaseapp.com') ||
        host.includes('firebaseapp.com')
      );
      if (isStaticHost) {
        // Authoritative fallback to live Render backend for Firebase & GitHub Pages
        return 'https://balananda-api.onrender.com';
      }

      // 4. Standard window origin if not static CDN
      const origin = window.location.origin;
      if (origin && origin !== 'null' && origin.startsWith('http')) {
        return origin;
      }
    }

    if (typeof process !== 'undefined' && process.env?.PORT) {
      return `http://localhost:${process.env.PORT}`;
    }

    return 'http://localhost:3000';
  }

  /**
   * Check if running on static hosting without a connected backend
   */
  public isStaticHosting(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname || '';
    const isStaticHost = Boolean(
      host.endsWith('github.io') ||
      host.includes('github.io') ||
      host.endsWith('web.app') ||
      host.includes('web.app') ||
      host.endsWith('firebaseapp.com') ||
      host.includes('firebaseapp.com')
    );
    const hasConfiguredBackend = Boolean(
      localStorage.getItem('balananda_backend_url') ||
      localStorage.getItem('balananda_api_base_url') ||
      (import.meta as any)?.env?.VITE_API_URL
    );
    return isStaticHost && !hasConfiguredBackend;
  }

  /**
   * Check if running in local development mode
   */
  public isDevelopment(): boolean {
    if (typeof window === 'undefined') {
      return process.env.NODE_ENV !== 'production';
    }
    const host = window.location.hostname || '';
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.startsWith('192.168.');
    const isDevEnv = Boolean((import.meta as any)?.env?.DEV);
    return isLocal || isDevEnv;
  }

  /**
   * Check if running on production (e.g. Firebase Hosting, production web domain)
   */
  public isProduction(): boolean {
    return !this.isDevelopment();
  }

  /**
   * Resolve an endpoint to a fully-qualified URL
   */
  public resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const base = this.getBaseUrl();
    return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
  }

  /**
   * Construct standard headers with active session & superadmin tokens
   */
  public getHeaders(customHeaders: HeadersInit = {}, skipAuth: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (typeof window !== 'undefined' && !skipAuth) {
      try {
        // 1. SuperAdmin session token (cryptographically verified from login)
        const superToken = localStorage.getItem('balananda_superadmin_jwt_v2') ||
          localStorage.getItem('balananda_superadmin_auth_token') ||
          localStorage.getItem('superadmin_token') ||
          (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('superadmin_token') : null);
        if (superToken && superToken !== 'SUPERADMIN' && superToken !== 'SUPER_ADMIN') {
          headers['Authorization'] = `Bearer ${superToken}`;
        }

        // 2. SuperAdmin secure session state
        const adminRaw = localStorage.getItem('balananda_superadmin_secure_session_v2') ||
          localStorage.getItem('balananda_admin_active_session_v1');
        if (adminRaw) {
          try {
            const admin = JSON.parse(adminRaw);
            if ((admin?.role === 'super_admin' || admin?.role === 'SUPER_ADMIN') && admin.token && admin.token !== 'SUPERADMIN') {
              if (!headers['Authorization']) {
                headers['Authorization'] = `Bearer ${admin.token}`;
              }
            }
          } catch {}
        }

        // 3. User session token if no superadmin authorization
        if (!headers['Authorization']) {
          const userSessionRaw = localStorage.getItem('balananda_rbac_active_session_v1') ||
            localStorage.getItem('balananda_rbac_session_v2') ||
            localStorage.getItem('balananda_user_session_token');
          if (userSessionRaw) {
            try {
              const sess = JSON.parse(userSessionRaw);
              if (sess?.token) {
                headers['Authorization'] = `Bearer ${sess.token}`;
              }
            } catch {
              // Raw token string
              if (typeof userSessionRaw === 'string' && userSessionRaw.length > 10) {
                headers['Authorization'] = `Bearer ${userSessionRaw}`;
              }
            }
          }
        }
      } catch {}
    }

    // Merge custom headers
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((val, key) => {
        headers[key] = val;
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, val]) => {
        headers[key] = val;
      });
    } else if (customHeaders && typeof customHeaders === 'object') {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Unified Request Execution with Timeout, Retry, and Fine-Grained Error Classification
   */
  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // 1. Check for invalid endpoint
    if (!endpoint || typeof endpoint !== 'string') {
      return {
        success: false,
        statusCode: 400,
        diagnosticCode: 'ERR_INVALID_URL',
        error: 'अमान्य API URL (Invalid URL): ब्याकइन्ड ठेगाना अमान्य वा अधुरो छ।',
        message: 'अमान्य API URL (Invalid URL): ब्याकइन्ड ठेगाना अमान्य वा अधुरो छ।'
      };
    }

    const url = this.resolveUrl(endpoint);
    const method = (options.method || 'GET').toUpperCase();
    const timeoutMs = options.timeoutMs ?? 10000;
    const maxRetries = options.retries ?? (method === 'GET' ? 2 : 0);
    const skipAuth = Boolean(options.skipAuth);

    // 2. Detect missing API URL on static hosting BEFORE network failure
    if (this.isStaticHosting() && !url.startsWith('http')) {
      return {
        success: false,
        statusCode: 404,
        isStaticRewriteError: true,
        diagnosticCode: 'ERR_MISSING_API_URL',
        attemptedUrl: url,
        error: 'केन्द्रीय ब्याकइन्ड API कन्फिगर गरिएको छैन (Missing API URL): यो वेबसाइट स्ट्याटिक CDN मा चलिरहेको छ। केन्द्रीय डाटाबेससँग जडान गर्न कृपया मान्य ब्याकइन्ड URL (VITE_API_URL) प्रदान गर्नुहोस्।',
        message: 'केन्द्रीय ब्याकइन्ड सर्भर फेला परेन। कृपया मान्य ब्याकइन्ड API URL कन्फिगर गर्नुहोस्।'
      };
    }

    const headers = this.getHeaders(options.headers, skipAuth);

    let attempt = 0;
    while (attempt <= maxRetries) {
      attempt++;
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

      try {
        const fetchOptions: RequestInit = {
          ...options,
          method,
          headers,
          signal: controller ? controller.signal : undefined
        };

        const response = await fetch(url, fetchOptions);
        if (timeoutId) clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type') || '';
        let payload: any = null;

        if (contentType.includes('application/json')) {
          payload = await response.json();
        } else {
          const text = await response.text();
          // Detect static CDN/Firebase Hosting single-page-app HTML rewrites (index.html returned with 200 OK)
          if (text.trim().startsWith('<!DOCTYPE') || text.includes('<html') || text.includes('<div id="root"')) {
            return {
              success: false,
              statusCode: 404,
              isStaticRewriteError: true,
              diagnosticCode: 'ERR_MISSING_API_URL_HTML_REWRITE',
              attemptedUrl: url,
              error: 'केन्द्रीय ब्याकइन्ड सर्भर फेला परेन (Static Hosting Rewrite Detected)। कृपया ब्याकइन्ड सर्भर चालु गर्नुहोस् वा VITE_API_URL कन्फिगर गर्नुहोस्।',
              message: 'केन्द्रीय ब्याकइन्ड सर्भर फेला परेन। कृपया मान्य ब्याकइन्ड API URL कन्फिगर गर्नुहोस्।'
            };
          }
          try {
            payload = JSON.parse(text);
          } catch {
            payload = { text };
          }
        }

        if (!response.ok) {
          let errorMsg = payload?.error || payload?.message;
          let diagCode = `HTTP_${response.status}`;

          if (response.status === 404) {
            diagCode = 'ERR_HTTP_404';
            errorMsg = errorMsg || 'अनुरोध गरिएको API सेवा फेला परेन (HTTP 404 Not Found)।';
          } else if (response.status === 401) {
            diagCode = 'ERR_HTTP_401';
            errorMsg = errorMsg || 'प्रमाणीकरण आवश्यक छ वा सत्र समाप्त भएको छ (HTTP 401 Unauthorized)।';
          } else if (response.status === 403) {
            diagCode = 'ERR_HTTP_403';
            errorMsg = errorMsg || 'यो कार्य गर्न अनुमति छैन (HTTP 403 Forbidden)।';
          } else if (response.status === 405) {
            diagCode = 'ERR_HTTP_405';
            errorMsg = errorMsg || 'सर्भर अनुरोध असफल भयो (HTTP 405 Method Not Allowed): स्ट्याटिक होस्टिङमा ब्याकइन्ड सर्भर उपलब्ध छैन।';
          } else if (response.status === 503) {
            diagCode = 'ERR_DATABASE_UNAVAILABLE';
            errorMsg = errorMsg || 'केन्द्रीय डाटाबेस वा सर्भर सेवा अस्थायी रूपमा उपलब्ध छैन (503 Service Unavailable / Database Down)।';
          } else if (response.status === 500) {
            diagCode = 'ERR_HTTP_500';
            errorMsg = errorMsg || `सर्भरमा आन्तरिक समस्या आयो (HTTP 500 Internal Server Error)।`;
          } else if (!errorMsg) {
            errorMsg = `सर्भर अनुरोध असफल भयो (${response.status})`;
          }

          return {
            success: false,
            statusCode: response.status,
            diagnosticCode: diagCode,
            error: errorMsg,
            message: errorMsg,
            data: payload,
            ...payload
          };
        }

        if (payload && typeof payload === 'object') {
          return {
            success: payload.success !== undefined ? payload.success : true,
            statusCode: response.status,
            data: payload.data !== undefined ? payload.data : payload,
            ...payload
          };
        }

        return {
          success: true,
          statusCode: response.status,
          data: payload
        };
      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId);

        const isLastAttempt = attempt > maxRetries;
        if (!isLastAttempt) {
          // Exponential backoff
          await new Promise((r) => setTimeout(r, Math.min(1000 * Math.pow(2, attempt - 1), 3000)));
          continue;
        }

        // If offline and request is queueable, save to offline queue
        if (options.queueOffline && method !== 'GET') {
          this.enqueueOfflineRequest({
            id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            url,
            method,
            headers,
            body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
            queuedAtISO: new Date().toISOString()
          });
        }

        const isTimeout = err?.name === 'AbortError';
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
        const isFetchFailed = err?.message?.includes('Failed to fetch') || err?.name === 'TypeError';
        
        let diagnosticCode = 'ERR_NETWORK';
        let friendlyError = '';

        if (isTimeout) {
          diagnosticCode = 'ERR_TIMEOUT';
          friendlyError = 'सर्भरले समयमा प्रतिक्रिया दिएन (अनुरोध समय समाप्त - Timeout)। कृपया पुनः प्रयास गर्नुहोस्।';
        } else if (isOffline) {
          diagnosticCode = 'ERR_OFFLINE';
          friendlyError = 'इन्टरनेट जडान विच्छेद भएको छ। कृपया आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्।';
        } else if (isFetchFailed) {
          diagnosticCode = 'ERR_CONNECTION_REFUSED_OR_CORS';
          friendlyError = 'ब्याकइन्ड सर्भरसँग सम्पर्क हुन सकेन (जडान विफलता वा CORS अस्वीकार)। कृपया ब्याकइन्ड चालु रहेको र CORS अनुमति दिइएको सुनिश्चित गर्नुहोस्।';
        } else {
          diagnosticCode = 'ERR_UNKNOWN_NETWORK';
          friendlyError = err?.message || 'नेटवर्क जडानमा समस्या भयो। कृपया इन्टरनेट जाँच गर्नुहोस्।';
        }

        return {
          success: false,
          isNetworkError: true,
          statusCode: isTimeout ? 408 : 0,
          diagnosticCode,
          attemptedUrl: url,
          error: friendlyError,
          message: friendlyError
        };
      }
    }

    return {
      success: false,
      error: 'अनुरोध सम्पन्न हुन सकेन।'
    };
  }

  // HTTP Helper Methods
  public get<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    const fetchBody = body !== undefined && typeof body !== 'string' ? JSON.stringify(body) : body;
    return this.request<T>(endpoint, { ...options, method: 'POST', body: fetchBody });
  }

  public put<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    const fetchBody = body !== undefined && typeof body !== 'string' ? JSON.stringify(body) : body;
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: fetchBody });
  }

  public patch<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    const fetchBody = body !== undefined && typeof body !== 'string' ? JSON.stringify(body) : body;
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: fetchBody });
  }

  public delete<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Offline Queue Management
  public queueOfflineRequest(url: string, method: string, headers: Record<string, string> = {}, body?: string): void {
    const item: QueuedOfflineRequest = {
      id: `off_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      url,
      method,
      headers,
      body,
      queuedAtISO: new Date().toISOString()
    };
    this.enqueueOfflineRequest(item);
  }

  public enqueueOfflineRequest(item: QueuedOfflineRequest): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
      const queue: QueuedOfflineRequest[] = raw ? JSON.parse(raw) : [];
      queue.push(item);
      localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue.slice(-50)));
      window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: { count: queue.length } }));
    } catch {}
  }

  public async drainOfflineQueue(): Promise<void> {
    if (typeof window === 'undefined' || this.isDrainingQueue) return;
    this.isDrainingQueue = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
      if (!raw) return;
      const queue: QueuedOfflineRequest[] = JSON.parse(raw);
      if (!Array.isArray(queue) || queue.length === 0) return;

      const remaining: QueuedOfflineRequest[] = [];

      for (const req of queue) {
        try {
          const res = await fetch(req.url, {
            method: req.method,
            headers: req.headers,
            body: req.body
          });
          if (!res.ok && res.status >= 500) {
            remaining.push(req);
          }
        } catch {
          remaining.push(req);
        }
      }

      localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(remaining));
      window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: { count: remaining.length } }));
    } catch {} finally {
      this.isDrainingQueue = false;
    }
  }

  public getOfflineQueueCount(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
      return raw ? JSON.parse(raw).length : 0;
    } catch {
      return 0;
    }
  }
}

export const apiClient = new ApiClient();
