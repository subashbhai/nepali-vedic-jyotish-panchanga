import { 
  OfficialMemberProfile, 
  AstrologerProfile, 
  PurohitProfile, 
  VastuExpertProfile,
  OfficialMemberStatus, 
  MemberApprovalStatus,
  MemberRoleType,
  MemberDocument 
} from '../types/astrology';

export type {
  OfficialMemberProfile,
  OfficialMemberStatus,
  MemberApprovalStatus,
  MemberRoleType
};
import { DEFAULT_ASTROLOGERS, DEFAULT_PUROHITS, DEFAULT_VASTU_EXPERTS } from './profileStore';
import { convertADToBS } from '../utils/nepaliCalendar';
import { sendAdminNotification, logAdminAction } from './adminStore';

const STORAGE_KEY_OFFICIAL_MEMBERS = 'sukdev_official_members_v3';

// Helper to convert number to Nepali digits string
export function toNepaliDigits(num: number | string): string {
  const nepaliMap: { [key: string]: string } = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
  };
  return String(num).replace(/[0-9]/g, (digit) => nepaliMap[digit] || digit);
}

// Generate application code (e.g. "SJS-APP-२०८१-४८१५")
export function generateApplicationNumber(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const todayAD = new Date().toISOString().split('T')[0];
  const yearBS = convertADToBS(todayAD).year;
  return `SJS-APP-${toNepaliDigits(yearBS)}-${toNepaliDigits(randomDigits)}`;
}

// Seed Initial Pre-existing Members if storage empty
export const INITIAL_OFFICIAL_MEMBERS: OfficialMemberProfile[] = [
  ...DEFAULT_ASTROLOGERS.map((a, index) => ({
    id: a.id || `astro_${index + 1}`,
    applicationNumber: `SJS-APP-२०८१-१०${index + 1}`,
    fullName: a.name,
    title: a.title || 'ज्योतिषाचार्य',
    role: 'astrologer' as MemberRoleType,
    photoUrl: a.photoUrl,
    expertise: a.expertise || ['जन्मकुण्डली फलादेश', 'विवाह मिलान'],
    contactPhone: a.contactPhone,
    email: a.email || 'astro@sukdev.np',
    district: 'काठमाडौं',
    experienceYears: a.experienceYears || 15,
    bio: a.bio || 'वैदिक ज्योतिष, फलित तथा सिद्धान्त ज्योतिष शास्त्रका ज्ञाता।',
    isAvailable: a.isAvailable ?? true,
    isVerified: true, // "प्रमाणित"
    status: 'approved' as OfficialMemberStatus, // "स्वीकृत"
    approvalStatus: 'Approved' as MemberApprovalStatus,
    registrationDateBS: '२०७९ वैशाख ०१',
    isPreExisting: true, // पहिले नै स्वीकृत
    serviceMode: 'both' as const,
  })),
  ...DEFAULT_PUROHITS.map((p, index) => ({
    id: p.id || `purohit_${index + 1}`,
    applicationNumber: `SJS-APP-२०८१-२०${index + 1}`,
    fullName: p.name,
    title: 'कर्मकाण्ड पुरोहित',
    role: 'purohit' as MemberRoleType,
    photoUrl: p.photoUrl,
    expertise: p.speciality || ['विवाह संस्कार', 'रुद्री पाठ', 'हवन'],
    contactPhone: p.contactPhone,
    email: 'purohit@sukdev.np',
    district: 'ललितपुर',
    experienceYears: p.experienceYears || 15,
    bio: p.bio || 'शुक्ल यजुर्वेद कर्मकाण्ड तथा विधिपूर्वक महायज्ञ गराउने वरिष्ठ पुरोहित।',
    isAvailable: p.isAvailable ?? true,
    isVerified: true, // "प्रमाणित"
    status: 'approved' as OfficialMemberStatus, // "स्वीकृत"
    approvalStatus: 'Approved' as MemberApprovalStatus,
    registrationDateBS: '२०७९ वैशाख ०१',
    isPreExisting: true, // पहिले नै स्वीकृत
    serviceMode: 'both' as const,
  })),
  ...DEFAULT_VASTU_EXPERTS.map((v, index) => ({
    id: v.id || `vastu_${index + 1}`,
    applicationNumber: `SJS-APP-२०८१-३०${index + 1}`,
    fullName: v.name,
    title: v.title || 'वैदिक वास्तुविद्',
    role: 'vastu' as MemberRoleType,
    photoUrl: v.photoUrl,
    expertise: v.speciality || ['गृह वास्तु', 'भवन वास्तु', 'भूमि परीक्षण'],
    contactPhone: v.contactPhone,
    email: v.email || 'vastu@sukdev.np',
    district: 'भक्तपुर',
    experienceYears: v.experienceYears || 16,
    bio: v.bio || 'प्राचीन समराङ्गणसूत्रधार शास्त्र अनुसार वास्तु परामर्शदाता।',
    isAvailable: v.isAvailable ?? true,
    isVerified: true,
    status: 'approved' as OfficialMemberStatus,
    approvalStatus: 'Approved' as MemberApprovalStatus,
    registrationDateBS: '२०७९ वैशाख ०१',
    isPreExisting: true,
    serviceMode: v.serviceMode || 'both',
  })),
];

