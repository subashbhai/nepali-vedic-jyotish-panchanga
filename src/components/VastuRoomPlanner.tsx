// src/components/VastuRoomPlanner.tsx
// Interactive Vastu Room & Plot Planner Component
// Utilizes VastuBuildingPlanner interfaces to map plot dimensions and room placements
// (Kitchen, Bedroom, Puja room, etc.) according to classical Vedic Vastu Shastra.

import React, { useState, useMemo } from 'react';
import {
  CompassDirection,
  PlotShape,
  MeasurementUnit,
  RoomCategory,
  PlannedRoomRequirement,
  PlotBoundaries,
  RoadInfo,
  SiteConditions,
  BuildingRequirements,
  VastuBuildingPlannerProject,
  VastuAuditItem,
  VastuBuildingAnalysisResult,
  AyaadiCalculation
} from '../vastu/types/planner';
import type { LocationData, BirthDetails } from '../types/astrology';
import {
  Building2,
  Compass,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Save,
  RotateCcw,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Sun,
  Maximize2,
  Check,
  ChevronRight,
  User,
  ShieldCheck,
  Printer
} from 'lucide-react';

export interface VastuRoomPlannerProps {
  initialProject?: Partial<VastuBuildingPlannerProject>;
  ownerProfile?: BirthDetails | null;
  onSave?: (project: VastuBuildingPlannerProject) => void;
  onProceedTo3D?: (project: VastuBuildingPlannerProject) => void;
  className?: string;
}

// 9 Direction Zones with Classical Vedic Attributes
interface VastuZoneMeta {
  direction: CompassDirection;
  nameNepali: string;
  nameSanskrit: string;
  element: 'जल' | 'अग्नि' | 'पृथ्वी' | 'वायु' | 'आकाश';
  deity: string;
  rulingPlanet: string;
  idealRooms: RoomCategory[];
  forbiddenRooms: RoomCategory[];
  color: string;
  bgColor: string;
  darkBgColor: string;
  gridRow: number;
  gridCol: number;
  description: string;
}

const VASTU_ZONES_DATA: Record<CompassDirection, VastuZoneMeta> = {
  NW: {
    direction: 'NW',
    nameNepali: 'वायव्य कोण',
    nameSanskrit: 'वायव्य (उत्तर-पश्चिम)',
    element: 'वायु',
    deity: 'वायुदेव (पवन)',
    rulingPlanet: 'चन्द्रमा',
    idealRooms: ['guest_room', 'toilet', 'bathroom', 'garage', 'laundry', 'bedroom'],
    forbiddenRooms: ['pooja', 'master_bedroom', 'kitchen'],
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 border-sky-300',
    darkBgColor: 'dark:bg-sky-950/40 dark:border-sky-800',
    gridRow: 1,
    gridCol: 1,
    description: 'चञ्चल ऊर्जा र आवागमन। पाहुना कोठा, शौचालय तथा हलुका सवारी पार्किङका लागि उपयुक्त।'
  },
  N: {
    direction: 'N',
    nameNepali: 'उत्तर दिशा',
    nameSanskrit: 'उत्तर (सौम्य/कौबेर)',
    element: 'जल',
    deity: 'कुबेर (धनपति)',
    rulingPlanet: 'बुध',
    idealRooms: ['living', 'study', 'pooja', 'bathroom', 'balcony', 'veranda'],
    forbiddenRooms: ['toilet', 'kitchen', 'master_bedroom', 'staircase'],
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 border-emerald-300',
    darkBgColor: 'dark:bg-emerald-950/40 dark:border-emerald-800',
    gridRow: 1,
    gridCol: 2,
    description: 'धनागमन, समृद्धि र खुलापन। बैठक कोठा, अध्ययन, खुला बगैँचा र मुख्य प्रवेशद्वारका लागि श्रेष्ठ।'
  },
  NE: {
    direction: 'NE',
    nameNepali: 'ईशान कोण',
    nameSanskrit: 'ईशान (उत्तर-पूर्व)',
    element: 'जल',
    deity: 'शिव / ईश',
    rulingPlanet: 'बृहस्पति (गुरु)',
    idealRooms: ['pooja', 'living', 'study', 'water_tank_underground', 'veranda'],
    forbiddenRooms: ['kitchen', 'toilet', 'master_bedroom', 'staircase', 'store'],
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 border-amber-300',
    darkBgColor: 'dark:bg-amber-950/40 dark:border-amber-800',
    gridRow: 1,
    gridCol: 3,
    description: 'दैवीय प्रकाश र आध्यात्मिक ऊर्जाको केन्द्र। पूजा कोठा, ध्यान कक्ष र भूमिगत पानी ट्याङ्कीका लागि सर्वोत्कृष्ट।'
  },
  W: {
    direction: 'W',
    nameNepali: 'पश्चिम दिशा',
    nameSanskrit: 'पश्चिम (वारुण)',
    element: 'वायु',
    deity: 'वरुणदेव',
    rulingPlanet: 'शनि',
    idealRooms: ['dining', 'bedroom', 'study', 'staircase', 'toilet', 'water_tank_overhead'],
    forbiddenRooms: ['pooja', 'water_tank_underground'],
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 border-indigo-300',
    darkBgColor: 'dark:bg-indigo-950/40 dark:border-indigo-800',
    gridRow: 2,
    gridCol: 1,
    description: 'स्थिरता र लाभ। भोजन कक्ष (Dining), छोराछोरीको शयनकक्ष र माथिल्लो पानी ट्याङ्कीका लागि उत्तम।'
  },
  CENTER: {
    direction: 'CENTER',
    nameNepali: 'ब्रह्मस्थान',
    nameSanskrit: 'ब्रह्मस्थान (नाभिमण्डल)',
    element: 'आकाश',
    deity: 'ब्रह्माजी',
    rulingPlanet: 'केतु / गुरु',
    idealRooms: ['courtyard'],
    forbiddenRooms: ['toilet', 'kitchen', 'staircase', 'master_bedroom', 'store'],
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50/80 border-yellow-300',
    darkBgColor: 'dark:bg-yellow-950/40 dark:border-yellow-800',
    gridRow: 2,
    gridCol: 2,
    description: 'घरको मुटु र नाभि। यहाँ कुनै स्तम्भ (पिलर), भित्ता, भर्याङ वा भारी तौल हुनुहुँदैन; सदैव खुला राख्नुपर्छ।'
  },
  E: {
    direction: 'E',
    nameNepali: 'पूर्व दिशा',
    nameSanskrit: 'पूर्व (ऐन्द्र/आदित्य)',
    element: 'अग्नि',
    deity: 'इन्द्र / सूर्य',
    rulingPlanet: 'सूर्य',
    idealRooms: ['living', 'pooja', 'bathroom', 'study', 'dining', 'balcony'],
    forbiddenRooms: ['toilet', 'master_bedroom', 'staircase', 'store'],
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 border-orange-300',
    darkBgColor: 'dark:bg-orange-950/40 dark:border-orange-800',
    gridRow: 2,
    gridCol: 3,
    description: 'आरोग्य, यश र सामाजिक प्रतिष्ठा। बिहानीको सूर्यकिरण प्रवेश गर्ने गरी खुला बैठक, स्नानघर वा बरण्डा श्रेष्ठ।'
  },
  SW: {
    direction: 'SW',
    nameNepali: 'नैऋत्य कोण',
    nameSanskrit: 'नैऋत्य (दक्षिण-पश्चिम)',
    element: 'पृथ्वी',
    deity: 'निरृति (राक्षस/स्थिरता)',
    rulingPlanet: 'राहु',
    idealRooms: ['master_bedroom', 'store', 'staircase', 'water_tank_overhead'],
    forbiddenRooms: ['pooja', 'kitchen', 'toilet', 'water_tank_underground', 'living'],
    color: 'text-rose-700 dark:text-rose-400',
    bgColor: 'bg-rose-50 border-rose-300',
    darkBgColor: 'dark:bg-rose-950/40 dark:border-rose-800',
    gridRow: 3,
    gridCol: 1,
    description: 'पृथ्वी तत्त्वको भार र स्थिरता। घरको मुली (गृहस्वामी) को मुख्य शयनकक्ष, सेफ तथा भारी दराजका लागि सर्वश्रेष्ठ।'
  },
  S: {
    direction: 'S',
    nameNepali: 'दक्षिण दिशा',
    nameSanskrit: 'दक्षिण (याम्य)',
    element: 'पृथ्वी',
    deity: 'यमराज',
    rulingPlanet: 'मङ्गल',
    idealRooms: ['bedroom', 'staircase', 'store', 'dining', 'toilet'],
    forbiddenRooms: ['pooja', 'water_tank_underground', 'kitchen'],
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 border-red-300',
    darkBgColor: 'dark:bg-red-950/40 dark:border-red-800',
    gridRow: 3,
    gridCol: 2,
    description: 'साहस, अनुशासन र विश्राम। शयनकक्ष (दक्षिण सिरानी), भर्याङ र भारी भण्डारका लागि उपयुक्त।'
  },
  SE: {
    direction: 'SE',
    nameNepali: 'आग्नेय कोण',
    nameSanskrit: 'आग्नेय (दक्षिण-पूर्व)',
    element: 'अग्नि',
    deity: 'अग्निदेव',
    rulingPlanet: 'शुक्र',
    idealRooms: ['kitchen', 'garage', 'utility'],
    forbiddenRooms: ['master_bedroom', 'pooja', 'water_tank_underground', 'toilet', 'living'],
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 border-orange-300',
    darkBgColor: 'dark:bg-orange-950/40 dark:border-orange-800',
    gridRow: 3,
    gridCol: 3,
    description: 'अग्नितत्त्वको उद्गमस्थल। भान्सा कोठा (Kitchen), बिजुलीको मुख्य मिटर/इन्भर्टर र जेनेरेटरका लागि सर्वोत्कृष्ट।'
  }
};

