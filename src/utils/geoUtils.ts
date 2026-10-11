import { LocationCoordinates, ServiceProvider, ServiceRequest } from '../types/yajamanTypes';
import { NEPAL_77_DISTRICTS } from './geoLocationHelper';

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

export interface PreciseLandmarkResult {
  addressText: string;
  displayName: string;
  locationCoordinates: LocationCoordinates;
  landmarkName?: string;
  toleOrChowk?: string;
  roadName?: string;
  wardNepali?: string;
  municipalityNepali?: string;
  districtNepali?: string;
  district: string;
  province: string;
  municipality: string;
  accuracyMeters?: number;
}

const DEVANAGARI_DIGITS_MAP: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
};

function toDevanagariNumeralsStr(val: string | number): string {
  return String(val).replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS_MAP[d] || d);
}

function extractWardNepali(str?: string): string | undefined {
  if (!str) return undefined;
  const match = String(str).match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > 0 && num <= 45) {
      return `वडा नं. ${toDevanagariNumeralsStr(num)}`;
    }
  }
  return undefined;
}

function cleanDistrictName(d?: string): string {
  if (!d) return '';
  return String(d)
    .replace(/\s*जिल्ला\s*/g, '')
    .replace(/\s*District\s*/gi, '')
    .trim();
}

/**
 * Resolves high-precision reverse-geocoded place names in Nepal using OpenStreetMap Nominatim,
 * Photon, and BigDataCloud with progressive 50-meter -> 100-meter -> 500-meter nearby landmark identification.
 * Guaranteed NEVER to return "undefined".
 */
