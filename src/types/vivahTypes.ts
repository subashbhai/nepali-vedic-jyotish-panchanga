export type ProfileGender = 'GROOM' | 'BRIDE';

export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE';

export type VerificationLevel = 'BASIC' | 'MOBILE_VERIFIED' | 'ID_SUBMITTED' | 'ADMIN_VERIFIED';

export type EmploymentType = 'GOVT' | 'PRIVATE' | 'BUSINESS' | 'FOREIGN' | 'NOT_WORKING' | 'FREELANCE';

export type VisibilitySetting = 'PUBLIC' | 'LIMITED' | 'PRIVATE';

export interface PartnerPreferences {
  minAge: number;
  maxAge: number;
  minHeightFeet: number;
  maxHeightFeet: number;
  maritalStatus: MaritalStatus[];
  minEducation: string;
  preferredProfessions: string[];
  preferredDistricts: string[];
  preferredProvinces: string[];
  religion?: string;
  dietPreference?: string;
  gotraAvoidance?: string[];
}

export interface VivahProfile {
  id: string;
  profileCode: string; // e.g. VIV-2081-101
  userId: string;
  userFullName: string;
  displayFirstName: string;
  gender: ProfileGender;
  dobAD: string;
  dobBS: string;
  birthTime?: string;
  birthPlace?: string;
  age: number;
  currentDistrict: string;
  currentProvince: string;
  permanentAddress: string;
  maritalStatus: MaritalStatus;
  education: string;
  fieldOfStudy: string;
  occupation: string;
  employedIn: EmploymentType;
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
  hobbiesInterests: string[];
  aboutMe: string;
  partnerPreferences: PartnerPreferences;
  profilePhoto: string;
  additionalPhotos: string[];
  verificationLevel: VerificationLevel;
  verificationStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  idDocumentType?: string;
  idDocumentUrl?: string;
  contactPhone: string;
  contactEmail: string;
  privacySettings: {
    visibility: VisibilitySetting;
    hideContactDetails: boolean;
    allowDirectMatch: boolean;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  isActive: boolean;
  isFeatured?: boolean;
}

export type AdStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface VivahAdvertisement {
  id: string;
  adCode: string;
  profileId: string;
  userId: string;
  candidateName: string;
  gender: ProfileGender;
  age: number;
  education: string;
  profession: string;
  location: string;
  familySummary: string;
  partnerExpectations: string;
  photoUrl: string;
  contactPhoneHidden: boolean;
  status: AdStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

export type ConnectionRequestStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'DECLINED' 
  | 'CONTACT_RELEASE_REQUESTED' 
  | 'APPROVED_BY_ADMIN' 
  | 'REJECTED_BY_ADMIN';

export interface VivahRequest {
  id: string;
  senderProfileId: string;
  senderUserId: string;
  senderName: string;
  senderGender: ProfileGender;
  senderPhoto: string;
  senderPhone: string;
  receiverProfileId: string;
  receiverUserId: string;
  receiverName: string;
  receiverGender: ProfileGender;
  receiverPhoto: string;
  receiverPhone: string;
  status: ConnectionRequestStatus;
  initialMessage?: string;
  adminApprovalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VivahFavorite {
  id: string;
  userId: string;
  targetProfileId: string;
  createdAt: string;
}

export type ReportReason = 
  | 'FAKE_PROFILE' 
  | 'SCAM_FRAUD' 
  | 'HARASSMENT' 
  | 'INAPPROPRIATE_CONTENT' 
  | 'MISLEADING_INFO' 
  | 'DUPLICATE' 
  | 'OTHER';

export interface VivahReport {
  id: string;
  reporterUserId: string;
  reporterName: string;
  targetProfileId: string;
  targetName: string;
  reason: ReportReason;
  details: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
}

export interface VivahBlock {
  id: string;
  userId: string;
  blockedProfileId: string;
  createdAt: string;
}

export interface VivahAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: 'PROFILE' | 'ADVERTISEMENT' | 'REQUEST' | 'REPORT' | 'VERIFICATION';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface VivahMatchResult {
  profile: VivahProfile;
  matchScore: number; // 0 to 100
  breakdown: {
    ageMatch: boolean;
    heightMatch: boolean;
    maritalStatusMatch: boolean;
    educationMatch: boolean;
    professionMatch: boolean;
    locationMatch: boolean;
    dietMatch: boolean;
    details: string[];
  };
}
