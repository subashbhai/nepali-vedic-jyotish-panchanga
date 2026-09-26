import {
  BlockRecord,
  CallSession,
  CallStatus,
  ChatMessage,
  MessageStatus,
  UserReport,
} from '../types/communicationTypes';
import { getStoredBookings } from './yajamanStore';
import { convertADToBS } from '../utils/nepaliCalendar';

const STORAGE_KEYS = {
  MESSAGES: 'balananda_chat_messages_v1',
  CALL_SESSIONS: 'balananda_call_sessions_v1',
  REPORTS: 'balananda_user_reports_v1',
  BLOCKS: 'balananda_user_blocks_v1',
};

function getTodayBS(): string {
  const today = new Date().toISOString().split('T')[0];
  return convertADToBS(today).formattedBS;
}

// Check if contact information is unlocked between Yajaman and Provider
export function isContactUnlocked(bookingId: string): boolean {
  if (!bookingId) return false;
  const bookings = getStoredBookings();
  const bk = bookings.find((b) => b.id === bookingId || b.requestId === bookingId);
  if (!bk) return false;
  
  const allowedStatuses = ['ACCEPTED', 'CONTACT_UNLOCKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
  return allowedStatuses.includes(bk.status);
}

// Check if contact is unlocked for a given Yajaman ID & Provider ID pair
export function isContactUnlockedForPair(yajamanId: string, providerId: string): boolean {
  if (!yajamanId || !providerId) return false;
  const bookings = getStoredBookings();
  return bookings.some(
    (b) =>
      b.yajamanId === yajamanId &&
      b.providerId === providerId &&
      ['ACCEPTED', 'CONTACT_UNLOCKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status)
  );
}

// CHAT MESSAGES MANAGEMENT
export function getStoredMessages(): ChatMessage[] {
  const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

export function getMessagesByBooking(bookingId: string, userId?: string): ChatMessage[] {
  const all = getStoredMessages();
  return all.filter((m) => {
    if (m.bookingId !== bookingId) return false;
    if (userId && m.deletedForUserIds && m.deletedForUserIds.includes(userId)) return false;
    return true;
  }).sort((a, b) => a.timestamp - b.timestamp);
}

export function sendChatMessage(
  bookingId: string,
  senderId: string,
  senderName: string,
  senderType: 'YAJAMAN' | 'PROVIDER',
  messageType: ChatMessage['messageType'],
  payload: {
    textContent?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentType?: string;
    attachmentSize?: string;
    voiceDurationSeconds?: number;
    replyToMessageId?: string;
    replyToText?: string;
  }
): ChatMessage | null {
  // Security check: Must have accepted booking
  if (!isContactUnlocked(bookingId)) {
    console.warn('Cannot send message on un-accepted booking');
    return null;
  }

  const all = getStoredMessages();
  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    bookingId,
    conversationId: `conv_${bookingId}`,
    senderId,
    senderName,
    senderType,
    messageType,
    textContent: payload.textContent,
    attachmentUrl: payload.attachmentUrl,
    attachmentName: payload.attachmentName,
    attachmentType: payload.attachmentType,
    attachmentSize: payload.attachmentSize,
    voiceDurationSeconds: payload.voiceDurationSeconds,
    replyToMessageId: payload.replyToMessageId,
    replyToText: payload.replyToText,
    status: 'delivered',
    timestamp: Date.now(),
    timestampBS: getTodayBS(),
  };

  saveMessages([...all, newMsg]);
  return newMsg;
}

export function markMessagesAsRead(bookingId: string, readerUserId: string): void {
  const all = getStoredMessages();
  let updated = false;

  const next = all.map((m) => {
    if (m.bookingId === bookingId && m.senderId !== readerUserId && m.status !== 'read') {
      updated = true;
      return { ...m, status: 'read' as MessageStatus };
    }
    return m;
  });

  if (updated) {
    saveMessages(next);
  }
}

export function deleteMessageForSelf(messageId: string, userId: string): void {
  const all = getStoredMessages();
  const next = all.map((m) => {
    if (m.id === messageId) {
      const deletedForUserIds = m.deletedForUserIds || [];
      if (!deletedForUserIds.includes(userId)) {
        return { ...m, deletedForUserIds: [...deletedForUserIds, userId] };
      }
    }
    return m;
  });
  saveMessages(next);
}

// CALL SESSIONS MANAGEMENT
export function getStoredCallSessions(): CallSession[] {
  const raw = localStorage.getItem(STORAGE_KEYS.CALL_SESSIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCallSessions(sessions: CallSession[]): void {
  localStorage.setItem(STORAGE_KEYS.CALL_SESSIONS, JSON.stringify(sessions));
}

export function initiateCallSession(
  bookingId: string,
  callerId: string,
  callerName: string,
  callerType: 'YAJAMAN' | 'PROVIDER',
  callerPhoto: string | undefined,
  receiverId: string,
  receiverName: string,
  receiverType: 'YAJAMAN' | 'PROVIDER',
  receiverPhoto: string | undefined
): CallSession | null {
  // Security check: Direct calling is only unlocked for accepted bookings
  if (!isContactUnlocked(bookingId)) {
    console.warn('Direct calling locked for unaccepted bookings');
    return null;
  }

  const all = getStoredCallSessions();
  const session: CallSession = {
    id: `call_${Date.now()}`,
    bookingId,
    callerId,
    callerName,
    callerType,
    callerPhoto,
    receiverId,
    receiverName,
    receiverType,
    receiverPhoto,
    status: 'calling',
    startTimestamp: Date.now(),
    timestampBS: getTodayBS(),
  };

  saveCallSessions([session, ...all]);
  return session;
}

export function updateCallStatus(
  callId: string,
  status: CallStatus,
  extra?: { durationSeconds?: number }
): CallSession | null {
  const all = getStoredCallSessions();
  const index = all.findIndex((c) => c.id === callId);
  if (index === -1) return null;

  const current = all[index];
  const updated: CallSession = {
    ...current,
    status,
    connectTimestamp: status === 'connected' && !current.connectTimestamp ? Date.now() : current.connectTimestamp,
    endTimestamp: ['ended', 'rejected', 'missed'].includes(status) ? Date.now() : current.endTimestamp,
    durationSeconds: extra?.durationSeconds ?? current.durationSeconds,
  };

  all[index] = updated;
  saveCallSessions(all);
  return updated;
}

export function getCallLogsByBooking(bookingId: string): CallSession[] {
  const all = getStoredCallSessions();
  return all.filter((c) => c.bookingId === bookingId).sort((a, b) => b.startTimestamp - a.startTimestamp);
}

export function getCallLogsForUser(userId: string): CallSession[] {
  const all = getStoredCallSessions();
  return all.filter((c) => c.callerId === userId || c.receiverId === userId).sort((a, b) => b.startTimestamp - a.startTimestamp);
}

// REPORTS & BLOCKS MANAGEMENT
export function getStoredUserReports(): UserReport[] {
  const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function createReportUser(
  reporterId: string,
  reporterName: string,
  reporterType: 'YAJAMAN' | 'PROVIDER',
  reportedUserId: string,
  reportedUserName: string,
  reportedUserType: 'YAJAMAN' | 'PROVIDER',
  reasonCategory: UserReport['reasonCategory'],
  details: string,
  bookingId?: string
): UserReport {
  const reports = getStoredUserReports();
  const newReport: UserReport = {
    id: `rep_${Date.now()}`,
    reporterId,
    reporterName,
    reporterType,
    reportedUserId,
    reportedUserName,
    reportedUserType,
    bookingId,
    reasonCategory,
    details,
    status: 'PENDING',
    createdAtBS: getTodayBS(),
    createdAtTimestamp: Date.now(),
  };

  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([newReport, ...reports]));
  return newReport;
}

export function getStoredUserBlocks(): BlockRecord[] {
  const raw = localStorage.getItem(STORAGE_KEYS.BLOCKS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function blockUser(blockerId: string, blockedUserId: string, reason?: string): void {
  const blocks = getStoredUserBlocks();
  if (!blocks.some((b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId)) {
    const newBlock: BlockRecord = {
      id: `blk_${Date.now()}`,
      blockerId,
      blockedUserId,
      reason,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify([...blocks, newBlock]));
  }
}

export function isUserBlocked(blockerId: string, targetUserId: string): boolean {
  const blocks = getStoredUserBlocks();
  return blocks.some(
    (b) => (b.blockerId === blockerId && b.blockedUserId === targetUserId) || (b.blockerId === targetUserId && b.blockedUserId === blockerId)
  );
}