export function getStoredOfficialMembers(): OfficialMemberProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFICIAL_MEMBERS);
    if (!raw) {
      saveOfficialMembers(INITIAL_OFFICIAL_MEMBERS);
      return INITIAL_OFFICIAL_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveOfficialMembers(INITIAL_OFFICIAL_MEMBERS);
      return INITIAL_OFFICIAL_MEMBERS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse official members from storage:', e);
    return INITIAL_OFFICIAL_MEMBERS;
  }
}

export function saveOfficialMembers(members: OfficialMemberProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_OFFICIAL_MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save official members to storage:', e);
  }
}

// Rule 1 & 2: New Registration starts as pending ("प्रशासकीय स्वीकृतिको प्रतीक्षामा")
export function registerOfficialMember(data: {
  fullName: string;
  title?: string;
  role: MemberRoleType;
  secondaryRoles?: MemberRoleType[];
  photoUrl?: string;
  expertise: string[];
  contactPhone: string;
  email?: string;
  dobBS?: string;
  dobAD?: string;
  district?: string;
  permanentAddress?: {
    district?: string;
    localLevel?: string;
    ward?: string;
    fullAddress?: string;
  };
  currentAddress?: string;
  qualification?: string;
  gurukulName?: string;
  guruName?: string;
  studyDurationYears?: number;
  experienceYears: number;
  expertExperienceYears?: number;
  serviceRegions?: string;
  serviceMode?: 'online' | 'in_person' | 'both';
  documents?: MemberDocument[];
  bio: string;
  consultationFee?: number;
}): OfficialMemberProfile {
  const members = getStoredOfficialMembers();
  const todayAD = new Date().toISOString().split('T')[0];
  const todayBS = convertADToBS(todayAD).formattedBS;

  const defaultTitle = 
    data.role === 'purohit' ? 'कर्मकाण्ड पुरोहित' :
    data.role === 'vastu' ? 'वैदिक वास्तुविद्' :
    data.role === 'both' ? 'ज्योतिषाचार्य तथा पुरोहित' :
    data.role === 'all' ? 'ज्योतिषाचार्य, पुरोहित तथा वास्तुविद्' :
    'ज्योतिषाचार्य';

  const appNo = generateApplicationNumber();

  const newMember: OfficialMemberProfile = {
    id: `member_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    applicationNumber: appNo,
    fullName: data.fullName,
    title: data.title || defaultTitle,
    role: data.role,
    secondaryRoles: data.secondaryRoles,
    photoUrl: data.photoUrl || '',
    expertise: data.expertise.length > 0 ? data.expertise : ['वैदिक ज्योतिष'],
    contactPhone: data.contactPhone,
    email: data.email || '',
    dobBS: data.dobBS,
    dobAD: data.dobAD,
    district: data.district || data.permanentAddress?.district || 'काठमाडौं',
    permanentAddress: data.permanentAddress,
    currentAddress: data.currentAddress,
    qualification: data.qualification,
    gurukulName: data.gurukulName,
    guruName: data.guruName,
    studyDurationYears: data.studyDurationYears,
    experienceYears: Number(data.experienceYears) || 1,
    expertExperienceYears: Number(data.expertExperienceYears) || Number(data.experienceYears) || 1,
    serviceRegions: data.serviceRegions,
    serviceMode: data.serviceMode || 'both',
    documents: data.documents || [],
    bio: data.bio || 'वैदिक ज्योतिष, कर्मकाण्ड तथा वास्तु साधक।',
    isAvailable: true,
    isVerified: false, // Cannot self-verify
    status: 'pending', // "प्रशासकीय स्वीकृतिको प्रतीक्षामा"
    approvalStatus: 'Pending',
    registrationDateBS: todayBS,
    isPreExisting: false,
    consultationFee: data.consultationFee || 1000,
  };

  const updatedList = [newMember, ...members];
  saveOfficialMembers(updatedList);
  return newMember;
}

// Rule 11 & 22: Admin actions (approve, reject, request info, deactivate, suspend)
export function adminUpdateMemberStatus(
  id: string, 
  status: OfficialMemberStatus | 'active', 
  rejectionReason?: string,
  infoRequestNote?: string
): OfficialMemberProfile | null {
  const members = getStoredOfficialMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const todayAD = new Date().toISOString().split('T')[0];
  const todayBS = convertADToBS(todayAD).formattedBS;

  const current = members[index];
  const targetStatus: OfficialMemberStatus = status === 'active' ? 'approved' : status;

  let approvalStatus: MemberApprovalStatus = 'Pending';
  if (targetStatus === 'approved') {
    approvalStatus = 'Approved';
  } else if (targetStatus === 'rejected') {
    approvalStatus = 'Rejected';
  } else {
    approvalStatus = 'Pending';
  }

  const updatedMember: OfficialMemberProfile = {
    ...current,
    status: targetStatus,
    approvalStatus,
    // Automatically set verified = true when approved by admin!
    isVerified: targetStatus === 'approved' ? true : (targetStatus === 'rejected' ? false : current.isVerified),
    rejectionReason: targetStatus === 'rejected' ? (rejectionReason || 'मापदण्ड तथा कागजात अपूर्ण रहेको हुनाले अस्वीकृत गरिएको छ।') : undefined,
    infoRequestNote: targetStatus === 'info_requested' ? (infoRequestNote || 'कृपया आफ्नो थप प्रमाणपत्र तथा विवरण अद्यावधिक गर्नुहोस्।') : undefined,
    updatedAtBS: todayBS,
  };

  members[index] = updatedMember;
  saveOfficialMembers(members);
  return updatedMember;
}

// Dedicated API method: Verify / Approve Expert or Staff Profile with Notification
export function verifyMemberProfile(
  id: string,
  adminUsername: string = 'admin'
): OfficialMemberProfile | null {
  const updatedMember = adminUpdateMemberStatus(id, 'approved');
  if (!updatedMember) return null;

  // Send system notification to user/members
  try {
    sendAdminNotification(
      'all_members',
      'विशेषज्ञ सदस्य',
      'विशेषज्ञ प्रोफाइल स्वीकृत भयो',
      `हार्दिक बधाई! ${updatedMember.fullName} (${updatedMember.title}) को विशेषज्ञ प्रोफाइल प्रशासकबाट सफलतापूर्वक प्रमाणीकरण तथा स्वीकृत भएको छ।`,
      adminUsername
    );
    logAdminAction(
      adminUsername,
      'प्रशासक',
      'expert',
      'विशेषज्ञ प्रोफाइल प्रमाणीकरण तथा स्वीकृति',
      updatedMember.id,
      updatedMember.fullName,
      `विशेषज्ञ (आवेदन नं: ${updatedMember.applicationNumber}) प्रोफाइल स्वीकृत गरियो।`
    );
  } catch (e) {
    console.error('Failed to log admin action or notification for member verification:', e);
  }

  return updatedMember;
}

// Dedicated API method: Reject Expert or Staff Profile with Reason & Notification
export function rejectMemberProfile(
  id: string,
  rejectionReason: string,
  adminUsername: string = 'admin'
): OfficialMemberProfile | null {
  const updatedMember = adminUpdateMemberStatus(id, 'rejected', rejectionReason);
  if (!updatedMember) return null;

  // Send system notification to user/members
  try {
    sendAdminNotification(
      'all_members',
      'विशेषज्ञ सदस्य',
      'विशेषज्ञ प्रोफाइल अस्वीकृत सूचना',
      `${updatedMember.fullName} को विशेषज्ञ प्रोफाइल निवेदन अस्वीकृत गरिएको छ। कारण: ${rejectionReason}`,
      adminUsername
    );
    logAdminAction(
      adminUsername,
      'प्रशासक',
      'expert',
      'विशेषज्ञ प्रोफाइल अस्वीकार',
      updatedMember.id,
      updatedMember.fullName,
      `विशेषज्ञ (आवेदन नं: ${updatedMember.applicationNumber}) प्रोफाइल अस्वीकृत गरियो। कारण: ${rejectionReason}`
    );
  } catch (e) {
    console.error('Failed to log admin action or notification for member rejection:', e);
  }

  return updatedMember;
}

// Unified API method for AdminControlPanel
export function verifyOrRejectMemberProfile(
  id: string,
  approvalStatus: 'Approved' | 'Rejected',
  rejectionReason?: string,
  adminUsername: string = 'admin'
): OfficialMemberProfile | null {
  if (approvalStatus === 'Approved') {
    return verifyMemberProfile(id, adminUsername);
  } else {
    return rejectMemberProfile(id, rejectionReason || 'मापदण्ड अनुसार कागजात अपूर्ण रहेको', adminUsername);
  }
}

// Rule 10: Admin Toggle Verification ("प्रमाणित")
export function adminToggleMemberVerification(id: string, isVerified: boolean): OfficialMemberProfile | null {
  const members = getStoredOfficialMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const updatedMember: OfficialMemberProfile = {
    ...members[index],
    isVerified,
    approvalStatus: isVerified ? 'Approved' : members[index].approvalStatus
  };

  members[index] = updatedMember;
  saveOfficialMembers(members);
  return updatedMember;
}

// Rule 8 & 9: Member Self Profile Update (photo, expertise, phone, bio, availability)
export function memberSelfUpdateProfile(
  id: string, 
  updates: {
    fullName?: string;
    title?: string;
    photoUrl?: string;
    expertise?: string[];
    contactPhone?: string;
    email?: string;
    bio?: string;
    experienceYears?: number;
    isAvailable?: boolean;
  }
): OfficialMemberProfile | null {
  const members = getStoredOfficialMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const current = members[index];

  // Strictly exclude status and isVerified from member self update
  const updatedMember: OfficialMemberProfile = {
    ...current,
    fullName: updates.fullName !== undefined ? updates.fullName : current.fullName,
    title: updates.title !== undefined ? updates.title : current.title,
    photoUrl: updates.photoUrl !== undefined ? updates.photoUrl : current.photoUrl,
    expertise: updates.expertise !== undefined ? updates.expertise : current.expertise,
    contactPhone: updates.contactPhone !== undefined ? updates.contactPhone : current.contactPhone,
    email: updates.email !== undefined ? updates.email : current.email,
    bio: updates.bio !== undefined ? updates.bio : current.bio,
    experienceYears: updates.experienceYears !== undefined ? updates.experienceYears : current.experienceYears,
    isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : current.isAvailable,
    // Keep verified and status intact!
    isVerified: current.isVerified,
    status: current.status,
    approvalStatus: current.approvalStatus,
  };

  members[index] = updatedMember;
  saveOfficialMembers(members);
  return updatedMember;
}

// Rule 14: Re-apply for rejected members
export function reapplyOfficialMember(
  id: string, 
  updatedData: {
    fullName: string;
    title: string;
    role: MemberRoleType;
    photoUrl?: string;
    expertise: string[];
    contactPhone: string;
    email?: string;
    experienceYears: number;
    bio: string;
  }
): OfficialMemberProfile | null {
  const members = getStoredOfficialMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const todayAD = new Date().toISOString().split('T')[0];
  const todayBS = convertADToBS(todayAD).formattedBS;

  const updatedMember: OfficialMemberProfile = {
    ...members[index],
    fullName: updatedData.fullName,
    title: updatedData.title,
    role: updatedData.role,
    photoUrl: updatedData.photoUrl,
    expertise: updatedData.expertise,
    contactPhone: updatedData.contactPhone,
    email: updatedData.email,
    experienceYears: updatedData.experienceYears,
    bio: updatedData.bio,
    status: 'pending', // Reset status to pending for admin review
    approvalStatus: 'Pending',
    rejectionReason: undefined, // Clear rejection reason
    updatedAtBS: todayBS,
  };

  members[index] = updatedMember;
  saveOfficialMembers(members);
  return updatedMember;
}

// Helpers to extract public lists for Astrologers, Purohits, and Vastu Experts
export function getApprovedAstrologersFromMembers(members: OfficialMemberProfile[]): AstrologerProfile[] {
  return members
    .filter((m) => (m.status === 'approved' || m.approvalStatus === 'Approved') && (m.role === 'astrologer' || m.role === 'both' || m.role === 'all'))
    .map((m) => ({
      id: m.id,
      name: m.fullName,
      photoUrl: m.photoUrl,
      title: m.title || 'आधिकारिक ज्योतिषाचार्य',
      expertise: m.expertise || [],
      contactPhone: m.contactPhone,
      email: m.email,
      experienceYears: m.experienceYears || 1,
      bio: m.bio,
      isAvailable: m.isAvailable,
      isVerified: m.isVerified,
      status: m.status,
      isPreExisting: m.isPreExisting,
      role: m.role,
    }));
}

export function getApprovedPurohitsFromMembers(members: OfficialMemberProfile[]): PurohitProfile[] {
  return members
    .filter((m) => (m.status === 'approved' || m.approvalStatus === 'Approved') && (m.role === 'purohit' || m.role === 'both' || m.role === 'all'))
    .map((m) => ({
      id: m.id,
      name: m.fullName,
      photoUrl: m.photoUrl,
      speciality: m.expertise || [],
      contactPhone: m.contactPhone,
      experienceYears: m.experienceYears || 1,
      bio: m.bio,
      isAvailable: m.isAvailable,
      isVerified: m.isVerified,
      status: m.status,
      isPreExisting: m.isPreExisting,
      role: m.role,
    }));
}

export function getApprovedVastuExpertsFromMembers(members: OfficialMemberProfile[]): VastuExpertProfile[] {
  return members
    .filter((m) => (m.status === 'approved' || m.approvalStatus === 'Approved') && (m.role === 'vastu' || m.role === 'both' || m.role === 'all'))
    .map((m) => ({
      id: m.id,
      name: m.fullName,
      photoUrl: m.photoUrl,
      title: m.title || 'आधिकारिक वास्तुविद्',
      speciality: m.expertise || [],
      contactPhone: m.contactPhone,
      email: m.email,
      experienceYears: m.experienceYears || 1,
      bio: m.bio,
      isAvailable: m.isAvailable,
      isVerified: m.isVerified,
      status: m.status,
      isPreExisting: m.isPreExisting,
      role: m.role,
      serviceMode: m.serviceMode || 'both',
    }));
}

export function editOfficialMember(
  id: string,
  updates: Partial<OfficialMemberProfile>,
  adminUsername: string = 'admin'
): OfficialMemberProfile | null {
  const members = getStoredOfficialMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const todayAD = new Date().toISOString().split('T')[0];
  const todayBS = convertADToBS(todayAD).formattedBS;

  const current = members[index];
  const updated: OfficialMemberProfile = {
    ...current,
    ...updates,
    updatedAtBS: todayBS,
  };

  members[index] = updated;
  saveOfficialMembers(members);

  try {
    logAdminAction(
      adminUsername,
      'प्रशासक',
      'expert',
      'विशेषज्ञ सदस्यता/प्रोफाइल संशोधन',
      id,
      updated.fullName,
      `विशेषज्ञ विवरण सुपरएडमिनद्वारा सम्पादन गरियो।`
    );
  } catch (e) {
    console.error('Failed to log admin action for member edit:', e);
  }

  return updated;
}

export function deleteOfficialMember(
  id: string,
  adminUsername: string = 'admin'
): boolean {
  const members = getStoredOfficialMembers();
  const found = members.find((m) => m.id === id);
  if (!found) return false;

  const filtered = members.filter((m) => m.id !== id);
  saveOfficialMembers(filtered);

  try {
    logAdminAction(
      adminUsername,
      'प्रशासक',
      'expert',
      'विशेषज्ञ सदस्यता/प्रोफाइल खारेज',
      id,
      found.fullName,
      `विशेषज्ञ (नाम: ${found.fullName}) सुपरएडमिनद्वारा प्रणालीबाट स्थायी रूपमा हटाइयो।`
    );
  } catch (e) {
    console.error('Failed to log admin action for member delete:', e);
  }

  return true;
}


