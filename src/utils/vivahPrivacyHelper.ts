import { VivahProfile, ProfileGender } from '../types/vivahTypes';
import { BirthDetails, VivahMilanResult } from '../types/astrology';
import { calculateVivahMilan } from './vivahEngine';
import { toDevanagariNumerals } from './nepaliCalendar';

const MY_VIVAH_PROFILE_STORAGE_KEY = 'balananda_my_vivah_profile_v1';

/**
 * Mask person's name for matrimonial privacy and discretion (नाम आधा मात्र लेख्ने)
 * e.g., "पूजा न्यौपाने" -> "पूजा न्यौ..."
 * e.g., "डा. प्रनिशा श्रेष्ठ" -> "डा. प्रनिशा श्रे..."
 * e.g., "इ. रुपेश के.सी." -> "इ. रुपेश के..."
 * e.g., "सुमन शर्मा" -> "सुमन श..."
 */
export function maskMatrimonialName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') return 'गुमनाम';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    const single = parts[0];
    const half = Math.max(2, Math.floor(single.length / 2));
    return single.slice(0, half) + '...';
  }

  // Handle titles like डा., इ., पं., श्री
  const titles = ['डा.', 'डा', 'इ.', 'इ', 'पं.', 'पं', 'श्री', 'श्रीमती', 'सुश्री', 'Er.', 'Dr.', 'Mr.', 'Ms.'];
  let titlePrefix = '';
  let restParts = [...parts];

  if (titles.includes(restParts[0])) {
    titlePrefix = restParts[0] + ' ';
    restParts.shift();
  }

  if (restParts.length === 1) {
    const single = restParts[0];
    const half = Math.max(2, Math.floor(single.length / 2));
    return `${titlePrefix}${single.slice(0, half)}...`;
  }

  const firstName = restParts[0];
  const lastName = restParts[restParts.length - 1];

  // Take only 2 to 3 characters/graphemes of the last name
  const surnamePrefixLen = lastName.length > 3 ? 3 : Math.max(1, Math.floor(lastName.length / 2));
  const maskedSurname = lastName.slice(0, surnamePrefixLen) + '...';

  return `${titlePrefix}${firstName} ${maskedSurname}`;
}

/**
 * Convert VivahProfile into a standardized BirthDetails object for Kundali calculation
 */
export function vivahProfileToBirthDetails(profile: Partial<VivahProfile>): BirthDetails {
  const gender = profile.gender === 'GROOM' ? 'male' : 'female';
  const name = profile.userFullName || profile.displayFirstName || 'व्यक्ति';
  const dateAD = profile.dobAD || '1996-05-15';
  const dateBS = profile.dobBS || '२०५३-०२-०२';
  const time = profile.birthTime || '०८:३०';
  const locName = profile.birthPlace || profile.currentDistrict || 'काठमाडौँ';

  return {
    id: profile.id || `birth_${Date.now()}`,
    name,
    gender,
    dateAD,
    dateBS,
    time,
    location: {
      name: locName,
      country: 'नेपाल',
      latitude: 27.7172,
      longitude: 85.3240,
      timeZone: 5.75,
    },
    fatherDetails: {
      name: profile.fatherOccupation ? `पिता (${profile.fatherOccupation})` : '',
      gotra: profile.gotra || '',
      occupation: profile.fatherOccupation || '',
    },
    category: 'Client',
  };
}

export interface KundaliMatchItem {
  profile: VivahProfile;
  milanResult: VivahMilanResult;
  totalGuna: number; // e.g. 28 out of 36
  percentage: number;
  qualityLabelNepali: string; // 'उत्कृष्ट' | 'उत्तम' | 'मध्यम' | 'सामान्य'
  nadiStatusNepali: string;
  bhakootStatusNepali: string;
  mangalStatusNepali: string;
}

/**
 * Calculate authentic 36 Guna Kundali Milan between user and a candidate profile
 */
export function calculateKundaliMilanForCandidate(
  myProfile: VivahProfile,
  candidate: VivahProfile
): KundaliMatchItem {
  const myBirth = vivahProfileToBirthDetails(myProfile);
  const candidateBirth = vivahProfileToBirthDetails(candidate);

  // vivahEngine expects (boy, girl)
  const isMyGroom = myProfile.gender === 'GROOM';
  const boyDetails = isMyGroom ? myBirth : candidateBirth;
  const girlDetails = isMyGroom ? candidateBirth : myBirth;

  const result = calculateVivahMilan(boyDetails, girlDetails);
  const totalGuna = result.totalScore;
  const percentage = Math.round((totalGuna / 36) * 100);

  let qualityLabelNepali = 'सामान्य';
  if (totalGuna >= 28) qualityLabelNepali = 'अति उत्तम';
  else if (totalGuna >= 24) qualityLabelNepali = 'उत्कृष्ट';
  else if (totalGuna >= 18) qualityLabelNepali = 'अनुकूल (शुभ)';
  else qualityLabelNepali = 'सामान्य विचारणीय';

  const nadiKoot = result.ashtakoot.find((k) => k.kootName === 'Nadi');
  const nadiStatus = nadiKoot?.obtainedPoints === 8
    ? 'निर्दोष (८/८ अङ्क)'
    : nadiKoot?.isCancelled
    ? 'परिहार भएको (शुभ)'
    : 'शान्ति आवश्यक';

  const bhakootKoot = result.ashtakoot.find((k) => k.kootName === 'Bhakoot');
  const bhakootStatus = bhakootKoot?.obtainedPoints === 7
    ? 'शुभ (७/७ अङ्क)'
    : bhakootKoot?.isCancelled
    ? 'परिहार भएको (शुभ)'
    : 'विचारणीय';

  const mangalStatus = result.isMangalDoshaCancelled
    ? 'मंगल दोष परिहार'
    : (result.mangalDoshaBoy.isManglik || result.mangalDoshaGirl.isManglik)
    ? 'मंगल स्थिति विचारणीय'
    : 'मंगल अनुकूल (निर्दोष)';

  return {
    profile: candidate,
    milanResult: result,
    totalGuna,
    percentage,
    qualityLabelNepali,
    nadiStatusNepali: nadiStatus,
    bhakootStatusNepali: bhakootStatus,
    mangalStatusNepali: mangalStatus,
  };
}

/**
 * Filter and sort candidates to get Top Kundali Matches (उच्च ३६ गुण मिलेका वर-वधुहरू)
 */
export function getTopKundaliMatches(
  myProfile: VivahProfile | null,
  candidates: VivahProfile[]
): KundaliMatchItem[] {
  if (!myProfile) return [];

  const targetGender = myProfile.gender === 'GROOM' ? 'BRIDE' : 'GROOM';
  const validCandidates = candidates.filter(
    (c) => c.id !== myProfile.id && c.gender === targetGender && c.isActive
  );

  const matched = validCandidates.map((c) =>
    calculateKundaliMilanForCandidate(myProfile, c)
  );

  // Sort descending by 36 Guna score
  return matched.sort((a, b) => b.totalGuna - a.totalGuna);
}

/**
 * Get or load stored user profile for Vivah portal
 */
export function getStoredMyVivahProfile(): VivahProfile | null {
  try {
    const raw = localStorage.getItem(MY_VIVAH_PROFILE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load my vivah profile from localStorage:', err);
  }
  return null;
}

/**
 * Save user profile for Vivah portal
 */
export function saveStoredMyVivahProfile(profile: VivahProfile): void {
  try {
    localStorage.setItem(MY_VIVAH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('my-vivah-profile-updated', { detail: profile }));
  } catch (err) {
    console.error('Failed to save my vivah profile to localStorage:', err);
  }
}
