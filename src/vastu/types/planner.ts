// src/vastu/types/planner.ts
// Core TypeScript interface definitions for the 'VastuBuildingPlanner' module.
// Fully compatible with Balananda Vedic Astrology & Panchanga engine types.

import type { LocationData, BirthDetails } from '../../types/astrology';

/**
 * Standard measurement units for plot and building dimensions
 * Includes traditional Nepali units (हात, रोपनी, आना, पैसा, दाम, बिघा, कट्ठा, धुर)
 */
export type MeasurementUnit = 'ft' | 'm' | 'haat' | 'gaj';

export type TraditionalLandUnitNepali = 
  | 'ropani_system' // रोपनी, आना, पैसा, दाम (Pahad / Valley)
  | 'bigha_system'  // बिघा, कट्ठा, धुर (Terai)
  | 'sq_ft' 
  | 'sq_m';

/**
 * Primary 8 Cardinal and Intercardinal Directions + Center (Brahmasthan)
 */
export type CompassDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'CENTER';

/**
 * Plot Shapes as recognized in classical Vedic Vastu Shastra texts
 * (Brihat Samhita, Mayamata, Manasara, Samarangana Sutradhara)
 */
export type PlotShape = 
  | 'square'           // समचतुरस्र (वर्गाकार) - अत्यन्त शुभ
  | 'rectangular'      // आयताकार - शुभ
  | 'circular'         // वृत्ताकार - सामान्यतः वर्जित
  | 'triangular'       // त्रिकोणाकार - वर्जित / अनिष्टकारक
  | 'trapezoidal'      // विषमचतुर्भुज (गोमुखी वा सिंहमुखी)
  | 'gomukhi'          // गोमुखी (अगाडि साँघुरो, पछाडि फराकिलो) - आवासीयका लागि शुभ
  | 'singhmukhi'       // सिंहमुखी (अगाडि फराकिलो, पछाडि साँघुरो) - व्यापारिकका लागि शुभ
  | 'l_shaped'         // L-आकार (खण्डित) - वास्तु दोष
  | 'irregular';       // अनियमित / विषमकोण

/**
 * Boundary nature on each side of the plot
 */
export type BoundaryType = 
  | 'neighbor'  // छिमेकीको जग्गा / घर
  | 'road'      // सडक / बाटो
  | 'open'      // खुला चौर / सरकारी जग्गा
  | 'river'     // नदी / खोला / खोल्सो
  | 'mountain'  // पहाड / अग्लो ढिस्को
  | 'building'  // अग्लो व्यापारिक भवन
  | 'other';

/**
 * Detailed specification of a single boundary side
 */
export interface PlotBoundarySide {
  length: number;
  boundaryType: BoundaryType;
  notes?: string;
  isFenced?: boolean;
  neighborBuildingHeight?: number; // in feet/meters to analyze shadow/weight
}

/**
 * Four principal boundaries of a land parcel
 */
export interface PlotBoundaries {
  north: PlotBoundarySide;
  south: PlotBoundarySide;
  east: PlotBoundarySide;
  west: PlotBoundarySide;
}

/**
 * Road / Access specifications adjoining the plot
 */
export interface RoadInfo {
  id: string;
  name?: string;
  direction: CompassDirection;
  width: number; // in current MeasurementUnit
  sideLength: number;
  isMainRoad: boolean;
  gatePlacement: 'left' | 'center' | 'right';
  roadLevel: 'higher' | 'level' | 'lower'; // सडकको सतह
  hasCornerJunction?: boolean; // दोबाटो / चौबाटो (T-junction / Vithishula)
  vithishulaDosha?: boolean; // वीथिशूला दोष (सडकको सिधा प्रहार)
}

/**
 * 2D Point on canvas or Cartesian plane
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Traditional Nepali Land Area decomposition
 */
export interface NepaliLandMeasurement {
  system: 'ropani' | 'bigha';
  // Ropani system
  ropani?: number;
  aana?: number;
  paisa?: number;
  daam?: number;
  // Bigha system
  bigha?: number;
  kattha?: number;
  dhur?: number;
  // Standard equivalence
  totalSqFt: number;
  totalSqMeters: number;
}

/**
 * Soil and environmental characteristics of the land (भूमि लक्षण)
 */
export interface SiteConditions {
  isFlat: boolean;
  slopeDirection: CompassDirection | 'none'; // ढलानको दिशा (ईशान ढलान श्रेष्ठ)
  waterDrainageDirection: CompassDirection | 'none'; // ढल/पानी निकास
  soilType?: 'white_sweet' | 'red_sour' | 'yellow_astringent' | 'black_pungent' | 'sandy' | 'rocky' | 'clay'; // ब्राह्मण, क्षत्रिय, वैश्य, शूद्र माटो
  soilSmell?: 'pleasant' | 'normal' | 'foul';
  nearbyWaterBody: boolean;
  waterBodyDirection?: CompassDirection;
  nearbyMountainOrHighRise: boolean;
  mountainDirection?: CompassDirection;
  existingTreeOrWell: boolean;
  existingStructures: Array<{
    name: string;
    direction: CompassDirection;
    sizeDescription?: string;
  }>;
}

