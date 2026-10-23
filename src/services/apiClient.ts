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
      // 1. Check local storage for explicitly configured backend URL
      try {
        const stored = localStorage.getItem('balananda_backend_url') || localStorage.getItem('balananda_api_base_url');
        if (stored && stored.trim()) {
          return stored.trim().replace(/\/+$/, '');
        }
      } catch {}

      // 2. Check Vite environment variable
      try {
        const envUrl = (import.meta as any)?.env?.VITE_API_URL;
        if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
          return envUrl.trim().replace(/\/+$/, '');
        }
      } catch {}

      // 3. GitHub Pages detection: GitHub Pages (*.github.io) is a static hosting platform.
      // It has no Express backend and strictly rejects POST requests with HTTP 405.
      // Default to http://localhost:3000 so local server development/testing works without 405!
      if (window.location.hostname && (window.location.hostname.endsWith('github.io') || window.location.hostname.includes('github.io'))) {
        return 'http://localhost:3000';
      }

      // 4. Standard window origin if not static github.io
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
        // 1. SuperAdmin token
        const superToken = localStorage.getItem('balananda_superadmin_auth_token');
        if (superToken) {
          headers['Authorization'] = `Bearer ${superToken}`;
        }

        // 2. SuperAdmin role secret header
        const adminRaw = localStorage.getItem('balananda_admin_active_session_v1');
        if (adminRaw) {
          const admin = JSON.parse(adminRaw);
          if (admin?.role === 'super_admin' || admin?.role === 'SUPER_ADMIN') {
            headers['x-superadmin-token'] = 'SUPER_ADMIN';
          }
        }

        // 3. User session token if no superadmin authorization
        if (!headers['Authorization']) {
          const userSessionRaw = localStorage.getItem('balananda_rbac_active_session_v1') || localStorage.getItem('balananda_rbac_session_v2');
          if (userSessionRaw) {
            const sess = JSON.parse(userSessionRaw);
            if (sess?.token) {
              headers['Authorization'] = `Bearer ${sess.token}`;
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
   * Unified Request Execution with Timeout, Retry, and Offline Queueing
   */
  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(endpoint);
    const method = (options.method || 'GET').toUpperCase();
    const timeoutMs = options.timeoutMs ?? 10000;
    const maxRetries = options.retries ?? (method === 'GET' ? 2 : 0);
    const skipAuth = Boolean(options.skipAuth);

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
          try {
            payload = JSON.parse(text);
          } catch {
            payload = { text };
          }
        }

        if (!response.ok) {
          let errorMsg = payload?.error || payload?.message;
          if (!errorMsg) {
            if (response.status === 405) {
              errorMsg = 'सर्भर अनुरोध असफल भयो (HTTP 405 Method Not Allowed): स्ट्याटिक होस्टिङ (जस्तै GitHub Pages) मा ब्याकइन्ड सर्भर उपलब्ध छैन। कृपया ब्याकइन्ड (http://localhost:3000) चलाउनुहोस् वा ब्याकइन्ड API URL कन्फिगर गर्नुहोस्।';
            } else {
              errorMsg = `सर्भर अनुरोध असफल भयो (${response.status})`;
            }
          }
          return {
            success: false,
            statusCode: response.status,
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
        return {
          success: false,
          error: isTimeout
            ? 'सर्भरले समयमा प्रतिक्रिया दिएन (अनुरोध समय समाप्त)। कृपया पुनः प्रयास गर्नुहोस्।'
            : (err?.message || 'नेटवर्क जडानमा समस्या भयो। कृपया इन्टरनेट जाँच गर्नुहोस्।')
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
