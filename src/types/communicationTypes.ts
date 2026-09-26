export type MessageType = 'text' | 'voice' | 'image' | 'document' | 'system';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id: string;
  bookingId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'YAJAMAN' | 'PROVIDER' | 'SYSTEM';
  messageType: MessageType;
  textContent?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string; // 'image/png' | 'application/pdf' etc.
  attachmentSize?: string;
  voiceDurationSeconds?: number;
  replyToMessageId?: string;
  replyToText?: string;
  status: MessageStatus;
  timestamp: number;
  timestampBS: string;
  deletedForUserIds?: string[]; // IDs of users who deleted this message for self
}

export type CallStatus = 'calling' | 'ringing' | 'connected' | 'missed' | 'rejected' | 'ended';

export interface CallSession {
  id: string;
  bookingId: string;
  callerId: string;
  callerName: string;
  callerType: 'YAJAMAN' | 'PROVIDER';
  callerPhoto?: string;
  receiverId: string;
  receiverName: string;
  receiverType: 'YAJAMAN' | 'PROVIDER';
  receiverPhoto?: string;
  status: CallStatus;
  startTimestamp: number;
  connectTimestamp?: number;
  endTimestamp?: number;
  durationSeconds?: number;
  timestampBS: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterType: 'YAJAMAN' | 'PROVIDER';
  reportedUserId: string;
  reportedUserName: string;
  reportedUserType: 'YAJAMAN' | 'PROVIDER';
  bookingId?: string;
  reasonCategory: 'INAPPROPRIATE_BEHAVIOR' | 'FRAUD' | 'NO_SHOW' | 'SPAM' | 'OTHER';
  details: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  createdAtBS: string;
  createdAtTimestamp: number;
}

export interface BlockRecord {
  id: string;
  blockerId: string;
  blockedUserId: string;
  reason?: string;
  timestamp: number;
}

export interface ProviderMatchingBadge {
  type: 'BEST_MATCH' | 'NEAREST' | 'TOP_RATED' | 'FAST_RESPONSE';
  labelNepali: string;
  colorClass: string;
}
