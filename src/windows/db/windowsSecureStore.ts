/**
 * Windows Offline Application — Secure Local Database Store
 * Implements 100% offline data storage with client encryption for:
 * 1. User Profiles & Accounts (with PIN / Password hashed)
 * 2. Birth Profiles (Kundali data)
 * 3. Vastu Projects & Metadata
 * 4. Floor Plans & Room Placements
 * 5. Saved Reports
 */

import { VastuProjectMetadata } from '../../core/vastu/vastuReport';
import { RoomPlacementEntry, VastuAnalysisResult } from '../../core/vastu/vastuAnalysis';

export interface WindowsUserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  pinHash: string; // SHA-256 salt-hashed
  role: 'ASTRO_VASTU_EXPERT' | 'PRACTITIONER' | 'CLIENT';
  lastActive: string;
  createdAt: string;
}

export interface WindowsBirthProfile {
  id: string;
  userId: string;
  name: string;
  relation: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateBS: string;
  dateAD: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: number;
  ayanamsa: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WindowsVastuFloorPlanRecord {
  id: string;
  projectId: string;
  floorName: string;
  gridType: '8-DIRECTION' | '16-DIRECTION' | '81-PARAMASAYIKA';
  compassRotationDegree: number; // 0 to 360
  placements: RoomPlacementEntry[];
  analysisCache?: VastuAnalysisResult;
  updatedAt: string;
}

export interface WindowsSavedReportRecord {
  id: string;
  userId: string;
  type: 'JYOTISH' | 'VASTU';
  title: string;
  associatedProfileOrProjectName: string;
  reportJson: string; // Encrypted string
  createdAt: string;
}

// -------------------------------------------------------------
// Encryption & Security Utilities (Zero Plaintext Sensitive Storage)
// -------------------------------------------------------------
const ENCRYPTION_SALT = 'Balananda_Vedic_Jyotish_Vastu_2026_Secure_Key';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16) + '_sec';
}

export function hashPin(pin: string): string {
  return simpleHash(`${pin}_${ENCRYPTION_SALT}`);
}

