/**
 * Geolocation & Nepal Sacred Geography Helper (नेपाल भू-अवस्थिति तथा पवित्र भूगोल सहयोगी)
 * Provides GPS auto-detection, reverse coordinate lookup to Nepal's 77 districts,
 * and persistence of the user's active sacred location.
 */

import { LocationData } from '../types/astrology';

export const BALANANDA_GEO_LOCATION_KEY = 'balananda_user_geo_location';
export const BALANANDA_GEO_UPDATED_EVENT = 'balananda_geo_location_updated';

export interface NepalDistrictCoord {
  district: string;
  districtEn: string;
  province: string;
  headquarter: string;
  latitude: number;
  longitude: number;
}

/**
 * 77 Districts of Nepal with central coordinates and provinces
 */
export const NEPAL_77_DISTRICTS: NepalDistrictCoord[] = [
  // कोशी प्रदेश (Koshi Province - 14 Districts)
  { district: 'झापा', districtEn: 'Jhapa', province: 'कोशी प्रदेश', headquarter: 'भद्रपुर / विर्तामोड', latitude: 26.6333, longitude: 87.9833 },
  { district: 'मोरङ', districtEn: 'Morang', province: 'कोशी प्रदेश', headquarter: 'विराटनगर', latitude: 26.4525, longitude: 87.2718 },
  { district: 'सुनसरी', districtEn: 'Sunsari', province: 'कोशी प्रदेश', headquarter: 'धरान / इनरुवा', latitude: 26.8125, longitude: 87.2833 },
  { district: 'इलाम', districtEn: 'Ilam', province: 'कोशी प्रदेश', headquarter: 'इलाम', latitude: 26.9111, longitude: 87.9231 },
  { district: 'पाँचथर', districtEn: 'Panchthar', province: 'कोशी प्रदेश', headquarter: 'फिदिम', latitude: 27.1500, longitude: 87.7500 },
  { district: 'ताप्लेजुङ', districtEn: 'Taplejung', province: 'कोशी प्रदेश', headquarter: 'फुङलिङ', latitude: 27.3500, longitude: 87.6667 },
  { district: 'सङ्खुवासभा', districtEn: 'Sankhuwasabha', province: 'कोशी प्रदेश', headquarter: 'खाँदबारी', latitude: 27.3750, longitude: 87.2167 },
  { district: 'तेह्रथुम', districtEn: 'Tehrathum', province: 'कोशी प्रदेश', headquarter: 'म्याङलुङ', latitude: 27.1333, longitude: 87.5333 },
  { district: 'धनकुटा', districtEn: 'Dhankuta', province: 'कोशी प्रदेश', headquarter: 'धनकुटा', latitude: 26.9833, longitude: 87.3333 },
  { district: 'भोजपुर', districtEn: 'Bhojpur', province: 'कोशी प्रदेश', headquarter: 'भोजपुर', latitude: 27.1708, longitude: 87.0458 },
  { district: 'खोटाङ', districtEn: 'Khotang', province: 'कोशी प्रदेश', headquarter: 'दिक्तेल', latitude: 27.2000, longitude: 86.7833 },
  { district: 'सोलुखुम्बु', districtEn: 'Solukhumbu', province: 'कोशी प्रदेश', headquarter: 'सल्लेरी', latitude: 27.5000, longitude: 86.5833 },
  { district: 'ओखलढुङ्गा', districtEn: 'Okhaldhunga', province: 'कोशी प्रदेश', headquarter: 'ओखलढुङ्गा', latitude: 27.3167, longitude: 86.5000 },
  { district: 'उदयपुर', districtEn: 'Udayapur', province: 'कोशी प्रदेश', headquarter: 'गाईघाट', latitude: 26.7900, longitude: 86.7000 },

  // मधेश प्रदेश (Madhesh Province - 8 Districts)
  { district: 'सप्तरी', districtEn: 'Saptari', province: 'मधेश प्रदेश', headquarter: 'राजविराज', latitude: 26.5417, longitude: 86.7500 },
  { district: 'सिराहा', districtEn: 'Siraha', province: 'मधेश प्रदेश', headquarter: 'सिराहा / लहान', latitude: 26.6500, longitude: 86.2000 },
  { district: 'धनुषा', districtEn: 'Dhanusha', province: 'मधेश प्रदेश', headquarter: 'जनकपुरधाम', latitude: 26.7271, longitude: 85.9231 },
  { district: 'महोत्तरी', districtEn: 'Mahottari', province: 'मधेश प्रदेश', headquarter: 'जलेश्वर', latitude: 26.6500, longitude: 85.8000 },
  { district: 'सर्लाही', districtEn: 'Sarlahi', province: 'मधेश प्रदेश', headquarter: 'मलङ्गवा', latitude: 26.8500, longitude: 85.5500 },
  { district: 'रौतहट', districtEn: 'Rautahat', province: 'मधेश प्रदेश', headquarter: 'गौर', latitude: 26.7667, longitude: 85.2833 },
  { district: 'बारा', districtEn: 'Bara', province: 'मधेश प्रदेश', headquarter: 'कलैया', latitude: 27.0333, longitude: 85.0000 },
  { district: 'पर्सा', districtEn: 'Parsa', province: 'मधेश प्रदेश', headquarter: 'वीरगञ्ज', latitude: 27.0000, longitude: 84.8667 },

  // बागमती प्रदेश (Bagmati Province - 13 Districts)
  { district: 'काठमाडौँ', districtEn: 'Kathmandu', province: 'बागमती प्रदेश', headquarter: 'काठमाडौँ', latitude: 27.7172, longitude: 85.3240 },
  { district: 'ललितपुर', districtEn: 'Lalitpur', province: 'बागमती प्रदेश', headquarter: 'पाटन', latitude: 27.6644, longitude: 85.3188 },
  { district: 'भक्तपुर', districtEn: 'Bhaktapur', province: 'बागमती प्रदेश', headquarter: 'भक्तपुर', latitude: 27.6710, longitude: 85.4298 },
  { district: 'काभ्रेपलाञ्चोक', districtEn: 'Kavrepalanchok', province: 'बागमती प्रदेश', headquarter: 'धुलिखेल / बनेपा', latitude: 27.6167, longitude: 85.5500 },
  { district: 'सिन्धुपाल्चोक', districtEn: 'Sindhupalchok', province: 'बागमती प्रदेश', headquarter: 'चौतारा', latitude: 27.7667, longitude: 85.7167 },
  { district: 'दोलखा', districtEn: 'Dolkha', province: 'बागमती प्रदेश', headquarter: 'चरीकोट', latitude: 27.6667, longitude: 86.0500 },
  { district: 'रामेछाप', districtEn: 'Ramechhap', province: 'बागमती प्रदेश', headquarter: 'मन्थली', latitude: 27.3333, longitude: 86.0833 },
  { district: 'सिन्धुली', districtEn: 'Sindhuli', province: 'बागमती प्रदेश', headquarter: 'सिन्धुलीमाढी', latitude: 27.2500, longitude: 85.9167 },
  { district: 'नुवाकोट', districtEn: 'Nuwakot', province: 'बागमती प्रदेश', headquarter: 'विदुर', latitude: 27.9167, longitude: 85.1667 },
  { district: 'रसुवा', districtEn: 'Rasuwa', province: 'बागमती प्रदेश', headquarter: 'धुन्चे', latitude: 28.1167, longitude: 85.3000 },
  { district: 'धादिङ', districtEn: 'Dhading', province: 'बागमती प्रदेश', headquarter: 'धादिङबेसी', latitude: 27.8667, longitude: 84.9000 },
  { district: 'मकवानपुर', districtEn: 'Makwanpur', province: 'बागमती प्रदेश', headquarter: 'हेटौँडा', latitude: 27.4167, longitude: 85.0333 },
  { district: 'चितवन', districtEn: 'Chitwan', province: 'बागमती प्रदेश', headquarter: 'भरतपुर / नारायणगढ', latitude: 27.6833, longitude: 84.4333 },

  // गण्डकी प्रदेश (Gandaki Province - 11 Districts)
  { district: 'कास्की', districtEn: 'Kaski', province: 'गण्डकी प्रदेश', headquarter: 'पोखरा', latitude: 28.2096, longitude: 83.9856 },
  { district: 'तनहुँ', districtEn: 'Tanahun', province: 'गण्डकी प्रदेश', headquarter: 'दमौली', latitude: 27.9667, longitude: 84.2833 },
  { district: 'गोरखा', districtEn: 'Gorkha', province: 'गण्डकी प्रदेश', headquarter: 'गोरखा', latitude: 28.0000, longitude: 84.6333 },
  { district: 'लमजुङ', districtEn: 'Lamjung', province: 'गण्डकी प्रदेश', headquarter: 'बेसीसहर', latitude: 28.2333, longitude: 84.3833 },
  { district: 'स्याङ्जा', districtEn: 'Syangja', province: 'गण्डकी प्रदेश', headquarter: 'पुतलीबजार', latitude: 28.1000, longitude: 83.8667 },
  { district: 'पाल्पा', districtEn: 'Palpa', province: 'लुम्बिनी प्रदेश', headquarter: 'तानसेन', latitude: 27.8667, longitude: 83.5500 },
  { district: 'पर्वत', districtEn: 'Parbat', province: 'गण्डकी प्रदेश', headquarter: 'कुश्मा', latitude: 28.2167, longitude: 83.6833 },
  { district: 'बागलुङ', districtEn: 'Baglung', province: 'गण्डकी प्रदेश', headquarter: 'बागलुङ', latitude: 28.2667, longitude: 83.6000 },
  { district: 'म्याग्दी', districtEn: 'Myagdi', province: 'गण्डकी प्रदेश', headquarter: 'बेनी', latitude: 28.3500, longitude: 83.5667 },
  { district: 'मुस्ताङ', districtEn: 'Mustang', province: 'गण्डकी प्रदेश', headquarter: 'जोमसोम / मुक्तिनाथ', latitude: 28.7833, longitude: 83.7333 },
  { district: 'मनाङ', districtEn: 'Manang', province: 'गण्डकी प्रदेश', headquarter: 'चामे', latitude: 28.5500, longitude: 84.2333 },
  { district: 'नवलपरासी पूर्व', districtEn: 'Nawalpur', province: 'गण्डकी प्रदेश', headquarter: 'कावासोती', latitude: 27.6500, longitude: 84.1167 },

  // लुम्बिनी प्रदेश (Lumbini Province - 12 Districts)
  { district: 'नवलपरासी पश्चिम', districtEn: 'Parasi', province: 'लुम्बिनी प्रदेश', headquarter: 'रामग्राम / परासी', latitude: 27.5333, longitude: 83.6667 },
  { district: 'रुपन्देही', districtEn: 'Rupandehi', province: 'लुम्बिनी प्रदेश', headquarter: 'बुटवल / भैरहवा', latitude: 27.7000, longitude: 83.4500 },
  { district: 'कपिलवस्तु', districtEn: 'Kapilvastu', province: 'लुम्बिनी प्रदेश', headquarter: 'तौलिहवा', latitude: 27.5500, longitude: 83.0500 },
  { district: 'अर्घाखाँची', districtEn: 'Arghakhanchi', province: 'लुम्बिनी प्रदेश', headquarter: 'सन्धिखर्क', latitude: 27.9167, longitude: 83.1333 },
  { district: 'गुल्मी', districtEn: 'Gulmi', province: 'लुम्बिनी प्रदेश', headquarter: 'तम्घास', latitude: 28.0667, longitude: 83.2500 },
  { district: 'रोल्पा', districtEn: 'Rolpa', province: 'लुम्बिनी प्रदेश', headquarter: 'लिवाङ', latitude: 28.3000, longitude: 82.6333 },
  { district: 'प्युठान', districtEn: 'Pyuthan', province: 'लुम्बिनी प्रदेश', headquarter: 'प्युठान', latitude: 28.1000, longitude: 82.9000 },
  { district: 'दाङ', districtEn: 'Dang', province: 'लुम्बिनी प्रदेश', headquarter: 'घोराही / तुलसीपुर', latitude: 28.0333, longitude: 82.3000 },
  { district: 'बाँके', districtEn: 'Banke', province: 'लुम्बिनी प्रदेश', headquarter: 'नेपालगञ्ज', latitude: 28.0500, longitude: 81.6167 },
  { district: 'बर्दिया', districtEn: 'Bardia', province: 'लुम्बिनी प्रदेश', headquarter: 'गुलरिया', latitude: 28.2333, longitude: 81.3333 },
  { district: 'रुकुम पूर्व', districtEn: 'Rukum East', province: 'लुम्बिनी प्रदेश', headquarter: 'रुकुमकोट', latitude: 28.6000, longitude: 82.6333 },

  // कर्णाली प्रदेश (Karnali Province - 10 Districts)
  { district: 'सुर्खेत', districtEn: 'Surkhet', province: 'कर्णाली प्रदेश', headquarter: 'वीरेन्द्रनगर', latitude: 28.6000, longitude: 81.6333 },
  { district: 'दैलेख', districtEn: 'Dailekh', province: 'कर्णाली प्रदेश', headquarter: 'दैलेख', latitude: 28.8333, longitude: 81.7167 },
  { district: 'जाजरकोट', districtEn: 'Jajarkot', province: 'कर्णाली प्रदेश', headquarter: 'खलङ्गा', latitude: 28.7000, longitude: 82.2000 },
  { district: 'रुकुम पश्चिम', districtEn: 'Rukum West', province: 'कर्णाली प्रदेश', headquarter: 'मुसिकोट', latitude: 28.6333, longitude: 82.4667 },
  { district: 'सल्यान', districtEn: 'Salyan', province: 'कर्णाली प्रदेश', headquarter: 'खलङ्गा', latitude: 28.3667, longitude: 82.1667 },
  { district: 'जुम्ला', districtEn: 'Jumla', province: 'कर्णाली प्रदेश', headquarter: 'खलङ्गा', latitude: 29.2750, longitude: 82.1833 },
  { district: 'कालीकोट', districtEn: 'Kalikot', province: 'कर्णाली प्रदेश', headquarter: 'मान्म', latitude: 29.1333, longitude: 81.8000 },
  { district: 'मुगु', districtEn: 'Mugu', province: 'कर्णाली प्रदेश', headquarter: 'गमगढी', latitude: 29.5833, longitude: 82.1667 },
  { district: 'हुम्ला', districtEn: 'Humla', province: 'कर्णाली प्रदेश', headquarter: 'सिमिकोट', latitude: 29.9667, longitude: 81.8333 },
  { district: 'डोल्पा', districtEn: 'Dolpa', province: 'कर्णाली प्रदेश', headquarter: 'दुनै', latitude: 28.9833, longitude: 82.9000 },

  // सुदूरपश्चिम प्रदेश (Sudurpashchim Province - 9 Districts)
  { district: 'कैलाली', districtEn: 'Kailali', province: 'सुदूरपश्चिम प्रदेश', headquarter: 'धनगढी / अत्तरिया', latitude: 28.6833, longitude: 80.6000 },
  { district: 'कञ्चनपुर', districtEn: 'Kanchanpur', province: 'सुदूरपश्चिम प्रदेश', headquarter: 'महेन्द्रनगर / भीमदत्त', latitude: 28.9667, longitude: 80.1833 },
  { district: 'डडेल्धुरा', districtEn: 'Dadeldhura', province: 'सुदूरपश्चिम प्रदेश', headquarter: 'डडेल्धुरा', latitude: 29.3000, longitude: 80.5833 },
  { district: 'बैतडी', districtEn: 'Baitadi', province: 'सुदूरपश्चिम प्रदेश', headquarter: 'दशरथचन्द', latitude: 29.5167, longitude: 80.4167 },
  { district: 'दार्चुला', districtEn: 'Darchula', province: 'सुदूरपश्चिम प्रदेश', headquarter: 'खलङ्गा', latitude: 29.8500, longitude: 80.5333 },
  { district: 'डोटी', districtEn: 'Doti', province: 'सुदूरपश्चिम प्रदेश', headquarter: 'दिपायल / सिलगढी', latitude: 29.2667, longitude: 80.9333 },
  { district: 'अछाम', districtEn: 'Achham', province: 'सुदूरपश्चिम प्रदेश', headquarter: 'मङ्गलसेन', latitude: 29.1167, longitude: 81.2833 },
  { district: 'बाजुरा', districtEn: 'Bajura', province: 'सुदूरपश्चिम प्रदेश', headquarter: 'मार्तडी', latitude: 29.5000, longitude: 81.5000 },
  { district: 'बझाङ', districtEn: 'Bajhang', province: 'सुदूरपश्चिम प्रदेश', headquarter: 'चैनपुर', latitude: 29.5667, longitude: 81.2000 },
];

