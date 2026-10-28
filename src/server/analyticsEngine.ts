/**
 * Visitor Tracking & Analytics Engine
 * Balananda Vaidik Sewa
 * 
 * Provides privacy-preserving visitor counting, unique visitor estimation,
 * country/district breakdown, and administrative analytics reporting.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface VisitRecord {
  id: string;
  visitDate: string; // YYYY-MM-DD
  visitTimestamp: string;
  visitorHash: string; // SHA-256 daily salted hash, raw IP never stored
  path: string;
  country: string;
  countryCode: string;
  district: string;
  isAuthenticated: boolean;
  userId?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  referrer?: string;
}

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  todayUnique: number;
  authenticatedVisits: number;
  anonymousVisits: number;
  countryBreakdown: Array<{
    country: string;
    countryCode: string;
    count: number;
    percentage: number;
  }>;
  districtBreakdown: Array<{
    district: string;
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    date: string;
    visits: number;
    uniqueVisitors: number;
  }>;
}

const COUNTRY_MAP: Record<string, string> = {
  NP: 'नेपाल (Nepal)',
  IN: 'भारत (India)',
  US: 'संयुक्त राज्य अमेरिका (USA)',
  AU: 'अस्ट्रेलिया (Australia)',
  GB: 'संयुक्त अधिराज्य (UK)',
  CA: 'क्यानडा (Canada)',
  AE: 'युएई (UAE)',
  QA: 'कतार (Qatar)',
  MY: 'मलेसिया (Malaysia)',
  JP: 'जापान (Japan)',
  KR: 'दक्षिण कोरिया (South Korea)',
  SA: 'साउदी अरब (Saudi Arabia)',
  KW: 'कुवेत (Kuwait)',
  DE: 'जर्मनी (Germany)',
  TH: 'थाइल्याण्ड (Thailand)',
  SG: 'सिङ्गापुर (Singapore)'
};

const VALID_NEPAL_DISTRICTS = new Set([
  'काठमाडौं', 'ललितपुर', 'भक्तपुर', 'काभ्रेपलाञ्चोक', 'धादिङ', 'नुवाकोट', 'रसुवा',
  'सिन्धुपाल्चोक', 'मकवानपुर', 'चितवन', 'मोरङ', 'सुनसरी', 'झापा', 'इलाम', 'पाँचथर',
  'ताप्लेजुङ', 'धनकुटा', 'तेह्रथुम', 'सङ्खुवासभा', 'भोजपुर', 'उदयपुर', 'ओखलढुङ्गा',
  'खोटाङ', 'सोलुखुम्बु', 'सिन्धुली', 'रामेछाप', 'दोलखा', 'सप्तरी', 'सिराहा', 'धनुषा',
  'महोत्तरी', 'सर्लाही', 'रौतहट', 'बारा', 'पर्सा', 'कास्की', 'तनहुँ', 'स्याङ्जा',
  'गोर्खा', 'लमजुङ', 'मनाङ', 'मुस्ताङ', 'पर्वत', 'म्याग्दी', 'बाग्लुङ', 'नवलपुर',
  'परासी', 'रुपन्देही', 'कपिलवस्तु', 'पाल्पा', 'गुल्मी', 'अर्घाखाँची', 'दाङ', 'बाँके',
  'बर्दिया', 'प्युठान', 'रोल्पा', 'रुकुम पूर्व', 'रुकुम पश्चिम', 'सल्यान', 'सुर्खेत',
  'दैलेख', 'जाजरकोट', 'डोल्पा', 'जुम्ला', 'कालिकोट', 'मुगु', 'हुम्ला', 'कैलाली',
  'कञ्चनपुर', 'डडेल्धुरा', 'डोटी', 'अछाम', 'बाजुरा', 'बझाङ', 'बैतडी', 'दार्चुला'
]);

const LOCAL_ANALYTICS_FILE = path.join(process.cwd(), 'data', 'visitor_analytics.json');

export class VisitorAnalyticsEngine {
  private static instance: VisitorAnalyticsEngine;
  private visits: VisitRecord[] = [];
  private recentVisitsMap = new Map<string, number>(); // Debounce map: key -> timestamp

  private constructor() {
    this.loadFromDisk();
    // Periodically clean debounce map
    const cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [k, time] of this.recentVisitsMap.entries()) {
        if (now - time > 60000) this.recentVisitsMap.delete(k);
      }
    }, 60000);
    if (typeof cleanupTimer.unref === 'function') {
      cleanupTimer.unref();
    }
  }

  public static getInstance(): VisitorAnalyticsEngine {
    if (!VisitorAnalyticsEngine.instance) {
      VisitorAnalyticsEngine.instance = new VisitorAnalyticsEngine();
    }
    return VisitorAnalyticsEngine.instance;
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(LOCAL_ANALYTICS_FILE)) {
        this.visits = JSON.parse(fs.readFileSync(LOCAL_ANALYTICS_FILE, 'utf-8'));
      }
    } catch {
      this.visits = [];
    }
  }

  private persist(): void {
    try {
      const dir = path.dirname(LOCAL_ANALYTICS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_ANALYTICS_FILE, JSON.stringify(this.visits, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[AnalyticsEngine] Failed to persist analytics:', e);
    }
  }

  /**
   * Record a new visit safely and privacy-preservingly
   */
  public async trackVisit(req: any, body: {
    path?: string;
    referrer?: string;
    isInitialLoad?: boolean;
    district?: string;
  }): Promise<{ recorded: boolean; reason?: string }> {
    const userAgent = String(req.headers['user-agent'] || '').toLowerCase();

    // 1. Bot & Crawler Filtering
    const isBot = /bot|crawler|spider|googlebot|bingbot|yandex|baidu|slurp|facebookexternalhit|whatsapp|duckduckbot/i.test(userAgent);
    if (isBot) {
      return { recorded: false, reason: 'Automated crawler or bot excluded' };
    }

    // 2. Extract Client IP
    const rawIp = String(
      req.headers['x-forwarded-for'] ||
      req.headers['cf-connecting-ip'] ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    ).split(',')[0].trim();

    // 3. Privacy-preserving Daily Anonymized Visitor Hash
    const todayDateStr = new Date().toISOString().split('T')[0];
    const visitorHash = crypto
      .createHash('sha256')
      .update(`${rawIp}_${todayDateStr}_balananda_visitor_salt_v1`)
      .digest('hex')
      .substring(0, 32);

    const targetPath = String(body.path || req.path || '/').split('?')[0].trim() || '/';

    // 4. Debounce route changes (avoid duplicate count if same path visited within 10s)
    const debounceKey = `${visitorHash}_${targetPath}`;
    const lastSeen = this.recentVisitsMap.get(debounceKey);
    const nowMs = Date.now();
    if (lastSeen && nowMs - lastSeen < 10000) {
      return { recorded: false, reason: 'Debounced duplicate visit within 10s' };
    }
    this.recentVisitsMap.set(debounceKey, nowMs);

    // 5. Geolocation resolution
    const countryCodeRaw = String(
      req.headers['cf-ipcountry'] ||
      req.headers['x-country'] ||
      'NP'
    ).toUpperCase().trim();

    const countryCode = countryCodeRaw.length === 2 ? countryCodeRaw : 'NP';
    const country = COUNTRY_MAP[countryCode] || `${countryCode} (विदेश)`;

    // District resolution: strictly 'Unknown/अनिर्धारित' unless reliably provided and verified
    let district = 'Unknown/अनिर्धारित';
    const candidateDistrict = String(body.district || req.headers['x-client-district'] || '').trim();
    if (candidateDistrict && VALID_NEPAL_DISTRICTS.has(candidateDistrict)) {
      district = candidateDistrict;
    }

    // Device type
    const isMobile = /mobile|iphone|android|ipod|blackberry|opera mini|iemobile/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const deviceType: 'mobile' | 'desktop' | 'tablet' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    // Check authentication
    let isAuthenticated = false;
    let userId: string | undefined;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      isAuthenticated = true;
      userId = (req as any).user?.id || (req as any).session?.userId;
    }

    const record: VisitRecord = {
      id: `vis_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      visitDate: todayDateStr,
      visitTimestamp: new Date().toISOString(),
      visitorHash,
      path: targetPath,
      country,
      countryCode,
      district,
      isAuthenticated,
      userId,
      deviceType,
      referrer: body.referrer ? String(body.referrer).slice(0, 200) : undefined
    };

    this.visits.unshift(record);
    // Keep in-memory store bounded
    if (this.visits.length > 50000) {
      this.visits = this.visits.slice(0, 50000);
    }
    this.persist();

    return { recorded: true };
  }

  /**
   * Super Admin: Calculate aggregate analytics summary for specified period
   */
  public getAnalyticsSummary(period: 'today' | '7d' | '30d' | 'all' = '7d'): AnalyticsSummary {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let cutoffDate = new Date(0);

    if (period === 'today') {
      cutoffDate = new Date(`${todayStr}T00:00:00.000Z`);
    } else if (period === '7d') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30d') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filtered = this.visits.filter(v => new Date(v.visitTimestamp) >= cutoffDate);
    const todayVisitsList = this.visits.filter(v => v.visitDate === todayStr);

    const totalVisits = filtered.length;
    const uniqueHashes = new Set(filtered.map(v => v.visitorHash));
    const uniqueVisitors = uniqueHashes.size;

    const todayVisits = todayVisitsList.length;
    const todayUnique = new Set(todayVisitsList.map(v => v.visitorHash)).size;

    const authenticatedVisits = filtered.filter(v => v.isAuthenticated).length;
    const anonymousVisits = totalVisits - authenticatedVisits;

    // Country Breakdown
    const countryCounts: Record<string, { country: string; countryCode: string; count: number }> = {};
    for (const v of filtered) {
      const key = v.countryCode;
      if (!countryCounts[key]) {
        countryCounts[key] = { country: v.country, countryCode: v.countryCode, count: 0 };
      }
      countryCounts[key].count++;
    }

    const countryBreakdown = Object.values(countryCounts)
      .map(c => ({
        ...c,
        percentage: totalVisits > 0 ? Math.round((c.count / totalVisits) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // District Breakdown
    const districtCounts: Record<string, number> = {};
    for (const v of filtered) {
      const d = v.district || 'Unknown/अनिर्धारित';
      districtCounts[d] = (districtCounts[d] || 0) + 1;
    }

    const districtBreakdown = Object.entries(districtCounts)
      .map(([district, count]) => ({
        district,
        count,
        percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Daily Trends (last 14 days or days in period)
    const trendMap: Record<string, { visits: number; hashes: Set<string> }> = {};
    for (const v of filtered) {
      if (!trendMap[v.visitDate]) {
        trendMap[v.visitDate] = { visits: 0, hashes: new Set() };
      }
      trendMap[v.visitDate].visits++;
      trendMap[v.visitDate].hashes.add(v.visitorHash);
    }

    const trends = Object.keys(trendMap)
      .sort()
      .map(date => ({
        date,
        visits: trendMap[date].visits,
        uniqueVisitors: trendMap[date].hashes.size
      }));

    return {
      totalVisits,
      uniqueVisitors,
      todayVisits,
      todayUnique,
      authenticatedVisits,
      anonymousVisits,
      countryBreakdown,
      districtBreakdown,
      trends
    };
  }
}

export const visitorAnalyticsEngine = VisitorAnalyticsEngine.getInstance();
export const analyticsEngine = visitorAnalyticsEngine;