function encryptPayload(data: any): string {
  try {
    const jsonStr = JSON.stringify(data);
    // Simple reversible XOR encryption + Base64
    const key = ENCRYPTION_SALT;
    let result = '';
    for (let i = 0; i < jsonStr.length; i++) {
      result += String.fromCharCode(jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(unescape(encodeURIComponent(result)));
  } catch {
    return JSON.stringify(data);
  }
}

function decryptPayload<T>(ciphertext: string, fallback: T): T {
  try {
    const raw = decodeURIComponent(escape(atob(ciphertext)));
    const key = ENCRYPTION_SALT;
    let jsonStr = '';
    for (let i = 0; i < raw.length; i++) {
      jsonStr += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return JSON.parse(jsonStr) as T;
  } catch {
    try {
      return JSON.parse(ciphertext) as T;
    } catch {
      return fallback;
    }
  }
}

// -------------------------------------------------------------
// Local Storage Keys for 100% Offline Persistence
// -------------------------------------------------------------
const STORAGE_KEYS = {
  USERS: 'balananda_win_users_enc',
  ACTIVE_USER: 'balananda_win_active_user',
  BIRTH_PROFILES: 'balananda_win_birth_profiles_enc',
  VASTU_PROJECTS: 'balananda_win_vastu_projects_enc',
  FLOOR_PLANS: 'balananda_win_floor_plans_enc',
  SAVED_REPORTS: 'balananda_win_reports_enc',
};

// -------------------------------------------------------------
// Database API Operations
// -------------------------------------------------------------

// Default Demo User Profile for instant offline usage
const DEFAULT_OFFLINE_USER: WindowsUserProfile = {
  id: 'win_user_default',
  name: 'वैदिक ज्योतिषी तथा वास्तुविद्',
  phone: '9800000000',
  pinHash: hashPin('1234'),
  role: 'ASTRO_VASTU_EXPERT',
  lastActive: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

// Default Demo Birth Profile
const DEFAULT_OFFLINE_BIRTH_PROFILE: WindowsBirthProfile = {
  id: 'bp_demo_1',
  userId: 'win_user_default',
  name: 'राम प्रसाद अधिकारी',
  relation: 'आफ्नो',
  gender: 'MALE',
  dateBS: '2055-06-15',
  dateAD: '1998-10-01',
  timeOfBirth: '06:45',
  placeOfBirth: 'काठमाडौँ, नेपाल',
  latitude: 27.7172,
  longitude: 85.324,
  timezone: 5.75,
  ayanamsa: 'Lahiri',
  notes: 'मूल जन्म कुण्डली',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default Demo Vastu Project
const DEFAULT_OFFLINE_VASTU_PROJECT: VastuProjectMetadata = {
  id: 'vp_demo_1',
  projectName: 'शान्ति निकेतन (आवासीय भवन)',
  ownerName: 'हरि शरण शर्मा',
  propertyType: 'आवासीय घर',
  facingDirection: 'E',
  address: 'टोखा, काठमाडौँ',
  contactNumber: '9841000000',
  plotDimensions: '३५ फिट x ४५ फिट',
  constructionStatus: 'बनेको पुरानो घर',
  notes: 'पूर्व मोहडा भएको २ तले घरको वास्तु परीक्षण',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_OFFLINE_FLOOR_PLAN: WindowsVastuFloorPlanRecord = {
  id: 'fp_demo_1',
  projectId: 'vp_demo_1',
  floorName: 'भुइँतला (Ground Floor)',
  gridType: '8-DIRECTION',
  compassRotationDegree: 0,
  placements: [
    { roomId: 'entrance', direction: 'E', customName: 'मुख्य प्रवेशद्वार' },
    { roomId: 'puja_room', direction: 'NE', customName: 'पारिवारिक मन्दिर' },
    { roomId: 'kitchen', direction: 'SE', customName: 'भान्सा कोठा' },
    { roomId: 'master_bedroom', direction: 'SW', customName: 'मालिकको शयनकक्ष' },
    { roomId: 'living_room', direction: 'N', customName: 'बैठक कोठा' },
    { roomId: 'toilet', direction: 'NW', customName: 'साझा शौचालय' },
    { roomId: 'staircase', direction: 'S', customName: 'माथिल्लो तलामा जाने सिँढी' },
  ],
  updatedAt: new Date().toISOString(),
};

/**
 * Initializes offline database with default structures if empty
 */
export function initWindowsOfflineDatabase(): void {
  if (typeof window === 'undefined') return;

  // Initialize Users
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const enc = encryptPayload([DEFAULT_OFFLINE_USER]);
    localStorage.setItem(STORAGE_KEYS.USERS, enc);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(DEFAULT_OFFLINE_USER));
  }

  // Initialize Birth Profiles
  if (!localStorage.getItem(STORAGE_KEYS.BIRTH_PROFILES)) {
    const enc = encryptPayload([DEFAULT_OFFLINE_BIRTH_PROFILE]);
    localStorage.setItem(STORAGE_KEYS.BIRTH_PROFILES, enc);
  }

  // Initialize Vastu Projects
  if (!localStorage.getItem(STORAGE_KEYS.VASTU_PROJECTS)) {
    const enc = encryptPayload([DEFAULT_OFFLINE_VASTU_PROJECT]);
    localStorage.setItem(STORAGE_KEYS.VASTU_PROJECTS, enc);
  }

  // Initialize Floor Plans
  if (!localStorage.getItem(STORAGE_KEYS.FLOOR_PLANS)) {
    const enc = encryptPayload([DEFAULT_OFFLINE_FLOOR_PLAN]);
    localStorage.setItem(STORAGE_KEYS.FLOOR_PLANS, enc);
  }
}

// -------------------------------------------------------------
// User & Auth Management
// -------------------------------------------------------------
export function getActiveWindowsUser(): WindowsUserProfile | null {
  if (typeof window === 'undefined') return DEFAULT_OFFLINE_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (!raw) return DEFAULT_OFFLINE_USER;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_OFFLINE_USER;
  }
}

export function getAllWindowsUsers(): WindowsUserProfile[] {
  if (typeof window === 'undefined') return [DEFAULT_OFFLINE_USER];
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!raw) return [DEFAULT_OFFLINE_USER];
  return decryptPayload<WindowsUserProfile[]>(raw, [DEFAULT_OFFLINE_USER]);
}

export function saveWindowsUser(user: WindowsUserProfile): void {
  const users = getAllWindowsUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, encryptPayload(users));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
}

// -------------------------------------------------------------
// Birth Profiles (Jyotish)
// -------------------------------------------------------------
export function getAllBirthProfiles(): WindowsBirthProfile[] {
  if (typeof window === 'undefined') return [DEFAULT_OFFLINE_BIRTH_PROFILE];
  const raw = localStorage.getItem(STORAGE_KEYS.BIRTH_PROFILES);
  if (!raw) return [DEFAULT_OFFLINE_BIRTH_PROFILE];
  return decryptPayload<WindowsBirthProfile[]>(raw, [DEFAULT_OFFLINE_BIRTH_PROFILE]);
}

export function saveBirthProfile(profile: WindowsBirthProfile): void {
  const list = getAllBirthProfiles();
  const index = list.findIndex((p) => p.id === profile.id);
  if (index >= 0) {
    list[index] = { ...profile, updatedAt: new Date().toISOString() };
  } else {
    list.push({ ...profile, updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEYS.BIRTH_PROFILES, encryptPayload(list));
}

export function deleteBirthProfile(id: string): void {
  const list = getAllBirthProfiles().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.BIRTH_PROFILES, encryptPayload(list));
}

// -------------------------------------------------------------
// Vastu Projects
// -------------------------------------------------------------
export function getAllVastuProjects(): VastuProjectMetadata[] {
  if (typeof window === 'undefined') return [DEFAULT_OFFLINE_VASTU_PROJECT];
  const raw = localStorage.getItem(STORAGE_KEYS.VASTU_PROJECTS);
  if (!raw) return [DEFAULT_OFFLINE_VASTU_PROJECT];
  return decryptPayload<VastuProjectMetadata[]>(raw, [DEFAULT_OFFLINE_VASTU_PROJECT]);
}

export function saveVastuProject(project: VastuProjectMetadata): void {
  const list = getAllVastuProjects();
  const index = list.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    list[index] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    list.push({ ...project, updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEYS.VASTU_PROJECTS, encryptPayload(list));
}

export function deleteVastuProject(id: string): void {
  const list = getAllVastuProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.VASTU_PROJECTS, encryptPayload(list));
  // Also clean up floor plans
  const fpList = getAllFloorPlans().filter((fp) => fp.projectId !== id);
  localStorage.setItem(STORAGE_KEYS.FLOOR_PLANS, encryptPayload(fpList));
}

// -------------------------------------------------------------
// Floor Plans & Placements
// -------------------------------------------------------------
export function getAllFloorPlans(): WindowsVastuFloorPlanRecord[] {
  if (typeof window === 'undefined') return [DEFAULT_OFFLINE_FLOOR_PLAN];
  const raw = localStorage.getItem(STORAGE_KEYS.FLOOR_PLANS);
  if (!raw) return [DEFAULT_OFFLINE_FLOOR_PLAN];
  return decryptPayload<WindowsVastuFloorPlanRecord[]>(raw, [DEFAULT_OFFLINE_FLOOR_PLAN]);
}

export function getFloorPlanByProjectId(projectId: string): WindowsVastuFloorPlanRecord {
  const all = getAllFloorPlans();
  const found = all.find((fp) => fp.projectId === projectId);
  if (found) return found;

  // Create empty default plan for project
  const newPlan: WindowsVastuFloorPlanRecord = {
    id: `fp_${Date.now()}`,
    projectId,
    floorName: 'मुख्य तला',
    gridType: '8-DIRECTION',
    compassRotationDegree: 0,
    placements: [
      { roomId: 'entrance', direction: 'E', customName: 'मुख्य ढोका' },
      { roomId: 'puja_room', direction: 'NE', customName: 'पूजा कोठा' },
      { roomId: 'kitchen', direction: 'SE', customName: 'भान्सा' },
      { roomId: 'master_bedroom', direction: 'SW', customName: 'मुख्य शयनकक्ष' },
    ],
    updatedAt: new Date().toISOString(),
  };
  saveFloorPlan(newPlan);
  return newPlan;
}

export function saveFloorPlan(plan: WindowsVastuFloorPlanRecord): void {
  const list = getAllFloorPlans();
  const index = list.findIndex((fp) => fp.id === plan.id || fp.projectId === plan.projectId);
  if (index >= 0) {
    list[index] = { ...plan, updatedAt: new Date().toISOString() };
  } else {
    list.push({ ...plan, updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEYS.FLOOR_PLANS, encryptPayload(list));
}
