/**
 * Marriage Module Complete SQL Schema & Database Types
 * Covers all required entities: users, marriage_profiles, partner_preferences,
 * marriage_ads, marriage_requests, connections, messages, notifications,
 * verification_requests, reports, blocks, and audit_logs.
 */

// ==========================================
// SQL DDL Statements (PostgreSQL / SQLite)
// ==========================================

export const MARRIAGE_MODULE_DDL = `
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'USER',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Marriage Profiles Table
CREATE TABLE IF NOT EXISTS marriage_profiles (
  id VARCHAR(36) PRIMARY KEY,
  profile_code VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_first_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  dob_ad DATE NOT NULL,
  dob_bs VARCHAR(20) NOT NULL,
  birth_time VARCHAR(20),
  birth_place VARCHAR(255),
  age INTEGER NOT NULL,
  current_district VARCHAR(100) NOT NULL,
  current_province VARCHAR(100) NOT NULL,
  permanent_address TEXT NOT NULL,
  marital_status VARCHAR(50) NOT NULL,
  education VARCHAR(255) NOT NULL,
  field_of_study VARCHAR(255) NOT NULL,
  occupation VARCHAR(255) NOT NULL,
  employed_in VARCHAR(50) NOT NULL,
  monthly_income_range VARCHAR(100) NOT NULL,
  height_feet_inches VARCHAR(20) NOT NULL,
  complexion VARCHAR(50),
  religion VARCHAR(100) DEFAULT 'Hinduism',
  caste_ethnicity VARCHAR(100),
  gotra VARCHAR(100),
  father_occupation VARCHAR(255),
  mother_occupation VARCHAR(255),
  family_type VARCHAR(50) DEFAULT 'JOINT',
  family_values VARCHAR(50) DEFAULT 'MODERATE',
  family_location VARCHAR(255),
  siblings_info TEXT,
  diet VARCHAR(20) DEFAULT 'VEG',
  drinking_smoking VARCHAR(20) DEFAULT 'NO',
  hobbies_interests TEXT,
  about_me TEXT NOT NULL,
  profile_photo TEXT NOT NULL,
  additional_photos TEXT,
  verification_level VARCHAR(50) DEFAULT 'BASIC',
  verification_status VARCHAR(50) DEFAULT 'NONE',
  id_document_type VARCHAR(100),
  id_document_url TEXT,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  visibility VARCHAR(50) DEFAULT 'PUBLIC',
  hide_contact_details BOOLEAN DEFAULT FALSE,
  allow_direct_match BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Partner Preferences Table
CREATE TABLE IF NOT EXISTS partner_preferences (
  id VARCHAR(36) PRIMARY KEY,
  profile_id VARCHAR(36) UNIQUE NOT NULL REFERENCES marriage_profiles(id) ON DELETE CASCADE,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 60,
  min_height_feet NUMERIC(3,1) DEFAULT 4.0,
  max_height_feet NUMERIC(3,1) DEFAULT 7.0,
  marital_status TEXT,
  min_education VARCHAR(255),
  preferred_professions TEXT,
  preferred_districts TEXT,
  preferred_provinces TEXT,
  religion VARCHAR(100),
  diet_preference VARCHAR(50),
  gotra_avoidance TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Marriage Advertisements Table
CREATE TABLE IF NOT EXISTS marriage_ads (
  id VARCHAR(36) PRIMARY KEY,
  ad_code VARCHAR(50) UNIQUE NOT NULL,
  profile_id VARCHAR(36) NOT NULL REFERENCES marriage_profiles(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_name VARCHAR(255) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  age INTEGER NOT NULL,
  education VARCHAR(255) NOT NULL,
  profession VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  family_summary TEXT,
  partner_expectations TEXT,
  photo_url TEXT,
  contact_phone_hidden BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'DRAFT',
  rejection_reason TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Marriage Requests Table
CREATE TABLE IF NOT EXISTS marriage_requests (
  id VARCHAR(36) PRIMARY KEY,
  sender_profile_id VARCHAR(36) NOT NULL REFERENCES marriage_profiles(id) ON DELETE CASCADE,
  sender_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_profile_id VARCHAR(36) NOT NULL REFERENCES marriage_profiles(id) ON DELETE CASCADE,
  receiver_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'PENDING',
  initial_message TEXT,
  admin_approval_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Connections Table
CREATE TABLE IF NOT EXISTS connections (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36) UNIQUE REFERENCES marriage_requests(id) ON DELETE SET NULL,
  profile1_id VARCHAR(36) NOT NULL REFERENCES marriage_profiles(id) ON DELETE CASCADE,
  profile2_id VARCHAR(36) NOT NULL REFERENCES marriage_profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  contact_released BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  connection_id VARCHAR(36) NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  reference_id VARCHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Verification Requests Table
CREATE TABLE IF NOT EXISTS verification_requests (
  id VARCHAR(36) PRIMARY KEY,
  profile_id VARCHAR(36) NOT NULL REFERENCES marriage_profiles(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_number VARCHAR(100),
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  admin_notes TEXT,
  reviewed_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(36) PRIMARY KEY,
  reporter_user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_profile_id VARCHAR(36) NOT NULL REFERENCES marriage_profiles(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Blocks Table
CREATE TABLE IF NOT EXISTS blocks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_profile_id VARCHAR(36) NOT NULL REFERENCES marriage_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, blocked_profile_id)
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  actor_id VARCHAR(36) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(36) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

// ==========================================
// TypeScript Entity Interfaces
// ==========================================

export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'AGENT';
  avatarUrl?: string;
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface MarriageProfileRow {
  id: string;
  profileCode: string;
  userId: string;
  displayFirstName: string;
  gender: 'GROOM' | 'BRIDE';
  dobAd: string;
  dobBs: string;
  birthTime?: string;
  birthPlace?: string;
  age: number;
  currentDistrict: string;
  currentProvince: string;
  permanentAddress: string;
  maritalStatus: 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE';
  education: string;
  fieldOfStudy: string;
  occupation: string;
  employedIn: 'GOVT' | 'PRIVATE' | 'BUSINESS' | 'FOREIGN' | 'NOT_WORKING' | 'FREELANCE';
  monthlyIncomeRange: string;
  heightFeetInches: string;
  complexion?: string;
  religion: string;
  casteEthnicity?: string;
  gotra?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  familyType: 'JOINT' | 'NUCLEAR';
  familyValues: 'TRADITIONAL' | 'MODERATE' | 'LIBERAL';
  familyLocation?: string;
  siblingsInfo?: string;
  diet: 'VEG' | 'NON_VEG' | 'EGG';
  drinkingSmoking: 'NO' | 'OCCASIONAL' | 'YES';
  hobbiesInterests?: string[];
  aboutMe: string;
  profilePhoto: string;
  additionalPhotos?: string[];
  verificationLevel: 'BASIC' | 'MOBILE_VERIFIED' | 'ID_SUBMITTED' | 'ADMIN_VERIFIED';
  verificationStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  idDocumentType?: string;
  idDocumentUrl?: string;
  contactPhone: string;
  contactEmail: string;
  visibility: 'PUBLIC' | 'LIMITED' | 'PRIVATE';
  hideContactDetails: boolean;
  allowDirectMatch: boolean;
  viewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerPreferencesRow {
  id: string;
  profileId: string;
  minAge: number;
  maxAge: number;
  minHeightFeet: number;
  maxHeightFeet: number;
  maritalStatus: string[];
  minEducation?: string;
  preferredProfessions?: string[];
  preferredDistricts?: string[];
  preferredProvinces?: string[];
  religion?: string;
  dietPreference?: string;
  gotraAvoidance?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MarriageAdRow {
  id: string;
  adCode: string;
  profileId: string;
  userId: string;
  candidateName: string;
  gender: 'GROOM' | 'BRIDE';
  age: number;
  education: string;
  profession: string;
  location: string;
  familySummary?: string;
  partnerExpectations?: string;
  photoUrl?: string;
  contactPhoneHidden: boolean;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarriageRequestRow {
  id: string;
  senderProfileId: string;
  senderUserId: string;
  receiverProfileId: string;
  receiverUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CONTACT_RELEASE_REQUESTED' | 'APPROVED_BY_ADMIN' | 'REJECTED_BY_ADMIN';
  initialMessage?: string;
  adminApprovalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionRow {
  id: string;
  requestId?: string;
  profile1Id: string;
  profile2Id: string;
  status: 'ACTIVE' | 'DISCONNECTED' | 'BLOCKED';
  contactReleased: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRow {
  id: string;
  connectionId: string;
  senderUserId: string;
  receiverUserId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationRow {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'REQUEST_RECEIVED' | 'REQUEST_ACCEPTED' | 'CONTACT_RELEASED' | 'VERIFICATION_UPDATE' | 'SYSTEM';
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface VerificationRequestRow {
  id: string;
  profileId: string;
  userId: string;
  documentType: 'CITIZENSHIP' | 'PASSPORT' | 'NATIONAL_ID' | 'DRIVING_LICENSE';
  documentNumber?: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRow {
  id: string;
  reporterUserId: string;
  targetProfileId: string;
  reason: 'FAKE_PROFILE' | 'SCAM_FRAUD' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'MISLEADING_INFO' | 'DUPLICATE' | 'OTHER';
  details: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockRow {
  id: string;
  userId: string;
  blockedProfileId: string;
  createdAt: string;
}

export interface AuditLogRow {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: 'PROFILE' | 'ADVERTISEMENT' | 'REQUEST' | 'REPORT' | 'VERIFICATION' | 'USER' | 'MESSAGE';
  targetId: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

/**
 * Table metadata map detailing all 12 tables in the marriage module schema.
 */
export const MARRIAGE_TABLES = [
  'users',
  'marriage_profiles',
  'partner_preferences',
  'marriage_ads',
  'marriage_requests',
  'connections',
  'messages',
  'notifications',
  'verification_requests',
  'reports',
  'blocks',
  'audit_logs',
] as const;

export type MarriageTableName = (typeof MARRIAGE_TABLES)[number];
