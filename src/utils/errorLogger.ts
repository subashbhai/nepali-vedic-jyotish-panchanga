import { toDevanagariNumerals } from './nepaliCalendar';

export const ERROR_LOG_STORAGE_KEY = 'error-log';
const MAX_LOG_ENTRIES = 50;

export interface AppStateContext {
  url?: string;
  routeHash?: string;
  activeTab?: string;
  activeModule?: string;
  activePatrikaSubTab?: string;
  profileId?: string;
  profileName?: string;
  profileDateBS?: string;
  profileTime?: string;
  profileLocation?: string;
  viewport?: { width: number; height: number };
  userAgent?: string;
  online?: boolean;
  screenOrientation?: string;
  custom?: Record<string, unknown>;
}

export interface ErrorLogEntry {
  id: string;
  timestamp: string; // ISO format
  timestampFormatted: string; // readable date & time
  timestampNepali: string;
  source: 'PatrikaErrorBoundary' | 'GlobalWindowError' | 'UnhandledPromiseRejection' | 'ManualReport' | string;
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  appStateContext?: AppStateContext;
}

// Registry for dynamic app state getters
let appContextGetter: (() => Partial<AppStateContext>) | null = null;

export function setAppContextGetter(getter: (() => Partial<AppStateContext>) | null) {
  appContextGetter = getter;
}

/**
 * Gathers current application state context safely
 */
export function getCurrentAppStateContext(customContext?: Record<string, unknown>): AppStateContext {
  const context: AppStateContext = {
    url: typeof window !== 'undefined' ? window.location.href : '',
    routeHash: typeof window !== 'undefined' ? window.location.hash : '',
    viewport: typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : undefined,
    userAgent: typeof window !== 'undefined' && window.navigator ? window.navigator.userAgent : '',
    online: typeof window !== 'undefined' && window.navigator ? window.navigator.onLine : true,
    screenOrientation: typeof window !== 'undefined' && window.screen?.orientation ? window.screen.orientation.type : undefined,
  };

  if (appContextGetter) {
    try {
      const dynamicCtx = appContextGetter();
      Object.assign(context, dynamicCtx);
    } catch (e) {
      console.warn('Error evaluating appContextGetter:', e);
    }
  }

  if (customContext) {
    context.custom = {
      ...(context.custom || {}),
      ...customContext,
    };
  }

  return context;
}

/**
 * Retrieve all error logs from the dedicated 'error-log' localStorage key
 */
export function getErrorLogs(): ErrorLogEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(ERROR_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse error-log from localStorage:', err);
    return [];
  }
}

/**
 * Save an error log entry into the dedicated 'error-log' key
 */
export function logError(
  error: unknown,
  options?: {
    componentStack?: string;
    source?: string;
    context?: Record<string, unknown>;
  }
): ErrorLogEntry {
  const now = new Date();
  const id = `err_${now.getTime()}_${Math.random().toString(36).substring(2, 8)}`;

  let name = 'Error';
  let message = 'Unknown application error occurred';
  let stack: string | undefined;

  if (error instanceof Error) {
    name = error.name || 'Error';
    message = error.message || String(error);
    stack = error.stack;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    name = String(errObj.name || 'Error');
    message = String(errObj.message || JSON.stringify(error));
    if (typeof errObj.stack === 'string') {
      stack = errObj.stack;
    }
  }

  const appStateContext = getCurrentAppStateContext(options?.context);

  const formattedTime = now.toLocaleTimeString('ne-NP', { hour12: false });
  const formattedDate = now.toISOString().split('T')[0];
  const nepaliTimestamp = `${toDevanagariNumerals(formattedDate)} ${toDevanagariNumerals(formattedTime)}`;

  const newEntry: ErrorLogEntry = {
    id,
    timestamp: now.toISOString(),
    timestampFormatted: `${formattedDate} ${formattedTime}`,
    timestampNepali: nepaliTimestamp,
    source: options?.source || 'ManualReport',
    name,
    message,
    stack,
    componentStack: options?.componentStack,
    appStateContext,
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = getErrorLogs();
      // Deduplicate identical errors occurring within 1 second
      const isDuplicate = existing.length > 0 &&
        existing[0].message === newEntry.message &&
        existing[0].source === newEntry.source &&
        (now.getTime() - new Date(existing[0].timestamp).getTime() < 1000);

      if (!isDuplicate) {
        const updated = [newEntry, ...existing].slice(0, MAX_LOG_ENTRIES);
        window.localStorage.setItem(ERROR_LOG_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('error-log-updated', { detail: { entry: newEntry, totalCount: updated.length } }));
      }
    }
  } catch (storageErr) {
    console.warn('Failed to write to error-log key in localStorage:', storageErr);
  }

  return newEntry;
}

/**
 * Clear the dedicated 'error-log' localStorage key
 */
export function clearErrorLogs(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(ERROR_LOG_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('error-log-updated', { detail: { totalCount: 0 } }));
  } catch (err) {
    console.warn('Failed to clear error-log:', err);
  }
}

/**
 * Clears persistent error states across the app:
 * 1. The dedicated 'error-log' key
 * 2. Transient astro/calculation caches that may have cached erroneous data
 * 3. Any corrupted active session / preview states
 */