// Default Starter Rooms for a Standard Nepali Home
const DEFAULT_ROOMS: PlannedRoomRequirement[] = [
  {
    id: 'req-pooja',
    category: 'pooja',
    nameNepali: 'पूजा कोठा (Puja Room)',
    nameEnglish: 'Puja / Prayer Room',
    floorNumber: 0,
    preferredDirection: 'NE',
    minLength: 6,
    minWidth: 8,
    minArea: 48,
    priority: 'critical',
    occupantRelation: 'सम्पूर्ण परिवार',
    notes: 'ईशान कोणमा उत्तर वा पूर्व फर्केर पूजा गर्ने व्यवस्था।'
  },
  {
    id: 'req-kitchen',
    category: 'kitchen',
    nameNepali: 'भान्सा कोठा (Kitchen)',
    nameEnglish: 'Kitchen',
    floorNumber: 0,
    preferredDirection: 'SE',
    minLength: 10,
    minWidth: 10,
    minArea: 100,
    priority: 'critical',
    occupantRelation: 'गृहिणी / भान्छा',
    notes: 'खाना पकाउँदा पूर्व फर्किने गरी चुलो राख्नुपर्छ।'
  },
  {
    id: 'req-master-bed',
    category: 'master_bedroom',
    nameNepali: 'मुख्य शयनकक्ष (Master Bed)',
    nameEnglish: 'Master Bedroom',
    floorNumber: 0,
    preferredDirection: 'SW',
    minLength: 12,
    minWidth: 14,
    minArea: 168,
    priority: 'critical',
    occupantRelation: 'गृहस्वामी दम्पती',
    hasAttachedBathroom: true,
    notes: 'दक्षिण वा पूर्व सिरानी गरेर सुत्ने व्यवस्था।'
  },
  {
    id: 'req-living',
    category: 'living',
    nameNepali: 'बैठक कोठा (Living Room)',
    nameEnglish: 'Living Room',
    floorNumber: 0,
    preferredDirection: 'N',
    minLength: 12,
    minWidth: 16,
    minArea: 192,
    priority: 'high',
    occupantRelation: 'अतिथि तथा परिवार'
  },
  {
    id: 'req-dining',
    category: 'dining',
    nameNepali: 'भोजन कक्ष (Dining Room)',
    nameEnglish: 'Dining Room',
    floorNumber: 0,
    preferredDirection: 'W',
    minLength: 10,
    minWidth: 12,
    minArea: 120,
    priority: 'medium'
  },
  {
    id: 'req-toilet',
    category: 'toilet',
    nameNepali: 'शौचालय (Common Toilet)',
    nameEnglish: 'Common Toilet',
    floorNumber: 0,
    preferredDirection: 'NW',
    minLength: 6,
    minWidth: 8,
    minArea: 48,
    priority: 'high',
    notes: 'कमोड उत्तर वा दक्षिण फर्किने गरी राख्ने।'
  },
  {
    id: 'req-staircase',
    category: 'staircase',
    nameNepali: 'भर्याङ (Staircase)',
    nameEnglish: 'Staircase',
    floorNumber: 0,
    preferredDirection: 'S',
    minLength: 8,
    minWidth: 12,
    minArea: 96,
    priority: 'high',
    notes: 'दक्षिणावर्ती (Clockwise) घुम्ने गरी निर्माण गर्नुपर्छ।'
  }
];

