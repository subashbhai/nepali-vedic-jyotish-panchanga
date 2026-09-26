import { convertADToBS } from '../utils/nepaliCalendar';

export interface VisitorLogEntry {
  id: string;
  visitorId: string;
  platform: 'desktop' | 'mobile' | 'web';
  browser: string;
  visitedAtISO: string;
  visitedAtBS: string;
  page: string;
}

export interface VisitorAnalyticsSummary {
  totalPageViews: number;
  totalUniqueVisitors: number;
  todayCount: number;
  mobileCount: number;
  desktopCount: number;
  recentLogs: VisitorLogEntry[];
}

const STORAGE_KEY_ANALYTICS = 'balananda_visitor_analytics_v2';
const STORAGE_KEY_VISITOR_ID = 'balananda_anonymous_visitor_id_v2';

function getOrGenerateVisitorId(): string {
  if (typeof window === 'undefined') return 'visitor-server';
  try {
    let id = localStorage.getItem(STORAGE_KEY_VISITOR_ID);
    if (!id) {
      id = `VIS-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(STORAGE_KEY_VISITOR_ID, id);
    }
    return id;
  } catch {
    return `VIS-${Date.now()}`;
  }
}

function detectPlatform(): 'desktop' | 'mobile' | 'web' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua) || (window.innerWidth <= 768)) {
    return 'mobile';
  }
  if (ua.includes('electron') || ua.includes('desktop_app')) {
    return 'desktop';
  }
  return 'web';
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  return 'Browser';
}

export function recordVisitorHit(page: string = 'गृहपृष्ठ'): void {
  if (typeof window === 'undefined') return;
  try {
    const visitorId = getOrGenerateVisitorId();
    const now = new Date();
    const nowISO = now.toISOString();
    const todayStr = nowISO.split('T')[0];
    const todayBS = convertADToBS(todayStr).formattedBS;

    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    let data: {
      totalPageViews: number;
      uniqueVisitors: string[];
      logs: VisitorLogEntry[];
    } = raw ? JSON.parse(raw) : { totalPageViews: 0, uniqueVisitors: [], logs: [] };

    // Increment page views
    data.totalPageViews = (data.totalPageViews || 0) + 1;

    // Track unique visitors
    if (!data.uniqueVisitors.includes(visitorId)) {
      data.uniqueVisitors.push(visitorId);
    }

    // Add entry
    const entry: VisitorLogEntry = {
      id: `HIT-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      visitorId,
      platform: detectPlatform(),
      browser: detectBrowser(),
      visitedAtISO: nowISO,
      visitedAtBS: todayBS,
      page,
    };

    // Keep last 500 logs to avoid localStorage bloating
    data.logs = [entry, ...(data.logs || [])].slice(0, 500);

    localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(data));
  } catch (e) {
    console.error('Error recording visitor hit:', e);
  }
}

export function getVisitorAnalytics(): VisitorAnalyticsSummary {
  if (typeof window === 'undefined') {
    return {
      totalPageViews: 0,
      totalUniqueVisitors: 0,
      todayCount: 0,
      mobileCount: 0,
      desktopCount: 0,
      recentLogs: [],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    const data = raw ? JSON.parse(raw) : { totalPageViews: 0, uniqueVisitors: [], logs: [] };
    const logs: VisitorLogEntry[] = data.logs || [];
    const todayStr = new Date().toISOString().split('T')[0];

    const todayCount = logs.filter((l) => l.visitedAtISO.startsWith(todayStr)).length;
    const mobileCount = logs.filter((l) => l.platform === 'mobile').length;
    const desktopCount = logs.filter((l) => l.platform === 'desktop' || l.platform === 'web').length;

    return {
      totalPageViews: data.totalPageViews || logs.length || 1,
      totalUniqueVisitors: (data.uniqueVisitors || []).length || 1,
      todayCount: Math.max(1, todayCount),
      mobileCount,
      desktopCount,
      recentLogs: logs.slice(0, 100),
    };
  } catch {
    return {
      totalPageViews: 1,
      totalUniqueVisitors: 1,
      todayCount: 1,
      mobileCount: 0,
      desktopCount: 1,
      recentLogs: [],
    };
  }
}

export function exportVisitorsToCSV(): string {
  const analytics = getVisitorAnalytics();
  const headers = ['Visitor ID', 'Platform', 'Browser', 'Date (BS)', 'Time (AD)', 'Page'];
  const rows = analytics.recentLogs.map((l) => [
    `"${l.visitorId}"`,
    `"${l.platform}"`,
    `"${l.browser}"`,
    `"${l.visitedAtBS}"`,
    `"${new Date(l.visitedAtISO).toLocaleTimeString()}"`,
    `"${l.page}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
