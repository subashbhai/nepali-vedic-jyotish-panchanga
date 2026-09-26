// TypeScript definitions for Vastu Building Planner (वास्तु भवन योजना)
// बालानन्द कर्मकाण्ड

export type MeasurementUnit = 'ft' | 'm' | 'haat';

export type PlotShape = 'rectangular' | 'square' | 'l_shaped' | 'irregular' | 'other';

export type BoundaryType = 
  | 'neighbor' // छिमेकी जग्गा
  | 'open' // खाली ठाउँ
  | 'road' // सडक / बाटो
  | 'river' // खोला / नदी
  | 'mountain' // पहाड
  | 'building' // भवन / अग्लो संरचना
  | 'other'; // अन्य

export type CompassDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'CENTER';

export interface PlotBoundarySide {
  length: number;
  boundaryType: BoundaryType;
  notes?: string;
}

export interface PlotBoundaries {
  north: PlotBoundarySide;
  south: PlotBoundarySide;
  east: PlotBoundarySide;
  west: PlotBoundarySide;
}

export interface RoadInfo {
  id: string;
  direction: CompassDirection;
  width: number; // in unit
  sideLength: number;
  isMainRoad: boolean;
  gatePlacement: 'left' | 'center' | 'right';
  roadLevel: 'higher' | 'level' | 'lower';
  name?: string;
}

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  locationName: string;
  district?: string;
  province?: string;
  country: string;
  timezone: number;
}

export interface SiteConditions {
  isFlat: boolean;
  slopeDirection: CompassDirection | 'none';
  waterDrainageDirection: CompassDirection | 'none';
  nearbyWaterBody: boolean;
  nearbyMountainOrHighRise: boolean;
  existingStructures: Array<{
    name: string;
    direction: CompassDirection;
    sizeDescription?: string;
  }>;
  existingTreeOrWell: boolean;
  terrainElevationNE?: number;
  terrainElevationNW?: number;
  terrainElevationSE?: number;
  terrainElevationSW?: number;
  terrainRoughness?: number;
}

export interface BuildingRequirements {
  buildingType: 'residential' | 'office' | 'mixed';
  estimatedBuiltUpArea?: number;
  maxLength?: number;
  maxWidth?: number;
  setbacks: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  parkingRequired: boolean;
  carParkingCount: number;
  bikeParkingCount: number;
  hasGarden: boolean;
  hasCourtyard: boolean;
  hasTerrace: boolean;
  hasBalcony: boolean;
  openSpacePreference?: string;
}

export type RoomCategory =
  | 'living' // बैठक कोठा
  | 'kitchen' // भान्सा
  | 'dining' // भोजन कक्ष
  | 'pooja' // पूजा कोठा
  | 'master_bedroom' // मुख्य शयनकक्ष
  | 'bedroom' // अन्य शयनकक्ष
  | 'guest_room' // अतिथि कोठा
  | 'study' // अध्ययन कक्ष
  | 'office' // कार्यालय
  | 'bathroom' // स्नानघर
  | 'toilet' // शौचालय
  | 'store' // भण्डार (Store)
  | 'laundry' // धोबी कोठा (Laundry)
  | 'staircase' // भर्याङ
  | 'lift' // लिफ्ट
  | 'balcony' // बालकनी
  | 'veranda' // बरण्डा
  | 'courtyard' // ब्रह्मस्थान / आँगन
  | 'garage' // पार्किङ / ग्यारेज
  | 'utility' // युटिलिटी
  | 'other'; // अन्य