export async function getPreciseNepalLandmark(
  lat: number,
  lon: number,
  accuracyMeters?: number
): Promise<PreciseLandmarkResult> {
  let landmarkName = '';
  let toleOrChowk = '';
  let roadName = '';
  let wardNepali = '';
  let municipalityNepali = '';
  let districtNepali = '';
  let provinceNepali = '';

  // 1. Primary High-Accuracy Reverse Geocoding: OpenStreetMap Nominatim
  // Progressive zoom: try zoom 18 (50m precision)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&extratags=1&accept-language=ne,en`;
    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BalanandaVedicJyotish/1.0' },
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      landmarkName = addr.amenity || addr.historic || addr.tourism || addr.building || addr.shop || addr.leisure || data.name || '';
      toleOrChowk = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.quarter || addr.residential || '';
      roadName = addr.road || addr.street || addr.highway || '';
      wardNepali = extractWardNepali(addr.city_district || addr.ward || addr.suburb || addr['ref:ward']) || '';
      municipalityNepali = addr.municipality || addr.city || addr.town || addr.village_council || '';
      districtNepali = cleanDistrictName(addr.county || addr.district || addr.state_district);
      provinceNepali = addr.state || '';
    }
  } catch {}

  // 1.5 If landmark/tole not found at 50m, broaden Nominatim to zoom 16 (100m - 500m area)
  if (!landmarkName && !toleOrChowk) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const nominatimBroadUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1&accept-language=ne,en`;
      const res = await fetch(nominatimBroadUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'BalanandaVedicJyotish/1.0' },
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        toleOrChowk = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.quarter || addr.residential || toleOrChowk;
        roadName = addr.road || addr.street || roadName;
        if (!wardNepali) wardNepali = extractWardNepali(addr.city_district || addr.ward || addr.suburb) || '';
        if (!municipalityNepali) municipalityNepali = addr.municipality || addr.city || addr.town || '';
        if (!districtNepali) districtNepali = cleanDistrictName(addr.county || addr.district || addr.state_district);
        if (!provinceNepali) provinceNepali = addr.state || '';
      }
    } catch {}
  }

  // 2. Secondary Supplement: Photon (Komoot) for micro-POI / Landmark within 50m - 500m
  if (!landmarkName || !toleOrChowk) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
      const pRes = await fetch(photonUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (pRes.ok) {
        const pData = await pRes.json();
        const feat = pData.features?.[0];
        if (feat && feat.properties) {
          const props = feat.properties;
          if (!landmarkName && props.name) {
            landmarkName = props.name;
          }
          if (!toleOrChowk && (props.locality || props.district)) {
            toleOrChowk = props.locality || props.district || '';
          }
          if (!roadName && props.street) {
            roadName = props.street;
          }
          if (!municipalityNepali && props.city) {
            municipalityNepali = props.city;
          }
          if (!districtNepali && (props.county || props.district)) {
            districtNepali = cleanDistrictName(props.county || props.district);
          }
        }
      }
    } catch {}
  }

  // 3. Tertiary Supplement: BigDataCloud for administrative names
  if (!municipalityNepali || !districtNepali) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ne`;
      const bRes = await fetch(bdcUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (bRes.ok) {
        const bData = await bRes.json();
        if (!municipalityNepali && (bData.city || bData.locality)) {
          municipalityNepali = bData.city || bData.locality;
        }
        if (!provinceNepali && bData.principalSubdivision) {
          provinceNepali = bData.principalSubdivision;
        }
        if (!districtNepali && Array.isArray(bData.localityInfo?.administrative)) {
          const distAdmin = bData.localityInfo.administrative.find((a: any) => a.adminLevel === 6);
          if (distAdmin?.name) {
            districtNepali = cleanDistrictName(distAdmin.name);
          }
        }
      }
    } catch {}
  }

  // 4. Reliable Offline Fallback using 77 Districts database
  if (!districtNepali || districtNepali === 'undefined') {
    let closestDist = NEPAL_77_DISTRICTS[0];
    let minD = 99999;
    for (const d of NEPAL_77_DISTRICTS) {
      const distKm = calculateDistanceKm(lat, lon, d.latitude, d.longitude);
      if (distKm < minD) {
        minD = distKm;
        closestDist = d;
      }
    }
    districtNepali = closestDist.district;
    if (!municipalityNepali || municipalityNepali === 'undefined') {
      municipalityNepali = closestDist.headquarter;
    }
    if (!provinceNepali || provinceNepali === 'undefined') {
      provinceNepali = closestDist.province;
    }
  }

  // Sanitize strings from any literal "undefined"
  if (districtNepali === 'undefined') districtNepali = 'काठमाडौँ';
  if (municipalityNepali === 'undefined') municipalityNepali = districtNepali;
  if (provinceNepali === 'undefined') provinceNepali = 'बागमती प्रदेश';

  // 5. Construct Clean, Natural Nepali Formatted Address String
  const parts: string[] = [];
  if (landmarkName && landmarkName !== 'undefined') {
    parts.push(landmarkName);
  }
  if (toleOrChowk && toleOrChowk !== 'undefined' && toleOrChowk !== landmarkName) {
    parts.push(toleOrChowk);
  }
  if (roadName && roadName !== 'undefined' && !parts.some((p) => p.includes(roadName))) {
    parts.push(roadName);
  }
  if (wardNepali && wardNepali !== 'undefined') {
    parts.push(wardNepali);
  }
  if (municipalityNepali && municipalityNepali !== 'undefined') {
    parts.push(municipalityNepali);
  }
  if (districtNepali && districtNepali !== 'undefined' && !municipalityNepali.includes(districtNepali)) {
    parts.push(districtNepali);
  }

  const formatted = parts.length > 0
    ? parts.join(', ')
    : `${municipalityNepali || 'काठमाडौँ'}, ${districtNepali || 'काठमाडौँ'}`;

  const coords: LocationCoordinates = {
    latitude: lat,
    longitude: lon,
    accuracyMeters: accuracyMeters || 50,
    addressName: formatted,
    district: districtNepali,
    localLevel: municipalityNepali,
    ward: wardNepali ? wardNepali.replace('वडा नं. ', '') : undefined,
  };

  return {
    addressText: formatted,
    displayName: formatted,
    locationCoordinates: coords,
    landmarkName,
    toleOrChowk,
    roadName,
    wardNepali,
    municipalityNepali,
    districtNepali,
    district: districtNepali,
    province: provinceNepali || 'बागमती प्रदेश',
    municipality: municipalityNepali || districtNepali,
    accuracyMeters,
  };
}
