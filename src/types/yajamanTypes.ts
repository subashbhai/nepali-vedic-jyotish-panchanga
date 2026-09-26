export type BookingStatus = 
  | 'REQUESTED'
  | 'MATCHING'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED_BY_YAJAMAN'
  | 'CANCELLED_BY_PROVIDER'
  | 'EXPIRED';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  addressName?: string;
  district?: string;
  localLevel?: string;
  ward?: string;
  accuracyMeters?: number;
}

export interface YajamanUser {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  password?: string;
  district: string;
  localLevel: string;
  ward: string;
  address: string;
  profilePhoto?: string;
  location?: LocationCoordinates;
  createdAtBS: string;
  lastLoginBS?: string;
  isActive: boolean;
}

export interface ServiceCategory {
  id: string;
  code: string;
  nameNepali: string;
  nameEnglish: string;
  iconName: string;
  descriptionNepali: string;
  isActive: boolean;
}

export interface ServiceProvider {
  id: string;
  fullName: string;
  title: string; // e.g., 'ज्योतिषाचार्य / पण्डित'
  mobile: string;
  email?: string;
  password?: string;
  photoUrl?: string;
  qualification: string;
  experienceYears: number;
  categories: string[]; // category IDs or codes
  expertise: string[]; // e.g., ['गृहप्रवेश', 'विवाह', 'कुण्डली']
  district: string;
  localLevel: string;
  ward: string;
  serviceAreas: string[]; // Districts/zones covered
  location: LocationCoordinates;
  maxServiceRadiusKm: number; // e.g., 30
  rating: number; // e.g. 4.8
  completedServicesCount: number;
  isAvailable: boolean; // toggle active status
  isVerified: boolean; // admin verified
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  bioNepali: string;
  joinedDateBS: string;
}

export interface ServiceRequest {
  id: string;
  bookingCode: string; // e.g., "YJM-२०८१-४८९१"
  yajamanId: string;
  yajamanName: string;
  yajamanMobile: string; // Protected/masked before accept
  yajamanEmail?: string;
  categoryId: string;
  categoryNameNepali: string;
  serviceType: string; // e.g. "गृहप्रवेश पुजा विधि"
  eventType?: string; // e.g. "वार्षिक कुलपूजा / विवाह मण्डप"
  preferredDateBS: string;
  preferredTime: string;
  location: LocationCoordinates;
  additionalNotes?: string;
  specialRequirements?: string;
  estimatedBudget?: number;
  attachmentUrl?: string;
  attachmentName?: string;
  status: BookingStatus;
  currentRadiusKm: number; // 3, 5, 10, 15, 20, 30
  offeredProviderIds: string[];
  rejectedProviderIds: string[];
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderPhone?: string;
  createdAtBS: string;
  createdTimestamp: number;
  updatedTimestamp: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  requestId: string;
  yajamanId: string;
  yajamanName: string;
  yajamanPhone: string;
  yajamanEmail?: string;
  yajamanLocation: LocationCoordinates;
  providerId: string;
  providerName: string;
  providerPhone: string;
  providerTitle: string;
  providerPhoto?: string;
  categoryName: string;
  serviceType: string;
  appointmentDateBS: string;
  appointmentTime: string;
  matchedRadiusKm: number;
  calculatedDistanceKm: number;
  status: BookingStatus;
  acceptanceTimestamp: number;
  completionTimestamp?: number;
  cancellationReason?: string;
  notes?: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  requestId: string;
  previousStatus: BookingStatus;
  newStatus: BookingStatus;
  changedBy: 'YAJAMAN' | 'PROVIDER' | 'SYSTEM' | 'ADMIN';
  changedById: string;
  reason?: string;
  timestamp: number;
  timestampBS: string;
}

export interface ContactExchangeLog {
  id: string;
  bookingId: string;
  requestId: string;
  yajamanId: string;
  providerId: string;
  exchangeTimestamp: number;
  exchangeTimestampBS: string;
  status: 'EXCHANGED';
}

export interface RatingReview {
  id: string;
  bookingId: string;
  yajamanId: string;
  yajamanName: string;
  providerId: string;
  rating: number; // 1 to 5
  reviewText: string;
  createdAtBS: string;
  createdAtTimestamp: number;
}

export interface YajamanComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  isReported?: boolean;
  reportReason?: string;
  replies?: Array<{
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAtBS: string;
  }>;
  createdAtBS: string;
  createdAtTimestamp: number;
}

export interface YajamanPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  authorRole: 'YAJAMAN' | 'PANDIT' | 'JYOTISH' | 'PUROHIT' | 'VASTU_EXPERT' | 'INSTITUTION';
  isVerified: boolean;
  title: string;
  description: string;
  serviceType: string;
  categoryCode: string;
  categoryNameNepali: string;
  district: string;
  localLevel?: string;
  availableDates?: string;
  availableTimes?: string;
  estimatedFee?: string;
  requiredSamagri?: string;
  photos: string[];
  likesCount: number;
  likedUserIds: string[];
  sharesCount: number;
  savedUserIds: string[];
  commentsCount: number;
  comments: YajamanComment[];
  contactPreference?: string;
  contactPhoneMasked?: string;
  contactEmailMasked?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'HIDDEN';
  isFeatured?: boolean;
  createdAtBS: string;
  createdAtTimestamp: number;
}

export interface YajamanReport {
  id: string;
  reportedBy: string;
  reporterName: string;
  targetType: 'POST' | 'COMMENT' | 'USER' | 'SERVICE_REQUEST';
  targetId: string;
  targetTitleOrName: string;
  reason: string;
  category: 'FAKE_PROFILE' | 'SPAM' | 'WRONG_INFO' | 'ABUSE' | 'INAPPROPRIATE' | 'FRAUD' | 'OTHER';
  details?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  actionTaken?: string;
  resolvedAtBS?: string;
  createdAtBS: string;
  timestamp: number;
}

export interface YajamanAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: 'POST' | 'COMMENT' | 'VERIFICATION' | 'REQUEST' | 'USER';
  targetId: string;
  details: string;
  timestampBS: string;
  timestamp: number;
}

export interface YajamanNotification {
  id: string;
  recipientId: string; // Yajaman ID or Provider ID
  recipientType: 'YAJAMAN' | 'PROVIDER' | 'ADMIN';
  title: string;
  message: string;
  relatedBookingId?: string;
  relatedRequestId?: string;
  relatedPostId?: string;
  isRead: boolean;
  timestamp: number;
  timestampBS: string;
}

