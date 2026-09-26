import { LocationCoordinates, ServiceProvider, ServiceRequest } from '../types/yajamanTypes';

/**
 * Radius search progression steps in KM (Pathao-style expansion)
 */
export const MATCHING_RADIUS_STEPS = [3, 5, 10, 15, 20, 30];

/**
 * Default Kathmadu Center Location (Asan / Durbar Square area)
 */
export const DEFAULT_NEPAL_LOCATION: LocationCoordinates = {
  latitude: 27.700769,
  longitude: 85.300140,
  addressName: 'काठमाडौँ, नेपाल',
  district: 'काठमाडौँ',
  localLevel: 'काठमाडौँ महानगरपालिका',
  ward: '२२',
};

/**
 * Calculates straight-line distance in kilometers between two GPS lat/long points
 * using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place (e.g., 2.4 km)
}

/**
 * Priority Scoring Algorithm for Provider Matching:
 * 1. Category match (Required)
 * 2. Specific expertise match
 * 3. Availability
 * 4. Distance (Proximity)
 * 5. Rating
 * 6. Completed service count
 * 7. Verification Status
 */
export function calculateProviderMatchScore(
  provider: ServiceProvider,
  request: ServiceRequest,
  currentRadiusKm: number
): { score: number; distanceKm: number; isEligible: boolean } {
  // 1. Check availability and verification
  if (!provider.isAvailable || provider.verificationStatus !== 'VERIFIED') {
    return { score: 0, distanceKm: 999, isEligible: false };
  }

  // 2. Check if provider has rejected this request
  if (request.rejectedProviderIds.includes(provider.id)) {
    return { score: 0, distanceKm: 999, isEligible: false };
  }

  // 3. Category match check
  const categoryMatch = provider.categories.some(
    (cat) => cat.toLowerCase() === request.categoryId.toLowerCase()
  );
  if (!categoryMatch) {
    return { score: 0, distanceKm: 999, isEligible: false };
  }

  // 4. Calculate Distance
  const distanceKm = calculateDistanceKm(
    request.location.latitude,
    request.location.longitude,
    provider.location.latitude,
    provider.location.longitude
  );

  // 5. Distance within current radius step check
  if (distanceKm > currentRadiusKm) {
    return { score: 0, distanceKm, isEligible: false };
  }

  // Compute composite score
  let score = 100; // Base score for category match

  // Expertise bonus
  const lowerServiceType = request.serviceType.toLowerCase();
  const expertiseBonus = provider.expertise.some((exp) =>
    lowerServiceType.includes(exp.toLowerCase())
  )
    ? 50
    : 10;
  score += expertiseBonus;

  // Proximity bonus (closer distance = higher score)
  const proximityBonus = Math.max(0, (30 - distanceKm) * 3);
  score += proximityBonus;

  // Rating bonus
  score += (provider.rating || 4.5) * 10;

  // Completed services bonus
  score += Math.min(30, (provider.completedServicesCount || 0) * 2);

  return { score, distanceKm, isEligible: true };
}

/**
 * Mask sensitive contact info for privacy (e.g. "९८४१******" or "******")
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '९८********';
  const clean = phone.trim();
  if (clean.length < 6) return '********';
  return clean.substring(0, 4) + '******' + clean.substring(clean.length - 2);
}

export function maskEmail(email?: string): string {
  if (!email) return '***@***.com';
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.com';
  const name = parts[0];
  const maskedName = name.length > 2 ? name.substring(0, 2) + '***' : '***';
  return `${maskedName}@${parts[1]}`;
}

export function maskAddress(address?: string): string {
  if (!address) return 'काठमाडौँ (समीप क्षेत्र)';
  const parts = address.split(',');
  if (parts.length > 1) {
    return `${parts[0].trim()} (समीप)`;
  }
  return `${address.substring(0, 6)}...`;
}

/**
 * Generates matching badge categories for service provider cards
 */
export function getProviderMatchingBadges(
  provider: ServiceProvider,
  distanceKm?: number
): { type: 'BEST_MATCH' | 'NEAREST' | 'TOP_RATED' | 'FAST_RESPONSE'; labelNepali: string; colorClass: string }[] {
  const badges: { type: 'BEST_MATCH' | 'NEAREST' | 'TOP_RATED' | 'FAST_RESPONSE'; labelNepali: string; colorClass: string }[] = [];

  if (distanceKm !== undefined && distanceKm <= 3) {
    badges.push({
      type: 'NEAREST',
      labelNepali: 'सबैभन्दा नजिक (०-३ किमी)',
      colorClass: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    });
  }

  if ((provider.rating || 0) >= 4.8) {
    badges.push({
      type: 'TOP_RATED',
      labelNepali: 'उच्च रेटिङ (Top Rated)',
      colorClass: 'bg-amber-950 text-amber-400 border-amber-800',
    });
  }

  if ((provider.completedServicesCount || 0) >= 100) {
    badges.push({
      type: 'FAST_RESPONSE',
      labelNepali: 'द्रुत जवाफ (Fast Response)',
      colorClass: 'bg-sky-950 text-sky-400 border-sky-800',
    });
  }

  if (badges.length === 0) {
    badges.push({
      type: 'BEST_MATCH',
      labelNepali: 'उत्कृष्ट मिलाप (Best Match)',
      colorClass: 'bg-stone-800 text-stone-200 border-stone-700',
    });
  }

  return badges;
}