export function clearPersistentErrorStates(options?: {
  keepLogs?: boolean;
  clearSessionStorage?: boolean;
}): { clearedKeys: string[]; success: boolean } {
  const clearedKeys: string[] = [];

  if (typeof window === 'undefined') {
    return { clearedKeys: [], success: true };
  }

  try {
    // 1. Clear error-log if not keeping logs
    if (!options?.keepLogs && window.localStorage) {
      window.localStorage.removeItem(ERROR_LOG_STORAGE_KEY);
      clearedKeys.push(ERROR_LOG_STORAGE_KEY);
    }

    // 2. Clear known transient error or calculation cache keys in localStorage
    const transientErrorKeys = [
      'sukdev_astro_cache',
      'sukdev_transient_error',
      'sukdev_last_crash',
      'nepali_astro_temp_state'
    ];

    if (window.localStorage) {
      transientErrorKeys.forEach((key) => {
        if (window.localStorage.getItem(key) !== null) {
          window.localStorage.removeItem(key);
          clearedKeys.push(key);
        }
      });
    }

    // 3. Clear sessionStorage if requested or available (for temporary crash states)
    if (options?.clearSessionStorage !== false && typeof window.sessionStorage !== 'undefined') {
      try {
        window.sessionStorage.clear();
        clearedKeys.push('sessionStorage');
      } catch (e) {
        console.warn('Could not clear sessionStorage:', e);
      }
    }

    // 4. Dispatch custom event so listeners can reset their UI or error boundaries
    window.dispatchEvent(new CustomEvent('persistent-error-state-cleared', {
      detail: { clearedKeys, timestamp: new Date().toISOString() }
    }));
    window.dispatchEvent(new CustomEvent('error-log-updated', {
      detail: { totalCount: options?.keepLogs ? getErrorLogs().length : 0 }
    }));

    return { clearedKeys, success: true };
  } catch (err) {
    console.error('Error in clearPersistentErrorStates:', err);
    return { clearedKeys, success: false };
  }
}

/**
 * Formats all error logs as a downloadable or exportable JSON string
 */
export function exportErrorLogsAsJson(): string {
  const logs = getErrorLogs();
  return JSON.stringify(logs, null, 2);
}

/**
 * Formats all error logs into human-readable text for quick copy/sharing
 */
export function exportErrorLogsAsFormattedText(): string {
  const logs = getErrorLogs();
  if (logs.length === 0) {
    return 'कुनै त्रुटि लग फेला परेन (No error logs found).';
  }

  return logs.map((l, i) => {
    const ctx = l.appStateContext;
    return `=== [${i + 1}] त्रुटि: ${l.name} ===
समय: ${l.timestampFormatted} (${l.timestampNepali})
स्रोत: ${l.source}
सन्देश: ${l.message}
एप सन्दर्भ:
  - सक्रिय ट्याब: ${ctx?.activeTab || 'N/A'}
  - मोड्युल: ${ctx?.activeModule || 'N/A'}
  - उप-ट्याब: ${ctx?.activePatrikaSubTab || 'N/A'}
  - जातक ID: ${ctx?.profileId || 'N/A'} (${ctx?.profileName || 'N/A'})
  - URL: ${ctx?.url || 'N/A'}
स्ट्याक ट्रेस:
${l.stack || 'No JS stack available'}
कम्पोनेन्ट स्ट्याक:
${l.componentStack || 'No React component stack'}
--------------------------------------------------`;
  }).join('\n\n');
}

/**
 * Initializes global error and unhandled rejection listeners
 */
let isGlobalLoggingInitialized = false;

export function initGlobalErrorLogging(): () => void {
  if (typeof window === 'undefined' || isGlobalLoggingInitialized) {
    return () => {};
  }

  isGlobalLoggingInitialized = true;

  const handleGlobalError = (event: ErrorEvent) => {
    try {
      // Ignore benign Vite HMR websocket errors as per environment instructions
      if (
        event.message?.includes('failed to connect to websocket') ||
        event.message?.includes('[vite]') ||
        event.filename?.includes('vite')
      ) {
        return;
      }

      logError(event.error || event.message, {
        source: 'GlobalWindowError',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    } catch (e) {
      console.warn('Failed in global error handler:', e);
    }
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    try {
      const reason = event.reason;
      // Filter out benign Vite HMR rejections
      if (typeof reason === 'string' && reason.includes('websocket')) {
        return;
      }

      logError(reason, {
        source: 'UnhandledPromiseRejection',
      });
    } catch (e) {
      console.warn('Failed in unhandled rejection handler:', e);
    }
  };

  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  return () => {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    isGlobalLoggingInitialized = false;
  };
}

/**
 * Hook or helper to subscribe to error log updates
 */
export function subscribeToErrorLogs(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => {
    callback();
  };

  window.addEventListener('error-log-updated', handler);
  window.addEventListener('persistent-error-state-cleared', handler);
  window.addEventListener('storage', (e) => {
    if (e.key === ERROR_LOG_STORAGE_KEY) {
      callback();
    }
  });

  return () => {
    window.removeEventListener('error-log-updated', handler);
    window.removeEventListener('persistent-error-state-cleared', handler);
  };
}