export interface PlannedRoom {
  id: string;
  category: RoomCategory;
  nameNepali: string;
  preferredDirection?: CompassDirection | 'CENTER';
  floorNumber: number; // 0 = Ground, 1 = First, 2 = Second...
  minLength: number;
  minWidth: number;
  attachedToilet?: boolean;
  hasWindows?: boolean;
  hasDoor?: boolean;
  doorCount?: number; // 1, 2, 3
  doorType?: 'D1' | 'D2' | 'D3' | 'sliding';
  windowCount?: number; // 0, 1, 2, 3, 4
  windowType?: 'W1' | 'W2' | 'V1';
  hasChhajja?: boolean;
  hasPlumbing?: boolean;
  plumbingFixtures?: string[]; // e.g. ['sink', 'tap', 'shower', 'commode', 'geyser']
  lightPointsCount?: number;
  fanPointsCount?: number;
  powerSocketsCount?: number;
  appliances?: string[]; // e.g. ['sofa', 'tv_unit', 'bed', 'dining_table', 'fridge', 'stove', 'mandir', 'washing_machine', 'wardrobe']
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export type LandscapeEnvironment = 'pahad' | 'terai' | 'city' | 'village';

export type VastuProfile = 'standard' | 'vedic' | 'residential' | 'comprehensive';

export interface GeneratedRoom {
  id: string;
  roomId: string;
  nameNepali: string;
  category: RoomCategory;
  x: number; // local coordinate in building footprint (0 to footprintWidth)
  y: number; // local coordinate (0 to footprintHeight)
  width: number;
  height: number;
  area: number;
  direction: CompassDirection | 'CENTER';
  vastuRating: 'recommended' | 'acceptable' | 'caution' | 'conflict';
  color: string;
  doors: Array<{ wall: 'top' | 'bottom' | 'left' | 'right'; offset: number; width: number }>;
  windows: Array<{ wall: 'top' | 'bottom' | 'left' | 'right'; offset: number; width: number }>;
}

export interface GeneratedFloor {
  floorNumber: number;
  floorNameNepali: string;
  rooms: GeneratedRoom[];
  staircase?: { x: number; y: number; width: number; height: number; direction: string };
  passage?: { x: number; y: number; width: number; height: number };
  balconies?: Array<{ x: number; y: number; width: number; height: number; nameNepali: string }>;
}

export interface GeneratedFloorPlan {
  buildingBounds: {
    x: number; // offset from plot left
    y: number; // offset from plot top
    width: number;
    height: number;
  };
  plotBounds: {
    width: number;
    height: number;
    polygonPoints?: Array<{ x: number; y: number }>;
  };
  floors: GeneratedFloor[];
  parking?: {
    x: number;
    y: number;
    width: number;
    height: number;
    capacity: string;
  };
  gate?: {
    x: number;
    y: number;
    width: number;
    direction: CompassDirection;
  };
  setbacksApplied: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  unit: MeasurementUnit;
}

export interface VastuAnalysisItem {
  id: string;
  title: string;
  category: string;
  direction: string;
  status: 'recommended' | 'acceptable' | 'caution' | 'conflict';
  observation: string;
  recommendation: string;
  vedicRemedy?: string;
}

export interface VastuAnalysisResult {
  overallScore: number; // 0 to 100
  grade: string; // उत्तम, अनुकूल, मध्यम, सुधार आवश्यक
  summaryNepali: string;
  items: VastuAnalysisItem[];
  elementBalance: {
    water: number; // jal %
    fire: number; // agni %
    earth: number; // prithvi %
    air: number; // vayu %
    space: number; // aakash %
  };
  entranceAnalysis: {
    direction: CompassDirection;
    status: 'recommended' | 'acceptable' | 'caution' | 'conflict';
    notes: string;
  };
  disclaimer: string;
}

export interface VastuPlannerProject {
  id: string;
  name: string;
  clientName?: string;
  clientPhone?: string;
  unit: MeasurementUnit;
  plotLength: number;
  plotWidth: number;
  plotArea: number;
  plotShape: PlotShape;
  boundaries: PlotBoundaries;
  roads: RoadInfo[];
  orientationAngle: number; // 0 = True North up, 0-359 deg
  geoLocation: GeoLocationData;
  siteConditions: SiteConditions;
  buildingReqs: BuildingRequirements;
  floorCount: number; // 1 to 5
  rooms: PlannedRoom[];
  vastuProfile: VastuProfile;
  landscapeEnvironment?: LandscapeEnvironment;
  structuralType?: 'rcc_frame' | 'sloped_roof' | 'traditional_timber' | 'hybrid';
  rccColumnsCount?: number;
  plumbingConfig?: {
    undergroundSumpDirection: CompassDirection;
    overheadTankDirection: CompassDirection;
    septicTankDirection: CompassDirection;
    rainwaterHarvesting: boolean;
  };
  electricalConfig?: {
    mainMeterLocation: CompassDirection;
    inverterLocation: CompassDirection;
    solarPanelsOnRoof: boolean;
  };
  createdAt: string;
  updatedAt: string;
  generatedPlan?: GeneratedFloorPlan;
  analysisResult?: VastuAnalysisResult;
}