/**
 * Municipal / Bye-laws & Vastu Setback Requirements
 */
export interface BuildingSetbacks {
  north: number; // उत्तर खुला ठाउँ (feet/meters)
  south: number; // दक्षिण खुला ठाउँ
  east: number;  // पूर्व खुला ठाउँ (उत्तर र पूर्व बढी खुला हुनुपर्छ)
  west: number;  // पश्चिम खुला ठाउँ
}

/**
 * Building envelope and open space preferences
 */
export interface BuildingRequirements {
  buildingType: 'residential' | 'commercial' | 'mixed' | 'institutional';
  estimatedBuiltUpArea?: number;
  maxLength?: number;
  maxWidth?: number;
  setbacks: BuildingSetbacks;
  parkingRequired: boolean;
  carParkingCount: number;
  bikeParkingCount: number;
  hasGarden: boolean;
  hasCourtyard: boolean; // आँगन / ब्रह्मस्थान खुला राख्ने
  hasTerrace: boolean;
  hasBalcony: boolean;
  openSpacePreference?: string;
}

/**
 * Room Categories recognized in Vastu & Architecture
 */
export type RoomCategory =
  | 'living'          // बैठक कोठा (Living Room)
  | 'kitchen'         // भान्सा (आग्नेय - SE)
  | 'dining'          // भोजन कक्ष (East / West)
  | 'pooja'           // पूजा कोठा (ईशान - NE)
  | 'master_bedroom'  // मुख्य शयनकक्ष (नैऋत्य - SW)
  | 'bedroom'         // अन्य शयनकक्ष (North / West / South)
  | 'guest_room'      // अतिथि कक्ष (वायव्य - NW)
  | 'study'           // अध्ययन कक्ष (North / NE / East)
  | 'office'          // गृह कार्यालय
  | 'bathroom'        // स्नानघर (East / North)
  | 'toilet'          // शौचालय (NW / West of South / South of SW)
  | 'store'           // भण्डार कोठा (South / West / SW)
  | 'laundry'         // धुलाइ कक्ष
  | 'staircase'       // भर्याङ (South / West / SW - दक्षिणावर्ती)
  | 'lift'            // लिफ्ट
  | 'balcony'         // बालकनी (North / East)
  | 'veranda'         // बरण्डा (North / East)
  | 'courtyard'       // आँगन / ब्रह्मस्थान
  | 'garage'          // ग्यारेज / पार्किङ (NW / SE)
  | 'water_tank_overhead' // माथिल्लो पानी ट्याङ्की (SW / West)
  | 'water_tank_underground' // भूमिगत पानी ट्याङ्की (NE / North)
  | 'utility'         // अन्य युटिलिटी
  | 'other';

/**
 * Individual planned room requirement before placement
 */
export interface PlannedRoomRequirement {
  id: string;
  category: RoomCategory;
  nameNepali: string;
  nameEnglish?: string;
  floorNumber: number; // 0 = Ground Floor, 1 = First, etc.
  preferredDirection: CompassDirection;
  alternativeDirection?: CompassDirection;
  minLength: number;
  minWidth: number;
  minArea?: number;
  hasAttachedBathroom?: boolean;
  hasAttachedBalcony?: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  occupantRelation?: string; // e.g., 'गृहस्वामी', 'छोरा', 'छोरी', 'अतिथि'
  notes?: string;
}

/**
 * Placed / Generated room on a floor plan
 */
export interface PlacedRoom {
  id: string;
  requirementId?: string;
  category: RoomCategory;
  nameNepali: string;
  nameEnglish?: string;
  x: number; // Local offset inside building footprint
  y: number;
  width: number;
  height: number;
  area: number;
  direction: CompassDirection;
  vastuRating: 'recommended' | 'acceptable' | 'caution' | 'conflict';
  color: string;
  doors: Array<{
    wall: 'top' | 'bottom' | 'left' | 'right';
    offset: number;
    width: number;
    hingeSide?: 'left' | 'right';
  }>;
  windows: Array<{
    wall: 'top' | 'bottom' | 'left' | 'right';
    offset: number;
    width: number;
  }>;
  vastuNotes?: string;
}

/**
 * Single Floor Configuration in the multi-story structure
 */
export interface FloorConfiguration {
  floorNumber: number; // 0 = Ground Floor, 1 = First Floor, etc.
  floorNameNepali: string;
  floorNameEnglish: string;
  floorHeight: number; // in feet (typically 9.5 to 10.5 ft)
  plinthHeight?: number; // Ground floor only (typically 1.5 - 3 ft)
  rooms: PlacedRoom[];
  staircase?: {
    x: number;
    y: number;
    width: number;
    height: number;
    direction: CompassDirection;
    clockwise: boolean; // दक्षिणावर्ती भर्याङ वास्तुसम्मत
  };
  passage?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  balconies?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    nameNepali: string;
    direction: CompassDirection;
  }>;
  builtUpAreaSqFt?: number;
}

