// 3D House Plan & Exterior Visualizer using Three.js
// बालानन्द कर्मकाण्ड - वास्तु भवन योजना
// Features: Full Realistic House, Front Aagan (Courtyard), Lush Garden (Bagaicha), Front Road (Bato),
// Compound Wall, Main Gate, Tulsi Math, Parked Car, Trees, Flowers, Roof Styles & Printable Snapshot

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GeneratedFloorPlan, VastuPlannerProject } from '../types';
import {
  RotateCcw,
  Sun,
  Moon,
  Sunset,
  Layers,
  Camera,
  Compass,
  Info,
  Maximize2,
  Minimize2,
  Printer,
  TreePine,
  Home,
  Mountain,
  TrendingUp,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Flag,
  Download,
  FileText,
  Sparkles,
  Footprints,
  Move,
  Hand,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  Navigation,
  MapPin,
  Building2,
  Palette,
  DoorOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { Vastu3DExportModal } from './Vastu3DExportModal';
import { generateVastuFloorPlan } from '../planner/planGenerator';
import {
  buildRoadAndSidewalk,
  buildCompoundWallAndGate,
  buildTulsiMath,
  buildParkedCar,
  buildTree,
  buildFlowerBed,
  buildGardenBench,
  buildExteriorWindow,
  buildFrontEntrancePorch,
  buildRooftopWaterTank,
  buildSolarWaterHeater,
  createGrassTexture,
  createPaverTexture,
  createTileRoofTexture,
  createBrickWallTexture,
  createStuccoWallTexture,
  createSlateRoofTexture,
  createMarbleFloorTexture,
  createWoodParquetTexture,
  createTerracottaTileTexture,
  buildRealisticDoor,
  buildRealisticBardali,
  buildCeilingLightFixture,
  RoofStyle,
  LightingMood,
  TerrainConfig,
  TerrainSlopePreset,
  TerrainVastuAnalysis,
  TERRAIN_SLOPE_PRESETS,
  getTerrainHeight,
  calculateTerrainVastuAnalysis,
  buildTerrainGroup
} from './threeDHouseBuilder';
import { buildNepalLandscape, NepalEnvironmentType } from './threeDNepalLandscape';
import { buildInteriorAppliance } from './threeDInteriorBuilder';

// Customization Types
type ExteriorWallOption = 'modern_white' | 'red_brick' | 'sandalwood' | 'slate_grey' | 'vedic_gold' | 'temple_red' | 'sage_green';
type BardaliStyleOption = 'carved_wood' | 'glass_steel' | 'iron_grill' | 'brass' | 'white_marble';
type InteriorWallColorOption = 'vastu' | '#fdfbf7' | '#fef3c7' | '#e0f2fe' | '#ffe4e6' | '#dcfce7' | '#fef08a';
type InteriorFloorOption = 'marble' | 'wood' | 'terracotta' | 'granite';

const EXTERIOR_WALL_OPTIONS: Array<{
  id: ExteriorWallOption;
  labelNepali: string;
  colorHex: number;
  isBrick?: boolean;
  swatch: string;
}> = [
  { id: 'modern_white', labelNepali: 'आधुनिक सेतो स्तुक्को (White Stucco)', colorHex: 0xf8fafc, swatch: '#f8fafc' },
  { id: 'red_brick', labelNepali: 'नेपाली रातो ईँटा (Red Brick)', colorHex: 0x991b1b, isBrick: true, swatch: '#991b1b' },
  { id: 'sandalwood', labelNepali: 'चन्दन बेज (Sandalwood Beige)', colorHex: 0xf5eedc, swatch: '#f5eedc' },
  { id: 'slate_grey', labelNepali: 'हिमाली स्लेट खैरो (Slate Grey)', colorHex: 0x64748b, swatch: '#64748b' },
  { id: 'vedic_gold', labelNepali: 'वैदिक पहेँलो (Vedic Gold)', colorHex: 0xd97706, swatch: '#d97706' },
  { id: 'temple_red', labelNepali: 'मन्दिर टेराकोटा (Temple Terracotta)', colorHex: 0xb91c1c, swatch: '#b91c1c' },
  { id: 'sage_green', labelNepali: 'शान्त हरियो (Sage Green)', colorHex: 0x4d7c0f, swatch: '#4d7c0f' },
];

const ROOF_OPTIONS: Array<{
  id: RoofStyle;
  labelNepali: string;
  icon: string;
}> = [
  { id: 'pitched_tile', labelNepali: '🏠 रातो माटोको टायल (Clay Red Tile)', icon: '🏠' },
  { id: 'pitched_slate', labelNepali: '🏔️ हिमाली नीलो स्लेट (Himalayan Slate)', icon: '🏔️' },
  { id: 'pitched_copper', labelNepali: '🪙 तामा धातुको छानो (Copper Bronze)', icon: '🪙' },
  { id: 'pitched_green', labelNepali: '🌿 हरियो पर्यावरण छानो (Eco Green)', icon: '🌿' },
  { id: 'flat_terrace', labelNepali: '🏢 आरसीसी कौशी र ट्यांकी (Flat Terrace)', icon: '🏢' },
  { id: 'cutaway', labelNepali: '📐 कोठा खुला कट-अवे (Cutaway View)', icon: '📐' },
];

const BARDALI_STYLE_OPTIONS: Array<{
  id: BardaliStyleOption;
  labelNepali: string;
  icon: string;
}> = [
  { id: 'carved_wood', labelNepali: '🪵 नेवारी काठको आँखीझ्याल (Carved Wood)', icon: '🪵' },
  { id: 'glass_steel', labelNepali: '🪟 आधुनिक सिसा र स्टिल (Glass & Steel)', icon: '🪟' },
  { id: 'iron_grill', labelNepali: '🛡️ कालो फलामे ग्रिल (Wrought Iron)', icon: '🛡️' },
  { id: 'brass', labelNepali: '✨ सुनौलो ब्रास (Golden Brass)', icon: '✨' },
  { id: 'white_marble', labelNepali: '🏛️ सेतो संगमरमर (White Marble)', icon: '🏛️' },
];

const BARDALI_COLOR_OPTIONS: Array<{
  id: number;
  labelNepali: string;
  swatch: string;
}> = [
  { id: 0x451a03, labelNepali: 'गाढा काठ (Dark Wood)', swatch: '#451a03' },
  { id: 0x78350f, labelNepali: 'सुनौलो काठ (Teak Wood)', swatch: '#78350f' },
  { id: 0x18181b, labelNepali: 'कालो (Jet Black)', swatch: '#18181b' },
  { id: 0x94a3b8, labelNepali: 'चाँदी / स्टिल (Silver Steel)', swatch: '#94a3b8' },
  { id: 0xffffff, labelNepali: 'सेतो (Pure White)', swatch: '#ffffff' },
  { id: 0xfacc15, labelNepali: 'सुनौलो (Royal Gold)', swatch: '#facc15' },
];

const INTERIOR_WALL_OPTIONS: Array<{
  id: InteriorWallColorOption;
  labelNepali: string;
  swatch: string;
}> = [
  { id: 'vastu', labelNepali: '🕉️ वास्तु अनुरूप रङ्ग (Vastu Direction)', swatch: '#fef08a' },
  { id: '#fdfbf7', labelNepali: 'सफा आइभोरी (Ivory White)', swatch: '#fdfbf7' },
  { id: '#fef3c7', labelNepali: 'न्यानो बेज (Warm Beige)', swatch: '#fef3c7' },
  { id: '#e0f2fe', labelNepali: 'शान्त आकाशी (Peaceful Sky Blue)', swatch: '#e0f2fe' },
  { id: '#ffe4e6', labelNepali: 'मन्द गुलाफी (Soft Rose)', swatch: '#ffe4e6' },
  { id: '#dcfce7', labelNepali: 'मिन्ट हरियो (Mint Sage)', swatch: '#dcfce7' },
  { id: '#fef08a', labelNepali: 'सूर्य पहेंलो (Sun Gold)', swatch: '#fef08a' },
];

const FLOOR_OPTIONS: Array<{
  id: InteriorFloorOption;
  labelNepali: string;
  icon: string;
}> = [
  { id: 'marble', labelNepali: '🏛️ इटालियन सेतो मार्बल (Italian Marble)', icon: '🏛️' },
  { id: 'wood', labelNepali: '🪵 काठको पार्केट (Hardwood Parquet)', icon: '🪵' },
  { id: 'terracotta', labelNepali: '🧱 रातो टेराकोटा टायल (Terracotta Tile)', icon: '🧱' },
  { id: 'granite', labelNepali: '🪨 खैरो ग्रेनाइट (Polished Granite)', icon: '🪨' },
];

function getVastuRoomWallColor(room: { category?: string; direction?: string }): number {
  const cat = room.category || '';
  const dir = room.direction || '';
  if (cat === 'pooja' || dir === 'NE') return 0xfef08a; // Light Vedic Gold
  if (cat === 'kitchen' || dir === 'SE') return 0xfed7aa; // Warm Peach / Orange (Agni)
  if (cat === 'master_bedroom' || dir === 'SW') return 0xf5eedc; // Sandalwood Earthy Beige (Prithvi)
  if (dir === 'NW' || cat === 'guest_room') return 0xe0f2fe; // Peaceful Sky Blue / Air
  if (dir === 'N' || cat === 'study' || cat === 'office') return 0xdcfce7; // Mint Sage (Mercury / Budha)
  if (cat === 'dining') return 0xffedd5; // Warm Apricot
  if (cat === 'toilet' || cat === 'bathroom') return 0xe2e8f0; // Soft Light Grey
  return 0xf8fafc; // Off-white modern
}

interface ThreeDHouseViewerProps {
  project: VastuPlannerProject;
  plan: GeneratedFloorPlan;
  onPlanUpdate?: (updatedPlan: GeneratedFloorPlan, updatedProject: VastuPlannerProject) => void;
}

export const ThreeDHouseViewer: React.FC<ThreeDHouseViewerProps> = ({
  project,
  plan,
  onPlanUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const handleSetFloorCount = (newCount: number) => {
    if (!onPlanUpdate) return;
    const updatedProject: VastuPlannerProject = {
      ...project,
      floorCount: newCount,
      updatedAt: new Date().toISOString()
    };
    const updatedPlan = generateVastuFloorPlan(updatedProject);
    onPlanUpdate(updatedPlan, updatedProject);
  };

  // Viewer State
  const [roofStyle, setRoofStyle] = useState<RoofStyle>('pitched_tile');
  const [lightingMood, setLightingMood] = useState<LightingMood>('day');
  const [showEnvironment, setShowEnvironment] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Nepal Environment & Interior Modes
  const [environmentType, setEnvironmentType] = useState<NepalEnvironmentType>(
    (project.landscapeEnvironment as NepalEnvironmentType) || 'city'
  );
  const [interiorLightsOn, setInteriorLightsOn] = useState<boolean>(true);
  const [showAppliances, setShowAppliances] = useState<boolean>(true);

  // House Customization State (Colors, Styles, Materials & Walk-in Tour)
  const [exteriorWallOption, setExteriorWallOption] = useState<ExteriorWallOption>('red_brick');
  const [bardaliStyle, setBardaliStyle] = useState<BardaliStyleOption>('carved_wood');
  const [bardaliColor, setBardaliColor] = useState<number>(0x451a03);
  const [interiorWallColor, setInteriorWallColor] = useState<InteriorWallColorOption>('vastu');
  const [interiorFloorType, setInteriorFloorType] = useState<InteriorFloorOption>('marble');
  const [activeInsideRoomId, setActiveInsideRoomId] = useState<string | null>(null);

  // Terrain & Slope Simulation State
  const [terrainConfig, setTerrainConfig] = useState<TerrainConfig>(() => {
    if (project.siteConditions?.terrainElevationNE !== undefined) {
      return {
        mode: 'custom',
        elevationNE: project.siteConditions.terrainElevationNE ?? 0,
        elevationNW: project.siteConditions.terrainElevationNW ?? 0,
        elevationSE: project.siteConditions.terrainElevationSE ?? 0,
        elevationSW: project.siteConditions.terrainElevationSW ?? 0,
        roughness: project.siteConditions.terrainRoughness ?? 0,
        showContourGrid: false,
        showSlopeArrow: true,
        showElevationPins: true
      };
    }
    // Default to auspicious Ishan Plava slope preset so user immediately sees elevation & Vastu interaction
    const ishanPreset = TERRAIN_SLOPE_PRESETS[0];
    return {
      mode: ishanPreset.id,
      elevationNE: ishanPreset.elevationNE,
      elevationNW: ishanPreset.elevationNW,
      elevationSE: ishanPreset.elevationSE,
      elevationSW: ishanPreset.elevationSW,
      roughness: ishanPreset.roughness,
      showContourGrid: false,
      showSlopeArrow: true,
      showElevationPins: true
    };
  });

  const [isTerrainToolsOpen, setIsTerrainToolsOpen] = useState<boolean>(false);
  const [terrainTab, setTerrainTab] = useState<'presets' | 'custom' | 'analysis'>('presets');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // 3D Navigation Mode: Orbit (परिक्रमा) vs Walkthrough (पदयात्रा)
  const [controlMode, setControlMode] = useState<'orbit' | 'walkthrough'>('orbit');
  const [eyeHeight, setEyeHeight] = useState<number>(5.5); // feet above ground
  const [walkSpeed, setWalkSpeed] = useState<'normal' | 'fast'>('normal');
  const [isNavDockExpanded, setIsNavDockExpanded] = useState<boolean>(true);

  // Live Vastu Shastra Terrain Analysis
  const terrainAnalysis: TerrainVastuAnalysis = useMemo(() => {
    const plotW = Math.max(30, plan.plotBounds.width);
    const plotH = Math.max(30, plan.plotBounds.height);
    return calculateTerrainVastuAnalysis(terrainConfig, plotW, plotH);
  }, [terrainConfig, plan.plotBounds.width, plan.plotBounds.height]);

  // Flattened list of all rooms across all floors with their 3D world coordinates
  const allRoomsList = useMemo(() => {
    const list: Array<{
      floorIdx: number;
      floorName: string;
      room: (typeof plan.floors)[0]['rooms'][0];
      worldX: number;
      worldY: number;
      worldZ: number;
    }> = [];

    const plotW = Math.max(30, plan.plotBounds.width);
    const plotH = Math.max(30, plan.plotBounds.height);
    const bW = plan.buildingBounds.width;
    const bH = plan.buildingBounds.height;
    const bCenterX = -plotW / 2 + plan.buildingBounds.x + bW / 2;
    const bCenterZ = -plotH / 2 + plan.buildingBounds.y + bH / 2;

    const houseFootprintCorners = [
      { x: bCenterX - bW / 2, z: bCenterZ - bH / 2 },
      { x: bCenterX + bW / 2, z: bCenterZ - bH / 2 },
      { x: bCenterX - bW / 2, z: bCenterZ + bH / 2 },
      { x: bCenterX + bW / 2, z: bCenterZ + bH / 2 },
      { x: bCenterX, z: bCenterZ }
    ];
    const houseHeights = houseFootprintCorners.map(c => getTerrainHeight(c.x, c.z, plotW, plotH, terrainConfig));
    const maxHouseElev = Math.max(...houseHeights);
    const bBaseY = Math.max(0, maxHouseElev);
    const plinthH = 1.2;
    const floorHeight = 10.5;

    plan.floors.forEach((fl, fIdx) => {
      const floorBaseY = bBaseY + plinthH + fIdx * floorHeight;
      fl.rooms.forEach(rm => {
        const rx = bCenterX + (rm.x - bW / 2 + rm.width / 2);
        const rz = bCenterZ + (rm.y - bH / 2 + rm.height / 2);
        list.push({
          floorIdx: fIdx,
          floorName: fl.floorNameNepali || `${fIdx + 1} तला`,
          room: rm,
          worldX: rx,
          worldY: floorBaseY,
          worldZ: rz
        });
      });
    });
    return list;
  }, [plan, terrainConfig]);

  const activeRoomData = useMemo(() => {
    if (!activeInsideRoomId) return null;
    return allRoomsList.find(r => r.room.id === activeInsideRoomId) || null;
  }, [allRoomsList, activeInsideRoomId]);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Camera Orbit angles & radius
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3.4,
    radius: 110
  });

  // Camera Target for Orbit mode (enables 3D panning across terrain & building)
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 7, 0));

  // Walkthrough first-person coordinates & gaze
  const walkPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 45 });
  const walkLookRef = useRef<{ yaw: number; pitch: number }>({ yaw: Math.PI, pitch: 0.04 });

  // Mouse & Touch interaction state
  const isDraggingRef = useRef<boolean>(false);
  const dragActionRef = useRef<'rotate' | 'pan' | 'walk_look' | null>(null);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevTouchDistRef = useRef<number | null>(null);
  const prevTouchMidRef = useRef<{ x: number; y: number } | null>(null);

  // Update Camera in spherical coords around cameraTargetRef for Orbit Mode
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const target = cameraTargetRef.current;
    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target.x, target.y, target.z);
  };

  // Update Camera for Walkthrough Mode (first-person human perspective)
  const updateWalkthroughCamera = () => {
    if (!cameraRef.current) return;
    const plotW = Math.max(30, plan.plotBounds.width);
    const plotH = Math.max(30, plan.plotBounds.height);
    const { x, z } = walkPosRef.current;

    // Follow natural ground terrain height or room floor height
    const groundY = getTerrainHeight(x, z, plotW, plotH, terrainConfig);
    const bW = plan.buildingBounds.width;
    const bH = plan.buildingBounds.height;
    const bCenterX = -plotW / 2 + plan.buildingBounds.x + bW / 2;
    const bCenterZ = -plotH / 2 + plan.buildingBounds.y + bH / 2;

    const houseFootprintCorners = [
      { x: bCenterX - bW / 2, z: bCenterZ - bH / 2 },
      { x: bCenterX + bW / 2, z: bCenterZ - bH / 2 },
      { x: bCenterX - bW / 2, z: bCenterZ + bH / 2 },
      { x: bCenterX + bW / 2, z: bCenterZ + bH / 2 },
      { x: bCenterX, z: bCenterZ }
    ];
    const houseHeights = houseFootprintCorners.map(c => getTerrainHeight(c.x, c.z, plotW, plotH, terrainConfig));
    const maxHouseElev = Math.max(...houseHeights);
    const bBaseY = Math.max(0, maxHouseElev);

    let floorBaseY = groundY;
    if (activeInsideRoomId && activeRoomData) {
      floorBaseY = activeRoomData.worldY;
    } else {
      const isInsideHouse =
        x >= bCenterX - bW / 2 && x <= bCenterX + bW / 2 &&
        z >= bCenterZ - bH / 2 && z <= bCenterZ + bH / 2;
      if (isInsideHouse) {
        floorBaseY = bBaseY + 1.2;
      }
    }
    const camY = floorBaseY + eyeHeight;

    cameraRef.current.position.set(x, camY, z);

    const { yaw, pitch } = walkLookRef.current;
    const lookDir = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch)
    );

    const lookTarget = new THREE.Vector3().addVectors(cameraRef.current.position, lookDir);
    cameraRef.current.lookAt(lookTarget);
  };

  // Switch between Orbit and Walkthrough Modes
  const handleSwitchMode = (mode: 'orbit' | 'walkthrough') => {
    setControlMode(mode);
    if (!cameraRef.current) return;

    if (mode === 'walkthrough') {
      cameraRef.current.fov = activeInsideRoomId ? 75 : 55;
      cameraRef.current.near = activeInsideRoomId ? 0.15 : 0.3;
      cameraRef.current.updateProjectionMatrix();

      if (!activeInsideRoomId) {
        // Initialize player position in front of main compound gate on the road
        const plotH = Math.max(30, plan.plotBounds.height);
        walkPosRef.current = { x: 0, z: Math.max(34, (plotH / 2) + 16) };
        walkLookRef.current = { yaw: Math.PI, pitch: 0.04 };
      }
      updateWalkthroughCamera();
    } else {
      setActiveInsideRoomId(null);
      cameraRef.current.fov = 45;
      cameraRef.current.near = 1.0;
      cameraRef.current.updateProjectionMatrix();

      updateCameraPosition();
    }
  };

  // Jump camera directly into a room (Walk-in Room Tour)
  const handleJumpToRoom = (roomId: string) => {
    if (!roomId || roomId === 'none') {
      setActiveInsideRoomId(null);
      handleSwitchMode('orbit');
      return;
    }
    const targetRoom = allRoomsList.find(r => r.room.id === roomId);
    if (!targetRoom) return;

    setActiveInsideRoomId(roomId);
    setControlMode('walkthrough');
    setEyeHeight(5.5);

    walkPosRef.current = { x: targetRoom.worldX, z: targetRoom.worldZ };
    walkLookRef.current = { yaw: Math.PI, pitch: 0.0 };

    if (cameraRef.current) {
      cameraRef.current.fov = 75; // Wide interior view
      cameraRef.current.near = 0.15; // Zero clipping
      cameraRef.current.updateProjectionMatrix();
    }
    updateWalkthroughCamera();
  };

  const handleNavigateRoom = (direction: 'prev' | 'next') => {
    if (allRoomsList.length === 0) return;
    const curIdx = allRoomsList.findIndex(r => r.room.id === activeInsideRoomId);
    let nextIdx = 0;
    if (curIdx === -1) {
      nextIdx = 0;
    } else if (direction === 'prev') {
      nextIdx = (curIdx - 1 + allRoomsList.length) % allRoomsList.length;
    } else {
      nextIdx = (curIdx + 1) % allRoomsList.length;
    }
    handleJumpToRoom(allRoomsList[nextIdx].room.id);
  };

  const handleExitRoomToOrbit = () => {
    setActiveInsideRoomId(null);
    handleSwitchMode('orbit');
  };

  // Pan Camera target along the view plane (Orbit Pan)
  const panCamera = (deltaX: number, deltaY: number) => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    const target = cameraTargetRef.current;
    const radius = cameraAngleRef.current.radius;

    // Compute view right and up vectors
    const forward = new THREE.Vector3().subVectors(target, camera.position).normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();

    const speed = radius * 0.0016;
    target.addScaledVector(right, -deltaX * speed);
    target.addScaledVector(up, deltaY * speed);

    updateCameraPosition();
  };

  // Reset Orbit Target to House Center
  const handleResetTarget = () => {
    cameraTargetRef.current.set(0, 7, 0);
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.4, radius: 110 };
    updateCameraPosition();
  };

  // Orbit rotation step
  const handleOrbitRotate = (deltaTheta: number, deltaPhi: number) => {
    cameraAngleRef.current.theta += deltaTheta;
    cameraAngleRef.current.phi = Math.max(0.08, Math.min(Math.PI / 2.05, cameraAngleRef.current.phi + deltaPhi));
    updateCameraPosition();
  };

  // Orbit zoom step
  const handleOrbitZoom = (inOut: 'in' | 'out') => {
    const factor = inOut === 'in' ? 0.82 : 1.22;
    cameraAngleRef.current.radius = Math.max(15, Math.min(260, cameraAngleRef.current.radius * factor));
    updateCameraPosition();
  };

  // Orbit pan via D-pad directional buttons
  const handleOrbitPan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 8;
    if (direction === 'up') panCamera(0, step);
    if (direction === 'down') panCamera(0, -step);
    if (direction === 'left') panCamera(-step, 0);
    if (direction === 'right') panCamera(step, 0);
  };

  // Walkthrough movement & turn
  const movePlayer = (forwardAmount: number, strafeAmount: number) => {
    const { yaw } = walkLookRef.current;
    walkPosRef.current.x += Math.sin(yaw) * forwardAmount;
    walkPosRef.current.z += Math.cos(yaw) * forwardAmount;

    walkPosRef.current.x += Math.cos(yaw) * strafeAmount;
    walkPosRef.current.z -= Math.sin(yaw) * strafeAmount;

    const plotW = Math.max(30, plan.plotBounds.width);
    const plotH = Math.max(30, plan.plotBounds.height);
    const boundary = Math.max(75, Math.max(plotW, plotH) * 1.6);
    walkPosRef.current.x = Math.max(-boundary, Math.min(boundary, walkPosRef.current.x));
    walkPosRef.current.z = Math.max(-boundary, Math.min(boundary, walkPosRef.current.z));

    updateWalkthroughCamera();
  };

  const turnPlayer = (yawDelta: number, pitchDelta: number = 0) => {
    walkLookRef.current.yaw += yawDelta;
    walkLookRef.current.pitch = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, walkLookRef.current.pitch + pitchDelta));
    updateWalkthroughCamera();
  };

  // Walkthrough Hotspots
  const walkHotspots = useMemo(() => {
    const plotW = Math.max(30, plan.plotBounds.width);
    const plotH = Math.max(30, plan.plotBounds.height);
    const roadZ = Math.max(34, (plotH / 2) + 16);
    const aaganZ = Math.max(16, (plotH / 2) + 3);
    const porchZ = Math.max(8, (plotH / 2) - 3);
    const gardenX = (plotW / 2) + 6;
    const backyardZ = -((plotH / 2) + 12);

    return [
      { id: 'gate', nameNepali: 'सडक र मुख्य गेट (Road Entrance)', icon: '🚗', x: 0, z: roadZ, yaw: Math.PI, pitch: 0.04, height: 5.5 },
      { id: 'courtyard', nameNepali: 'आँगन र तुलसी (Courtyard & Tulsi)', icon: '🪴', x: 8, z: aaganZ, yaw: Math.PI * 0.88, pitch: -0.04, height: 5.5 },
      { id: 'porch', nameNepali: 'मुख्य ढोका / पोर्च (Entrance Porch)', icon: '🚪', x: 0, z: porchZ, yaw: Math.PI, pitch: 0.05, height: 5.5 },
      { id: 'garden', nameNepali: 'पूर्व बगैँचा (East Garden)', icon: '🌿', x: gardenX, z: 2, yaw: -Math.PI / 2, pitch: 0.02, height: 5.5 },
      { id: 'terrace', nameNepali: 'खुला छत / कौशी (Rooftop Terrace)', icon: '🏢', x: 0, z: 2, yaw: 0, pitch: -0.06, height: 18.0 },
      { id: 'backyard', nameNepali: 'घरको पछाडि (Backyard / SW)', icon: '🌄', x: 0, z: backyardZ, yaw: 0, pitch: 0.04, height: 5.5 }
    ];
  }, [plan.plotBounds.width, plan.plotBounds.height]);

  const handleJumpToHotspot = (spot: typeof walkHotspots[0]) => {
    walkPosRef.current = { x: spot.x, z: spot.z };
    walkLookRef.current = { yaw: spot.yaw, pitch: spot.pitch };
    setEyeHeight(spot.height);
    if (controlMode !== 'walkthrough') {
      handleSwitchMode('walkthrough');
    } else {
      updateWalkthroughCamera();
    }
  };

  // Camera Preset Switcher
  const setPresetView = (view: 'road' | 'courtyard' | 'isometric' | 'top' | 'terrace') => {
    if (controlMode === 'walkthrough') {
      setControlMode('orbit');
      if (cameraRef.current) {
        cameraRef.current.fov = 45;
        cameraRef.current.near = 1.0;
        cameraRef.current.updateProjectionMatrix();
      }
    }
    cameraTargetRef.current.set(0, 7, 0);
    if (view === 'road') {
      cameraAngleRef.current = { theta: 0.05, phi: Math.PI / 2.3, radius: 95 };
    } else if (view === 'courtyard') {
      cameraAngleRef.current = { theta: -0.2, phi: Math.PI / 2.6, radius: 75 };
    } else if (view === 'isometric') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.4, radius: 110 };
    } else if (view === 'top') {
      cameraAngleRef.current = { theta: 0.001, phi: 0.08, radius: 120 };
    } else if (view === 'terrace') {
      cameraAngleRef.current = { theta: Math.PI / 3, phi: Math.PI / 4, radius: 65 };
    }
    updateCameraPosition();
  };

  // Build Scene
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Background color based on lighting mood
    if (lightingMood === 'day') {
      scene.background = new THREE.Color(0xf0f7ff); // Bright crisp sky
      scene.fog = new THREE.FogExp2(0xf0f7ff, 0.002);
    } else if (lightingMood === 'sunset') {
      scene.background = new THREE.Color(0xfde68a); // Golden dusk
      scene.fog = new THREE.FogExp2(0xfde68a, 0.003);
    } else {
      scene.background = new THREE.Color(0x090d16); // Deep night
      scene.fog = new THREE.FogExp2(0x090d16, 0.004);
    }

    // 2. Camera
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1200);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer with shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true // Required for 3D printable snapshot
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      lightingMood === 'day' ? 0xffffff : lightingMood === 'sunset' ? 0xfef08a : 0x1e293b,
      lightingMood === 'day' ? 0.85 : lightingMood === 'sunset' ? 0.65 : 0.25
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      lightingMood === 'day' ? 0xfffbeb : lightingMood === 'sunset' ? 0xf97316 : 0x60a5fa,
      lightingMood === 'day' ? 1.4 : lightingMood === 'sunset' ? 1.2 : 0.25
    );
    sunLight.position.set(60, 90, 70);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -90;
    sunLight.shadow.camera.right = 90;
    sunLight.shadow.camera.top = 90;
    sunLight.shadow.camera.bottom = -90;
    scene.add(sunLight);

    // Secondary fill light for soft architectural details
    const fillLight = new THREE.DirectionalLight(0xffffff, lightingMood === 'day' ? 0.35 : 0.15);
    fillLight.position.set(-50, 40, -40);
    scene.add(fillLight);

    // 5. Dynamic 3D Terrain (Elevation, Slopes, Contours, Survey Pins & Slope Arrow)
    const plotW = Math.max(30, plan.plotBounds.width);
    const plotH = Math.max(30, plan.plotBounds.height);
    const isNight = lightingMood === 'night';

    // Generate procedural terrain mesh with custom elevation, contours, pins and downhill vectors
    const terrainGroup = buildTerrainGroup(plotW, plotH, terrainConfig, isNight);
    scene.add(terrainGroup);

    // Building Dimensions
    const bW = plan.buildingBounds.width;
    const bH = plan.buildingBounds.height;
    // Building center coordinates within plot
    const bCenterX = -plotW / 2 + plan.buildingBounds.x + bW / 2;
    const bCenterZ = -plotH / 2 + plan.buildingBounds.y + bH / 2;

    // Calculate terrain elevations across the house footprint
    const houseFootprintCorners = [
      { x: bCenterX - bW / 2, z: bCenterZ - bH / 2 },
      { x: bCenterX + bW / 2, z: bCenterZ - bH / 2 },
      { x: bCenterX - bW / 2, z: bCenterZ + bH / 2 },
      { x: bCenterX + bW / 2, z: bCenterZ + bH / 2 },
      { x: bCenterX, z: bCenterZ }
    ];
    const houseHeights = houseFootprintCorners.map(c => getTerrainHeight(c.x, c.z, plotW, plotH, terrainConfig));
    const maxHouseElev = Math.max(...houseHeights);
    const minHouseElev = Math.min(...houseHeights);

    // House plinth stays level on top of the terrain with a masonry foundation skirt into the ground
    const bBaseY = Math.max(0, maxHouseElev);
    const foundationSkirtDepth = Math.max(2.0, (bBaseY - minHouseElev) + 3.0);

    // 6. Environment: Front Road, Compound Wall, Gate, Courtyard & Garden
    if (showEnvironment) {
      // Front Road & Sidewalk adjusted to front terrain elevation
      const roadDir = project.roads[0]?.direction || 'S';
      const roadGroup = buildRoadAndSidewalk(plotW, plotH, roadDir, isNight);
      const roadCenterZ = plotH / 2 + 12;
      const roadBaseY = getTerrainHeight(0, roadCenterZ, plotW, plotH, terrainConfig);
      roadGroup.position.y = roadBaseY;
      scene.add(roadGroup);

      // Gate location
      const gateX = plan.gate ? (-plotW / 2 + plan.gate.x + plan.gate.width / 2) : 0;
      const gateW = plan.gate?.width || 12;

      // Compound Wall & Entrance Gate with deep footing to sink cleanly into sloped terrain
      const maxCornerDiff = Math.max(
        Math.abs(terrainConfig.elevationNE),
        Math.abs(terrainConfig.elevationNW),
        Math.abs(terrainConfig.elevationSE),
        Math.abs(terrainConfig.elevationSW)
      );
      const minCornerY = Math.min(terrainConfig.elevationNE, terrainConfig.elevationNW, terrainConfig.elevationSE, terrainConfig.elevationSW);
      const wallFooting = Math.max(5.0, maxCornerDiff * 1.5 + 3.0);
      const wallGroup = buildCompoundWallAndGate(plotW, plotH, gateX, gateW, isNight, Math.min(0, minCornerY), wallFooting);
      scene.add(wallGroup);

      // Front Courtyard (आँगन / Aagan) with Interlocking Paving Stones adjusted to local ground
      const aaganDepth = Math.max(12, (plotH / 2) - (bCenterZ + bH / 2));
      const aaganCenterZ = plotH / 2 - aaganDepth / 2;
      const aaganY = getTerrainHeight(0, aaganCenterZ, plotW, plotH, terrainConfig) + 0.12;
      const aaganGeo = new THREE.PlaneGeometry(plotW - 2, aaganDepth);
      const paverTex = createPaverTexture();
      const aaganMat = new THREE.MeshStandardMaterial({
        map: paverTex,
        roughness: 0.65
      });
      const aagan = new THREE.Mesh(aaganGeo, aaganMat);
      aagan.rotation.x = -Math.PI / 2;
      aagan.position.set(0, aaganY, aaganCenterZ);
      aagan.receiveShadow = true;
      scene.add(aagan);

      // Sacred Tulsi Math in North-East (ईशान कोण) or front-left of Aagan
      const tulsiX = plotW / 2 - 6;
      const tulsiZ = plotH / 2 - aaganDepth + 4;
      const tulsiY = getTerrainHeight(tulsiX, tulsiZ, plotW, plotH, terrainConfig);
      const tulsiMath = buildTulsiMath(tulsiX, tulsiZ, tulsiY);
      scene.add(tulsiMath);

      // Parked Modern Sedan Car in Driveway/Porch placed on terrain
      const carX = Math.max(-plotW / 2 + 8, Math.min(plotW / 2 - 8, gateX - 4));
      const carZ = plotH / 2 - 10;
      const carY = getTerrainHeight(carX, carZ, plotW, plotH, terrainConfig) + 0.05;
      const car = buildParkedCar(carX, carZ, 0.05, carY);
      scene.add(car);

      // Garden & Landscaping Trees (बगैँचाका रुखहरू) on terrain height
      const treeConfigs = [
        // Left side yard
        { type: 'conical' as const, x: -plotW / 2 + 4, z: -plotH / 4, scale: 1.2 },
        { type: 'round' as const, x: -plotW / 2 + 5, z: plotH / 6, scale: 1.1 },
        { type: 'conical' as const, x: -plotW / 2 + 4, z: plotH / 2 - 6, scale: 1.0 },
        // Right side yard
        { type: 'round' as const, x: plotW / 2 - 5, z: -plotH / 4, scale: 1.3 },
        { type: 'conical' as const, x: plotW / 2 - 4, z: plotH / 6, scale: 1.0 },
        // Back yard
        { type: 'round' as const, x: -plotW / 4, z: -plotH / 2 + 4, scale: 1.2 },
        { type: 'conical' as const, x: plotW / 4, z: -plotH / 2 + 4, scale: 1.1 }
      ];

      treeConfigs.forEach(tc => {
        const treeY = getTerrainHeight(tc.x, tc.z, plotW, plotH, terrainConfig);
        const tree = buildTree(tc.type, tc.x, tc.z, tc.scale, treeY);
        scene.add(tree);
      });

      // Flower Beds with Marigolds & Roses on terrain height
      const bed1Z = plotH / 2 - aaganDepth - 1;
      const bed1Y = getTerrainHeight(plotW / 4, bed1Z, plotW, plotH, terrainConfig);
      const bed1 = buildFlowerBed(plotW / 4, bed1Z, 14, 3, bed1Y);
      scene.add(bed1);

      const bed2Y = getTerrainHeight(-plotW / 4, bed1Z, plotW, plotH, terrainConfig);
      const bed2 = buildFlowerBed(-plotW / 4, bed1Z, 14, 3, bed2Y);
      scene.add(bed2);

      // Garden Park Bench on terrain height
      const benchX = -plotW / 2 + 8;
      const benchZ = plotH / 6;
      const benchY = getTerrainHeight(benchX, benchZ, plotW, plotH, terrainConfig);
      const bench = buildGardenBench(benchX, benchZ, Math.PI / 2, benchY);
      scene.add(bench);
    }

    // 7. House Architectural Structure
    const houseGroup = new THREE.Group();
    houseGroup.position.set(bCenterX, bBaseY, bCenterZ);
    scene.add(houseGroup);

    const floorHeight = 10.5; // 10.5 ft per floor
    const totalFloors = plan.floors.length || 1;

    // Raised Plinth Foundation (घरको जग र पेटी) with retaining foundation skirt
    const plinthH = 1.2;
    const plinthGeo = new THREE.BoxGeometry(bW + 2, plinthH + foundationSkirtDepth, bH + 2);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x57534e, // Slate stone cladding base
      roughness: 0.9
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = plinthH / 2 - foundationSkirtDepth / 2;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    houseGroup.add(plinth);

    // Front Entrance Porch with Stairs & Pillars
    const porchW = Math.min(14, bW * 0.4);
    const porchGroup = buildFrontEntrancePorch(porchW, floorHeight, isNight);
    porchGroup.position.set(0, 0, bH / 2);
    houseGroup.add(porchGroup);

    // Exterior Wall Material with Texture (Stucco or Nepali Red Brick)
    const selectedExtOpt = EXTERIOR_WALL_OPTIONS.find(o => o.id === exteriorWallOption) || EXTERIOR_WALL_OPTIONS[0];
    let extWallMat: THREE.Material;
    if (selectedExtOpt.isBrick) {
      const brickTex = createBrickWallTexture(selectedExtOpt.colorHex);
      extWallMat = new THREE.MeshStandardMaterial({
        map: brickTex,
        roughness: 0.75,
        metalness: 0.05
      });
    } else {
      const stuccoTex = createStuccoWallTexture(selectedExtOpt.colorHex);
      extWallMat = new THREE.MeshStandardMaterial({
        map: stuccoTex,
        color: selectedExtOpt.colorHex,
        roughness: 0.7,
        metalness: 0.05
      });
    }
    const accentBandMat = new THREE.MeshStandardMaterial({
      color: 0x7a1c1c, // Terracotta accent trim
      roughness: 0.5
    });

    // Interior Floor Tile Texture
    let floorTileTex: THREE.CanvasTexture | null = null;
    if (interiorFloorType === 'marble') {
      floorTileTex = createMarbleFloorTexture();
    } else if (interiorFloorType === 'wood') {
      floorTileTex = createWoodParquetTexture();
    } else if (interiorFloorType === 'terracotta') {
      floorTileTex = createTerracottaTileTexture();
    }

    // Construct Floors
    plan.floors.forEach((fl, fIdx) => {
      const floorBaseY = plinthH + fIdx * floorHeight;

      // Floor Slab
      const slabGeo = new THREE.BoxGeometry(bW + 1.2, 0.7, bH + 1.2);
      const slabMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = floorBaseY;
      slab.castShadow = true;
      slab.receiveShadow = true;
      houseGroup.add(slab);

      // Floor Exterior Cornice Accent Band
      const bandGeo = new THREE.BoxGeometry(bW + 1.5, 0.4, bH + 1.5);
      const band = new THREE.Mesh(bandGeo, accentBandMat);
      band.position.y = floorBaseY + floorHeight - 0.2;
      houseGroup.add(band);

      // Always Build Interior Rooms (for Walk-in Exploration and Cutaway Mode)
      const pWallH = roofStyle === 'cutaway' ? 3.6 : floorHeight;
      const wThick = 0.5;

      fl.rooms.forEach(room => {
        const rx = room.x - bW / 2 + room.width / 2;
        const rz = room.y - bH / 2 + room.height / 2;

        // 1. Room Floor Tile with Texture
        const rfGeo = new THREE.BoxGeometry(room.width - 0.2, 0.12, room.height - 0.2);
        let rfMat: THREE.Material;
        if (floorTileTex) {
          rfMat = new THREE.MeshStandardMaterial({
            map: floorTileTex,
            roughness: interiorFloorType === 'marble' ? 0.3 : 0.6,
            metalness: interiorFloorType === 'marble' ? 0.08 : 0.02
          });
        } else {
          // Granite
          rfMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            roughness: 0.25,
            metalness: 0.25
          });
        }
        const rf = new THREE.Mesh(rfGeo, rfMat);
        rf.position.set(rx, floorBaseY + 0.4, rz);
        rf.receiveShadow = true;
        houseGroup.add(rf);

        // 2. Room Partition Wall Material
        let rColorHex = 0xffffff;
        if (interiorWallColor === 'vastu') {
          rColorHex = getVastuRoomWallColor(room);
        } else {
          rColorHex = parseInt(interiorWallColor.replace('#', '0x')) || 0xffffff;
        }
        const pWallMat = new THREE.MeshStandardMaterial({
          color: rColorHex,
          roughness: 0.7
        });

        // South wall
        const swGeo = new THREE.BoxGeometry(room.width, pWallH, wThick);
        const sw = new THREE.Mesh(swGeo, pWallMat);
        sw.position.set(rx, floorBaseY + pWallH / 2, rz + room.height / 2 - wThick / 2);
        houseGroup.add(sw);

        // North wall
        const nw = new THREE.Mesh(swGeo, pWallMat);
        nw.position.set(rx, floorBaseY + pWallH / 2, rz - room.height / 2 + wThick / 2);
        houseGroup.add(nw);

        // West wall
        const ewGeo = new THREE.BoxGeometry(wThick, pWallH, room.height);
        const ww = new THREE.Mesh(ewGeo, pWallMat);
        ww.position.set(rx - room.width / 2 + wThick / 2, floorBaseY + pWallH / 2, rz);
        houseGroup.add(ww);

        // East wall
        const ew = new THREE.Mesh(ewGeo, pWallMat);
        ew.position.set(rx + room.width / 2 - wThick / 2, floorBaseY + pWallH / 2, rz);
        houseGroup.add(ew);

        // 3. Interior Ceiling Light Fixture & Warm Illumination
        const lightH = floorBaseY + (roofStyle === 'cutaway' ? pWallH - 0.2 : floorHeight - 0.25);
        const lightFixture = buildCeilingLightFixture(interiorLightsOn);
        lightFixture.position.set(rx, lightH, rz);
        houseGroup.add(lightFixture);

        if (interiorLightsOn) {
          const rPointLight = new THREE.PointLight(0xffedd5, 0.95, 24);
          rPointLight.position.set(rx, lightH - 0.35, rz);
          rPointLight.castShadow = false;
          houseGroup.add(rPointLight);
        }

        // 4. Interior Furniture & Appliances
        if (showAppliances) {
          const matchedPlannedRoom = project.rooms?.find(
            pr => pr.nameNepali === room.nameNepali || pr.category === room.category
          );
          const appliancesToRender = matchedPlannedRoom?.appliances && matchedPlannedRoom.appliances.length > 0
            ? matchedPlannedRoom.appliances
            : (room.category === 'living' ? ['sofa', 'tv_unit']
              : room.category === 'master_bedroom' ? ['bed', 'wardrobe']
              : room.category === 'bedroom' ? ['bed']
              : room.category === 'kitchen' ? ['stove', 'fridge']
              : room.category === 'pooja' ? ['mandir']
              : room.category === 'dining' ? ['dining_table']
              : room.category === 'garage' ? ['washing_machine']
              : []);

          appliancesToRender.forEach((appId, appIdx) => {
            const appMesh = buildInteriorAppliance(appId);
            const offX = appIdx === 0 ? 0 : (appIdx % 2 === 1 ? -1.8 : 1.8);
            const offZ = appIdx > 1 ? 1.4 : 0;
            appMesh.position.set(rx + offX, floorBaseY + 0.4, rz + offZ);
            houseGroup.add(appMesh);
          });
        }
      });

      // Complete House Exterior Walls (when not in cutaway mode)
      if (roofStyle !== 'cutaway') {
        const extWallH = floorHeight;
        const extThick = 0.9;

        // North exterior wall (Back)
        const nWallGeo = new THREE.BoxGeometry(bW, extWallH, extThick);
        const nWall = new THREE.Mesh(nWallGeo, extWallMat);
        nWall.position.set(0, floorBaseY + extWallH / 2, -bH / 2 + extThick / 2);
        nWall.castShadow = true;
        houseGroup.add(nWall);

        // West exterior wall (Left)
        const wWallGeo = new THREE.BoxGeometry(extThick, extWallH, bH);
        const wWall = new THREE.Mesh(wWallGeo, extWallMat);
        wWall.position.set(-bW / 2 + extThick / 2, floorBaseY + extWallH / 2, 0);
        wWall.castShadow = true;
        houseGroup.add(wWall);

        // East exterior wall (Right)
        const eWall = new THREE.Mesh(wWallGeo, extWallMat);
        eWall.position.set(bW / 2 - extThick / 2, floorBaseY + extWallH / 2, 0);
        eWall.castShadow = true;
        houseGroup.add(eWall);

        // South exterior wall (Front Facade with Realistic Door Openings)
        if (fIdx === 0) {
          // Ground Floor Front: Main Entrance Door opening + realistic paneled wooden door
          const doorOpeningW = 5.2;
          const doorOpeningH = 7.5;
          const sideWallW = (bW - doorOpeningW) / 2;

          // Left front wall
          const leftFrontGeo = new THREE.BoxGeometry(sideWallW, extWallH, extThick);
          const leftFrontWall = new THREE.Mesh(leftFrontGeo, extWallMat);
          leftFrontWall.position.set(-bW / 2 + sideWallW / 2, floorBaseY + extWallH / 2, bH / 2 - extThick / 2);
          leftFrontWall.castShadow = true;
          houseGroup.add(leftFrontWall);

          // Right front wall
          const rightFrontWall = new THREE.Mesh(leftFrontGeo, extWallMat);
          rightFrontWall.position.set(bW / 2 - sideWallW / 2, floorBaseY + extWallH / 2, bH / 2 - extThick / 2);
          rightFrontWall.castShadow = true;
          houseGroup.add(rightFrontWall);

          // Transom wall above main entrance door
          const transomH = extWallH - doorOpeningH;
          if (transomH > 0) {
            const transomGeo = new THREE.BoxGeometry(doorOpeningW, transomH, extThick);
            const transomWall = new THREE.Mesh(transomGeo, extWallMat);
            transomWall.position.set(0, floorBaseY + doorOpeningH + transomH / 2, bH / 2 - extThick / 2);
            transomWall.castShadow = true;
            houseGroup.add(transomWall);
          }

          // Realistic 3D Paneled Front Door with brass handles & architrave
          const frontDoor = buildRealisticDoor(doorOpeningW, doorOpeningH, extThick, 0x451a03);
          frontDoor.position.set(0, floorBaseY + doorOpeningH / 2, bH / 2 - extThick / 2);
          houseGroup.add(frontDoor);

        } else {
          // Upper Floor Front: Balcony Entrance Door + realistic Bardali
          const balDoorW = 4.2;
          const balDoorH = 7.2;
          const sideWallW = (bW - balDoorW) / 2;

          // Left front wall
          const leftFrontGeo = new THREE.BoxGeometry(sideWallW, extWallH, extThick);
          const leftFrontWall = new THREE.Mesh(leftFrontGeo, extWallMat);
          leftFrontWall.position.set(-bW / 2 + sideWallW / 2, floorBaseY + extWallH / 2, bH / 2 - extThick / 2);
          leftFrontWall.castShadow = true;
          houseGroup.add(leftFrontWall);

          // Right front wall
          const rightFrontWall = new THREE.Mesh(leftFrontGeo, extWallMat);
          rightFrontWall.position.set(bW / 2 - sideWallW / 2, floorBaseY + extWallH / 2, bH / 2 - extThick / 2);
          rightFrontWall.castShadow = true;
          houseGroup.add(rightFrontWall);

          // Transom wall above balcony door
          const transomH = extWallH - balDoorH;
          if (transomH > 0) {
            const transomGeo = new THREE.BoxGeometry(balDoorW, transomH, extThick);
            const transomWall = new THREE.Mesh(transomGeo, extWallMat);
            transomWall.position.set(0, floorBaseY + balDoorH + transomH / 2, bH / 2 - extThick / 2);
            transomWall.castShadow = true;
            houseGroup.add(transomWall);
          }

          // Balcony Door
          const balDoor = buildRealisticDoor(balDoorW, balDoorH, extThick, 0x451a03);
          balDoor.position.set(0, floorBaseY + balDoorH / 2, bH / 2 - extThick / 2);
          houseGroup.add(balDoor);

          // Upper Floor Realistic Bardali (Balcony) with customizable styles & colors
          const balW = Math.min(bW * 0.55, 20);
          const bardaliGroup = buildRealisticBardali(balW, 3.8, 3.2, bardaliStyle, bardaliColor);
          bardaliGroup.position.set(0, floorBaseY, bH / 2);
          houseGroup.add(bardaliGroup);
        }

        // Realistic Exterior Windows with Chhajja (Sunshades)
        const winW = 4.2;
        const winH = 4.5;
        const winY = floorBaseY + 5.2;

        // Front Windows (South)
        [-bW / 3, bW / 3].forEach(wx => {
          const frontWin = buildExteriorWindow(winW, winH, extThick);
          frontWin.position.set(wx, winY, bH / 2);
          houseGroup.add(frontWin);
        });

        // Left Windows (West)
        [-bH / 4, bH / 4].forEach(wz => {
          const westWin = buildExteriorWindow(winW, winH, extThick);
          westWin.rotation.y = Math.PI / 2;
          westWin.position.set(-bW / 2, winY, wz);
          houseGroup.add(westWin);
        });

        // Right Windows (East)
        [-bH / 4, bH / 4].forEach(wz => {
          const eastWin = buildExteriorWindow(winW, winH, extThick);
          eastWin.rotation.y = -Math.PI / 2;
          eastWin.position.set(bW / 2, winY, wz);
          houseGroup.add(eastWin);
        });
      }
    });

    // 8. Roof Options
    const roofBaseY = plinthH + totalFloors * floorHeight;

    if (
      roofStyle === 'pitched_tile' ||
      roofStyle === 'pitched_slate' ||
      roofStyle === 'pitched_copper' ||
      roofStyle === 'pitched_green'
    ) {
      let roofMat: THREE.Material;
      if (roofStyle === 'pitched_tile') {
        const roofTex = createTileRoofTexture();
        roofMat = new THREE.MeshStandardMaterial({
          map: roofTex,
          roughness: 0.5,
          color: 0x991b1b
        });
      } else if (roofStyle === 'pitched_slate') {
        const slateTex = createSlateRoofTexture(0x1e293b);
        roofMat = new THREE.MeshStandardMaterial({
          map: slateTex,
          roughness: 0.45,
          color: 0x1e293b
        });
      } else if (roofStyle === 'pitched_copper') {
        roofMat = new THREE.MeshStandardMaterial({
          color: 0xb45309,
          metalness: 0.85,
          roughness: 0.25
        });
      } else {
        // pitched_green
        const tileTex = createTileRoofTexture();
        roofMat = new THREE.MeshStandardMaterial({
          map: tileTex,
          roughness: 0.55,
          color: 0x15803d
        });
      }

      const pitchH = 7.5;
      const eaves = 2.5; // Eaves overhang
      const rW = bW + eaves * 2;
      const rH = bH + eaves * 2;

      // Hip Roof 4-sided Pyramid Geometry
      const roofGeo = new THREE.ConeGeometry(Math.max(rW, rH) * 0.72, pitchH, 4);
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.set(0, roofBaseY + pitchH / 2, 0);
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.scale.set(rW / Math.max(rW, rH), 1, rH / Math.max(rW, rH));
      roofMesh.castShadow = true;
      houseGroup.add(roofMesh);

      // White Fascia Board around roof perimeter
      const fasciaGeo = new THREE.BoxGeometry(rW, 0.6, rH);
      const fasciaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const fascia = new THREE.Mesh(fasciaGeo, fasciaMat);
      fascia.position.set(0, roofBaseY + 0.3, 0);
      houseGroup.add(fascia);

      // Gold Kalash Pinnacle on Roof Peak (छानोको शिखर कलश / Gajur)
      const gajurGeo = new THREE.CylinderGeometry(0.1, 0.5, 2.0, 8);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
      const gajur = new THREE.Mesh(gajurGeo, goldMat);
      gajur.position.set(0, roofBaseY + pitchH + 1.0, 0);
      houseGroup.add(gajur);

    } else if (roofStyle === 'flat_terrace') {
      // Modern RCC Flat Terrace with Parapet, Stair Mumty & Water Tank
      // Roof slab
      const terraceSlabGeo = new THREE.BoxGeometry(bW + 2, 0.8, bH + 2);
      const terraceSlabMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.6 });
      const terrace = new THREE.Mesh(terraceSlabGeo, terraceSlabMat);
      terrace.position.y = roofBaseY + 0.4;
      terrace.castShadow = true;
      houseGroup.add(terrace);

      // Parapet Wall (कौशीको सुरक्षा पर्खाल)
      const parapetH = 3.2;
      const parapetThick = 0.6;
      const parapetMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
      const copingMat = new THREE.MeshStandardMaterial({ color: 0x7a1c1c });

      // North & South parapets
      [-1, 1].forEach(side => {
        const pGeo = new THREE.BoxGeometry(bW + 2, parapetH, parapetThick);
        const pMesh = new THREE.Mesh(pGeo, parapetMat);
        pMesh.position.set(0, roofBaseY + 0.8 + parapetH / 2, side * (bH / 2 + 1 - parapetThick / 2));
        houseGroup.add(pMesh);

        const cGeo = new THREE.BoxGeometry(bW + 2.4, 0.3, parapetThick + 0.3);
        const cMesh = new THREE.Mesh(cGeo, copingMat);
        cMesh.position.set(0, roofBaseY + 0.8 + parapetH + 0.15, side * (bH / 2 + 1 - parapetThick / 2));
        houseGroup.add(cMesh);
      });

      // West & East parapets
      [-1, 1].forEach(side => {
        const pGeo = new THREE.BoxGeometry(parapetThick, parapetH, bH + 2);
        const pMesh = new THREE.Mesh(pGeo, parapetMat);
        pMesh.position.set(side * (bW / 2 + 1 - parapetThick / 2), roofBaseY + 0.8 + parapetH / 2, 0);
        houseGroup.add(pMesh);

        const cGeo = new THREE.BoxGeometry(parapetThick + 0.3, 0.3, bH + 2.4);
        const cMesh = new THREE.Mesh(cGeo, copingMat);
        cMesh.position.set(side * (bW / 2 + 1 - parapetThick / 2), roofBaseY + 0.8 + parapetH + 0.15, 0);
        houseGroup.add(cMesh);
      });

      // Staircase Headroom (मुम्टी कोठा / Mumty Room)
      const mumtyW = 8;
      const mumtyH = 7.5;
      const mumtyD = 10;
      const mumtyGeo = new THREE.BoxGeometry(mumtyW, mumtyH, mumtyD);
      const mumty = new THREE.Mesh(mumtyGeo, extWallMat);
      mumty.position.set(-bW / 4, roofBaseY + 0.8 + mumtyH / 2, -bH / 4);
      mumty.castShadow = true;
      houseGroup.add(mumty);

      // Mumty Door
      const mDoorGeo = new THREE.BoxGeometry(2.8, 6.0, 0.2);
      const mDoorMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
      const mDoor = new THREE.Mesh(mDoorGeo, mDoorMat);
      mDoor.position.set(-bW / 4, roofBaseY + 0.8 + 3.0, -bH / 4 + mumtyD / 2 + 0.1);
      houseGroup.add(mDoor);

      // Rooftop Overhead Sintex Water Tank in Vastu-approved South-West (नैरृत्य)
      const tankX = -bW / 3;
      const tankZ = bH / 3;
      const tank = buildRooftopWaterTank(tankX, roofBaseY + 0.8, tankZ);
      houseGroup.add(tank);

      // Solar Water Heater collector on roof facing south
      const solarX = bW / 4;
      const solarZ = 0;
      const solar = buildSolarWaterHeater(solarX, roofBaseY + 0.8, solarZ);
      houseGroup.add(solar);
    }

    // 8b. Nepal Surrounding Landscape (Pahad / Terai / City / Village)
    if (showEnvironment) {
      const nepalLandscape = buildNepalLandscape(environmentType, plotW, plotH, isNight);
      scene.add(nepalLandscape);
    }

    // 9. Animation Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(mount);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, [
    plan,
    project,
    roofStyle,
    lightingMood,
    showEnvironment,
    terrainConfig,
    environmentType,
    interiorLightsOn,
    showAppliances,
    exteriorWallOption,
    bardaliStyle,
    bardaliColor,
    interiorWallColor,
    interiorFloorType
  ]);

  // Keyboard control in Walkthrough Mode (WASD & Arrow Keys)
  useEffect(() => {
    if (controlMode !== 'walkthrough') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const step = walkSpeed === 'fast' ? 3.6 : 1.8;
      const turnStep = 0.08;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          e.preventDefault();
          movePlayer(step, 0);
          break;
        case 'KeyS':
        case 'ArrowDown':
          e.preventDefault();
          movePlayer(-step, 0);
          break;
        case 'KeyA':
          e.preventDefault();
          movePlayer(0, -step);
          break;
        case 'KeyD':
          e.preventDefault();
          movePlayer(0, step);
          break;
        case 'KeyQ':
        case 'ArrowLeft':
          e.preventDefault();
          turnPlayer(turnStep, 0);
          break;
        case 'KeyE':
        case 'ArrowRight':
          e.preventDefault();
          turnPlayer(-turnStep, 0);
          break;
        case 'Escape':
          handleSwitchMode('orbit');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [controlMode, walkSpeed, eyeHeight]);

  // Mouse & Touch Controls with Orbit (Rotate, Pan, Zoom) and Walkthrough (Look, Move)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (controlMode === 'walkthrough') {
      dragActionRef.current = 'walk_look';
    } else {
      // Right click (2), Middle click (1), or Shift + Left click -> Pan
      if (e.button === 2 || e.button === 1 || e.shiftKey) {
        dragActionRef.current = 'pan';
      } else {
        dragActionRef.current = 'rotate';
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    if (controlMode === 'walkthrough') {
      // In Walkthrough: mouse movement turns player yaw & pitch smoothly
      turnPlayer(deltaX * 0.005, deltaY * 0.005);
    } else {
      if (dragActionRef.current === 'pan') {
        panCamera(deltaX, deltaY);
      } else {
        cameraAngleRef.current.theta += deltaX * 0.009;
        cameraAngleRef.current.phi = Math.max(0.08, Math.min(Math.PI / 2.05, cameraAngleRef.current.phi - deltaY * 0.009));
        updateCameraPosition();
      }
    }

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    dragActionRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (controlMode === 'walkthrough') {
      const step = (walkSpeed === 'fast' ? 3.0 : 1.5) * (e.deltaY < 0 ? 1 : -1);
      movePlayer(step, 0);
    } else {
      const factor = Math.max(0.35, cameraAngleRef.current.radius / 90);
      cameraAngleRef.current.radius = Math.max(15, Math.min(260, cameraAngleRef.current.radius + e.deltaY * 0.08 * factor));
      updateCameraPosition();
    }
  };

  // Touch handlers for mobile (Single-finger rotate/look, Two-finger pinch-zoom & pan)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      prevTouchDistRef.current = null;
      prevTouchMidRef.current = null;
    } else if (e.touches.length === 2 && controlMode === 'orbit') {
      isDraggingRef.current = true;
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      prevTouchDistRef.current = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      prevTouchMidRef.current = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
      const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;

      if (controlMode === 'walkthrough') {
        turnPlayer(deltaX * 0.007, deltaY * 0.007);
      } else {
        cameraAngleRef.current.theta += deltaX * 0.012;
        cameraAngleRef.current.phi = Math.max(0.08, Math.min(Math.PI / 2.05, cameraAngleRef.current.phi - deltaY * 0.012));
        updateCameraPosition();
      }

      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && controlMode === 'orbit') {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const curDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const curMid = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2
      };

      // Pinch to Zoom
      if (prevTouchDistRef.current !== null) {
        const distDelta = curDist - prevTouchDistRef.current;
        cameraAngleRef.current.radius = Math.max(15, Math.min(260, cameraAngleRef.current.radius - distDelta * 0.25));
      }

      // Two-Finger Pan
      if (prevTouchMidRef.current !== null) {
        const panDeltaX = curMid.x - prevTouchMidRef.current.x;
        const panDeltaY = curMid.y - prevTouchMidRef.current.y;
        panCamera(panDeltaX, panDeltaY);
      } else {
        updateCameraPosition();
      }

      prevTouchDistRef.current = curDist;
      prevTouchMidRef.current = curMid;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    dragActionRef.current = null;
    prevTouchDistRef.current = null;
    prevTouchMidRef.current = null;
  };

  // Terrain slope preset applicator
  const handleApplyPreset = (preset: TerrainSlopePreset) => {
    setTerrainConfig(prev => ({
      ...prev,
      mode: preset.id,
      elevationNE: preset.elevationNE,
      elevationNW: preset.elevationNW,
      elevationSE: preset.elevationSE,
      elevationSW: preset.elevationSW,
      roughness: preset.roughness
    }));
  };

  // Terrain corner elevation adjuster
  const handleUpdateCornerElevation = (corner: 'NE' | 'NW' | 'SE' | 'SW', value: number) => {
    setTerrainConfig(prev => ({
      ...prev,
      mode: 'custom',
      [`elevation${corner}`]: Math.round(value * 10) / 10
    }));
  };

  // Reset to flat land
  const handleResetFlat = () => {
    setTerrainConfig(prev => ({
      ...prev,
      mode: 'samatala_flat',
      elevationNE: 0,
      elevationNW: 0,
      elevationSE: 0,
      elevationSW: 0,
      roughness: 0
    }));
  };

  // High-Resolution Snapshot Capture Function (supports FHD, 2K, 4K)
  const handleCaptureSnapshot = (targetWidth?: number, targetHeight?: number): string | null => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (!targetWidth || !targetHeight) {
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png', 1.0);
    }

    // Preserve previous render configuration
    const originalSize = new THREE.Vector2();
    renderer.getSize(originalSize);
    const originalPixelRatio = renderer.getPixelRatio();
    const originalAspect = camera.aspect;

    try {
      renderer.setPixelRatio(1);
      renderer.setSize(targetWidth, targetHeight, false);
      camera.aspect = targetWidth / targetHeight;
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png', 1.0);
    } catch (e) {
      console.error('Failed to capture high-res snapshot:', e);
      return renderer.domElement.toDataURL('image/png', 1.0);
    } finally {
      renderer.setPixelRatio(originalPixelRatio);
      renderer.setSize(originalSize.x, originalSize.y, false);
      camera.aspect = originalAspect;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }
  };

  // Quick 1-Click Snapshot Download (FHD PNG)
  const handleQuickDownloadSnapshot = () => {
    const dataUrl = handleCaptureSnapshot(1920, 1080);
    if (!dataUrl) return;
    const link = document.createElement('a');
    const cleanName = project.name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\u0900-\u097F]/g, '') || 'Vastu_House';
    link.download = `${cleanName}_3D_FHD.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div ref={containerRef} className={`space-y-3 ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-stone-950 overflow-auto' : ''}`}>
      {/* 3D Top Control Bar */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Roof Style & Floor Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Floor Count Selector */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-xl border border-stone-200 dark:border-stone-700">
            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">तला:</span>
            {[1, 2, 3, 4, 5].map(cnt => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleSetFloorCount(cnt)}
                className={`w-6 h-6 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                  (project.floorCount || 1) === cnt
                    ? 'bg-[#7A1C1C] text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
                title={`${cnt} तलाको घर बनाउने (Set ${cnt} Floors)`}
              >
                {cnt}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-amber-600" />
            छत:
          </span>
          <button
            type="button"
            onClick={() => setRoofStyle('pitched_tile')}
            className={`px-3 py-1 text-xs font-bold rounded-xl border transition cursor-pointer ${
              roofStyle === 'pitched_tile'
                ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
            }`}
          >
            🏠 रातो टायलको छानो (Tile Roof)
          </button>
          <button
            type="button"
            onClick={() => setRoofStyle('flat_terrace')}
            className={`px-3 py-1 text-xs font-bold rounded-xl border transition cursor-pointer ${
              roofStyle === 'flat_terrace'
                ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
            }`}
          >
            🏢 आरसीसी कौशी (Terrace & Water Tank)
          </button>
          <button
            type="button"
            onClick={() => setRoofStyle('cutaway')}
            className={`px-3 py-1 text-xs font-bold rounded-xl border transition cursor-pointer ${
              roofStyle === 'cutaway'
                ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
            }`}
          >
            📐 भित्री कोठा खुला (Cutaway)
          </button>
        </div>

        {/* Lighting & Environment Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Terrain & Slope Tools Toggle Button */}
          <button
            type="button"
            onClick={() => setIsTerrainToolsOpen(!isTerrainToolsOpen)}
            className={`px-3 py-1 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              isTerrainToolsOpen
                ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
            }`}
            title="जमिनको सतह, उँचाइ र ढलान सिमुलेशन"
          >
            <Mountain className="w-3.5 h-3.5 text-amber-600" />
            <span>धरातल / ढलान</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              terrainAnalysis.score >= 80 ? 'bg-emerald-600 text-white' : terrainAnalysis.score >= 50 ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {terrainAnalysis.score}%
            </span>
            {isTerrainToolsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Nepal Landscape Environment Selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 rounded-xl px-2.5 py-1 border border-stone-200 dark:border-stone-700">
            <span className="text-[11px] font-bold text-stone-500">परिवेश:</span>
            <select
              value={environmentType}
              onChange={(e) => setEnvironmentType(e.target.value as NepalEnvironmentType)}
              className="text-xs font-bold bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
              title="नेपालको भौगोलिक परिवेश छान्नुहोस्"
            >
              <option value="city">🏙️ सहरी परिवेश (City)</option>
              <option value="pahad">🏔️ पहाड/हिमाल (Hills)</option>
              <option value="terai">🌾 तराई फाँट (Terai)</option>
              <option value="village">🏡 गाउँले परिवेश (Village)</option>
            </select>
          </div>

          {/* Interior Cutaway vs Exterior View Toggle */}
          <button
            type="button"
            onClick={() => setRoofStyle(roofStyle === 'cutaway' ? 'pitched_tile' : 'cutaway')}
            className={`px-3 py-1 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              roofStyle === 'cutaway'
                ? 'bg-purple-800 text-white border-purple-900 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-200'
            }`}
            title="घर भित्रको ३D दृश्य हेर्नुहोस् (Interior View)"
          >
            <Home className="w-3.5 h-3.5 text-purple-400" />
            <span>{roofStyle === 'cutaway' ? 'भित्री दृश्य सक्रिय (Interior ON)' : 'भित्री दृश्य (Interior)'}</span>
          </button>

          {/* Interior Lights Toggle */}
          {roofStyle === 'cutaway' && (
            <button
              type="button"
              onClick={() => setInteriorLightsOn(!interiorLightsOn)}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                interiorLightsOn
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 border-stone-300'
              }`}
              title="कोठाको बत्ती बाल्ने वा निभाउने"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{interiorLightsOn ? '💡 बत्ती बालिएको (Lights ON)' : '🌑 बत्ती निभाइएको (Lights OFF)'}</span>
            </button>
          )}

          {/* Interior Appliances Toggle */}
          {roofStyle === 'cutaway' && (
            <button
              type="button"
              onClick={() => setShowAppliances(!showAppliances)}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                showAppliances
                  ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 border-stone-300'
              }`}
              title="घरायसी सामग्री (सोफा, बेड, आदि) राख्ने वा हटाउने"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showAppliances ? '🛋️ सामान देखाइएको' : '🛋️ सामान लुकाइएको'}</span>
            </button>
          )}

          {/* Environment toggle */}
          <button
            type="button"
            onClick={() => setShowEnvironment(!showEnvironment)}
            className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              showEnvironment
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
            }`}
            title="आँगन, बगैँचा र बाटो देखाउने वा लुकाउने"
          >
            <TreePine className="w-3.5 h-3.5 text-emerald-600" />
            <span>{showEnvironment ? 'आँगन/बगैँचा सक्रिय' : 'घर मात्र'}</span>
          </button>

          {/* Lighting Mode Selector */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-0.5 border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setLightingMood('day')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                lightingMood === 'day' ? 'bg-white dark:bg-stone-700 text-amber-600 shadow-xs' : 'text-stone-500'
              }`}
              title="उज्यालो दिन (Day)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLightingMood('sunset')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                lightingMood === 'sunset' ? 'bg-white dark:bg-stone-700 text-amber-600 shadow-xs' : 'text-stone-500'
              }`}
              title="सुनौलो साँझ (Sunset)"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLightingMood('night')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                lightingMood === 'night' ? 'bg-white dark:bg-stone-700 text-indigo-400 shadow-xs' : 'text-stone-500'
              }`}
              title="रातको बत्ती (Night Lights)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3D Navigation Mode: Orbit (परिक्रमा) vs Walkthrough (पदयात्रा) */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-0.5 border border-stone-300 dark:border-stone-700 shadow-xs">
            <button
              type="button"
              onClick={() => handleSwitchMode('orbit')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                controlMode === 'orbit'
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="घरको वरिपरि ३६०° परिक्रमा (Orbit), प्यान र जुम गर्ने मोड"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>परिक्रमा (Orbit)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('walkthrough')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                controlMode === 'walkthrough'
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="मानव आँखाको उचाइबाट घर, बाटो र आँगनमा हिँड्ने मोड (Walkthrough)"
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>पदयात्रा (Walkthrough)</span>
            </button>
          </div>

          {/* Quick Snapshot button */}
          <button
            type="button"
            onClick={handleQuickDownloadSnapshot}
            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
            title="हालको ३D दृश्य द्रुत HD तस्बिर (PNG) डाउनलोड गर्नुहोस्"
          >
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">द्रुत HD तस्बिर</span>
          </button>

          {/* Primary Export & PDF Report button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-1 bg-gradient-to-r from-[#7A1C1C] to-amber-900 hover:from-[#601616] hover:to-amber-950 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
            title="३D तस्बिर वा प्रिन्टयोग्य PDF प्रतिवेदन निर्यात गर्नुहोस्"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>📥 निर्यात / PDF रिपोर्ट</span>
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={() => setPresetView('isometric')}
            className="p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 cursor-pointer text-stone-700 dark:text-stone-300 hover:bg-stone-100"
            title="क्यामेरा रिसेट"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 cursor-pointer text-stone-700 dark:text-stone-300 hover:bg-stone-100"
            title={isFullscreen ? 'नर्मल दृश्य' : 'फुलस्क्रिन'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D House Finishes & Walk-in Tour Customizer Toolbar */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-orange-50/60 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 border border-amber-300 dark:border-stone-800 rounded-2xl p-3 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 dark:border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                भवन रङ्ग, छाना, बार्दली तथा भित्री कोठा अनुकूलन (House 3D Finishes)
              </h4>
              <p className="text-[10.5px] text-stone-600 dark:text-stone-400">
                ड्रपडाउनबाट घरको भित्ता, छानो, बार्दलीको रङ्ग रोज्नुहोस् वा सिधै कोठा भित्र पसेर ३D अवलोकन गर्नुहोस्
              </p>
            </div>
          </div>

          {/* Quick Walk-in Room Tour Dropdown (Prominent) */}
          <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/70 border border-amber-400/60 rounded-xl px-2.5 py-1">
            <DoorOpen className="w-4 h-4 text-amber-800 dark:text-amber-300 shrink-0" />
            <span className="text-xs font-black text-amber-900 dark:text-amber-200">
              कोठा भित्र जानुहोस्:
            </span>
            <select
              value={activeInsideRoomId || 'none'}
              onChange={e => handleJumpToRoom(e.target.value)}
              className="text-xs font-bold bg-white dark:bg-stone-800 text-amber-950 dark:text-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-stone-700 focus:outline-none cursor-pointer"
              title="कुनै पनि कोठा छानेर सिधै भित्र पस्नुहोस्"
            >
              <option value="none">🏠 घर बाहिर (Exterior Orbit View)</option>
              {allRoomsList.map(r => (
                <option key={r.room.id} value={r.room.id}>
                  🚪 [{r.floorName}] {r.room.nameNepali} ({r.room.direction} कोण)
                </option>
              ))}
            </select>
            {activeInsideRoomId && (
              <button
                type="button"
                onClick={handleExitRoomToOrbit}
                className="px-2 py-0.5 rounded bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold cursor-pointer transition shadow-xs"
                title="बाहिरी दृश्यमा फर्कनुहोस्"
              >
                बाहिर
              </button>
            )}
          </div>
        </div>

        {/* 6 Customizer Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. Exterior Wall Color & Texture */}
          <div className="bg-white/80 dark:bg-stone-800/80 p-2 rounded-xl border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1 mb-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block border border-stone-300" style={{ backgroundColor: EXTERIOR_WALL_OPTIONS.find(o => o.id === exteriorWallOption)?.swatch || '#f8fafc' }} />
              घरको रङ्ग:
            </span>
            <select
              value={exteriorWallOption}
              onChange={e => setExteriorWallOption(e.target.value as ExteriorWallOption)}
              className="text-xs font-bold bg-stone-50 dark:bg-stone-700 text-stone-800 dark:text-stone-200 p-1 rounded-lg border border-stone-300 dark:border-stone-600 focus:outline-none cursor-pointer truncate"
              title="घरको बाहिरी भित्ताको रङ्ग र टेक्सचर छान्नुहोस्"
            >
              {EXTERIOR_WALL_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.labelNepali}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Roof Finish & Style */}
          <div className="bg-white/80 dark:bg-stone-800/80 p-2 rounded-xl border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1 mb-1">
              <Home className="w-3 h-3 text-amber-600" />
              छानाको रङ्ग र शैली:
            </span>
            <select
              value={roofStyle}
              onChange={e => setRoofStyle(e.target.value as RoofStyle)}
              className="text-xs font-bold bg-stone-50 dark:bg-stone-700 text-stone-800 dark:text-stone-200 p-1 rounded-lg border border-stone-300 dark:border-stone-600 focus:outline-none cursor-pointer truncate"
              title="छानोको रङ्ग र वास्तुकला शैली छान्नुहोस्"
            >
              {ROOF_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.labelNepali}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Bardali / Balcony Style */}
          <div className="bg-white/80 dark:bg-stone-800/80 p-2 rounded-xl border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1 mb-1">
              <span>🪵</span>
              बार्दलीको डिजाइन:
            </span>
            <select
              value={bardaliStyle}
              onChange={e => setBardaliStyle(e.target.value as BardaliStyleOption)}
              className="text-xs font-bold bg-stone-50 dark:bg-stone-700 text-stone-800 dark:text-stone-200 p-1 rounded-lg border border-stone-300 dark:border-stone-600 focus:outline-none cursor-pointer truncate"
              title="बार्दलीको रेलिङ शैली (काठको आँखीझ्याल, सिसा/स्टिल, ग्रिल आदि) छान्नुहोस्"
            >
              {BARDALI_STYLE_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.labelNepali}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Bardali / Balcony Color */}
          <div className="bg-white/80 dark:bg-stone-800/80 p-2 rounded-xl border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1 mb-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block border border-stone-400" style={{ backgroundColor: BARDALI_COLOR_OPTIONS.find(o => o.id === bardaliColor)?.swatch || '#451a03' }} />
              बार्दलीको रङ्ग:
            </span>
            <select
              value={bardaliColor}
              onChange={e => setBardaliColor(parseInt(e.target.value))}
              className="text-xs font-bold bg-stone-50 dark:bg-stone-700 text-stone-800 dark:text-stone-200 p-1 rounded-lg border border-stone-300 dark:border-stone-600 focus:outline-none cursor-pointer truncate"
              title="बार्दलीको रङ्ग छान्नुहोस्"
            >
              {BARDALI_COLOR_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.labelNepali}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Interior Room Wall Color */}
          <div className="bg-white/80 dark:bg-stone-800/80 p-2 rounded-xl border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1 mb-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block border border-stone-400" style={{ backgroundColor: interiorWallColor === 'vastu' ? '#fef08a' : interiorWallColor }} />
              कोठाको भित्री रङ्ग:
            </span>
            <select
              value={interiorWallColor}
              onChange={e => setInteriorWallColor(e.target.value as InteriorWallColorOption)}
              className="text-xs font-bold bg-stone-50 dark:bg-stone-700 text-stone-800 dark:text-stone-200 p-1 rounded-lg border border-stone-300 dark:border-stone-600 focus:outline-none cursor-pointer truncate"
              title="कोठाको भित्ताको रङ्ग छान्नुहोस्"
            >
              {INTERIOR_WALL_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.labelNepali}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Interior Floor Material */}
          <div className="bg-white/80 dark:bg-stone-800/80 p-2 rounded-xl border border-stone-200 dark:border-stone-700/80 flex flex-col justify-between">
            <span className="text-[10.5px] font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1 mb-1">
              <span>🏛️</span>
              भुइँको फिनिस (Floor):
            </span>
            <select
              value={interiorFloorType}
              onChange={e => setInteriorFloorType(e.target.value as InteriorFloorOption)}
              className="text-xs font-bold bg-stone-50 dark:bg-stone-700 text-stone-800 dark:text-stone-200 p-1 rounded-lg border border-stone-300 dark:border-stone-600 focus:outline-none cursor-pointer truncate"
              title="कोठाको भुइँको फिनिस (मार्बल, पार्केट, टेराकोटा, ग्रेनाइट) छान्नुहोस्"
            >
              {FLOOR_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.labelNepali}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Collapsible Terrain Elevation & Slope Control Center */}
      {isTerrainToolsOpen && (
        <div className="bg-amber-50/70 dark:bg-stone-900 border-2 border-amber-300/80 dark:border-amber-900/60 rounded-2xl p-3.5 shadow-sm space-y-3">
          {/* Header & Sub-Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold">
                <Mountain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  जमिनको धरातल, उँचाइ र ढलान नियन्त्रण (Terrain Height & Slope)
                </h4>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  वास्तुशास्त्र अनुसार जग्गाको ढलानले गृहस्वामीको आयु, स्वास्थ्य, धन र उन्नतिको निर्धारण गर्दछ
                </p>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-1 bg-stone-200/80 dark:bg-stone-800 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setTerrainTab('presets')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  terrainTab === 'presets'
                    ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <span>📜 शास्त्रीय प्रारूप (Presets)</span>
              </button>
              <button
                type="button"
                onClick={() => setTerrainTab('custom')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  terrainTab === 'custom'
                    ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>🎛️ ४ कुना उँचाइ (Custom)</span>
              </button>
              <button
                type="button"
                onClick={() => setTerrainTab('analysis')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  terrainTab === 'analysis'
                    ? 'bg-white dark:bg-stone-700 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>📖 प्रभाव र उपाय (Analysis)</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PRESETS */}
          {terrainTab === 'presets' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
                <span>वास्तु ग्रन्थ (बृहत्संहिता र मानसार) मा वर्णित १० मानक धरातल ढलानहरू:</span>
                <span className="font-semibold text-amber-800 dark:text-amber-400">
                  क्लिक गर्नासाथ ३D जमिन स्वतः ढलान हुनेछ
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {TERRAIN_SLOPE_PRESETS.map(preset => {
                  const isSelected = terrainConfig.mode === preset.id;
                  const isAuspicious = preset.score >= 80;
                  const isModerate = preset.score >= 50 && preset.score < 80;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`text-left p-2.5 rounded-xl border transition cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-600 bg-amber-100/90 dark:bg-amber-950/60 ring-2 ring-amber-500/50 shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:border-amber-400 hover:bg-amber-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                            {preset.nameNepali}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                              isAuspicious
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                                : isModerate
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                                : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300'
                            }`}
                          >
                            {preset.ratingBadge}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-tight mb-2">
                          {preset.descriptionNepali}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-stone-100 dark:border-stone-700/60 font-mono text-stone-600 dark:text-stone-300">
                        <span>ईशान: {preset.elevationNE > 0 ? `+${preset.elevationNE}` : preset.elevationNE}'</span>
                        <span>नैरृत्य: {preset.elevationSW > 0 ? `+${preset.elevationSW}` : preset.elevationSW}'</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM 4 CORNER HEIGHTS & SURFACE MODIFIERS */}
          {terrainTab === 'custom' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  जग्गाका चार कुनाको उँचाइ (Corner Elevations in Feet):
                </span>
                <button
                  type="button"
                  onClick={handleResetFlat}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>समतल बनाउनुहोस् (Reset Flat 0')</span>
                </button>
              </div>

              {/* 4 Corners Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. North-West (वायव्य / NW) */}
                <div className="bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        उत्तर-पश्चिम (वायव्य / NW)
                      </span>
                      <span className="text-[10px] text-stone-500">वायु तत्त्व (Wind / Movement)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                      {terrainConfig.elevationNW > 0 ? `+${terrainConfig.elevationNW}` : terrainConfig.elevationNW} ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.5"
                    value={terrainConfig.elevationNW}
                    onChange={e => handleUpdateCornerElevation('NW', parseFloat(e.target.value))}
                    className="w-full accent-amber-700 cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    {[-3, -1, 0, 1, 3].map(stepVal => (
                      <button
                        key={stepVal}
                        type="button"
                        onClick={() => handleUpdateCornerElevation('NW', stepVal)}
                        className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                          terrainConfig.elevationNW === stepVal
                            ? 'bg-amber-700 text-white border-amber-800'
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600'
                        }`}
                      >
                        {stepVal > 0 ? `+${stepVal}` : stepVal}'
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. North-East (ईशान / NE) */}
                <div className="bg-white dark:bg-stone-800 p-2.5 rounded-xl border-2 border-emerald-300/80 dark:border-emerald-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                        उत्तर-पूर्व (ईशान / NE)
                        <span className="text-[9px] px-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 rounded font-normal">शुभ होचो</span>
                      </span>
                      <span className="text-[10px] text-stone-500">जल तत्त्व / ईश्वरीय कोण (Water / Spirit)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
                      {terrainConfig.elevationNE > 0 ? `+${terrainConfig.elevationNE}` : terrainConfig.elevationNE} ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.5"
                    value={terrainConfig.elevationNE}
                    onChange={e => handleUpdateCornerElevation('NE', parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    {[-4, -2, 0, 1, 3].map(stepVal => (
                      <button
                        key={stepVal}
                        type="button"
                        onClick={() => handleUpdateCornerElevation('NE', stepVal)}
                        className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                          terrainConfig.elevationNE === stepVal
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600'
                        }`}
                      >
                        {stepVal > 0 ? `+${stepVal}` : stepVal}'
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. South-West (नैरृत्य / SW) */}
                <div className="bg-white dark:bg-stone-800 p-2.5 rounded-xl border-2 border-amber-300/80 dark:border-amber-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                        दक्षिण-पश्चिम (नैरृत्य / SW)
                        <span className="text-[9px] px-1 bg-amber-100 dark:bg-amber-950 text-amber-800 rounded font-normal">शुभ अग्लो</span>
                      </span>
                      <span className="text-[10px] text-stone-500">पृथ्वी तत्त्व / स्थिरता (Earth / Stability)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                      {terrainConfig.elevationSW > 0 ? `+${terrainConfig.elevationSW}` : terrainConfig.elevationSW} ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.5"
                    value={terrainConfig.elevationSW}
                    onChange={e => handleUpdateCornerElevation('SW', parseFloat(e.target.value))}
                    className="w-full accent-amber-700 cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    {[-3, -1, 0, 2, 4].map(stepVal => (
                      <button
                        key={stepVal}
                        type="button"
                        onClick={() => handleUpdateCornerElevation('SW', stepVal)}
                        className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                          terrainConfig.elevationSW === stepVal
                            ? 'bg-amber-700 text-white border-amber-800'
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600'
                        }`}
                      >
                        {stepVal > 0 ? `+${stepVal}` : stepVal}'
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. South-East (आग्नेय / SE) */}
                <div className="bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        दक्षिण-पूर्व (आग्नेय / SE)
                      </span>
                      <span className="text-[10px] text-stone-500">अग्नि तत्त्व (Fire / Energy)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                      {terrainConfig.elevationSE > 0 ? `+${terrainConfig.elevationSE}` : terrainConfig.elevationSE} ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.5"
                    value={terrainConfig.elevationSE}
                    onChange={e => handleUpdateCornerElevation('SE', parseFloat(e.target.value))}
                    className="w-full accent-amber-700 cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    {[-3, -1, 0, 1, 3].map(stepVal => (
                      <button
                        key={stepVal}
                        type="button"
                        onClick={() => handleUpdateCornerElevation('SE', stepVal)}
                        className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                          terrainConfig.elevationSE === stepVal
                            ? 'bg-amber-700 text-white border-amber-800'
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600'
                        }`}
                      >
                        {stepVal > 0 ? `+${stepVal}` : stepVal}'
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Surface Roughness & Visual Guides */}
              <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3">
                {/* Surface Roughness */}
                <div className="flex items-center gap-3 min-w-[240px] flex-1">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 shrink-0">
                    पहाडी तरङ्ग/उबडखाबड:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.2"
                    value={terrainConfig.roughness}
                    onChange={e => setTerrainConfig(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                    className="w-full accent-amber-700 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-400 shrink-0">
                    {terrainConfig.roughness} ft
                  </span>
                </div>

                {/* 3D Visual Guides Toggles */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTerrainConfig(prev => ({ ...prev, showContourGrid: !prev.showContourGrid }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      terrainConfig.showContourGrid
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border-blue-400'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    📐 कन्टुर रेखा {terrainConfig.showContourGrid ? 'सक्रिय' : 'बन्द'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTerrainConfig(prev => ({ ...prev, showSlopeArrow: !prev.showSlopeArrow }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      terrainConfig.showSlopeArrow
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-400'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    🧭 ३D ढलान एरो {terrainConfig.showSlopeArrow ? 'सक्रिय' : 'बन्द'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTerrainConfig(prev => ({ ...prev, showElevationPins: !prev.showElevationPins }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      terrainConfig.showElevationPins
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border-emerald-400'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    🚩 सर्भे पिन {terrainConfig.showElevationPins ? 'सक्रिय' : 'बन्द'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE VASTU ANALYSIS & REMEDIES */}
          {terrainTab === 'analysis' && (
            <div className="bg-white dark:bg-stone-800 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3">
              {/* Score & Direction Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-stone-900/60 border border-amber-200 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl text-white ${
                    terrainAnalysis.score >= 80 ? 'bg-emerald-600' : terrainAnalysis.score >= 50 ? 'bg-amber-600' : 'bg-red-600'
                  }`}>
                    {terrainAnalysis.score >= 80 ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {terrainAnalysis.titleNepali} — {terrainAnalysis.verdictNepali}
                    </h5>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">
                      प्राकृतिक ढलान दिशा: <strong>{terrainAnalysis.slopeDirectionNepali}</strong> | भिरालोपन: <strong>{terrainAnalysis.gradientPercent}%</strong> | कुल उँचाइ अन्तर: <strong>{terrainAnalysis.heightDifference} फिट</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-amber-800 dark:text-amber-400 font-mono">
                    {terrainAnalysis.score}
                    <span className="text-xs text-stone-400">/100</span>
                  </span>
                  <span className="text-[10px] text-stone-500 block">धरातल वास्तु अङ्क</span>
                </div>
              </div>

              {/* Classical Shloka Card */}
              <div className="p-2.5 rounded-xl bg-amber-100/50 dark:bg-amber-950/40 border-l-4 border-amber-700 text-stone-800 dark:text-stone-200">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block uppercase tracking-wider">
                  प्राचीन वैदिक वास्तु सूत्र (Classical Vedic Shloka):
                </span>
                <p className="font-serif italic text-xs mt-0.5 text-stone-900 dark:text-stone-100">
                  {terrainAnalysis.classicalRule}
                </p>
              </div>

              {/* Effects & Remedies Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Effects */}
                <div className="space-y-1.5">
                  <h6 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    धरातल ढलानको प्रभाव (Impact on Household):
                  </h6>
                  <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                    {terrainAnalysis.effectsNepali.map((eff, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{eff}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Remedies */}
                <div className="space-y-1.5">
                  <h6 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                    वास्तु दोष निवारण र इन्जिनियरिङ उपाय (Remedies):
                  </h6>
                  <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                    {terrainAnalysis.remedies.map((rem, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic View Bar: Orbit Camera Angles vs Walkthrough Hotspots */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          {controlMode === 'orbit' ? (
            <>
              <Camera className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold text-stone-700 dark:text-stone-300 shrink-0">दृश्य (Orbit Angles):</span>
              <button
                type="button"
                onClick={() => setPresetView('road')}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium whitespace-nowrap cursor-pointer transition"
              >
                🛣️ अगाडि बाटो र गेट
              </button>
              <button
                type="button"
                onClick={() => setPresetView('courtyard')}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium whitespace-nowrap cursor-pointer transition"
              >
                🏡 आँगन र तुलसी
              </button>
              <button
                type="button"
                onClick={() => setPresetView('isometric')}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium whitespace-nowrap cursor-pointer transition"
              >
                🔄 ३६०° आइसोमेट्रिक
              </button>
              <button
                type="button"
                onClick={() => setPresetView('terrace')}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium whitespace-nowrap cursor-pointer transition"
              >
                🏢 कौशी र छत
              </button>
              <button
                type="button"
                onClick={() => setPresetView('top')}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium whitespace-nowrap cursor-pointer transition"
              >
                ⬆️ माथिबाट
              </button>
            </>
          ) : (
            <>
              <Footprints className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold text-stone-700 dark:text-stone-300 shrink-0">पदयात्रा विन्दुहरू (Walk Hotspots):</span>
              {walkHotspots.map(spot => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => handleJumpToHotspot(spot)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium whitespace-nowrap cursor-pointer transition flex items-center gap-1"
                  title={spot.nameNepali}
                >
                  <span>{spot.icon}</span>
                  <span>{spot.nameNepali}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Quick Orbit Controls or Walk Settings */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto pl-2 border-l border-stone-200 dark:border-stone-700">
          {controlMode === 'orbit' ? (
            <>
              <button
                type="button"
                onClick={handleResetTarget}
                className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer flex items-center gap-1"
                title="घरको केन्द्रमा फोकस रिसेट गर्नुहोस्"
              >
                <Crosshair className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">केन्द्र रिसेट</span>
              </button>
              <button
                type="button"
                onClick={() => handleOrbitZoom('in')}
                className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                title="जुम इन (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleOrbitZoom('out')}
                className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                title="जुम आउट (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* Eye Height Selector */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 text-[11px]">
                <Eye className="w-3 h-3 text-stone-500 ml-1" />
                <button
                  type="button"
                  onClick={() => { setEyeHeight(3.5); updateWalkthroughCamera(); }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${eyeHeight === 3.5 ? 'bg-amber-800 text-white font-bold' : 'text-stone-600 dark:text-stone-400'}`}
                  title="बसाइ स्तर (३.५ फिट)"
                >
                  ३.५'
                </button>
                <button
                  type="button"
                  onClick={() => { setEyeHeight(5.5); updateWalkthroughCamera(); }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${eyeHeight === 5.5 ? 'bg-amber-800 text-white font-bold' : 'text-stone-600 dark:text-stone-400'}`}
                  title="मानव आँखा स्तर (५.५ फिट)"
                >
                  ५.५'
                </button>
                <button
                  type="button"
                  onClick={() => { setEyeHeight(8.0); updateWalkthroughCamera(); }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${eyeHeight === 8.0 ? 'bg-amber-800 text-white font-bold' : 'text-stone-600 dark:text-stone-400'}`}
                  title="अग्लो स्तर (८ फिट)"
                >
                  ८'
                </button>
                <button
                  type="button"
                  onClick={() => { setEyeHeight(18.0); updateWalkthroughCamera(); }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${eyeHeight === 18.0 ? 'bg-amber-800 text-white font-bold' : 'text-stone-600 dark:text-stone-400'}`}
                  title="कौशी स्तर (१८ फिट)"
                >
                  १८'
                </button>
              </div>

              {/* Speed Toggle */}
              <button
                type="button"
                onClick={() => setWalkSpeed(prev => prev === 'normal' ? 'fast' : 'normal')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                  walkSpeed === 'fast'
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
                title="हिँड्ने गति परिवर्तन गर्नुहोस्"
              >
                {walkSpeed === 'fast' ? '⚡ छिटो (2x)' : '🚶 सामान्य (1x)'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border-2 border-amber-200 dark:border-stone-800 bg-stone-900 shadow-inner select-none ${
          controlMode === 'walkthrough' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        } ${
          isFullscreen ? 'h-[85vh]' : 'aspect-[16/10] min-h-[480px]'
        }`}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={mountRef} className="w-full h-full" />

        {/* Floating Inside Room Vastu HUD & Navigation Controls */}
        {activeInsideRoomId && activeRoomData && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-stone-950/92 backdrop-blur-md border-2 border-amber-400 text-white rounded-2xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 max-w-[96vw] sm:max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600/30 border border-amber-400/50 flex items-center justify-center text-lg shadow-inner">
                🚪
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-amber-300">
                    {activeRoomData.room.nameNepali}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                    {activeRoomData.floorName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeRoomData.room.direction} कोण
                  </span>
                </div>
                <p className="text-[11px] text-stone-300">
                  वास्तु क्षेत्रफल: {activeRoomData.room.area} व.फु. ({activeRoomData.room.width}' × {activeRoomData.room.height}') • भित्री दृश्य
                </p>
              </div>
            </div>

            {/* Room Navigation Buttons & Exit */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => handleNavigateRoom('prev')}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-stone-700"
                title="अघिल्लो कोठामा जानुहोस्"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">अघिल्लो</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigateRoom('next')}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-stone-700"
                title="पछिल्लो कोठामा जानुहोस्"
              >
                <span className="hidden sm:inline">पछिल्लो</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setInteriorLightsOn(!interiorLightsOn)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-1 ${
                  interiorLightsOn
                    ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-xs'
                    : 'bg-stone-800 text-stone-300 border-stone-700'
                }`}
                title="कोठाको बत्ती खोल्ने वा निभाउने"
              >
                <Sparkles className="w-3 h-3" />
                <span>{interiorLightsOn ? 'बत्ती बन्द' : 'बत्ती सुरु'}</span>
              </button>
              <button
                type="button"
                onClick={handleExitRoomToOrbit}
                className="px-3 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-md"
                title="कोठाबाट बाहिर निस्किएर घरको बाहिरी परिक्रमा दृश्यमा फर्कनुहोस्"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>बाहिर</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Controls Guidance Badge */}
        <div className="absolute bottom-3 left-3 bg-stone-900/85 backdrop-blur-sm border border-stone-700 text-white rounded-xl px-3 py-1.5 text-[11px] pointer-events-none flex items-center gap-2 shadow-lg">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {controlMode === 'orbit'
              ? 'माउस बायाँ-ड्र्याग: ३६०° घुमाउनुहोस् | दायाँ-ड्र्याग / Shift: प्यान गर्नुहोस् | स्क्रोल: जुम'
              : 'पदयात्रा: W, A, S, D वा Arrow keys बाट हिँड्नुहोस् | माउस ड्र्याग: चारैतिर हेर्नुहोस्'}
          </span>
        </div>

        {/* Floating True North Compass */}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border border-amber-300 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs flex items-center gap-2 shadow-md">
          <Compass className="w-4 h-4 text-red-600" />
          <div className="text-[11px]">
            <span className="font-bold text-stone-800 dark:text-stone-200 block">सत्य उत्तर (North)</span>
            <span className="text-[10px] text-stone-500">वास्तु दिशा अनुरूप</span>
          </div>
        </div>

        {/* Floating Real-time Terrain Slope & Vastu Rating Badge */}
        <div className="absolute top-3 right-36 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border border-amber-300 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs hidden sm:flex items-center gap-2 shadow-md">
          <TrendingUp className={`w-4 h-4 shrink-0 ${terrainAnalysis.score >= 80 ? 'text-emerald-600' : terrainAnalysis.score >= 50 ? 'text-amber-600' : 'text-red-600'}`} />
          <div className="text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {terrainAnalysis.titleNepali}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold text-white ${
                terrainAnalysis.score >= 80 ? 'bg-emerald-600' : terrainAnalysis.score >= 50 ? 'bg-amber-600' : 'bg-red-600'
              }`}>
                {terrainAnalysis.score}%
              </span>
            </div>
            <span className="text-[10px] text-stone-500">
              {terrainAnalysis.slopeDirectionNepali} • {terrainAnalysis.gradientPercent}% ढलान ({terrainAnalysis.heightDifference}' फरक)
            </span>
          </div>
        </div>

        {/* Floating Realistic House Features Badge */}
        <div className="absolute top-3 left-3 hidden sm:flex items-center gap-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border border-amber-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            {controlMode === 'orbit' ? '३D परिक्रमा मोड (Full Orbit & Pan)' : '३D प्रत्यक्ष पदयात्रा मोड (First-Person Walk)'}
          </span>
        </div>

        {/* Floating Navigation & D-Pad Controller Dock (Bottom Right) */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-1.5">
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700/80 text-white rounded-2xl p-2.5 shadow-2xl flex flex-col items-center select-none w-44">
            {/* Dock Header */}
            <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-800 text-[11px]">
              <div className="flex items-center gap-1 font-bold text-amber-400">
                {controlMode === 'orbit' ? (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    <span>परिक्रमा नियन्त्रण</span>
                  </>
                ) : (
                  <>
                    <Footprints className="w-3.5 h-3.5" />
                    <span>पदयात्रा कुञ्जी</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsNavDockExpanded(!isNavDockExpanded)}
                className="text-stone-400 hover:text-white cursor-pointer"
                title={isNavDockExpanded ? 'संक्षिप्त गर्नुहोस्' : 'विस्तार गर्नुहोस्'}
              >
                {isNavDockExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isNavDockExpanded && (
              <>
                {controlMode === 'orbit' ? (
                  /* Orbit D-Pad & Controls */
                  <div className="flex flex-col items-center gap-2 w-full pt-1">
                    {/* Directional Pan D-Pad */}
                    <div className="grid grid-cols-3 gap-1 w-28 h-28 items-center justify-items-center">
                      <div />
                      <button
                        type="button"
                        onClick={() => handleOrbitPan('up')}
                        className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-amber-800 active:bg-amber-900 text-stone-200 hover:text-white flex items-center justify-center cursor-pointer transition shadow-xs border border-stone-700"
                        title="माथि सार्नुहोस् (Pan Up)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <div />

                      <button
                        type="button"
                        onClick={() => handleOrbitPan('left')}
                        className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-amber-800 active:bg-amber-900 text-stone-200 hover:text-white flex items-center justify-center cursor-pointer transition shadow-xs border border-stone-700"
                        title="बायाँ सार्नुहोस् (Pan Left)"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleResetTarget}
                        className="w-8 h-8 rounded-lg bg-amber-700 hover:bg-amber-600 active:bg-amber-800 text-white flex items-center justify-center cursor-pointer transition shadow-xs border border-amber-600"
                        title="घरको केन्द्रमा रिसेट गर्नुहोस्"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOrbitPan('right')}
                        className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-amber-800 active:bg-amber-900 text-stone-200 hover:text-white flex items-center justify-center cursor-pointer transition shadow-xs border border-stone-700"
                        title="दायाँ सार्नुहोस् (Pan Right)"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div />
                      <button
                        type="button"
                        onClick={() => handleOrbitPan('down')}
                        className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-amber-800 active:bg-amber-900 text-stone-200 hover:text-white flex items-center justify-center cursor-pointer transition shadow-xs border border-stone-700"
                        title="तल सार्नुहोस् (Pan Down)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <div />
                    </div>

                    {/* Orbit Rotate and Zoom bar */}
                    <div className="flex items-center justify-between w-full pt-1 border-t border-stone-800 gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOrbitRotate(0.25, 0)}
                          className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer"
                          title="बायाँ घुमाउनुहोस् (Orbit Left)"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOrbitRotate(-0.25, 0)}
                          className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer"
                          title="दायाँ घुमाउनुहोस् (Orbit Right)"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOrbitZoom('in')}
                          className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer"
                          title="जुम इन (Zoom In)"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOrbitZoom('out')}
                          className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer"
                          title="जुम आउट (Zoom Out)"
                        >
                          <ZoomOut className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Walkthrough Virtual D-Pad & Controls */
                  <div className="flex flex-col items-center gap-2 w-full pt-1">
                    {/* Movement D-Pad */}
                    <div className="grid grid-cols-3 gap-1 w-28 h-28 items-center justify-items-center">
                      <button
                        type="button"
                        onClick={() => turnPlayer(0.18, 0)}
                        className="w-7 h-7 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 flex items-center justify-center cursor-pointer transition text-[10px]"
                        title="बायाँ हेर्नुहोस् (Turn Left - Q)"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePlayer(walkSpeed === 'fast' ? 4 : 2, 0)}
                        className="w-8 h-8 rounded-lg bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white flex items-center justify-center cursor-pointer transition shadow-xs border border-emerald-600"
                        title="अगाडि हिँड्नुहोस् (Forward - W)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => turnPlayer(-0.18, 0)}
                        className="w-7 h-7 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 flex items-center justify-center cursor-pointer transition text-[10px]"
                        title="दायाँ हेर्नुहोस् (Turn Right - E)"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => movePlayer(0, walkSpeed === 'fast' ? -4 : -2)}
                        className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-white flex items-center justify-center cursor-pointer transition shadow-xs border border-stone-700"
                        title="बायाँ सर्नुहोस् (Strafe Left - A)"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-7 h-7 rounded bg-stone-800/70 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                        🚶
                      </div>
                      <button
                        type="button"
                        onClick={() => movePlayer(0, walkSpeed === 'fast' ? 4 : 2)}
                        className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-white flex items-center justify-center cursor-pointer transition shadow-xs border border-stone-700"
                        title="दायाँ सर्नुहोस् (Strafe Right - D)"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div />
                      <button
                        type="button"
                        onClick={() => movePlayer(walkSpeed === 'fast' ? -4 : -2, 0)}
                        className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-white flex items-center justify-center cursor-pointer transition shadow-xs border border-stone-700"
                        title="पछाडि हिँड्नुहोस् (Backward - S)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <div />
                    </div>

                    {/* Keyboard shortcut hint */}
                    <div className="w-full pt-1 border-t border-stone-800 text-[10px] text-stone-400 text-center">
                      <span>कुञ्जीहरू: <strong className="text-stone-200">W, A, S, D</strong></span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* High-Resolution 3D Snapshot & Printable PDF Report Modal */}
      <Vastu3DExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        plan={plan}
        terrainConfig={terrainConfig}
        terrainAnalysis={terrainAnalysis}
        roofStyle={roofStyle}
        lightingMood={lightingMood}
        onCaptureSnapshot={handleCaptureSnapshot}
      />
    </div>
  );
};
