export type LockableServiceKey = 'jyotish' | 'vastu';

export type ServiceLicenseStatus = 'unlocked' | 'locked' | 'expired' | 'pending_approval';

export type ServiceLicenseDuration = 'trial' | '1_month' | '3_months' | '6_months' | '1_year' | '2_years' | '5_years' | 'lifetime' | 'custom';

export interface UserServiceLicense {
  id: string; // `${userId}_${serviceKey}`
  userId: string;
  username: string;
  fullName: string;
  phone: string;
  email?: string;
  serviceKey: LockableServiceKey; // strictly 'jyotish' | 'vastu'
  status: ServiceLicenseStatus;
  duration: ServiceLicenseDuration;
  startsAtISO: string;
  startsAtBS: string;
  expiresAtISO?: string;
  expiresAtBS?: string;
  expiresAtTimestamp?: number;
  unlockedBy?: string;
  unlockedAtISO?: string;
  notes?: string;
  updatedAtISO: string;
  softwareName?: string;
  planNameNepali?: string;
  amountNPR?: number;
  paymentStatus?: 'verified' | 'pending' | 'cash_verified' | 'waived';
  paymentMethod?: 'esewa' | 'khalti' | 'bank' | 'cash';
  transactionId?: string;
  lastAccessDateISO?: string;
}

export type PurchaseRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ServicePurchaseRequest {
  id: string;
  userId?: string;
  username?: string;
  fullName: string;
  phone: string;
  email?: string;
  serviceKey: LockableServiceKey;
  serviceTitleNepali: string;
  planDuration: ServiceLicenseDuration;
  amountNPR?: number;
  paymentMethod?: 'esewa' | 'khalti' | 'bank' | 'cash' | 'pending';
  requestStatus: PurchaseRequestStatus;
  userMessage?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAtISO?: string;
  createdAtISO: string;
  createdAtBS: string;
}

export interface ServiceLicenseAuditLog {
  id: string;
  timestampISO: string;
  timestampBS: string;
  performedBy: string;
  action: 'UNLOCK' | 'LOCK' | 'EXTEND' | 'APPROVE_PURCHASE' | 'REJECT_PURCHASE';
  targetUserId: string;
  targetUsername: string;
  serviceKey: LockableServiceKey;
  details: string;
}

export interface ServiceAccessCheckResult {
  allowed: boolean;
  serviceKey: LockableServiceKey;
  status: ServiceLicenseStatus;
  license?: UserServiceLicense;
  isSuperAdmin?: boolean;
  reasonNepali?: string;
}
