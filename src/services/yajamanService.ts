import {
  Booking,
  BookingStatus,
  ContactExchangeLog,
  LocationCoordinates,
  RatingReview,
  ServiceCategory,
  ServiceProvider,
  ServiceRequest,
  YajamanNotification,
  YajamanUser,
} from '../types/yajamanTypes';

import {
  calculateDistanceKm,
  calculateProviderMatchScore,
  MATCHING_RADIUS_STEPS,
  maskAddress,
  maskEmail,
  maskPhoneNumber,
} from '../utils/geoUtils';

import {
  acceptServiceRequest,
  addNotification,
  getContactExchangeLogs,
  getStoredBookings,
  getStoredNotifications,
  getStoredServiceCategories,
  getStoredServiceProviders,
  getStoredServiceRequests,
  getStoredYajamanUsers,
  recordContactExchange,
  saveBookings,
  saveNotifications,
  saveServiceProviders,
  saveServiceRequests,
  saveYajamanUsers,
} from '../db/yajamanStore';

/**
 * PostgreSQL Table Definitions Schema Representation
 * Reference for SQL/Relational ORM integration:
 *
 * CREATE TABLE yajaman_users (
 *   id VARCHAR(64) PRIMARY KEY,
 *   full_name VARCHAR(120) NOT NULL,
 *   mobile VARCHAR(20) UNIQUE NOT NULL,
 *   email VARCHAR(120),
 *   password_hash TEXT,
 *   district VARCHAR(60) NOT NULL,
 *   local_level VARCHAR(100),
 *   ward VARCHAR(10),
 *   address TEXT,
 *   latitude DOUBLE PRECISION,
 *   longitude DOUBLE PRECISION,
 *   profile_photo TEXT,
 *   created_at_bs VARCHAR(30) NOT NULL,
 *   is_active BOOLEAN DEFAULT TRUE
 * );
 *
 * CREATE TABLE service_providers (
 *   id VARCHAR(64) PRIMARY KEY,
 *   full_name VARCHAR(120) NOT NULL,
 *   title VARCHAR(120) NOT NULL,
 *   mobile VARCHAR(20) NOT NULL,
 *   email VARCHAR(120),
 *   qualification TEXT,
 *   experience_years INT DEFAULT 0,
 *   categories JSONB NOT NULL,
 *   expertise JSONB NOT NULL,
 *   district VARCHAR(60),
 *   local_level VARCHAR(100),
 *   ward VARCHAR(10),
 *   latitude DOUBLE PRECISION NOT NULL,
 *   longitude DOUBLE PRECISION NOT NULL,
 *   max_service_radius_km INT DEFAULT 30,
 *   rating NUMERIC(3, 2) DEFAULT 5.0,
 *   completed_services_count INT DEFAULT 0,
 *   is_available BOOLEAN DEFAULT TRUE,
 *   is_verified BOOLEAN DEFAULT FALSE,
 *   verification_status VARCHAR(20) DEFAULT 'PENDING'
 * );
 *
 * CREATE TABLE service_requests (
 *   id VARCHAR(64) PRIMARY KEY,
 *   booking_code VARCHAR(30) UNIQUE NOT NULL,
 *   yajaman_id VARCHAR(64) REFERENCES yajaman_users(id),
 *   category_id VARCHAR(64) NOT NULL,
 *   service_type VARCHAR(120) NOT NULL,
 *   preferred_date_bs VARCHAR(30) NOT NULL,
 *   preferred_time VARCHAR(50) NOT NULL,
 *   latitude DOUBLE PRECISION NOT NULL,
 *   longitude DOUBLE PRECISION NOT NULL,
 *   status VARCHAR(30) DEFAULT 'MATCHING',
 *   current_radius_km INT DEFAULT 3,
 *   offered_provider_ids JSONB DEFAULT '[]',
 *   rejected_provider_ids JSONB DEFAULT '[]',
 *   assigned_provider_id VARCHAR(64),
 *   created_timestamp BIGINT NOT NULL
 * );
 *
 * CREATE TABLE bookings (
 *   id VARCHAR(64) PRIMARY KEY,
 *   booking_code VARCHAR(30) UNIQUE NOT NULL,
 *   request_id VARCHAR(64) REFERENCES service_requests(id),
 *   yajaman_id VARCHAR(64) REFERENCES yajaman_users(id),
 *   provider_id VARCHAR(64) REFERENCES service_providers(id),
 *   status VARCHAR(30) NOT NULL,
 *   matched_radius_km INT NOT NULL,
 *   calculated_distance_km NUMERIC(5, 2) NOT NULL,
 *   acceptance_timestamp BIGINT NOT NULL
 * );
 *
 * CREATE TABLE contact_exchange_logs (
 *   id VARCHAR(64) PRIMARY KEY,
 *   booking_id VARCHAR(64) REFERENCES bookings(id),
 *   yajaman_id VARCHAR(64) REFERENCES yajaman_users(id),
 *   provider_id VARCHAR(64) REFERENCES service_providers(id),
 *   exchange_timestamp BIGINT NOT NULL
 * );
 */

export class YajamanService {
  /**
   * Safe Data Sanitizer: Mask contact details if booking is not yet ACCEPTED / CONFIRMED
   */
  public static sanitizeProviderForYajaman(
    provider: ServiceProvider,
    isBookingAccepted: boolean
  ): ServiceProvider {
    if (isBookingAccepted) {
      return provider;
    }
    return {
      ...provider,
      mobile: maskPhoneNumber(provider.mobile),
      email: provider.email ? maskEmail(provider.email) : undefined,
      location: {
        ...provider.location,
        addressName: maskAddress(provider.location.addressName),
      },
    };
  }