export const VastuRoomPlanner: React.FC<VastuRoomPlannerProps> = ({
  initialProject,
  ownerProfile,
  onSave,
  onProceedTo3D,
  className = ''
}) => {
  // 1. PLOT DIMENSIONS & METADATA STATE
  const [plotLength, setPlotLength] = useState<number>(initialProject?.plotLength || 40);
  const [plotWidth, setPlotWidth] = useState<number>(initialProject?.plotWidth || 30);
  const [unit, setUnit] = useState<MeasurementUnit>(initialProject?.unit || 'ft');
  const [plotShape, setPlotShape] = useState<PlotShape>(initialProject?.plotShape || 'rectangular');
  const [mainRoadDirection, setMainRoadDirection] = useState<CompassDirection>('E');
  const [mainRoadWidth, setMainRoadWidth] = useState<number>(16);
  const [orientationAngle, setOrientationAngle] = useState<number>(initialProject?.orientationAngle || 0);

  // Setbacks State
  const [setbackNorth, setSetbackNorth] = useState<number>(initialProject?.buildingReqs?.setbacks.north ?? 5);
  const [setbackEast, setSetbackEast] = useState<number>(initialProject?.buildingReqs?.setbacks.east ?? 5);
  const [setbackSouth, setSetbackSouth] = useState<number>(initialProject?.buildingReqs?.setbacks.south ?? 4);
  const [setbackWest, setSetbackWest] = useState<number>(initialProject?.buildingReqs?.setbacks.west ?? 4);

  // Homeowner & Astrology State
  const [clientName, setClientName] = useState<string>(
    initialProject?.clientName || ownerProfile?.name || 'श्री बालानन्द यजमान'
  );
  const [clientPhone, setClientPhone] = useState<string>(
    initialProject?.clientPhone || ownerProfile?.phone || ''
  );
  const [ownerRashi, setOwnerRashi] = useState<string>(initialProject?.ownerRashi || 'मेष');

  // 2. ROOM REQUIREMENTS STATE
  const [roomRequirements, setRoomRequirements] = useState<PlannedRoomRequirement[]>(
    initialProject?.roomRequirements || DEFAULT_ROOMS
  );

  // Active Floor Selection
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [floorCount, setFloorCount] = useState<number>(initialProject?.floorCount || 2);

  // Selected Direction Filter / Inspection in Mandala
  const [inspectedZone, setInspectedZone] = useState<CompassDirection | null>('NE');

  // New Room Modal / Inline Form State
  const [isAddingRoom, setIsAddingRoom] = useState<boolean>(false);
  const [newRoomCategory, setNewRoomCategory] = useState<RoomCategory>('bedroom');
  const [newRoomNameNepali, setNewRoomNameNepali] = useState<string>('नयाँ शयनकक्ष');
  const [newRoomDirection, setNewRoomDirection] = useState<CompassDirection>('SW');
  const [newRoomLength, setNewRoomLength] = useState<number>(12);
  const [newRoomWidth, setNewRoomWidth] = useState<number>(12);
  const [newRoomPriority, setNewRoomPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');

  // Saved notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // CALCULATE PLOT AREA
  const plotArea = useMemo(() => plotLength * plotWidth, [plotLength, plotWidth]);

  // TRADITIONAL NEPALI LAND AREA CALCULATIONS (Pahad / Terai)
  const nepaliLandDetails = useMemo(() => {
    const sqFt = unit === 'ft' ? plotArea : unit === 'm' ? plotArea * 10.7639 : plotArea * 2.25;
    // Ropani System (1 Ropani = 5476 sq ft, 1 Aana = 342.25 sq ft, 1 Paisa = 85.56 sq ft, 1 Daam = 21.39 sq ft)
    const ropani = Math.floor(sqFt / 5476);
    const rem1 = sqFt % 5476;
    const aana = Math.floor(rem1 / 342.25);
    const rem2 = rem1 % 342.25;
    const paisa = Math.floor(rem2 / 85.56);
    const rem3 = rem2 % 85.56;
    const daam = Math.floor(rem3 / 21.39);

    // Bigha System (1 Bigha = 72900 sq ft, 1 Kattha = 3645 sq ft, 1 Dhur = 182.25 sq ft)
    const bigha = Math.floor(sqFt / 72900);
    const bRem1 = sqFt % 72900;
    const kattha = Math.floor(bRem1 / 3645);
    const bRem2 = bRem1 % 3645;
    const dhur = Math.floor(bRem2 / 182.25);

    return { sqFt: Math.round(sqFt), ropani, aana, paisa, daam, bigha, kattha, dhur };
  }, [plotArea, unit]);

  // AYAADI CALCULATION (Vedic Longevity & Prosperity Formula)
  const ayaadiCalculation: AyaadiCalculation = useMemo(() => {
    const perimeter = 2 * (plotLength + plotWidth);
    const ayaNumber = ((perimeter * 8) % 8) || 8;
    const ayaNames: Array<'ध्वज' | 'धूम' | 'सिंह' | 'श्वान' | 'वृष' | 'खर' | 'गज' | 'काक'> = [
      'ध्वज', 'धूम', 'सिंह', 'श्वान', 'वृष', 'खर', 'गज', 'काक'
    ];
    const ayaName = ayaNames[ayaNumber - 1] || 'ध्वज';
    const isAyaAuspicious = [1, 3, 5, 7].includes(ayaNumber); // Dhwaja, Simha, Vrisha, Gaja

    const vyayaValue = (perimeter * 3) % 8 || 8;
    const aayuYears = ((plotArea * 27) % 100) || 60;
    const yoniNumber = ((plotWidth * 3) % 8) || 1;

    return {
      perimeter,
      length: plotLength,
      width: plotWidth,
      ayaNumber,
      ayaNameNepali: ayaName,
      isAyaAuspicious,
      vyayaValue,
      isProfitPositive: ayaNumber > vyayaValue,
      aayuYears,
      yoniNumber,
      yoniNameNepali: ayaName,
      buildingNakshatraIndex: (plotArea * 8) % 27 || 1,
      buildingNakshatraNameNepali: 'रोहिणी',
      isOwnerCompatible: isAyaAuspicious
    };
  }, [plotLength, plotWidth, plotArea]);

  // VASTU AUDIT ENGINE FOR ROOM MAPPING
  const auditResult = useMemo((): VastuBuildingAnalysisResult => {
    const items: VastuAuditItem[] = [];
    let totalScore = 0;
    let maxScore = 0;

    let waterPoints = 20;
    let firePoints = 20;
    let earthPoints = 20;
    let airPoints = 20;
    let spacePoints = 20;

    roomRequirements.forEach((room) => {
      const zoneMeta = VASTU_ZONES_DATA[room.preferredDirection];
      const isIdeal = zoneMeta.idealRooms.includes(room.category);
      const isForbidden = zoneMeta.forbiddenRooms.includes(room.category);

      let status: 'recommended' | 'acceptable' | 'caution' | 'conflict' = 'acceptable';
      let score = 7;
      let observation = `${room.nameNepali} ${zoneMeta.nameNepali} मा राखिएको छ।`;
      let recommendation = 'सामान्य अनुकूल छ।';
      let remedy: string | undefined = undefined;

      // SPECIFIC CHECKS FOR CORE ROOMS: POOJA, KITCHEN, BEDROOM
      if (room.category === 'pooja') {
        maxScore += 20;
        if (room.preferredDirection === 'NE') {
          status = 'recommended';
          score = 20;
          observation = 'पूजा कोठा ईशान (उत्तर-पूर्व) कोणमा रहेको छ। यो सर्वश्रेष्ठ वास्तु स्थिति हो।';
          recommendation = 'ईश्वरीय कृपा, मानसिक शान्ति र कुल वृद्धि हुनेछ।';
          waterPoints += 10;
        } else if (room.preferredDirection === 'E' || room.preferredDirection === 'N') {
          status = 'acceptable';
          score = 15;
          observation = 'पूजा कोठा पूर्व वा उत्तरमा छ। यो पनि शुभ मानिन्छ।';
          recommendation = 'पूजा गर्दा पूर्व वा उत्तर फर्किनुहोस्।';
        } else if (room.preferredDirection === 'SE') {
          status = 'caution';
          score = 8;
          observation = 'पूजा कोठा आग्नेय कोणमा छ। अग्नि तत्त्वको प्रभावले पारिवारिक तनाव हुन सक्छ।';
          recommendation = 'पूजा स्थललाई ईशान तर्फ सार्नु उत्तम।';
          remedy = 'पूजा कोठामा सेतो वा हल्का पहेँलो रङ्ग लगाउनुहोस् र घृतको दीप बाल्नुहोस्।';
        } else {
          status = 'conflict';
          score = 2;
          observation = `पूजा कोठा ${zoneMeta.nameNepali} मा छ। यो गम्भीर वास्तु दोष मानिन्छ।`;
          recommendation = 'पूजा कोठालाई तत्काल उत्तर-पूर्व (ईशान) कोणमा स्थानान्तरण गर्नुहोस्।';
          remedy = 'तोडफोड सम्भव नभएमा ईशान कोणमा छुट्टै श्रीयन्त्र वा मङ्गल कलश स्थापना गर्नुहोस्।';
        }
      } else if (room.category === 'kitchen') {
        maxScore += 20;
        if (room.preferredDirection === 'SE') {
          status = 'recommended';
          score = 20;
          observation = 'भान्सा कोठा आग्नेय कोण (दक्षिण-पूर्व) मा छ। यो अग्निदेवको स्वस्थान हो।';
          recommendation = 'गृहिणीको स्वास्थ्य उत्तम रहनेछ र अन्नपूर्णाको वास हुनेछ।';
          firePoints += 15;
        } else if (room.preferredDirection === 'NW') {
          status = 'acceptable';
          score = 14;
          observation = 'भान्सा वायव्य कोणमा छ। यो आग्नेयको उत्तम विकल्प हो।';
          recommendation = 'खाना पकाउँदा पूर्व फर्किने गरी चुलो राख्नुहोस्।';
        } else if (room.preferredDirection === 'NE') {
          status = 'conflict';
          score = 0;
          observation = 'भान्सा ईशान (उत्तर-पूर्व) मा छ! जल र अग्निको टकरावले वंश हानि, अशान्ति र खर्च निम्त्याउँछ।';
          recommendation = 'भान्सालाई आग्नेय (SE) कोणमा सार्न अत्यधिक सिफारिस गरिन्छ।';
          remedy = 'तोडफोड गर्न नमिल्ने अवस्थामा ग्यास चुलोमुनि प्राकृतिक पहेंलो मार्वल वा तामाको प्लेट राख्नुहोस्।';
          waterPoints -= 15;
          firePoints -= 15;
        } else if (room.preferredDirection === 'SW') {
          status = 'conflict';
          score = 2;
          observation = 'भान्सा नैऋत्य कोणमा हुनुहुँदैन। यसले गृहस्वामीको आयु तथा आर्थिक स्थिरता कमजोर बनाउँछ।';
          recommendation = 'दक्षिण-पूर्व वा उत्तर-पश्चिममा सार्नुहोस्।';
          remedy = 'चुलोको नजिक पञ्चधातु वा राहु शान्ति यन्त्र राख्नुहोस्।';
        } else {
          status = 'caution';
          score = 8;
          observation = `भान्सा ${zoneMeta.nameNepali} मा छ।`;
          recommendation = 'खाना पकाउँदा पूर्व दिशा फर्कन मिल्ने चुलो बनाउनुहोस्।';
        }
      } else if (room.category === 'master_bedroom') {
        maxScore += 20;
        if (room.preferredDirection === 'SW') {
          status = 'recommended';
          score = 20;
          observation = 'मुख्य शयनकक्ष नैऋत्य (दक्षिण-पश्चिम) कोणमा छ। पृथ्वी तत्त्वको पूर्ण स्थिरता।';
          recommendation = 'गृहस्वामीको प्रतिष्ठा, परिवारमा आदर र आर्थिक स्थायित्व वृद्धि गर्दछ।';
          earthPoints += 15;
        } else if (room.preferredDirection === 'S' || room.preferredDirection === 'W') {
          status = 'acceptable';
          score = 15;
          observation = 'शयनकक्ष दक्षिण वा पश्चिममा छ। यो पनि अनुकूल मानिन्छ।';
          recommendation = 'सुत्दा टाउको सधैँ दक्षिण वा पूर्व तर्फ राख्नुहोस्।';
        } else if (room.preferredDirection === 'NE') {
          status = 'conflict';
          score = 2;
          observation = 'मुख्य शयनकक्ष ईशान कोणमा हुनुहुँदैन। यो देवस्थान भएकाले दम्पतीमा कलह हुन सक्छ।';
          recommendation = 'ईशानमा पूजा वा ध्यान कक्ष राख्नुहोस् र शयनकक्ष नैऋत्यमा सार्नुहोस्।';
          remedy = 'यदि सार्न नसकिएमा कोठामा हल्का पहेँलो रङ्ग र क्रिस्टल बल झुन्ड्याउनुहोस्।';
        } else if (room.preferredDirection === 'SE') {
          status = 'caution';
          score = 6;
          observation = 'आग्नेय कोणमा शयनकक्ष हुँदा अनिद्रा, मानसिक तनाव र रिस बढ्न सक्छ।';
          recommendation = 'अग्नि कोणबाट शयनकक्ष हटाउनु राम्रो।';
          remedy = 'खाटलाई उत्तर-पश्चिम भित्तातर्फ सार्नुहोस् र हरियो/नीलो पर्दा प्रयोग गर्नुहोस्।';
        } else {
          status = 'acceptable';
          score = 10;
          observation = `शयनकक्ष ${zoneMeta.nameNepali} मा छ।`;
          recommendation = 'सुत्दा दक्षिण सिरानी मिलाउनुहोस्।';
        }
      } else if (room.category === 'toilet') {
        maxScore += 15;
        if (room.preferredDirection === 'NW' || room.preferredDirection === 'W') {
          status = 'recommended';
          score = 15;
          observation = 'शौचालय वायव्य वा पश्चिममा छ। यो शास्त्रीय रूपमा निर्दोष स्थिति हो।';
          recommendation = 'कमोड उत्तर वा दक्षिण फर्काएर राख्नुहोस्।';
          airPoints += 5;
        } else if (room.preferredDirection === 'NE') {
          status = 'conflict';
          score = 0;
          observation = 'ईशान (NE) कोणमा शौचालय महावास्तु दोष हो! यसले वंशवृद्धि, मस्तिष्क र धनमा गम्भीर हानि गर्छ।';
          recommendation = 'ईशानबाट शौचालय अनिवार्य रूपमा हटाउनुहोस्।';
          remedy = 'तत्कालका लागि शौचालयमा सिधे नुनको कचौरा राख्ने र बाहिर तामाको स्वस्तिक यन्त्र टाँस्नुहोस्।';
          waterPoints -= 20;
        } else if (room.preferredDirection === 'SW' || room.preferredDirection === 'CENTER') {
          status = 'conflict';
          score = 0;
          observation = 'नैऋत्य वा ब्रह्मस्थानमा शौचालय हुनु अत्यन्त हानिकारक मानिन्छ।';
          recommendation = 'वायव्य वा पश्चिम तर्फ स्थानान्तरण गर्नुहोस्।';
          remedy = 'कमोडको वरिपरि तामाको तार वा सिसा (Lead) स्ट्रिप टाँस्नुहोस्।';
          earthPoints -= 20;
        } else {
          status = 'caution';
          score = 7;
          observation = `शौचालय ${zoneMeta.nameNepali} मा छ।`;
          recommendation = 'शौचालयको ढोका सधैँ बन्द राख्नुहोस्।';
        }
      } else {
        maxScore += 10;
        if (isIdeal) {
          status = 'recommended';
          score = 10;
          observation = `${room.nameNepali} ${zoneMeta.nameNepali} का लागि पूर्ण अनुकूल छ।`;
          recommendation = 'वास्तुसम्मत निर्माण जारी राख्नुहोस्।';
        } else if (isForbidden) {
          status = 'conflict';
          score = 2;
          observation = `${room.nameNepali} ${zoneMeta.nameNepali} मा राख्न शास्त्रीय रूपमा वर्जित छ।`;
          recommendation = 'यो कोठालाई अनुकूल दिशामा सार्नुहोस्।';
          remedy = 'रङ्ग तथा पञ्चतत्त्व यन्त्रमार्फत दोष निवारण गर्नुहोस्।';
        } else {
          status = 'acceptable';
          score = 8;
          observation = `${room.nameNepali} ${zoneMeta.nameNepali} मा सामान्य अनुकूल छ।`;
          recommendation = 'दिशागत नियम अनुसार आन्तरिक व्यवस्थापन मिलाउनुहोस्।';
        }
      }

      totalScore += score;
      items.push({
        id: `audit-${room.id}`,
        title: room.nameNepali,
        category: room.category,
        direction: room.preferredDirection,
        status,
        observation,
        recommendation,
        vedicRemedy: remedy
      });
    });

    const percentage = maxScore > 0 ? Math.min(100, Math.round((totalScore / maxScore) * 100)) : 80;
    let grade: 'उत्तम' | 'अनुकूल' | 'मध्यम' | 'सुधार आवश्यक' = 'अनुकूल';
    if (percentage >= 85) grade = 'उत्तम';
    else if (percentage >= 70) grade = 'अनुकूल';
    else if (percentage >= 50) grade = 'मध्यम';
    else grade = 'सुधार आवश्यक';

    return {
      overallScore: percentage,
      grade,
      summaryNepali: `तपाईंको प्रस्तावित भवन योजनाको समग्र वास्तु अनुकूलता ${percentage}% (${grade}) रहेको छ। पूजा, भान्सा र शयनकक्षको दिशा शास्त्रीय नियम अनुरूप व्यवस्थित गरिएको छ।`,
      items,
      elementBalance: {
        water: Math.max(10, Math.min(100, waterPoints)),
        fire: Math.max(10, Math.min(100, firePoints)),
        earth: Math.max(10, Math.min(100, earthPoints)),
        air: Math.max(10, Math.min(100, airPoints)),
        space: Math.max(10, Math.min(100, spacePoints))
      },
      entranceAnalysis: {
        direction: mainRoadDirection,
        padaNameNepali: mainRoadDirection === 'E' ? 'इन्द्र/जयन्त' : mainRoadDirection === 'N' ? 'कुबेर/मुख्य' : 'सामान्य',
        status: mainRoadDirection === 'E' || mainRoadDirection === 'N' ? 'recommended' : 'acceptable',
        notes: `${mainRoadDirection} तर्फ सडक र मुख्य प्रवेशद्वार शास्त्रीय रूपमा ${mainRoadDirection === 'E' || mainRoadDirection === 'N' ? 'अत्यन्त शुभ र समृद्धिकारक' : 'स्वीकार्य'} छ।`
      },
      ayaadi: ayaadiCalculation,
      disclaimer: 'यो वास्तु योजना प्रारम्भिक वैदिक वास्तु सिद्धान्तमा आधारित योजना हो। संरचनागत (Structural) इन्जिनियरिङ र नगरपालिकाको मापदण्डका लागि दक्ष प्राविधिकसँग परामर्श लिनुहोला।'
    };
  }, [roomRequirements, mainRoadDirection, ayaadiCalculation]);

  // HANDLE ROOM DIRECTION CHANGE
  const handleRoomDirectionChange = (roomId: string, newDir: CompassDirection) => {
    setRoomRequirements((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, preferredDirection: newDir } : r))
    );
  };

  // HANDLE REMOVE ROOM
  const handleRemoveRoom = (roomId: string) => {
    setRoomRequirements((prev) => prev.filter((r) => r.id !== roomId));
  };

  // ADD NEW CUSTOM ROOM
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom: PlannedRoomRequirement = {
      id: `req-${Date.now()}`,
      category: newRoomCategory,
      nameNepali: newRoomNameNepali,
      floorNumber: selectedFloor,
      preferredDirection: newRoomDirection,
      minLength: newRoomLength,
      minWidth: newRoomWidth,
      minArea: newRoomLength * newRoomWidth,
      priority: newRoomPriority
    };
    setRoomRequirements((prev) => [...prev, newRoom]);
    setIsAddingRoom(false);
    // Reset defaults
    setNewRoomNameNepali('नयाँ कोठा');
  };

  // ONE-CLICK VASTU AUTO-OPTIMIZATION
  const handleApplyVastuDefaults = () => {
    setRoomRequirements((prev) =>
      prev.map((room) => {
        if (room.category === 'pooja') return { ...room, preferredDirection: 'NE' };
        if (room.category === 'kitchen') return { ...room, preferredDirection: 'SE' };
        if (room.category === 'master_bedroom') return { ...room, preferredDirection: 'SW' };
        if (room.category === 'toilet') return { ...room, preferredDirection: 'NW' };
        if (room.category === 'living') return { ...room, preferredDirection: 'N' };
        if (room.category === 'dining') return { ...room, preferredDirection: 'W' };
        if (room.category === 'staircase') return { ...room, preferredDirection: 'S' };
        return room;
      })
    );
    setToastMessage('सबै कोठाहरू वैदिक वास्तुको आदर्श स्थानमा मिलाइयो!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // SAVE PROJECT
  const handleSaveProject = () => {
    const fullProject: VastuBuildingPlannerProject = {
      id: initialProject?.id || `vbp-${Date.now()}`,
      name: initialProject?.name || `${clientName}को वास्तु भवन योजना`,
      createdAt: initialProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientName,
      clientPhone,
      ownerRashi,
      location: initialProject?.location || {
        name: 'काठमाडौं, नेपाल',
        country: 'नेपाल',
        latitude: 27.7172,
        longitude: 85.324,
        timeZone: 5.75
      },
      orientationAngle,
      unit,
      plotLength,
      plotWidth,
      plotArea,
      plotShape,
      boundaries: {
        north: { length: plotLength, boundaryType: 'neighbor' },
        south: { length: plotLength, boundaryType: 'neighbor' },
        east: { length: plotWidth, boundaryType: mainRoadDirection === 'E' ? 'road' : 'open' },
        west: { length: plotWidth, boundaryType: mainRoadDirection === 'W' ? 'road' : 'open' }
      },
      roads: [
        {
          id: 'road-1',
          direction: mainRoadDirection,
          width: mainRoadWidth,
          sideLength: plotWidth,
          isMainRoad: true,
          gatePlacement: 'center',
          roadLevel: 'level'
        }
      ],
      siteConditions: {
        isFlat: true,
        slopeDirection: 'NE',
        waterDrainageDirection: 'NE',
        nearbyWaterBody: false,
        nearbyMountainOrHighRise: false,
        existingTreeOrWell: false,
        existingStructures: []
      },
      buildingReqs: {
        buildingType: 'residential',
        setbacks: {
          north: setbackNorth,
          east: setbackEast,
          south: setbackSouth,
          west: setbackWest
        },
        parkingRequired: true,
        carParkingCount: 1,
        bikeParkingCount: 2,
        hasGarden: true,
        hasCourtyard: true,
        hasTerrace: true,
        hasBalcony: true
      },
      floorCount,
      roomRequirements,
      floors: [],
      analysisResult: auditResult,
      ayaadiResult: ayaadiCalculation,
      version: '1.0'
    };

    if (onSave) {
      onSave(fullProject);
    }
    setToastMessage('वास्तु भवन योजना सफलतापूर्वक सुरक्षित गरियो!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div id="vastu-room-planner-root" className={`w-full space-y-6 ${className}`}>
      {/* 1. COMPONENT HERO BANNER */}
      <div className="bg-gradient-to-r from-[#7A1C1C] via-[#8B2323] to-[#5C1515] text-white rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                VastuRoomPlanner • वैदिक मण्डल
              </span>
              <span className="text-amber-200 text-xs hidden sm:inline">
                | जग्गा नाप तथा कोठा वास्तु म्यापिङ
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-amber-400" />
              <span>वास्तु भवन तथा कोठा योजनाकार (Vastu Room Planner)</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-2xl">
              जग्गाको नाप, सडक र कोठाहरू (भान्सा, पूजा कोठा, मुख्य शयनकक्ष आदि) वैदिक वास्तुशास्त्र अनुसार अनुकूल दिशामा मिलाउनुहोस्।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleApplyVastuDefaults}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
              title="शास्त्रीय सर्वोत्तम दिशामा स्वतः मिलाउनुहोस्"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>वास्तु आदर्श म्यापिङ</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProject}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>सुरक्षित गर्नुहोस्</span>
            </button>

            {onProceedTo3D && (
              <button
                type="button"
                onClick={() => {
                  handleSaveProject();
                  onProceedTo3D({
                    id: 'temp',
                    name: clientName,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    clientName,
                    location: { name: 'नेपाल', country: 'नेपाल', latitude: 27.7, longitude: 85.3, timeZone: 5.75 },
                    orientationAngle,
                    unit,
                    plotLength,
                    plotWidth,
                    plotArea,
                    plotShape,
                    boundaries: {
                      north: { length: plotLength, boundaryType: 'neighbor' },
                      south: { length: plotLength, boundaryType: 'neighbor' },
                      east: { length: plotWidth, boundaryType: 'road' },
                      west: { length: plotWidth, boundaryType: 'open' }
                    },
                    roads: [],
                    siteConditions: { isFlat: true, slopeDirection: 'NE', waterDrainageDirection: 'NE', nearbyWaterBody: false, nearbyMountainOrHighRise: false, existingTreeOrWell: false, existingStructures: [] },
                    buildingReqs: { buildingType: 'residential', setbacks: { north: setbackNorth, east: setbackEast, south: setbackSouth, west: setbackWest }, parkingRequired: true, carParkingCount: 1, bikeParkingCount: 2, hasGarden: true, hasCourtyard: true, hasTerrace: true, hasBalcony: true },
                    floorCount,
                    roomRequirements,
                    floors: [],
                    version: '1.0'
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
              >
                <span>३D मोडल हेर्नुहोस्</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Real-time Score Pill Bar */}
        <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-amber-200">वास्तु प्राप्ताङ्क:</span>
            <span className="font-black text-amber-300 text-sm px-2.5 py-0.5 rounded-lg bg-black/20 border border-amber-400/30">
              {auditResult.overallScore}% ({auditResult.grade})
            </span>
            <span className="text-stone-200 text-[11px] hidden sm:inline">
              आय-व्यय विचार: <strong>{ayaadiCalculation.ayaNameNepali} आय</strong> (
              {ayaadiCalculation.isAyaAuspicious ? 'शुभ/वृद्धि' : 'सामान्य'}
              )
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-amber-200">जग्गाको क्षेत्रफल:</span>
            <span className="font-bold text-white">
              {plotLength} × {plotWidth} {unit} = {plotArea} {unit}²
            </span>
            <span className="text-amber-300 hidden md:inline">
              ({nepaliLandDetails.ropani}-{nepaliLandDetails.aana}-{nepaliLandDetails.paisa}-
              {nepaliLandDetails.daam} रोपनी प्रणाली)
            </span>
          </div>
        </div>
      </div>

      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN LAYOUT: (A) INPUTS & MANDALA | (B) ROOM MAPPING & AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================================================== */}
        {/* LEFT COLUMN (LG: 5 COLS): PLOT DIMENSIONS & MANDALA */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* CARD 1: PLOT INPUTS & GEOMETRY */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-sm font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-amber-600" />
                <span>१. जग्गाको नाप तथा आधारभूत विवरण</span>
              </h3>
              <span className="text-[10px] text-stone-500 uppercase font-bold">Plot Geometry</span>
            </div>

            {/* Owner Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                  गृहस्वामीको नाम:
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="उदा: गृहस्वामीको नाम"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                  गृहस्वामीको राशि:
                </label>
                <select
                  value={ownerRashi}
                  onChange={(e) => setOwnerRashi(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold focus:outline-none cursor-pointer"
                >
                  {['मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'].map(
                    (r) => (
                      <option key={r} value={r}>
                        {r} राशि
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Length, Width, Unit */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                  लम्बाइ (Length):
                </label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={plotLength}
                  onChange={(e) => setPlotLength(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                  चौडाइ (Width):
                </label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={plotWidth}
                  onChange={(e) => setPlotWidth(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                  एकाइ (Unit):
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold cursor-pointer"
                >
                  <option value="ft">फिट (Feet)</option>
                  <option value="m">मिटर (Meters)</option>
                  <option value="haat">हात (Haat)</option>
                  <option value="gaj">गज (Gaj)</option>
                </select>
              </div>
            </div>

            {/* Shape & Facing Direction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                  जग्गाको आकार (Shape):
                </label>
                <select
                  value={plotShape}
                  onChange={(e) => setPlotShape(e.target.value as PlotShape)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold cursor-pointer"
                >
                  <option value="rectangular">आयताकार (Rectangular - शुभ)</option>
                  <option value="square">समचतुरस्र (Square - सर्वोत्तम)</option>
                  <option value="gomukhi">गोमुखी (Gomukhi - आवासीयका लागि शुभ)</option>
                  <option value="singhmukhi">सिंहमुखी (व्यापारिकका लागि शुभ)</option>
                  <option value="l_shaped">L-आकार (L-Shaped - दोषयुक्त)</option>
                  <option value="irregular">विषमकोण / अनियमित</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                  मुख्य सडक दिशा (Facing Road):
                </label>
                <select
                  value={mainRoadDirection}
                  onChange={(e) => setMainRoadDirection(e.target.value as CompassDirection)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold cursor-pointer"
                >
                  <option value="E">पूर्व (East) - सर्वोत्तम सूर्योदय</option>
                  <option value="N">उत्तर (North) - कुबेर स्थान</option>
                  <option value="NE">उत्तर-पूर्व (ईशान) - उत्तम</option>
                  <option value="SE">दक्षिण-पूर्व (आग्नेय)</option>
                  <option value="S">दक्षिण (South)</option>
                  <option value="SW">दक्षिण-पश्चिम (नैऋत्य)</option>
                  <option value="W">पश्चिम (West)</option>
                  <option value="NW">उत्तर-पश्चिम (वायव्य)</option>
                </select>
              </div>
            </div>

            {/* Setbacks Row */}
            <div>
              <label className="block text-stone-600 dark:text-stone-300 font-bold text-xs mb-1.5">
                सेटब्याक / खुला ठाउँ (Setbacks in {unit}):
              </label>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
                  <span className="block text-[10px] text-stone-500 font-bold">उत्तर (North)</span>
                  <input
                    type="number"
                    value={setbackNorth}
                    onChange={(e) => setSetbackNorth(Number(e.target.value))}
                    className="w-full text-center font-bold bg-transparent text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
                  <span className="block text-[10px] text-stone-500 font-bold">पूर्व (East)</span>
                  <input
                    type="number"
                    value={setbackEast}
                    onChange={(e) => setSetbackEast(Number(e.target.value))}
                    className="w-full text-center font-bold bg-transparent text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
                  <span className="block text-[10px] text-stone-500 font-bold">दक्षिण (South)</span>
                  <input
                    type="number"
                    value={setbackSouth}
                    onChange={(e) => setSetbackSouth(Number(e.target.value))}
                    className="w-full text-center font-bold bg-transparent text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div className="p-2 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
                  <span className="block text-[10px] text-stone-500 font-bold">पश्चिम (West)</span>
                  <input
                    type="number"
                    value={setbackWest}
                    onChange={(e) => setSetbackWest(Number(e.target.value))}
                    className="w-full text-center font-bold bg-transparent text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                * वास्तु नियम: उत्तर र पूर्व तर्फ बढी खुला ठाउँ हुनु शुभ हुन्छ।
              </p>
            </div>
          </div>

          {/* CARD 2: 3x3 VASTU PURUSHA MANDALA DIRECTION GRID */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-sm font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>२. ३×३ वास्तु मण्डल चक्र (Direction Grid)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  दिशा छानेर कुन कोठा राख्ने सोझै परीक्षण गर्नुहोस्:
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                ९ पद मण्डल
              </span>
            </div>

            {/* 3x3 Grid Visualizer */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-stone-100 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700">
              {(['NW', 'N', 'NE', 'W', 'CENTER', 'E', 'SW', 'S', 'SE'] as CompassDirection[]).map(
                (dir) => {
                  const meta = VASTU_ZONES_DATA[dir];
                  const assignedRooms = roomRequirements.filter(
                    (r) => r.preferredDirection === dir
                  );
                  const isSelected = inspectedZone === dir;

                  return (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setInspectedZone(dir)}
                      className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col justify-between min-h-[90px] cursor-pointer ${
                        isSelected
                          ? 'border-[#7A1C1C] dark:border-amber-400 shadow-md ring-2 ring-[#7A1C1C]/20 bg-white dark:bg-stone-800'
                          : `${meta.bgColor} ${meta.darkBgColor} hover:brightness-95`
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-black ${meta.color}`}>{dir}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 text-stone-700 dark:text-stone-300">
                          {meta.element}
                        </span>
                      </div>

                      <div className="my-1">
                        <span className="block text-[11px] font-bold text-stone-800 dark:text-stone-200 leading-tight">
                          {meta.nameNepali}
                        </span>
                        <span className="block text-[9px] text-stone-500 truncate">
                          {meta.deity}
                        </span>
                      </div>

                      {/* Assigned Room Tags */}
                      <div className="w-full pt-1 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">
                          {assignedRooms.length > 0 ? `${assignedRooms.length} कोठा` : 'खाली'}
                        </span>
                        {assignedRooms.length > 0 && (
                          <div className="flex gap-0.5">
                            {assignedRooms.slice(0, 2).map((_, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-[#7A1C1C] dark:bg-amber-400"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {/* Inspected Zone Detail Card */}
            {inspectedZone && (
              <div className="p-3.5 bg-amber-50/70 dark:bg-stone-800/80 rounded-xl border border-amber-300 dark:border-stone-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>
                      {VASTU_ZONES_DATA[inspectedZone].nameSanskrit} ({inspectedZone})
                    </span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-semibold">
                    स्वामी: {VASTU_ZONES_DATA[inspectedZone].deity} (
                    {VASTU_ZONES_DATA[inspectedZone].rulingPlanet})
                  </span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-[11px]">
                  {VASTU_ZONES_DATA[inspectedZone].description}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    ✓ उत्तम:
                  </span>
                  {VASTU_ZONES_DATA[inspectedZone].idealRooms.map((r) => (
                    <span
                      key={r}
                      className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-semibold"
                    >
                      {r}
                    </span>
                  ))}
                  <span className="text-[10px] font-bold text-red-700 dark:text-red-300 ml-1">
                    ✗ निषेध:
                  </span>
                  {VASTU_ZONES_DATA[inspectedZone].forbiddenRooms.map((r) => (
                    <span
                      key={r}
                      className="px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200 text-[10px] font-semibold"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN (LG: 7 COLS): ROOM MAPPING & AUDIT */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* CARD 3: ROOM REQUIREMENTS & VASTU MAPPING */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-sm font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>३. कोठा आवश्यकता तथा दिशा निर्धारण (Room Mapping)</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  विशेष ध्यान: <strong>पूजा कोठा (NE)</strong>, <strong>भान्सा (SE)</strong>,{' '}
                  <strong>मुख्य शयनकक्ष (SW)</strong>
                </p>
              </div>

              {/* Add Custom Room Button */}
              <button
                type="button"
                onClick={() => setIsAddingRoom(!isAddingRoom)}
                className="px-3 py-1.5 rounded-xl bg-[#7A1C1C] hover:bg-[#8B2323] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नयाँ कोठा थप्नुहोस्</span>
              </button>
            </div>

            {/* ADD ROOM COLLAPSIBLE FORM */}
            {isAddingRoom && (
              <form
                onSubmit={handleAddRoom}
                className="p-4 bg-amber-50/60 dark:bg-stone-800/80 rounded-xl border border-amber-300 dark:border-stone-700 space-y-3 text-xs animate-fade-in"
              >
                <div className="font-bold text-stone-800 dark:text-stone-200">
                  नयाँ कोठाको विवरण भर्नुहोस्:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      कोठाको नाम (Nepali):
                    </label>
                    <input
                      type="text"
                      required
                      value={newRoomNameNepali}
                      onChange={(e) => setNewRoomNameNepali(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      प्रकार (Category):
                    </label>
                    <select
                      value={newRoomCategory}
                      onChange={(e) => setNewRoomCategory(e.target.value as RoomCategory)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-bold cursor-pointer"
                    >
                      <option value="pooja">पूजा कोठा (Puja)</option>
                      <option value="kitchen">भान्सा (Kitchen)</option>
                      <option value="master_bedroom">मुख्य शयनकक्ष (Master Bed)</option>
                      <option value="bedroom">अन्य शयनकक्ष (Bedroom)</option>
                      <option value="living">बैठक कोठा (Living)</option>
                      <option value="dining">भोजन कक्ष (Dining)</option>
                      <option value="toilet">शौचालय (Toilet)</option>
                      <option value="bathroom">स्नानघर (Bathroom)</option>
                      <option value="study">अध्ययन कक्ष (Study)</option>
                      <option value="staircase">भर्याङ (Staircase)</option>
                      <option value="store">भण्डार (Store)</option>
                      <option value="garage">पार्किङ / ग्यारेज</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      वास्तु दिशा (Target Zone):
                    </label>
                    <select
                      value={newRoomDirection}
                      onChange={(e) => setNewRoomDirection(e.target.value as CompassDirection)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-bold cursor-pointer"
                    >
                      {(['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'CENTER'] as CompassDirection[]).map(
                        (d) => (
                          <option key={d} value={d}>
                            {d} ({VASTU_ZONES_DATA[d].nameNepali})
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      लम्बाइ ({unit}):
                    </label>
                    <input
                      type="number"
                      value={newRoomLength}
                      onChange={(e) => setNewRoomLength(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      चौडाइ ({unit}):
                    </label>
                    <input
                      type="number"
                      value={newRoomWidth}
                      onChange={(e) => setNewRoomWidth(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      प्राथमिकता:
                    </label>
                    <select
                      value={newRoomPriority}
                      onChange={(e) => setNewRoomPriority(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-bold cursor-pointer"
                    >
                      <option value="critical">अत्यन्त महत्त्वपूर्ण (Critical)</option>
                      <option value="high">उच्च (High)</option>
                      <option value="medium">मध्यम (Medium)</option>
                      <option value="low">सामान्य (Low)</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      थप्नुहोस्
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingRoom(false)}
                      className="py-1.5 px-3 rounded-lg border border-stone-300 dark:border-stone-600 font-bold cursor-pointer"
                    >
                      रद्द
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ROOM LIST & INTERACTIVE DIRECTION DROPDOWNS */}
            <div className="space-y-2.5">
              {roomRequirements.map((room, idx) => {
                const auditItem = auditResult.items.find((it) => it.title === room.nameNepali);
                const status = auditItem?.status || 'acceptable';

                return (
                  <div
                    key={room.id}
                    className={`p-3.5 rounded-xl border-2 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      status === 'recommended'
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : status === 'conflict'
                        ? 'border-red-300 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif">
                            {room.nameNepali}
                          </h4>
                          {/* Status Badge */}
                          {status === 'recommended' && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>उत्तम</span>
                            </span>
                          )}
                          {status === 'conflict' && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 flex items-center gap-1">
                              <AlertOctagon className="w-3 h-3" />
                              <span>वास्तु दोष</span>
                            </span>
                          )}
                          {status === 'caution' && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>सावधानी</span>
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-500 mt-0.5">
                          नाप: {room.minLength} × {room.minWidth} {unit} ({room.minArea || room.minLength * room.minWidth} {unit}²)
                          {room.notes && ` • ${room.notes}`}
                        </p>

                        {/* Vedic Remedy Suggestion if Conflict */}
                        {auditItem?.vedicRemedy && (
                          <div className="mt-1 text-[11px] text-red-700 dark:text-red-400 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>तोडफोडविहीन समाधान: {auditItem.vedicRemedy}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side: Direction Selector & Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-stone-400 block font-bold">दिशा</span>
                      </div>
                      <select
                        value={room.preferredDirection}
                        onChange={(e) =>
                          handleRoomDirectionChange(room.id, e.target.value as CompassDirection)
                        }
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer focus:outline-none ${
                          status === 'recommended'
                            ? 'border-emerald-400 text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950'
                            : status === 'conflict'
                            ? 'border-red-400 text-red-900 dark:text-red-200 bg-red-50 dark:bg-red-950'
                            : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800'
                        }`}
                      >
                        {(['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'CENTER'] as CompassDirection[]).map(
                          (dir) => (
                            <option key={dir} value={dir}>
                              {dir} - {VASTU_ZONES_DATA[dir].nameNepali}
                            </option>
                          )
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveRoom(room.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-stone-800 cursor-pointer transition"
                        title="कोठा हटाउनुहोस्"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 4: VASTU AUDIT SUMMARY & ELEMENT BALANCE */}
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-sm font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>४. पञ्चतत्त्व सन्तुलन तथा वास्तु प्रतिवेदन</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                श्रेणी: {auditResult.grade}
              </span>
            </div>

            {/* Element Balance Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <Droplets className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="block font-bold text-blue-900 dark:text-blue-300">जल (Water)</span>
                <span className="text-xs font-black text-blue-700 dark:text-blue-200">
                  {auditResult.elementBalance.water}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
                <Flame className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                <span className="block font-bold text-orange-900 dark:text-orange-300">
                  अग्नि (Fire)
                </span>
                <span className="text-xs font-black text-orange-700 dark:text-orange-200">
                  {auditResult.elementBalance.fire}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700">
                <Mountain className="w-4 h-4 text-stone-600 dark:text-stone-300 mx-auto mb-1" />
                <span className="block font-bold text-stone-900 dark:text-stone-200">
                  पृथ्वी (Earth)
                </span>
                <span className="text-xs font-black text-stone-700 dark:text-stone-300">
                  {auditResult.elementBalance.earth}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <Wind className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                <span className="block font-bold text-sky-900 dark:text-sky-300">वायु (Air)</span>
                <span className="text-xs font-black text-sky-700 dark:text-sky-200">
                  {auditResult.elementBalance.air}%
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800">
                <Sun className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
                <span className="block font-bold text-yellow-900 dark:text-yellow-300">
                  आकाश (Space)
                </span>
                <span className="text-xs font-black text-yellow-700 dark:text-yellow-200">
                  {auditResult.elementBalance.space}%
                </span>
              </div>
            </div>

            {/* Summary Text & Disclaimer */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-xs space-y-2">
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
                {auditResult.summaryNepali}
              </p>
              <p className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200 dark:border-stone-700">
                <strong>सूचना:</strong> {auditResult.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