/**
 * Classical Vedic Ayaadi Calculation (आय-व्यय तथा नक्षत्र षड्वर्ग विचार)
 * Used to ensure building dimensions harmonize with the owner's horoscope
 */
export interface AyaadiCalculation {
  perimeter: number;
  length: number;
  width: number;
  // Aya (Income) - 1: Dhwaja, 2: Dhumra, 3: Simha, 4: Shwana, 5: Vrisha, 6: Khara, 7: Gaja, 8: Kaka
  ayaNumber: number;
  ayaNameNepali: 'ध्वज' | 'धूम' | 'सिंह' | 'श्वान' | 'वृष' | 'खर' | 'गज' | 'काक';
  isAyaAuspicious: boolean; // Dhwaja, Simha, Vrisha, Gaja are auspicious
  // Vyaya (Expense) - Must be less than Aya
  vyayaValue: number;
  isProfitPositive: boolean; // Aya > Vyaya
  // Aayu (Longevity of building in years)
  aayuYears: number;
  // Yoni
  yoniNumber: number;
  yoniNameNepali: string;
  // Nakshatra of building
  buildingNakshatraIndex: number;
  buildingNakshatraNameNepali: string;
  // Owner compatibility
  ownerNakshatraIndex?: number;
  isOwnerCompatible?: boolean;
}

/**
 * Vastu Analysis Checklist Item
 */
export interface VastuAuditItem {
  id: string;
  title: string;
  category: string;
  direction: CompassDirection | string;
  status: 'recommended' | 'acceptable' | 'caution' | 'conflict';
  observation: string;
  recommendation: string;
  vedicRemedy?: string; // तोडफोडविहीन वैदिक/यन्त्र उपचार
}

/**
 * Overall Vastu Audit & Element Balance Result
 */
export interface VastuBuildingAnalysisResult {
  overallScore: number; // 0 to 100%
  grade: 'उत्तम' | 'अनुकूल' | 'मध्यम' | 'सुधार आवश्यक';
  summaryNepali: string;
  items: VastuAuditItem[];
  elementBalance: {
    water: number; // जल तत्त्व % (ईशान)
    fire: number;  // अग्नि तत्त्व % (आग्नेय)
    earth: number; // पृथ्वी तत्त्व % (नैऋत्य)
    air: number;   // वायु तत्त्व % (वायव्य)
    space: number; // आकाश / ब्रह्मस्थान %
  };
  entranceAnalysis: {
    direction: CompassDirection;
    padaNameNepali?: string; // e.g. जयन्त, इन्द्र, मुख्य, भल्लाट
    status: 'recommended' | 'acceptable' | 'caution' | 'conflict';
    notes: string;
  };
  ayaadi?: AyaadiCalculation;
  disclaimer: string;
}

/**
 * Master Vastu Building Planner Project Structure
 * Compatible with Balananda Jyotish BirthDetails and LocationData
 */
export interface VastuBuildingPlannerProject {
  id: string;
  name: string;
  code?: string; // e.g. 'VBP-२०८१-०१'
  createdAt: string;
  updatedAt: string;

  // ==========================================
  // ASTROLOGY & OWNER INTEGRATION (ज्योतिष सम्बन्ध)
  // ==========================================
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  // Optional linkage to existing BirthDetails (Horoscope / Kundali)
  ownerProfileId?: string;
  ownerBirthDetails?: BirthDetails;
  ownerRashi?: string; // e.g., 'मेष', 'वृष', 'मिथुन'...
  ownerNakshatra?: string; // e.g., 'अश्विनी', 'रोहिणी'...

  // ==========================================
  // GEOGRAPHICAL LOCATION (भू-अवस्थिति)
  // Reuses LocationData from src/types/astrology.ts
  // ==========================================
  location: LocationData;
  orientationAngle: number; // 0° = True North, 0 to 359°

  // ==========================================
  // PLOT & SITE DETAILS (जग्गाको विवरण)
  // ==========================================
  unit: MeasurementUnit;
  plotLength: number;
  plotWidth: number;
  plotArea: number; // in sq. unit
  plotShape: PlotShape;
  boundaries: PlotBoundaries;
  roads: RoadInfo[];
  siteConditions: SiteConditions;
  nepaliMeasurement?: NepaliLandMeasurement;

  // ==========================================
  // BUILDING REQUIREMENTS & SETBACKS (भवन आवश्यकता)
  // ==========================================
  buildingReqs: BuildingRequirements;
  floorCount: number; // 1 to 5
  roomRequirements: PlannedRoomRequirement[];

  // ==========================================
  // FLOOR PLANS & CONFIGURATION (तला तथा नक्सा)
  // ==========================================
  floors: FloorConfiguration[];
  buildingFootprint?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  parkingLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
    capacity: string;
  };
  mainGate?: {
    x: number;
    y: number;
    width: number;
    direction: CompassDirection;
  };

  // ==========================================
  // VASTU ANALYSIS & CALCULATION RESULT
  // ==========================================
  analysisResult?: VastuBuildingAnalysisResult;
  ayaadiResult?: AyaadiCalculation;

  // Metadata
  consultantNotes?: string;
  version: string;
}