/**
 * Calculates straight line distance in km using Haversine formula
 */
export function calculateGeoDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the nearest Nepal district given any GPS latitude and longitude
 */
export function findNearestNepalDistrict(
  lat: number,
  lon: number
): { district: NepalDistrictCoord; distanceKm: number } {
  let closest = NEPAL_77_DISTRICTS[0];
  let minDistance = 99999;

  for (const dist of NEPAL_77_DISTRICTS) {
    const d = calculateGeoDistanceKm(lat, lon, dist.latitude, dist.longitude);
    if (d < minDistance) {
      minDistance = d;
      closest = dist;
    }
  }

  return { district: closest, distanceKm: minDistance };
}

export interface GPSDetectionResult {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  location: LocationData;
  nearestDistrictName: string;
  distanceKm: number;
}

/**
 * High-accuracy promise-based wrapper around navigator.geolocation
 */
export async function getCurrentUserGPS(): Promise<GPSDetectionResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('ब्राउजरमा GPS/Geolocation सुविधा उपलब्ध छैन।'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy || 50;

        // Find nearest Nepal district
        const { district, distanceKm } = findNearestNepalDistrict(lat, lon);

        // Determine if within Nepal or international
        const isNepal = lat >= 26.0 && lat <= 30.8 && lon >= 79.8 && lon <= 88.5;
        const offsetMinutes = -new Date().getTimezoneOffset();
        const tz = isNepal ? 5.75 : Math.round((offsetMinutes / 60) * 100) / 100;

        const location: LocationData = {
          name: isNepal
            ? `${district.headquarter}, ${district.district}`
            : `GPS अवस्थिति (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          englishName: isNepal ? `${district.districtEn} District` : 'GPS Location',
          district: district.district,
          province: district.province,
          country: isNepal ? 'नेपाल' : 'अन्तर्राष्ट्रिय',
          latitude: lat,
          longitude: lon,
          timeZone: tz,
          flag: isNepal ? '🇳🇵' : '📍',
        };

        resolve({
          latitude: lat,
          longitude: lon,
          accuracyMeters: accuracy,
          location,
          nearestDistrictName: district.district,
          distanceKm,
        });
      },
      (error) => {
        let msg = 'स्थान पत्ता लगाउन सकिएन।';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'स्थान (Location) अनुमति अस्वीकृत भयो। कृपया ब्राउजरमा अनुमति दिनुहोस्।';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'स्थान जानकारी अनुपलब्ध छ। यन्त्रको GPS/Location अन गर्नुहोस्।';
        } else if (error.code === error.TIMEOUT) {
          msg = 'स्थान पत्ता लगाउन समय समाप्त भयो। पुनः प्रयास गर्नुहोस्।';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Saves user's detected / selected location to localStorage and notifies listeners
 */
export function saveUserDetectedLocation(loc: LocationData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BALANANDA_GEO_LOCATION_KEY, JSON.stringify(loc));
    window.dispatchEvent(
      new CustomEvent(BALANANDA_GEO_UPDATED_EVENT, { detail: loc })
    );
  } catch (err) {
    console.error('Failed to save user detected location', err);
  }
}

/**
 * Retrieves the stored user detected location or returns default Kathmandu
 */
export function getStoredUserLocation(): LocationData {
  const defaultLoc: LocationData = {
    name: 'काठमाडौँ (Kathmandu)',
    englishName: 'Kathmandu',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    country: 'नेपाल',
    latitude: 27.7172,
    longitude: 85.3240,
    timeZone: 5.75,
    flag: '🇳🇵',
  };

  if (typeof window === 'undefined') return defaultLoc;

  try {
    const raw = localStorage.getItem(BALANANDA_GEO_LOCATION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.latitude && parsed.longitude) {
        return parsed as LocationData;
      }
    }
  } catch {}

  return defaultLoc;
}
