import { convertADToBS } from '../utils/nepaliCalendar';

export type NotificationAudience = 'ALL' | 'VISITORS' | 'MEMBERS' | 'CLIENTS';

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  senderRole: 'SUPER_ADMIN' | 'CLIENT';
  senderName: string;
  senderClientId?: string; // If sent by an astrologer/client to their own yajamans
  category: 'ANNOUNCEMENT' | 'OFFER' | 'VEDIC_FESTIVAL' | 'SYSTEM_UPDATE' | 'CLIENT_REMINDER';
  targetUrl?: string;
  createdAtISO: string;
  createdAtBS: string;
  expiresAtISO?: string;
  isRead?: boolean;
}

const STORAGE_KEY_BROADCASTS = 'balananda_broadcast_notifications_v2';
const STORAGE_KEY_READ_IDS = 'balananda_read_notification_ids_v2';

export function getStoredBroadcastNotifications(): BroadcastNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BROADCASTS);
    if (!raw) {
      // Seed default welcoming announcement
      const defaultNotification: BroadcastNotification = {
        id: 'NOTIF-INIT-01',
        title: '🚩 बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवामा स्वागत छ!',
        message: 'नेपालकै आधिकारिक, शुद्ध दृक-सिद्धान्तमा आधारित पञ्चाङ्ग, जन्मकुण्डली, फलादेश तथा वास्तु सेवामा यहाँलाई हार्दिक स्वागत गर्दछौँ।',
        audience: 'ALL',
        senderRole: 'SUPER_ADMIN',
        senderName: 'सुपर एडमिन (बालानन्द सेवा)',
        category: 'ANNOUNCEMENT',
        createdAtISO: new Date().toISOString(),
        createdAtBS: convertADToBS(new Date().toISOString().split('T')[0]).formattedBS,
      };
      localStorage.setItem(STORAGE_KEY_BROADCASTS, JSON.stringify([defaultNotification]));
      return [defaultNotification];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load broadcast notifications:', e);
    return [];
  }
}

export function saveBroadcastNotifications(notifications: BroadcastNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BROADCASTS, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('broadcast-notifications-updated', { detail: { notifications } }));
  } catch (e) {
    console.error('Failed to save broadcast notifications:', e);
  }
}

/**
 * SuperAdmin: Broadcast a notification to target audience
 */
export function sendSuperAdminBroadcast(data: {
  title: string;
  message: string;
  audience: NotificationAudience;
  category?: 'ANNOUNCEMENT' | 'OFFER' | 'VEDIC_FESTIVAL' | 'SYSTEM_UPDATE';
  targetUrl?: string;
}): { success: boolean; messageNepali: string } {
  const now = new Date();
  const todayBS = convertADToBS(now.toISOString().split('T')[0]).formattedBS;

  const newNotif: BroadcastNotification = {
    id: `NOTIF-${Date.now()}`,
    title: data.title,
    message: data.message,
    audience: data.audience,
    senderRole: 'SUPER_ADMIN',
    senderName: 'सुपर एडमिन (केन्द्रीय प्रसारण)',
    category: data.category || 'ANNOUNCEMENT',
    targetUrl: data.targetUrl,
    createdAtISO: now.toISOString(),
    createdAtBS: todayBS,
  };

  const current = getStoredBroadcastNotifications();
  saveBroadcastNotifications([newNotif, ...current]);

  return {
    success: true,
    messageNepali: 'पुश नोटिफिकेसन सफलतापूर्वक लक्षित समूहमा प्रसारण गरियो।'
  };
}

/**
 * Client (Astrologer): Send notification to own clients / yajamans
 */
export function sendClientToYajamanNotification(data: {
  clientId?: string;
  clientName?: string;
  senderClientId?: string;
  senderName?: string;
  title: string;
  message: string;
  category?: 'ANNOUNCEMENT' | 'OFFER' | 'VEDIC_FESTIVAL' | 'CLIENT_REMINDER';
  targetUrl?: string;
}): { success: boolean; messageNepali: string } {
  const now = new Date();
  const todayBS = convertADToBS(now.toISOString().split('T')[0]).formattedBS;

  const effectiveClientId = data.senderClientId || data.clientId || 'client-self';
  const effectiveClientName = data.senderName || data.clientName || 'ज्योतिष सेवा';

  const newNotif: BroadcastNotification = {
    id: `NOTIF-CLI-${Date.now()}`,
    title: data.title,
    message: data.message,
    audience: 'MEMBERS',
    senderRole: 'CLIENT',
    senderName: effectiveClientName,
    senderClientId: effectiveClientId,
    category: data.category || 'CLIENT_REMINDER',
    targetUrl: data.targetUrl,
    createdAtISO: now.toISOString(),
    createdAtBS: todayBS,
  };

  const current = getStoredBroadcastNotifications();
  saveBroadcastNotifications([newNotif, ...current]);

  return {
    success: true,
    messageNepali: 'तपाईंका यजमान तथा ग्राहकहरूलाई सूचना सफलतापूर्वक पठाइयो।'
  };
}

/**
 * Retrieve notifications for current user depending on user type
 */
export function getNotificationsForAudience(userType: 'VISITOR' | 'MEMBER' | 'CLIENT', clientId?: string): BroadcastNotification[] {
  const all = getStoredBroadcastNotifications();
  const readIds = getReadNotificationIds();

  return all
    .filter((n) => {
      // 1. Audience check
      if (n.audience === 'ALL') return true;
      if (userType === 'VISITOR' && n.audience === 'VISITORS') return true;
      if (userType === 'MEMBER' && (n.audience === 'MEMBERS' || n.audience === 'VISITORS')) return true;
      if (userType === 'CLIENT') return true;

      // 2. Client-specific check
      if (n.senderClientId && clientId && n.senderClientId === clientId) return true;

      return false;
    })
    .map((n) => ({
      ...n,
      isRead: readIds.includes(n.id),
    }));
}

export function getReadNotificationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READ_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const readIds = getReadNotificationIds();
    if (!readIds.includes(id)) {
      localStorage.setItem(STORAGE_KEY_READ_IDS, JSON.stringify([id, ...readIds]));
      window.dispatchEvent(new CustomEvent('broadcast-notifications-read-updated'));
    }
  } catch (e) {
    console.error('Failed to mark notification as read:', e);
  }
}

export function deleteBroadcastNotification(id: string): void {
  const current = getStoredBroadcastNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveBroadcastNotifications(updated);
}