  public static sanitizeYajamanForProvider(
    yajaman: YajamanUser,
    isBookingAccepted: boolean
  ): YajamanUser {
    if (isBookingAccepted) {
      return yajaman;
    }
    return {
      ...yajaman,
      mobile: maskPhoneNumber(yajaman.mobile),
      email: yajaman.email ? maskEmail(yajaman.email) : undefined,
      address: maskAddress(yajaman.address),
    };
  }

  /**
   * Geolocation Radius Expansion Logic (3km -> 5km -> 10km -> 15km -> 20km -> 30km)
   */
  public static getMatchingProvidersByRadius(
    request: ServiceRequest
  ): { provider: ServiceProvider; score: number; distanceKm: number }[] {
    const allProviders = getStoredServiceProviders();
    const currentRadius = request.currentRadiusKm || 3;

    const matched: { provider: ServiceProvider; score: number; distanceKm: number }[] = [];

    for (const prov of allProviders) {
      const match = calculateProviderMatchScore(prov, request, currentRadius);
      if (match.isEligible) {
        matched.push({
          provider: this.sanitizeProviderForYajaman(prov, false),
          score: match.score,
          distanceKm: match.distanceKm,
        });
      }
    }

    // Rank by composite score (highest first) and distance (closest first)
    return matched.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
  }

  /**
   * Step up search radius to the next milestone if no provider accepted in current radius
   */
  public static expandSearchRadius(requestId: string): {
    success: boolean;
    newRadiusKm?: number;
    message: string;
  } {
    const requests = getStoredServiceRequests();
    const reqIndex = requests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) {
      return { success: false, message: 'अनुरोध भेटिएन।' };
    }

    const req = requests[reqIndex];
    const current = req.currentRadiusKm || 3;
    const currentIndex = MATCHING_RADIUS_STEPS.indexOf(current);

    if (currentIndex >= 0 && currentIndex < MATCHING_RADIUS_STEPS.length - 1) {
      const nextRadius = MATCHING_RADIUS_STEPS[currentIndex + 1];
      req.currentRadiusKm = nextRadius;
      req.updatedTimestamp = Date.now();
      requests[reqIndex] = req;
      saveServiceRequests(requests);

      addNotification(
        req.yajamanId,
        'YAJAMAN',
        'खोज परिधि विस्तार गरियो',
        `सेवा '${req.serviceType}' को लागि खोज परिधि बढाएर ${nextRadius} KM बनाइएको छ।`,
        undefined,
        req.id
      );

      return {
        success: true,
        newRadiusKm: nextRadius,
        message: `सफलतापूर्वक खोज परिधि बढाएर ${nextRadius} KM बनाइयो!`,
      };
    }

    return {
      success: false,
      newRadiusKm: 30,
      message: 'अधिकतम ३० KM परिधिसम्म खोज गरिसकिएको छ।',
    };
  }

  /**
   * Accept Service Request & Contact Details Exchange Protocol
   */
  public static processAcceptance(
    requestId: string,
    providerId: string
  ): { success: boolean; booking?: Booking; error?: string } {
    return acceptServiceRequest(requestId, providerId);
  }

  /**
   * Fetch all bookings for a Yajaman with secure contact masking rule
   */
  public static getYajamanBookings(yajamanId: string): Booking[] {
    const allBookings = getStoredBookings();
    return allBookings.filter((b) => b.yajamanId === yajamanId);
  }

  /**
   * Fetch all incoming / assigned requests for a Provider
   */
  public static getProviderIncomingRequests(providerId: string): ServiceRequest[] {
    const allRequests = getStoredServiceRequests();
    const provider = getStoredServiceProviders().find((p) => p.id === providerId);
    if (!provider) return [];

    return allRequests.filter((req) => {
      if (req.status === 'ACCEPTED' || req.status === 'COMPLETED') {
        return req.assignedProviderId === providerId;
      }
      // Check if provider falls inside current matching radius
      const match = calculateProviderMatchScore(provider, req, req.currentRadiusKm);
      return match.isEligible;
    });
  }

  /**
   * Mark booking as completed and update provider service stats
   */
  public static completeBooking(bookingId: string): { success: boolean; message: string } {
    const bookings = getStoredBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return { success: false, message: 'बुकिङ फेला परेन।' };

    const bk = bookings[idx];
    bk.status = 'COMPLETED';
    bk.completionTimestamp = Date.now();
    bookings[idx] = bk;
    saveBookings(bookings);

    // Increment completed service count for provider
    const providers = getStoredServiceProviders();
    const pIdx = providers.findIndex((p) => p.id === bk.providerId);
    if (pIdx !== -1) {
      providers[pIdx].completedServicesCount = (providers[pIdx].completedServicesCount || 0) + 1;
      saveServiceProviders(providers);
    }

    // Add completion notification
    addNotification(
      bk.yajamanId,
      'YAJAMAN',
      'सेवा सम्पन्न भयो!',
      `तपाईंको बुकिङ ${bk.bookingCode} सफलताका साथ सम्पन्न भएको छ। सेवा मूल्याङ्कन (Rating & Review) प्रदान गर्नुहोस्।`,
      bk.id
    );

    return { success: true, message: 'सेवा सफलतापूर्वक सम्पन्न भयो!' };
  }
}
