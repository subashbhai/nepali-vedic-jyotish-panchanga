// 3D House Scene & Landscape Builder using Three.js
// Procedural textures, realistic house architectural elements, aagan, garden & road
// बालानन्द कर्मकाण्ड - वास्तु भवन योजना

import * as THREE from 'three';
import { GeneratedFloorPlan, VastuPlannerProject } from '../types';

export type RoofStyle =
  | 'pitched_tile'
  | 'pitched_slate'
  | 'pitched_copper'
  | 'pitched_green'
  | 'flat_terrace'
  | 'cutaway';
export type LightingMood = 'day' | 'sunset' | 'night';

// --- Terrain & Slope Simulation Definitions ---

export interface TerrainConfig {
  mode: string;
  elevationNE: number; // in feet: relative corner elevation (+ high, - low)
  elevationNW: number;
  elevationSE: number;
  elevationSW: number;
  roughness: number; // 0 to 4 ft (surface undulating/ripples)
  showContourGrid: boolean; // overlay elevation lines/wireframe
  showSlopeArrow: boolean; // 3D slope direction vector arrow
  showElevationPins: boolean; // 3D corner survey markers
}

export interface TerrainSlopePreset {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  descriptionNepali: string;
  elevationNE: number;
  elevationNW: number;
  elevationSE: number;
  elevationSW: number;
  roughness: number;
  ratingBadge: string;
  score: number;
  vastuVerdict: string;
}

export interface TerrainVastuAnalysis {
  slopeDirection: 'NE' | 'E' | 'N' | 'NW' | 'SE' | 'W' | 'S' | 'SW' | 'none';
  slopeDirectionNepali: string;
  gradientPercent: number;
  heightDifference: number;
  score: number;
  verdictNepali: string;
  status: 'recommended' | 'acceptable' | 'caution' | 'conflict';
  titleNepali: string;
  classicalRule: string;
  effectsNepali: string[];
  doshasDetected: string[];
  remedies: string[];
}

export const TERRAIN_SLOPE_PRESETS: TerrainSlopePreset[] = [
  {
    id: 'ishan_slope',
    nameNepali: 'ईशान ढलान (NE Down)',
    nameEnglish: 'North-East Downhill (Ishan Plava)',
    descriptionNepali: 'ईशान कोण होचो र नैरृत्य कोण अग्लो - वास्तुशास्त्रमा सर्वाधिक शुभ, ऐश्वर्यदायक तथा सुवर्ण योग',
    elevationNE: -3.5,
    elevationNW: 0.5,
    elevationSE: 1.5,
    elevationSW: 5.0,
    roughness: 0,
    ratingBadge: 'उत्कृष्ट १००%',
    score: 100,
    vastuVerdict: 'अत्यन्त शुभ (Highly Auspicious)'
  },
  {
    id: 'indra_east_slope',
    nameNepali: 'पूर्व ढलान (East Down)',
    nameEnglish: 'East Downhill (Indra Plava)',
    descriptionNepali: 'पूर्व होचो, पश्चिम अग्लो - सूर्य ऊर्जा प्रवेश, मान-सम्मान, कान्ति तथा सन्तान सुख',
    elevationNE: -3.0,
    elevationNW: 3.0,
    elevationSE: -3.0,
    elevationSW: 3.0,
    roughness: 0,
    ratingBadge: 'उत्तम ९५%',
    score: 95,
    vastuVerdict: 'शुभ (Auspicious)'
  },
  {
    id: 'kuber_north_slope',
    nameNepali: 'उत्तर ढलान (North Down)',
    nameEnglish: 'North Downhill (Kuber Plava)',
    descriptionNepali: 'उत्तर होचो, दक्षिण अग्लो - कुबेरको दृष्टि, आर्थिक समृद्धि, व्यापार लाभ र धन वृद्धि',
    elevationNE: -3.0,
    elevationNW: -3.0,
    elevationSE: 3.0,
    elevationSW: 3.0,
    roughness: 0,
    ratingBadge: 'उत्तम ९५%',
    score: 95,
    vastuVerdict: 'शुभ (Auspicious)'
  },
  {
    id: 'samatala_flat',
    nameNepali: 'समतल जग्गा (Flat Land)',
    nameEnglish: 'Even / Level Plot (Samatala)',
    descriptionNepali: 'चारैतर्फ समान सतह - सन्तुलित पञ्चतत्त्व, सामान्य शुभ तथा निर्माणमा सहजता',
    elevationNE: 0,
    elevationNW: 0,
    elevationSE: 0,
    elevationSW: 0,
    roughness: 0,
    ratingBadge: 'सन्तुलित ८५%',
    score: 85,
    vastuVerdict: 'सन्तुलित शुभ (Neutral Balanced)'
  },
  {
    id: 'vayu_nw_slope',
    nameNepali: 'वायव्य ढलान (NW Down)',
    nameEnglish: 'North-West Downhill (Vayu Plava)',
    descriptionNepali: 'वायव्य होचो, आग्नेय अग्लो - वायु तत्त्व सक्रिय, यात्रा तथा खर्चमा चञ्चलता',
    elevationNE: 1.5,
    elevationNW: -3.0,
    elevationSE: 4.0,
    elevationSW: 0.5,
    roughness: 0,
    ratingBadge: 'मध्यम ६०%',
    score: 60,
    vastuVerdict: 'मध्यम (Moderate)'
  },
  {
    id: 'varun_west_slope',
    nameNepali: 'पश्चिम ढलान (West Down)',
    nameEnglish: 'West Downhill (Varun Plava)',
    descriptionNepali: 'पश्चिम होचो, पूर्व अग्लो - आर्थिक व्यय वृद्धि, परिवारका सदस्यमा थकाइ र अल्छीपन',
    elevationNE: 3.0,
    elevationNW: -3.0,
    elevationSE: 3.0,
    elevationSW: -3.0,
    roughness: 0,
    ratingBadge: 'सतर्कता ४५%',
    score: 45,
    vastuVerdict: 'सतर्कता आवश्यक (Caution)'
  },
  {
    id: 'agneya_se_slope',
    nameNepali: 'आग्नेय ढलान (SE Down)',
    nameEnglish: 'South-East Downhill (Agni Plava)',
    descriptionNepali: 'आग्नेय होचो, वायव्य अग्लो - अग्नि तत्त्व असन्तुलन, क्रोध, कलह तथा आकस्मिक खर्च',
    elevationNE: 0.5,
    elevationNW: 3.5,
    elevationSE: -3.0,
    elevationSW: 1.5,
    roughness: 0,
    ratingBadge: 'दोषयुक्त ४०%',
    score: 40,
    vastuVerdict: 'दोषयुक्त (Caution)'
  },
  {
    id: 'yama_south_slope',
    nameNepali: 'दक्षिण ढलान (South Down)',
    nameEnglish: 'South Downhill (Yama Plava)',
    descriptionNepali: 'दक्षिण होचो, उत्तर अग्लो - यम वीथी दोष, स्वास्थ्य हानि, आर्थिक अपव्यय र रोग भय',
    elevationNE: 3.5,
    elevationNW: 3.5,
    elevationSE: -3.5,
    elevationSW: -3.5,
    roughness: 0,
    ratingBadge: 'वास्तु दोष २५%',
    score: 25,
    vastuVerdict: 'वास्तु दोष (Yama Dosha)'
  },
  {
    id: 'asura_sw_slope',
    nameNepali: 'नैरृत्य ढलान (SW Down)',
    nameEnglish: 'South-West Downhill (Asura Plava)',
    descriptionNepali: 'नैरृत्य होचो, ईशान अग्लो - महादोष! स्थायित्व अभाव, आकस्मिक दुर्घटना, धनहानि र अशान्ति',
    elevationNE: 4.5,
    elevationNW: 1.5,
    elevationSE: 1.5,
    elevationSW: -4.5,
    roughness: 0,
    ratingBadge: 'गम्भीर दोष १५%',
    score: 15,
    vastuVerdict: 'गम्भीर वास्तु दोष (Severe Dosha)'
  },
  {
    id: 'vishama_undulating',
    nameNepali: 'उबडखाबड पहाडी (Uneven)',
    nameEnglish: 'Undulating Hillside (Vishama)',
    descriptionNepali: 'असमान सतह, उच्च-निच खाल्डाखुल्डी - ऊर्जा प्रवाह अवरुद्ध, जमिन सम्याउनु आवश्यक',
    elevationNE: 1.5,
    elevationNW: -2.0,
    elevationSE: -1.0,
    elevationSW: 2.5,
    roughness: 2.5,
    ratingBadge: 'अस्थिर ४०%',
    score: 40,
    vastuVerdict: 'अस्थिर धरातल (Unstable)'
  }
];

// --- Procedural Canvas Texture Helpers ---

/**
 * Procedural grass texture with natural green speckling
 */
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add variations for lush grass look
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const shade = Math.random();
      ctx.fillStyle = shade > 0.6 ? '#16a34a' : shade > 0.3 ? '#15803d' : '#4ade80';
      ctx.fillRect(x, y, 2, 3);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/**
 * Procedural interlocking paver stone texture for Aagan (Courtyard)
 */
export function createPaverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;

    const tileSize = 32;
    for (let x = 0; x < 256; x += tileSize) {
      for (let y = 0; y < 256; y += tileSize) {
        const offset = ((y / tileSize) % 2 === 0) ? 0 : tileSize / 2;
        const tx = (x + offset) % 256;
        
        ctx.fillStyle = (x + y) % 64 === 0 ? '#cbd5e1' : '#f1f5f9';
        ctx.fillRect(tx + 1, y + 1, tileSize - 2, tileSize - 2);
        ctx.strokeRect(tx, y, tileSize, tileSize);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  return texture;
}

/**
 * Procedural terracotta roof tiles texture (रातो टायल)
 */
export function createTileRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, 256, 256);

    const rows = 16;
    const cols = 8;
    const rowH = 256 / rows;
    const colW = 256 / cols;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      // Ridge shadow
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(0, y, 256, 3);

      // Tile highlights
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, y + 3, 256, 2);

      const offset = (r % 2) * (colW / 2);
      for (let c = 0; c < cols + 1; c++) {
        const x = c * colW - offset;
        ctx.strokeStyle = '#450a0a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH);
        ctx.stroke();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Procedural asphalt road texture with yellow dashed lines & white boundary lines
 */
export function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Dark asphalt
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, 512, 256);

    // Asphalt noise grain
    for (let i = 0; i < 3000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? '#3f3f46' : '#18181b';
      ctx.fillRect(rx, ry, 2, 2);
    }

    // White shoulder lines
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 20, 512, 6);
    ctx.fillRect(0, 230, 512, 6);

    // Yellow center divider dashed line
    ctx.fillStyle = '#eab308';
    for (let x = 0; x < 512; x += 64) {
      ctx.fillRect(x + 10, 124, 44, 8);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedural Nepali Red Brick Wall texture (नेपाली रातो ईँटा)
 */
export function createBrickWallTexture(colorHex: number = 0x991b1b): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const colStr = '#' + colorHex.toString(16).padStart(6, '0');
    ctx.fillStyle = '#cbd5e1'; // Mortar light grey
    ctx.fillRect(0, 0, 256, 256);

    const rows = 16;
    const cols = 8;
    const rowH = 256 / rows;
    const colW = 256 / cols;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const offset = (r % 2) * (colW / 2);
      for (let c = -1; c < cols + 1; c++) {
        const x = c * colW + offset;
        ctx.fillStyle = colStr;
        ctx.fillRect(x + 1.5, y + 1.5, colW - 3, rowH - 3);

        // Brick surface noise variation
        ctx.fillStyle = (r + c) % 3 === 0 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Procedural Stucco / Plaster wall texture (आधुनिक स्तुक्को/प्लास्टर भित्ता)
 */
export function createStuccoWallTexture(colorHex: number = 0xf8fafc): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const colStr = '#' + colorHex.toString(16).padStart(6, '0');
    ctx.fillStyle = colStr;
    ctx.fillRect(0, 0, 128, 128);

    // Subtle stucco stipple noise
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/**
 * Procedural Himalayan Slate Roof texture (पहाडी स्लेट छानो)
 */
export function createSlateRoofTexture(colorHex: number = 0x1e293b): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const colStr = '#' + colorHex.toString(16).padStart(6, '0');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 256);

    const rows = 12;
    const cols = 6;
    const rowH = 256 / rows;
    const colW = 256 / cols;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const offset = (r % 2) * (colW / 2);
      for (let c = -1; c < cols + 1; c++) {
        const x = c * colW + offset;
        ctx.fillStyle = colStr;
        ctx.fillRect(x + 1, y + 1, colW - 2, rowH - 2);

        // Slate texture shading
        ctx.fillStyle = (r * 7 + c * 13) % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);

        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1, y + 1, colW - 2, rowH - 2);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Procedural Italian White Marble floor texture (इटालियन मार्बल भुइँ)
 */
export function createMarbleFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, 256, 256);

    // Marble veins
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, 20);
    ctx.bezierCurveTo(90, 60, 140, 180, 240, 220);
    ctx.stroke();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(30, 240);
    ctx.bezierCurveTo(110, 170, 180, 130, 220, 20);
    ctx.stroke();

    // Tile seams
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeRect(128, 0, 128, 128);
    ctx.strokeRect(0, 128, 128, 128);
    ctx.strokeRect(128, 128, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Procedural Hardwood Parquet floor texture (काठको पार्केट भुइँ)
 */
export function createWoodParquetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#78350f'; // Warm walnut base
    ctx.fillRect(0, 0, 256, 256);

    const plankH = 256 / 8;
    const plankW = 256 / 4;

    for (let r = 0; r < 8; r++) {
      const y = r * plankH;
      const offset = (r % 2) * (plankW / 2);
      for (let c = -1; c < 5; c++) {
        const x = c * plankW + offset;
        ctx.fillStyle = (r + c) % 2 === 0 ? '#92400e' : '#b45309';
        ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

        // Wood grain streaks
        ctx.strokeStyle = 'rgba(69, 26, 3, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + plankH / 2);
        ctx.lineTo(x + plankW - 2, y + plankH / 2 + 1);
        ctx.stroke();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Procedural Red Terracotta Tile floor texture (रातो टेराकोटा टायल)
 */
export function createTerracottaTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 256, 256);

    const tileSize = 64;
    for (let x = 0; x < 256; x += tileSize) {
      for (let y = 0; y < 256; y += tileSize) {
        ctx.fillStyle = (x / tileSize + y / tileSize) % 2 === 0 ? '#991b1b' : '#b91c1c';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        ctx.strokeStyle = '#d6d3d1'; // Light grout
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Procedural Nepali Carved Wood Jali texture (पारम्परिक काठको आँखीझ्याल बुट्टा)
 */
export function createCarvedWoodJaliTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#451a03'; // Dark carved wood
    ctx.fillRect(0, 0, 128, 128);

    // Lattice Diamond cutouts
    ctx.fillStyle = '#1e1b18'; // Dark perforated gap
    const sz = 16;
    for (let x = 0; x < 128; x += sz) {
      for (let y = 0; y < 128; y += sz) {
        ctx.beginPath();
        ctx.moveTo(x + sz / 2, y + 3);
        ctx.lineTo(x + sz - 3, y + sz / 2);
        ctx.lineTo(x + sz / 2, y + sz - 3);
        ctx.lineTo(x + 3, y + sz / 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

// --- 3D Element Builders ---

/**
 * Builds the front road, pedestrian sidewalk, curb, and streetlights
 */
export function buildRoadAndSidewalk(
  plotW: number,
  plotH: number,
  roadDir: string,
  isNight: boolean
): THREE.Group {
  const roadGroup = new THREE.Group();
  const roadWidth = 24;
  const roadLength = plotW + 60;
  const sidewalkWidth = 6;
  const curbHeight = 0.6;

  // Primary road is placed at the front side of the plot (typically South / +Z)
  const roadTex = createRoadTexture();
  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.85,
    metalness: 0.1
  });

  // Road Asphalt Mesh
  const roadGeo = new THREE.PlaneGeometry(roadLength, roadWidth);
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(0, 0.05, plotH / 2 + roadWidth / 2 + sidewalkWidth);
  roadMesh.receiveShadow = true;
  roadGroup.add(roadMesh);

  // Sidewalk (फुटपाथ) with paving tiles
  const paverTex = createPaverTexture();
  const sidewalkGeo = new THREE.BoxGeometry(roadLength, curbHeight, sidewalkWidth);
  const sidewalkMat = new THREE.MeshStandardMaterial({
    map: paverTex,
    roughness: 0.7
  });
  const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
  sidewalk.position.set(0, curbHeight / 2, plotH / 2 + sidewalkWidth / 2);
  sidewalk.receiveShadow = true;
  roadGroup.add(sidewalk);

  // Concrete Curb Stone (कर्ब स्टोन) between road & sidewalk
  const curbGeo = new THREE.BoxGeometry(roadLength, curbHeight + 0.1, 0.6);
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const curb = new THREE.Mesh(curbGeo, curbMat);
  curb.position.set(0, curbHeight / 2 + 0.05, plotH / 2 + sidewalkWidth);
  roadGroup.add(curb);

  // Street Light Posts (सडक बत्ती)
  const lampPositions = [-roadLength / 3, roadLength / 3];
  lampPositions.forEach(lx => {
    const lampGroup = new THREE.Group();
    // Metal pole
    const poleGeo = new THREE.CylinderGeometry(0.2, 0.3, 14, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0, 7, 0);
    pole.castShadow = true;
    lampGroup.add(pole);

    // Lamp curved arm
    const armGeo = new THREE.BoxGeometry(0.2, 0.2, 3);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.set(0, 14, 1.5);
    lampGroup.add(arm);

    // Lamp head / housing
    const headGeo = new THREE.ConeGeometry(0.8, 0.6, 8);
    const head = new THREE.Mesh(headGeo, poleMat);
    head.rotation.x = Math.PI;
    head.position.set(0, 14, 3);
    lampGroup.add(head);

    // Glowing bulb
    const bulbGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({
      color: isNight ? 0xfef08a : 0xe2e8f0
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, 13.7, 3);
    lampGroup.add(bulb);

    // Add actual point light if night mode
    if (isNight) {
      const streetLight = new THREE.PointLight(0xfef08a, 1.5, 30);
      streetLight.position.set(0, 13.5, 3);
      lampGroup.add(streetLight);
    }

    lampGroup.position.set(lx, 0, plotH / 2 + sidewalkWidth - 0.8);
    roadGroup.add(lampGroup);
  });

  return roadGroup;
}

/**
 * Builds the Compound Wall with decorative stone pillars, protective grill, and main entry gate
 */
export function buildCompoundWallAndGate(
  plotW: number,
  plotH: number,
  gateX: number,
  gateWidth: number,
  isNight: boolean,
  baseY: number = 0,
  footingDepth: number = 4.5
): THREE.Group {
  const wallGroup = new THREE.Group();
  const wallHeight = 4.5;
  const wallThick = 0.7;
  const totalWallH = wallHeight + footingDepth;

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });
  const copingMat = new THREE.MeshStandardMaterial({ color: 0x7a1c1c, roughness: 0.6 }); // Red terracotta coping
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });

  // North wall (back) with deep footing
  const backWallGeo = new THREE.BoxGeometry(plotW, totalWallH, wallThick);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, wallHeight / 2 - footingDepth / 2, -plotH / 2);
  backWall.castShadow = true;
  wallGroup.add(backWall);

  const backCopingGeo = new THREE.BoxGeometry(plotW + 0.6, 0.4, wallThick + 0.4);
  const backCoping = new THREE.Mesh(backCopingGeo, copingMat);
  backCoping.position.set(0, wallHeight + 0.2, -plotH / 2);
  wallGroup.add(backCoping);

  // West wall (left) with deep footing
  const westWallGeo = new THREE.BoxGeometry(wallThick, totalWallH, plotH);
  const westWall = new THREE.Mesh(westWallGeo, wallMat);
  westWall.position.set(-plotW / 2, wallHeight / 2 - footingDepth / 2, 0);
  westWall.castShadow = true;
  wallGroup.add(westWall);

  const westCopingGeo = new THREE.BoxGeometry(wallThick + 0.4, 0.4, plotH + 0.6);
  const westCoping = new THREE.Mesh(westCopingGeo, copingMat);
  westCoping.position.set(-plotW / 2, wallHeight + 0.2, 0);
  wallGroup.add(westCoping);

  // East wall (right) with deep footing
  const eastWall = new THREE.Mesh(westWallGeo, wallMat);
  eastWall.position.set(plotW / 2, wallHeight / 2 - footingDepth / 2, 0);
  eastWall.castShadow = true;
  wallGroup.add(eastWall);

  const eastCoping = new THREE.Mesh(westCopingGeo, copingMat);
  eastCoping.position.set(plotW / 2, wallHeight + 0.2, 0);
  wallGroup.add(eastCoping);

  // Front Wall (South side with Gate opening)
  const actualGateX = gateX || plotW * 0.15;
  const actualGateW = Math.max(10, gateWidth || 12);
  const leftFrontLength = (plotW / 2) + actualGateX - actualGateW / 2;
  const rightFrontLength = (plotW / 2) - actualGateX - actualGateW / 2;

  if (leftFrontLength > 1) {
    const leftWallGeo = new THREE.BoxGeometry(leftFrontLength, totalWallH, wallThick);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-plotW / 2 + leftFrontLength / 2, wallHeight / 2 - footingDepth / 2, plotH / 2);
    leftWall.castShadow = true;
    wallGroup.add(leftWall);

    const leftCopingGeo = new THREE.BoxGeometry(leftFrontLength + 0.4, 0.4, wallThick + 0.4);
    const leftCoping = new THREE.Mesh(leftCopingGeo, copingMat);
    leftCoping.position.set(-plotW / 2 + leftFrontLength / 2, wallHeight + 0.2, plotH / 2);
    wallGroup.add(leftCoping);
  }

  if (rightFrontLength > 1) {
    const rightWallGeo = new THREE.BoxGeometry(rightFrontLength, totalWallH, wallThick);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(plotW / 2 - rightFrontLength / 2, wallHeight / 2 - footingDepth / 2, plotH / 2);
    rightWall.castShadow = true;
    wallGroup.add(rightWall);

    const rightCopingGeo = new THREE.BoxGeometry(rightFrontLength + 0.4, 0.4, wallThick + 0.4);
    const rightCoping = new THREE.Mesh(rightCopingGeo, copingMat);
    rightCoping.position.set(plotW / 2 - rightFrontLength / 2, wallHeight + 0.2, plotH / 2);
    wallGroup.add(rightCoping);
  }

  // Gate Pillars (गेट पिल्लरहरू)
  const pillarW = 1.6;
  const pillarH = 6.2;
  const totalPillarH = pillarH + footingDepth;
  const leftPillarX = actualGateX - actualGateW / 2;
  const rightPillarX = actualGateX + actualGateW / 2;

  [leftPillarX, rightPillarX].forEach(px => {
    const pillarGeo = new THREE.BoxGeometry(pillarW, totalPillarH, pillarW);
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(px, pillarH / 2 - footingDepth / 2, plotH / 2);
    pillar.castShadow = true;
    wallGroup.add(pillar);

    // Pillar capital
    const capGeo = new THREE.BoxGeometry(pillarW + 0.5, 0.6, pillarW + 0.5);
    const cap = new THREE.Mesh(capGeo, copingMat);
    cap.position.set(px, pillarH + 0.3, plotH / 2);
    wallGroup.add(cap);

    // Gate pillar top lamp
    const lampGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const lampMat = new THREE.MeshBasicMaterial({ color: isNight ? 0xfef08a : 0xffffff });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(px, pillarH + 0.9, plotH / 2);
    wallGroup.add(lamp);

    if (isNight) {
      const pLight = new THREE.PointLight(0xfef08a, 0.8, 15);
      pLight.position.set(px, pillarH + 0.9, plotH / 2);
      wallGroup.add(pLight);
    }
  });

  // Metallic Gate Wings (फलामको बुट्टेदार मूल गेट)
  const halfGateW = (actualGateW - 0.4) / 2;
  const gateHeight = 4.8;

  [-1, 1].forEach(side => {
    const wingGroup = new THREE.Group();
    // Outer frame
    const frameGeo = new THREE.BoxGeometry(halfGateW, gateHeight, 0.2);
    const frameMesh = new THREE.Mesh(frameGeo, ironMat);
    frameMesh.position.set((halfGateW / 2) * side, gateHeight / 2, 0);
    wingGroup.add(frameMesh);

    // Vertical pickets
    for (let i = 0; i < 7; i++) {
      const picketGeo = new THREE.CylinderGeometry(0.06, 0.06, gateHeight, 6);
      const picket = new THREE.Mesh(picketGeo, ironMat);
      const px = (side === -1 ? -halfGateW + (i + 0.5) * (halfGateW / 7) : (i + 0.5) * (halfGateW / 7));
      picket.position.set(px, gateHeight / 2, 0);
      wingGroup.add(picket);
    }

    wingGroup.position.set(actualGateX + (side === -1 ? -actualGateW / 2 + 0.2 : actualGateW / 2 - 0.2), 0, plotH / 2);
    // Slight open angle for welcoming look
    wingGroup.rotation.y = side * 0.2;
    wallGroup.add(wingGroup);
  });

  wallGroup.position.y = baseY;
  return wallGroup;
}

/**
 * Builds the sacred Vedic Tulsi Math (तुलसीको मठ / Basil Altar) in the North-East of the aagan
 */
export function buildTulsiMath(x: number, z: number, y: number = 0): THREE.Group {
  const tulsiGroup = new THREE.Group();

  // Tier 1 Base Plinth (ठूलो फेद)
  const t1Geo = new THREE.BoxGeometry(3.2, 0.5, 3.2);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
  const t1 = new THREE.Mesh(t1Geo, plinthMat);
  t1.position.y = 0.25;
  tulsiGroup.add(t1);

  // Tier 2 Terracotta Body (रातो गेरुवा रङको मठ)
  const t2Geo = new THREE.BoxGeometry(2.4, 1.8, 2.4);
  const mathMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.7 });
  const t2 = new THREE.Mesh(t2Geo, mathMat);
  t2.position.y = 0.5 + 0.9;
  t2.castShadow = true;
  tulsiGroup.add(t2);

  // Niches on 4 sides of the Math for Diya (दियो बाल्ने खोपा)
  const nicheGeo = new THREE.BoxGeometry(0.8, 0.6, 2.5);
  const nicheMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.9 });
  const niche = new THREE.Mesh(nicheGeo, nicheMat);
  niche.position.y = 1.4;
  tulsiGroup.add(niche);

  // Brass Diya inside (पित्तलको दियो)
  const diyaGeo = new THREE.ConeGeometry(0.2, 0.15, 8);
  const diyaMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8 });
  const diya = new THREE.Mesh(diyaGeo, diyaMat);
  diya.position.set(0, 1.3, 1.3);
  tulsiGroup.add(diya);

  // Tier 3 Molded Top Rim
  const t3Geo = new THREE.BoxGeometry(2.6, 0.3, 2.6);
  const t3 = new THREE.Mesh(t3Geo, plinthMat);
  t3.position.y = 2.45;
  tulsiGroup.add(t3);

  // Pot Soil / Potting base
  const soilGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 8);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 1 });
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.y = 2.65;
  tulsiGroup.add(soil);

  // Sacred Tulsi Plant foliage (पवित्र तुलसीको पात / बुटो)
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  const tulsiStemGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.2, 6);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
  const stem = new THREE.Mesh(tulsiStemGeo, stemMat);
  stem.position.y = 3.2;
  tulsiGroup.add(stem);

  // Tulsi foliage cluster
  const bush1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), leafMat);
  bush1.position.set(0, 3.6, 0);
  tulsiGroup.add(bush1);

  const bush2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 7, 7), leafMat);
  bush2.position.set(0.3, 3.8, 0.2);
  tulsiGroup.add(bush2);

  const bush3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 7, 7), leafMat);
  bush3.position.set(-0.3, 3.7, -0.2);
  tulsiGroup.add(bush3);

  // Position the whole Tulsi Math in scene
  tulsiGroup.position.set(x, y, z);
  return tulsiGroup;
}

/**
 * Builds a realistic 3D parked car for driveway / porch
 */
export function buildParkedCar(x: number, z: number, rotationY: number = 0, y: number = 0): THREE.Group {
  const car = new THREE.Group();

  // Car Body Chassis (Metallic Red/Navy modern sedan)
  const bodyGeo = new THREE.BoxGeometry(6.5, 2.2, 13);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Crimson red finish
    metalness: 0.6,
    roughness: 0.3
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.8;
  body.castShadow = true;
  car.add(body);

  // Cabin / Roof
  const roofGeo = new THREE.BoxGeometry(5.8, 1.8, 7.5);
  const roof = new THREE.Mesh(roofGeo, bodyMat);
  roof.position.set(0, 3.4, -0.5);
  roof.castShadow = true;
  car.add(roof);

  // Tinted Glass Windows
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.1
  });
  const windshieldGeo = new THREE.BoxGeometry(5.6, 1.5, 0.1);
  const frontGlass = new THREE.Mesh(windshieldGeo, glassMat);
  frontGlass.position.set(0, 3.2, 3.3);
  frontGlass.rotation.x = 0.35;
  car.add(frontGlass);

  const rearGlass = new THREE.Mesh(windshieldGeo, glassMat);
  rearGlass.position.set(0, 3.2, -4.3);
  rearGlass.rotation.x = -0.35;
  car.add(rearGlass);

  // Headlights
  const lightGeo = new THREE.BoxGeometry(1.2, 0.5, 0.2);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const hlLeft = new THREE.Mesh(lightGeo, lightMat);
  hlLeft.position.set(-2.2, 1.8, 6.55);
  car.add(hlLeft);

  const hlRight = new THREE.Mesh(lightGeo, lightMat);
  hlRight.position.set(2.2, 1.8, 6.55);
  car.add(hlRight);

  // 4 Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.7, 12);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 });

  const wheelPositions = [
    { x: -3.1, z: 3.5 },
    { x: 3.1, z: 3.5 },
    { x: -3.1, z: -3.5 },
    { x: 3.1, z: -3.5 }
  ];

  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, tireMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, 0.9, pos.z);
    wheel.castShadow = true;
    car.add(wheel);

    // Rim hubcap
    const rimGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.75, 8);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(pos.x, 0.9, pos.z);
    car.add(rim);
  });

  car.position.set(x, y, z);
  car.rotation.y = rotationY;
  car.scale.set(0.7, 0.7, 0.7);
  return car;
}

/**
 * Builds a natural, realistic 3D tree
 */
export function buildTree(type: 'round' | 'conical', x: number, z: number, scale: number = 1, y: number = 0): THREE.Group {
  const tree = new THREE.Group();

  // Trunk (काठको काण्ड)
  const trunkHeight = 6 * scale;
  const trunkGeo = new THREE.CylinderGeometry(0.4 * scale, 0.6 * scale, trunkHeight, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x543826, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  tree.add(trunk);

  // Foliage
  if (type === 'conical') {
    // Cypress / Ashoka / Christmas tree style
    const levels = 3;
    for (let i = 0; i < levels; i++) {
      const coneGeo = new THREE.ConeGeometry((2.6 - i * 0.6) * scale, (4 - i * 0.8) * scale, 8);
      const coneMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x166534 : 0x15803d,
        roughness: 0.7
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = trunkHeight + (i * 2.2) * scale;
      cone.castShadow = true;
      tree.add(cone);
    }
  } else {
    // Round Mango / Pipal / Neem tree style with clusters
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });

    const mainFoliage = new THREE.Mesh(new THREE.SphereGeometry(3 * scale, 8, 8), foliageMat1);
    mainFoliage.position.y = trunkHeight + 2.5 * scale;
    mainFoliage.castShadow = true;
    tree.add(mainFoliage);

    // Secondary sub-clusters for natural fluffiness
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(2 * scale, 8, 8), foliageMat2);
    c1.position.set(1.4 * scale, trunkHeight + 3.2 * scale, 0.8 * scale);
    tree.add(c1);

    const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.8 * scale, 8, 8), foliageMat1);
    c2.position.set(-1.3 * scale, trunkHeight + 3 * scale, -0.6 * scale);
    tree.add(c2);
  }

  tree.position.set(x, y, z);
  return tree;
}

/**
 * Builds vibrant flower beds & garden shrubs (सयपत्री, मखमली, गुलाब)
 */
export function buildFlowerBed(x: number, z: number, length: number, width: number, y: number = 0): THREE.Group {
  const bedGroup = new THREE.Group();

  // Dark garden soil border
  const soilGeo = new THREE.BoxGeometry(length, 0.25, width);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 1 });
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.y = 0.12;
  bedGroup.add(soil);

  // Stone border around flower bed
  const stoneBorderGeo = new THREE.BoxGeometry(length + 0.4, 0.35, width + 0.4);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const stoneBorder = new THREE.Mesh(stoneBorderGeo, stoneMat);
  stoneBorder.position.y = 0.1;
  bedGroup.add(stoneBorder);

  // Flowers clusters
  const flowerColors = [0xea580c, 0xdc2626, 0xfacc15, 0xec4899]; // Orange Marigold, Red Rose, Yellow, Pink
  const flowerCount = Math.floor(length * 1.5);

  for (let i = 0; i < flowerCount; i++) {
    const fx = -length / 2 + (i + 0.5) * (length / flowerCount) + (Math.random() - 0.5) * 0.4;
    const fz = (Math.random() - 0.5) * (width * 0.6);

    // Green leafy stem
    const leafMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 })
    );
    leafMesh.position.set(fx, 0.4, fz);
    bedGroup.add(leafMesh);

    // Colorful petal blossom
    const col = flowerColors[i % flowerColors.length];
    const blossom = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 6, 6),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 })
    );
    blossom.position.set(fx, 0.65, fz);
    bedGroup.add(blossom);
  }

  bedGroup.position.set(x, y, z);
  return bedGroup;
}

/**
 * Builds a cozy wooden garden bench (काठको आरामदायी बेन्च)
 */
export function buildGardenBench(x: number, z: number, rotationY: number, y: number = 0): THREE.Group {
  const bench = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });

  // Seat
  const seatGeo = new THREE.BoxGeometry(3.6, 0.15, 1.2);
  const seat = new THREE.Mesh(seatGeo, woodMat);
  seat.position.set(0, 1.4, 0);
  bench.add(seat);

  // Backrest
  const backGeo = new THREE.BoxGeometry(3.6, 1.2, 0.15);
  const back = new THREE.Mesh(backGeo, woodMat);
  back.position.set(0, 2.3, -0.5);
  bench.add(back);

  // Legs
  [-1.6, 1.6].forEach(lx => {
    const legGeo = new THREE.BoxGeometry(0.15, 1.4, 1.1);
    const leg = new THREE.Mesh(legGeo, ironMat);
    leg.position.set(lx, 0.7, 0);
    bench.add(leg);
  });

  bench.position.set(x, y, z);
  bench.rotation.y = rotationY;
  return bench;
}

/**
 * Builds realistic exterior windows with white trim, dark frame, reflective glass, and concrete sunshade (छज्जा)
 */
export function buildExteriorWindow(
  width: number,
  height: number,
  wallThickness: number
): THREE.Group {
  const winGroup = new THREE.Group();

  // White window surround frame
  const frameGeo = new THREE.BoxGeometry(width + 0.3, height + 0.3, wallThickness + 0.2);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  winGroup.add(frame);

  // Reflective Glass pane
  const glassGeo = new THREE.BoxGeometry(width - 0.2, height - 0.2, wallThickness + 0.22);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  winGroup.add(glass);

  // Window mullions (कालो ग्रिल/फ्रेम)
  const mullionMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  // Vertical divider
  const vMullion = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, wallThickness + 0.24), mullionMat);
  winGroup.add(vMullion);
  // Horizontal divider
  const hMullion = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, wallThickness + 0.24), mullionMat);
  winGroup.add(hMullion);

  // Cantilevered Concrete Sunshade (झ्यालको छज्जा / Lintel Chhajja)
  const chhajjaGeo = new THREE.BoxGeometry(width + 1.2, 0.25, 2.2);
  const chhajjaMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
  const chhajja = new THREE.Mesh(chhajjaGeo, chhajjaMat);
  chhajja.position.set(0, height / 2 + 0.35, 1.1);
  chhajja.castShadow = true;
  winGroup.add(chhajja);

  return winGroup;
}

/**
 * Builds the Grand Entrance Porch (पिँढी / मुख्य ढोकाको दलान) with stairs, pillars, and solid wood door
 */
export function buildFrontEntrancePorch(
  porchW: number,
  porchH: number,
  isNight: boolean
): THREE.Group {
  const porch = new THREE.Group();

  // Raised Plinth Steps (प्रवेशद्वारका सिँढीहरू)
  const stepCount = 3;
  for (let s = 0; s < stepCount; s++) {
    const stepW = porchW + (stepCount - s) * 0.8;
    const stepDepth = (stepCount - s) * 1.0;
    const stepHeight = 0.4;
    const stepGeo = new THREE.BoxGeometry(stepW, stepHeight, stepDepth);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.7 });
    const stepMesh = new THREE.Mesh(stepGeo, stepMat);
    stepMesh.position.set(0, (s + 0.5) * stepHeight, (stepDepth / 2));
    stepMesh.receiveShadow = true;
    porch.add(stepMesh);
  }

  // Dual Decorative Columns (पोर्चका पिल्लरहरू)
  const colHeight = porchH - 1.2;
  [-porchW / 2 + 0.6, porchW / 2 - 0.6].forEach(cx => {
    const colGeo = new THREE.CylinderGeometry(0.35, 0.4, colHeight, 12);
    const colMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(cx, 1.2 + colHeight / 2, 2.6);
    col.castShadow = true;
    porch.add(col);

    // Column Base & Capital
    const capGeo = new THREE.BoxGeometry(1.0, 0.3, 1.0);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x7a1c1c, roughness: 0.5 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(cx, 1.2 + colHeight + 0.15, 2.6);
    porch.add(cap);
  });

  // Porch Canopy Roof (दलानको छानो)
  const canopyGeo = new THREE.BoxGeometry(porchW + 1.2, 0.6, 3.4);
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, porchH + 0.4, 1.7);
  canopy.castShadow = true;
  porch.add(canopy);

  // Warm Porch Ceiling Light
  const porchLight = new THREE.PointLight(0xfef08a, isNight ? 1.8 : 0.4, 18);
  porchLight.position.set(0, porchH - 0.2, 1.5);
  porch.add(porchLight);

  // Ornate Wooden Main Entrance Door (काठको बुट्टेदार मूल ढोका)
  const doorGeo = new THREE.BoxGeometry(3.6, 7.2, 0.3);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 }); // Dark teak wood
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 1.2 + 3.6, 0.15);
  door.castShadow = true;
  porch.add(door);

  // Door decorative trim & brass handle
  const trimGeo = new THREE.BoxGeometry(4.0, 7.6, 0.25);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
  const trim = new THREE.Mesh(trimGeo, trimMat);
  trim.position.set(0, 1.2 + 3.8, 0.05);
  porch.add(trim);

  // Golden Brass Handle
  const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6);
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
  const handle = new THREE.Mesh(handleGeo, brassMat);
  handle.position.set(1.2, 1.2 + 3.6, 0.35);
  porch.add(handle);

  return porch;
}

/**
 * Builds a realistic interior/exterior wooden paneled door with doorframe and brass handle
 */
export function buildRealisticDoor(
  width: number,
  height: number,
  depth: number = 0.6,
  woodColorHex: number = 0x451a03
): THREE.Group {
  const doorGroup = new THREE.Group();

  // Outer Door Frame (चौकोस)
  const frameThick = 0.35;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x271406, roughness: 0.7 });

  // Top frame
  const topF = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, frameThick, depth + 0.2), frameMat);
  topF.position.set(0, height / 2, 0);
  doorGroup.add(topF);

  // Left frame
  const leftF = new THREE.Mesh(new THREE.BoxGeometry(frameThick, height, depth + 0.2), frameMat);
  leftF.position.set(-width / 2 - frameThick / 2 + 0.1, 0, 0);
  doorGroup.add(leftF);

  // Right frame
  const rightF = new THREE.Mesh(new THREE.BoxGeometry(frameThick, height, depth + 0.2), frameMat);
  rightF.position.set(width / 2 + frameThick / 2 - 0.1, 0, 0);
  doorGroup.add(rightF);

  // Door Leaf Panel (काठको पल्ला)
  const leafMat = new THREE.MeshStandardMaterial({ color: woodColorHex, roughness: 0.5 });
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, height - 0.1, 0.22), leafMat);
  leaf.castShadow = true;
  doorGroup.add(leaf);

  // Recessed Inset Carved Panels (४ वटा काठका बुट्टेदार प्यानलहरू)
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x361605, roughness: 0.6 });
  const pW = (width - 0.6) / 2;
  const pH = (height - 1.2) / 2;

  [-pW / 2 - 0.1, pW / 2 + 0.1].forEach(px => {
    [-pH / 2 - 0.2, pH / 2 + 0.2].forEach(py => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(pW, pH, 0.28), panelMat);
      panel.position.set(px, py, 0);
      doorGroup.add(panel);
    });
  });

  // Brass Handle & Keyhole
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), brassMat);
  handle.position.set(width / 2 - 0.45, 0, 0.2);
  doorGroup.add(handle);

  return doorGroup;
}

/**
 * Builds a realistic Balcony (बार्दली / Bardali) with customizable railing styles:
 * 'carved_wood' (परम्परागत काठको आँखीझ्याल), 'glass_steel' (आधुनिक सिसा र स्टिल),
 * 'iron_grill' (कालो फलामे ग्रिल), 'brass' (सुनौलो ब्रास), 'white_marble' (सेतो संगमरमर)
 */
export function buildRealisticBardali(
  width: number,
  depth: number = 3.5,
  height: number = 3.2,
  style: 'carved_wood' | 'glass_steel' | 'iron_grill' | 'brass' | 'white_marble' = 'carved_wood',
  balconyColorHex: number = 0x78350f
): THREE.Group {
  const bardali = new THREE.Group();

  // Cantilevered Floor Slab with Bottom Cornice (बार्दलीको ढलान र बुट्टेदार पेटी)
  const slabGeo = new THREE.BoxGeometry(width, 0.45, depth);
  const slabMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.set(0, 0.22, depth / 2);
  slab.castShadow = true;
  slab.receiveShadow = true;
  bardali.add(slab);

  // Decorative Cantilever Support Brackets underneath (बार्दलीका टुँडाल / सपोर्ट खम्बाहरू)
  const bracketCount = Math.max(3, Math.floor(width / 4));
  const bSpacing = width / (bracketCount - 1);
  const bracketMat = new THREE.MeshStandardMaterial({ color: 0x7a1c1c, roughness: 0.6 });
  for (let b = 0; b < bracketCount; b++) {
    const bx = -width / 2 + b * bSpacing;
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, depth - 0.4), bracketMat);
    bracket.position.set(bx, -0.15, (depth - 0.4) / 2);
    bardali.add(bracket);
  }

  // Railing Construction based on chosen style
  if (style === 'carved_wood') {
    // Traditional Carved Wood Jali Railing (काठको आँखीझ्याल बार्दली)
    const jaliTex = createCarvedWoodJaliTexture();
    const woodMat = new THREE.MeshStandardMaterial({
      map: jaliTex,
      color: balconyColorHex,
      roughness: 0.7
    });

    // Front Railing
    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.25), woodMat);
    frontRail.position.set(0, 0.45 + height / 2, depth - 0.15);
    bardali.add(frontRail);

    // Left & Right Side Railings
    const sideRailMat = new THREE.MeshStandardMaterial({ color: balconyColorHex, roughness: 0.7 });
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.25, height, depth), sideRailMat);
    leftRail.position.set(-width / 2 + 0.12, 0.45 + height / 2, depth / 2);
    bardali.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.25, height, depth), sideRailMat);
    rightRail.position.set(width / 2 - 0.12, 0.45 + height / 2, depth / 2);
    bardali.add(rightRail);

    // Carved Handrail Cap on top
    const capMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
    const handrail = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, 0.25, 0.5), capMat);
    handrail.position.set(0, 0.45 + height + 0.12, depth - 0.15);
    bardali.add(handrail);

  } else if (style === 'glass_steel') {
    // Modern Glass & Stainless Steel Railing
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.65
    });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });

    // Glass panel
    const glass = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, height - 0.4, 0.12), glassMat);
    glass.position.set(0, 0.45 + height / 2, depth - 0.15);
    bardali.add(glass);

    // Stainless steel handrail
    const handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, width, 12), steelMat);
    handrail.rotation.z = Math.PI / 2;
    handrail.position.set(0, 0.45 + height, depth - 0.15);
    bardali.add(handrail);

    // Steel support posts
    const postCount = Math.max(3, Math.floor(width / 4));
    for (let p = 0; p < postCount; p++) {
      const px = -width / 2 + 0.2 + (p * (width - 0.4)) / (postCount - 1);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, height, 8), steelMat);
      post.position.set(px, 0.45 + height / 2, depth - 0.15);
      bardali.add(post);
    }

  } else if (style === 'iron_grill') {
    // Wrought Iron Ornamental Grill
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 });
    const postCount = Math.max(8, Math.floor(width * 2));
    for (let p = 0; p < postCount; p++) {
      const px = -width / 2 + 0.2 + (p * (width - 0.4)) / (postCount - 1);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, height, 6), ironMat);
      bar.position.set(px, 0.45 + height / 2, depth - 0.15);
      bardali.add(bar);
    }
    // Top & bottom horizontal runners
    const runnerGeo = new THREE.BoxGeometry(width, 0.1, 0.1);
    const topR = new THREE.Mesh(runnerGeo, ironMat);
    topR.position.set(0, 0.45 + height, depth - 0.15);
    bardali.add(topR);
    const botR = new THREE.Mesh(runnerGeo, ironMat);
    botR.position.set(0, 0.45 + 0.1, depth - 0.15);
    bardali.add(botR);

  } else if (style === 'brass') {
    // Golden Brass Luxurious Railing
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
    const postCount = Math.max(6, Math.floor(width * 1.5));
    for (let p = 0; p < postCount; p++) {
      const px = -width / 2 + 0.2 + (p * (width - 0.4)) / (postCount - 1);
      const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, height, 8), brassMat);
      baluster.position.set(px, 0.45 + height / 2, depth - 0.15);
      bardali.add(baluster);
    }
    const handrail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.2, 0.35), brassMat);
    handrail.position.set(0, 0.45 + height, depth - 0.15);
    bardali.add(handrail);

  } else {
    // White Classical Marble Balustrade
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const balusterCount = Math.max(6, Math.floor(width * 1.2));
    for (let p = 0; p < balusterCount; p++) {
      const px = -width / 2 + 0.3 + (p * (width - 0.6)) / (balusterCount - 1);
      const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, height, 10), marbleMat);
      baluster.position.set(px, 0.45 + height / 2, depth - 0.15);
      bardali.add(baluster);
    }
    const handrail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.3, 0.45), marbleMat);
    handrail.position.set(0, 0.45 + height + 0.1, depth - 0.15);
    bardali.add(handrail);
  }

  return bardali;
}

/**
 * Builds an elegant ceiling light fixture for interior rooms
 */
export function buildCeilingLightFixture(isLit: boolean = true): THREE.Group {
  const lightGroup = new THREE.Group();

  // Metal Base Plate
  const baseGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  lightGroup.add(base);

  // Glowing Diffuser Lens
  const lensGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 16);
  const lensMat = new THREE.MeshStandardMaterial({
    color: isLit ? 0xfef08a : 0x64748b,
    emissive: isLit ? 0xfef08a : 0x000000,
    emissiveIntensity: isLit ? 1.0 : 0,
    roughness: 0.2
  });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.position.y = -0.08;
  lightGroup.add(lens);

  return lightGroup;
}

/**
 * Builds the Rooftop Overhead Sintex Water Tank & Stand (South-West / Vastu Zone)
 */
export function buildRooftopWaterTank(x: number, y: number, z: number): THREE.Group {
  const tankGroup = new THREE.Group();

  // Masonry Plinth Stand (उच्च मञ्च)
  const standGeo = new THREE.BoxGeometry(3.6, 1.8, 3.6);
  const standMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const stand = new THREE.Mesh(standGeo, standMat);
  stand.position.y = 0.9;
  stand.castShadow = true;
  tankGroup.add(stand);

  // Cylindrical Sintex Tank (कालो पानी ट्याङ्की)
  const tankGeo = new THREE.CylinderGeometry(1.4, 1.4, 3.2, 16);
  const tankMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.position.y = 1.8 + 1.6;
  tank.castShadow = true;
  tankGroup.add(tank);

  // Tank Cover Lid
  const lidGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.3, 12);
  const lid = new THREE.Mesh(lidGeo, tankMat);
  lid.position.y = 1.8 + 3.2 + 0.15;
  tankGroup.add(lid);

  tankGroup.position.set(x, y, z);
  return tankGroup;
}

/**
 * Builds Rooftop Solar Water Heater Panel
 */
export function buildSolarWaterHeater(x: number, y: number, z: number): THREE.Group {
  const solarGroup = new THREE.Group();

  // Solar collector angled panel
  const panelGeo = new THREE.BoxGeometry(4.5, 0.2, 3.5);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8, roughness: 0.2 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.rotation.x = -0.55; // Angled southwards towards sun
  panel.position.set(0, 1.8, 0);
  panel.castShadow = true;
  solarGroup.add(panel);

  // Insulated hot water cylinder
  const cylGeo = new THREE.CylinderGeometry(0.6, 0.6, 4.6, 12);
  const cylMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
  const cyl = new THREE.Mesh(cylGeo, cylMat);
  cyl.rotation.z = Math.PI / 2;
  cyl.position.set(0, 2.8, -1.5);
  solarGroup.add(cyl);

  // Metal support frame
  const frameGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  [-1.8, 1.8].forEach(fx => {
    const fLeg = new THREE.Mesh(frameGeo, frameMat);
    fLeg.position.set(fx, 1.2, -1.2);
    solarGroup.add(fLeg);
  });

  solarGroup.position.set(x, y, z);
  return solarGroup;
}

/**
 * Bilinear interpolation for height at any coordinate (x, z) within plot bounds [-plotW/2, plotW/2] and [-plotH/2, plotH/2]
 * Coordinate mapping:
 * - x = +plotW/2 is East (E), x = -plotW/2 is West (W)
 * - z = -plotH/2 is North (N), z = +plotH/2 is South (S)
 * Corner mapping:
 * - North-East (NE): x = +plotW/2, z = -plotH/2 -> elevationNE
 * - North-West (NW): x = -plotW/2, z = -plotH/2 -> elevationNW
 * - South-East (SE): x = +plotW/2, z = +plotH/2 -> elevationSE
 * - South-West (SW): x = -plotW/2, z = +plotH/2 -> elevationSW
 */
export function getTerrainHeight(x: number, z: number, plotW: number, plotH: number, config: TerrainConfig): number {
  const u = Math.min(Math.max((x + plotW / 2) / (plotW || 1), 0), 1); // 0 at West, 1 at East
  const v = Math.min(Math.max((z + plotH / 2) / (plotH || 1), 0), 1); // 0 at North, 1 at South

  // Bilinear interpolation
  const topElevation = (1 - u) * config.elevationNW + u * config.elevationNE; // at North (z = -plotH/2)
  const bottomElevation = (1 - u) * config.elevationSW + u * config.elevationSE; // at South (z = +plotH/2)
  const baseHeight = (1 - v) * topElevation + v * bottomElevation;

  // Add natural surface roughness if enabled
  let ripple = 0;
  if (config.roughness > 0) {
    ripple = Math.sin(x * 0.15) * Math.cos(z * 0.15) * (config.roughness * 0.5)
           + Math.sin(x * 0.3 + z * 0.2) * (config.roughness * 0.25);
  }

  return baseHeight + ripple;
}

/**
 * Height lookup for surrounding external landscape extending beyond plot bounds
 */
export function getExtendedTerrainHeight(x: number, z: number, plotW: number, plotH: number, config: TerrainConfig): number {
  const clampedX = Math.min(Math.max(x, -plotW / 2), plotW / 2);
  const clampedZ = Math.min(Math.max(z, -plotH / 2), plotH / 2);
  const base = getTerrainHeight(clampedX, clampedZ, plotW, plotH, { ...config, roughness: 0 });
  
  // Taper off gently into surrounding landscape
  const distOut = Math.max(0, Math.abs(x) - plotW / 2, Math.abs(z) - plotH / 2);
  const falloff = Math.max(0, 1 - distOut / 120);
  return base * falloff;
}

/**
 * Computes deep classical Vastu Shastra slope analysis based on corner elevations
 */
export function calculateTerrainVastuAnalysis(config: TerrainConfig, plotW: number, plotH: number): TerrainVastuAnalysis {
  const { elevationNE, elevationNW, elevationSE, elevationSW } = config;
  
  // East-West gradient: positive if West is higher than East (slopes DOWN towards East = good)
  const westAvg = (elevationNW + elevationSW) / 2;
  const eastAvg = (elevationNE + elevationSE) / 2;
  const ewDiff = westAvg - eastAvg; // > 0 means sloping towards East

  // North-South gradient: positive if South is higher than North (slopes DOWN towards North = good)
  const southAvg = (elevationSE + elevationSW) / 2;
  const northAvg = (elevationNE + elevationNW) / 2;
  const nsDiff = southAvg - northAvg; // > 0 means sloping towards North

  const maxH = Math.max(elevationNE, elevationNW, elevationSE, elevationSW);
  const minH = Math.min(elevationNE, elevationNW, elevationSE, elevationSW);
  const heightDifference = Math.round((maxH - minH) * 10) / 10;
  
  // Plot diagonal
  const diagLen = Math.sqrt(plotW * plotW + plotH * plotH) || 50;
  const gradientPercent = Math.round((heightDifference / diagLen) * 1000) / 10;

  // Determine primary downhill slope direction
  let slopeDir: 'NE' | 'E' | 'N' | 'NW' | 'SE' | 'W' | 'S' | 'SW' | 'none' = 'none';
  let slopeDirNepali = 'समतल (बराबर)';

  if (heightDifference < 0.3) {
    return {
      slopeDirection: 'none',
      slopeDirectionNepali: 'समतल (समान स्तर)',
      gradientPercent: 0,
      heightDifference: 0,
      score: 85,
      verdictNepali: 'सन्तुलित एवं शुभ (Neutral & Balanced)',
      status: 'recommended',
      titleNepali: 'समतल भूमि (Level Plot - समतलम वास्तु)',
      classicalRule: 'समतला भूमिः सर्वसम्पत्करी शुभावहा (समतल जग्गाले सबै प्रकारको समृद्धि र कल्याण प्रदान गर्छ)।',
      effectsNepali: [
        'पञ्चतत्त्वको सन्तुलित प्रवाह र ऊर्जाको सहज वितरण',
        'घर निर्माण र जग खन्न प्राविधिक रूपमा सजिलो र बलियो',
        'कुनै प्रतिकूल वास्तु दोष नभएको सहज धरातल'
      ],
      doshasDetected: [],
      remedies: [
        'वर्षाको पानी निकासका लागि कम्पाउन्ड वाल भित्र उत्तर-पूर्वी ढलको व्यवस्था गर्नुहोस्।',
        'मुख्य भवनको जग वरपरको जमिनभन्दा १.५ देखि २.५ फिट उँचो (Plinth) राख्नुहोस्।'
      ]
    };
  }

  // Downhill angle: dx is positive Eastward, -nsDiff is negative Northward
  const dx = ewDiff;
  const dz = -nsDiff;
  const angle = Math.atan2(dz, dx);
  const deg = (angle * 180 / Math.PI + 360) % 360;

  if (deg >= 337.5 || deg < 22.5) {
    slopeDir = 'E';
    slopeDirNepali = 'पूर्व ढलान (East Downhill - इन्द्र प्लव)';
  } else if (deg >= 22.5 && deg < 67.5) {
    slopeDir = 'SE';
    slopeDirNepali = 'आग्नेय ढलान (SE Downhill - अग्नि प्लव)';
  } else if (deg >= 67.5 && deg < 112.5) {
    slopeDir = 'S';
    slopeDirNepali = 'दक्षिण ढलान (South Downhill - यम प्लव)';
  } else if (deg >= 112.5 && deg < 157.5) {
    slopeDir = 'SW';
    slopeDirNepali = 'नैरृत्य ढलान (SW Downhill - असुर प्लव)';
  } else if (deg >= 157.5 && deg < 202.5) {
    slopeDir = 'W';
    slopeDirNepali = 'पश्चिम ढलान (West Downhill - वरुण प्लव)';
  } else if (deg >= 202.5 && deg < 247.5) {
    slopeDir = 'NW';
    slopeDirNepali = 'वायव्य ढलान (NW Downhill - वायु प्लव)';
  } else if (deg >= 247.5 && deg < 292.5) {
    slopeDir = 'N';
    slopeDirNepali = 'उत्तर ढलान (North Downhill - कुबेर प्लव)';
  } else {
    slopeDir = 'NE';
    slopeDirNepali = 'ईशान ढलान (NE Downhill - ईशान प्लव)';
  }

  // Classical Vastu evaluations
  if (slopeDir === 'NE') {
    return {
      slopeDirection: 'NE',
      slopeDirectionNepali: slopeDirNepali,
      gradientPercent,
      heightDifference,
      score: 100,
      verdictNepali: 'अत्यन्त शुभ एवं ऐश्वर्यप्रद (Supreme Ishan Plava)',
      status: 'recommended',
      titleNepali: 'ईशान निम्नता (सर्वोत्तम वास्तु योग)',
      classicalRule: 'ईशाने निम्नता चेत्स्यात् धनधान्यसमृद्धिदा। पुत्रपौत्रप्रवृद्धिश्च सर्वाभीष्टफलप्रदा॥',
      effectsNepali: [
        'दैवीय चुम्बकीय ऊर्जा (Bio-Magnetic Flux) को सहज प्रवाह',
        'घरका सदस्यहरूको चौतर्फी उन्नति, मान-प्रतिष्ठा र विद्या लाभ',
        'धनधान्य, सन्तान सुख र आध्यात्मिक चेतनाको विकास'
      ],
      doshasDetected: [],
      remedies: [
        'यो प्राकृतिक ढलान अत्यन्त शुभ छ; यसलाई सुरक्षित राख्दै उत्तर-पूर्वमा खुला ठाउँ र तुलसीको मठ राख्नुहोस्।'
      ]
    };
  }

  if (slopeDir === 'E') {
    return {
      slopeDirection: 'E',
      slopeDirectionNepali: slopeDirNepali,
      gradientPercent,
      heightDifference,
      score: 95,
      verdictNepali: 'अति शुभ एवं कान्तिप्रद (Auspicious Indra Plava)',
      status: 'recommended',
      titleNepali: 'पूर्व निम्नता (सूर्य ऊर्जा योग)',
      classicalRule: 'प्राग्निम्ने धनवृद्धिश्च सौख्यं च सुमहद्भवेत्।',
      effectsNepali: [
        'प्रातःकालीन सूर्यकिरण र सकारात्मक प्राण ऊर्जाको निर्वाध प्रवेश',
        'पारिवारिक स्वास्थ्य, आरोग्यता र समाजमा उच्च प्रतिष्ठा',
        'व्यापार व्यवसाय र सरकारी कार्यमा सफलता'
      ],
      doshasDetected: [],
      remedies: [
        'पूर्व दिशामा सुन्दर बगैँचा, फूलबारी वा खुला आँगन राख्नु लाभप्रद हुन्छ।'
      ]
    };
  }

  if (slopeDir === 'N') {
    return {
      slopeDirection: 'N',
      slopeDirectionNepali: slopeDirNepali,
      gradientPercent,
      heightDifference,
      score: 95,
      verdictNepali: 'अति शुभ एवं धनदायक (Auspicious Kuber Plava)',
      status: 'recommended',
      titleNepali: 'उत्तर निम्नता (कुबेर भण्डार योग)',
      classicalRule: 'उदङ्निम्ने तु वित्ताढ्यो नित्यं मंगलमश्नुते।',
      effectsNepali: [
        'कुबेरको अनुग्रहले धन वृद्धि, नयाँ आम्दानीका स्रोतहरू खुल्ने',
        'महिला सदस्यहरूको स्वास्थ्य सबल रहने',
        'शान्ति, अध्ययन तथा बौद्धिक कार्यमा उच्च प्रगति'
      ],
      doshasDetected: [],
      remedies: [
        'उत्तर तर्फको जमिन सफा, होचो र खुला राख्नुहोस्।'
      ]
    };
  }

  if (slopeDir === 'NW') {
    return {
      slopeDirection: 'NW',
      slopeDirectionNepali: slopeDirNepali,
      gradientPercent,
      heightDifference,
      score: 60,
      verdictNepali: 'मध्यम - चञ्चलता (Moderate Vayu Plava)',
      status: 'acceptable',
      titleNepali: 'वायव्य निम्नता (वायु प्रवाह)',
      classicalRule: 'वायव्ये चञ्चला लक्ष्मीः प्रवासगमनं भवेत्।',
      effectsNepali: [
        'अनावश्यक यात्रा, बसाइँसराइ र मानसिक चञ्चलता',
        'आम्दानी राम्रो भए पनि खर्चमा नियन्त्रण हुन नसक्ने',
        'मित्र र नातेदारहरूसँग सम्बन्धमा उतारचढाव'
      ],
      doshasDetected: ['वायव्य कोणमा अधिक गहिराइ वा होचोपन'],
      remedies: [
        'वायव्य कोणमा सेतो रङको झण्डा वा धातुको विन्ड चाइम (Wind Chime) स्थापना गर्नुहोस्।',
        'नैरृत्य (SW) कोणलाई वायव्यभन्दा स्पष्ट उँचो राख्न जग वा कम्पाउन्ड वाल मजबुत बनाउनुहोस्।'
      ]
    };
  }

  if (slopeDir === 'SE') {
    return {
      slopeDirection: 'SE',
      slopeDirectionNepali: slopeDirNepali,
      gradientPercent,
      heightDifference,
      score: 40,
      verdictNepali: 'दोषयुक्त - अग्नि असन्तुलन (Agni Dosha)',
      status: 'caution',
      titleNepali: 'आग्नेय निम्नता (अग्नि प्रकोप दोष)',
      classicalRule: 'आग्नेय्यां कलहो नित्यं अग्निभीतिर्धनक्षयः।',
      effectsNepali: [
        'परिवारमा आकस्मिक रिस-राग, कलह र मनमुटाव',
        'आकस्मिक चिकित्सा खर्च वा विद्युतीय उपकरण बिग्रने भय',
        'महिलाहरूको स्वास्थ्यमा रक्तचाप वा पाचन समस्या'
      ],
      doshasDetected: ['आग्नेय कोण ईशानभन्दा होचो भएको अग्नि दोष'],
      remedies: [
        'आग्नेय कोणमा जमिन माटोले पुरेर सम्याउने वा रातो बत्ती/मार्सल पिरामिड स्थापना गर्नुहोस्।',
        'घरको पानीको मुख्य निकास आग्नेय कोणबाट नगर्नुहोस्।'
      ]
    };
  }

  if (slopeDir === 'W') {
    return {
      slopeDirection: 'W',
      slopeDirectionNepali: slopeDirNepali,
      gradientPercent,
      heightDifference,
      score: 45,
      verdictNepali: 'प्रतिकूल - आर्थिक अपव्यय (Varun Dosha)',
      status: 'caution',
      titleNepali: 'पश्चिम निम्नता (वरुण दोष)',
      classicalRule: 'पश्चिमे धनहानिः स्यात् सन्तानस्यापि पीडनम्।',
      effectsNepali: [
        'कडा परिश्रम गर्दा पनि सोचेजस्तो प्रतिफल नपाउने',
        'आर्थिक व्यय बढी भई ऋणको बोझ बढ्न सक्ने',
        'घरको मुख्य व्यक्तिको आत्मबलमा कमी'
      ],
      doshasDetected: ['पश्चिम तर्फ जमिन होचो भई पूर्व अग्लो भएको दोष'],
      remedies: [
        'पश्चिम कम्पाउन्ड वाललाई पूर्वभन्दा १-२ फिट अग्लो र बाक्लो बनाउनुहोस्।',
        'पश्चिम भागमा अग्ला रुखहरू (जस्तै अशोक वा सल्लो) रोपेर भार थप्नुहोस्।'
      ]
    };
  }

  if (slopeDir === 'S') {
    return {
      slopeDirection: 'S',
      slopeDirectionNepali: slopeDirNepali,
      gradientPercent,
      heightDifference,
      score: 25,
      verdictNepali: 'गम्भीर वास्तु दोष - यम वीथी (Yama Dosha)',
      status: 'conflict',
      titleNepali: 'दक्षिण निम्नता (यम दोष)',
      classicalRule: 'दक्षिणे रोगसन्तापो यमवीथी विनाशदा।',
      effectsNepali: [
        'परिवारका सदस्यहरूमा दीर्घ रोग र स्वास्थ्यमा गम्भीर असर',
        'सम्पत्ति ह्रास, व्यापारमा नोक्सानी र अनावश्यक कानुनी झमेला',
        'घरमा सधैं भारीपन र नकारात्मक ऊर्जा'
      ],
      doshasDetected: ['दक्षिण होचो र उत्तर अग्लो भएको शास्त्रीय यम दोष'],
      remedies: [
        'दक्षिण तर्फको जमिनमा अनिवार्य रूपमा माटो भरेर उत्तरभन्दा अग्लो बनाउनुहोस् (Terracing)।',
        'दक्षिण बाउन्ड्री वाललाई धेरै अग्लो र भारी ढुङ्गाको बनाउनुहोस्।',
        'दक्षिण सीमामा ३ वटा तामाका सूर्य यन्त्र वा पञ्चधातु पिरामिड भूमिगत प्रतिस्थापन गर्नुहोस्।'
      ]
    };
  }

  // slopeDir === 'SW'
  return {
    slopeDirection: 'SW',
    slopeDirectionNepali: slopeDirNepali,
    gradientPercent,
    heightDifference,
    score: 15,
    verdictNepali: 'महावास्तु दोष - असुर निम्नता (Severe Asura Dosha)',
    status: 'conflict',
    titleNepali: 'नैरृत्य निम्नता (राहु/नैऋत्य महादोष)',
    classicalRule: 'नैऋत्ये सर्वनाशः स्यात् कुलक्षयकरं ध्रुवम्। ईशाने चोन्नते यत्र नैऋत्ये निम्नता भवेत्॥',
    effectsNepali: [
      'स्थायित्व र सुरक्षाको गम्भीर अभाव, आकस्मिक दुर्घटनाको खतरा',
      'घरको मूली (गृहस्वामी) को आयु, स्वास्थ्य र करियरमा गम्भीर संकट',
      'सञ्चित धनको नाश र परिवारमा अशान्ति'
    ],
    doshasDetected: ['नैरृत्य कोण ईशानभन्दा होचो हुनु वास्तुशास्त्रमा सबैभन्दा गम्भीर महादोष हो'],
    remedies: [
      'नैरृत्य कोणमा ठूलो रिटेनिङ वाल (Retaining Wall) बनाई जमिन माटोले भरेर ईशानभन्दा कम्तीमा २-३ फिट अग्लो बनाउनुहोस्।',
      'नैरृत्य कोणमा ओभरहेड पानी ट्यांकी, भारी स्टोर रुम वा सबैभन्दा अग्लो संरचना निर्माण गर्नुहोस्।',
      'भूमि पूजन गरी नैरृत्य कुनामा सिसा (Lead/राहु धातु) र वास्तु शङ्कु स्थापना गर्नुहोस्।'
    ]
  };
}

/**
 * Builds the dynamic 3D Terrain mesh, contour wireframe lines, corner elevation survey pins, and slope vector arrow
 */
export function buildTerrainGroup(
  plotW: number,
  plotH: number,
  config: TerrainConfig,
  isNight: boolean
): THREE.Group {
  const group = new THREE.Group();

  // 1. Subdivided Inner Plot Terrain Geometry (32 x 32 grid for smooth curved slopes)
  const segX = 32;
  const segZ = 32;
  const plotGeo = new THREE.PlaneGeometry(plotW, plotH, segX, segZ);
  plotGeo.rotateX(-Math.PI / 2);

  // Deform vertices based on corner elevations and surface roughness
  const posAttr = plotGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getZ(i);
    const vy = getTerrainHeight(vx, vz, plotW, plotH, config);
    posAttr.setY(i, vy);
  }
  plotGeo.computeVertexNormals();

  const grassTexture = createGrassTexture();
  grassTexture.repeat.set(plotW / 10, plotH / 10);
  const plotMat = new THREE.MeshStandardMaterial({
    map: grassTexture,
    roughness: 0.85,
    metalness: 0.05
  });

  const plotMesh = new THREE.Mesh(plotGeo, plotMat);
  plotMesh.receiveShadow = true;
  group.add(plotMesh);

  // 2. Contour / Elevation Grid Lines (if enabled)
  if (config.showContourGrid) {
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(plotGeo.clone(), wireMat);
    wireMesh.position.y += 0.05; // avoid z-fighting
    group.add(wireMesh);
  }

  // 3. Surrounding External Landscape (40 x 40 segments)
  const outerW = plotW * 3.5;
  const outerH = plotH * 3.5;
  const outerGeo = new THREE.PlaneGeometry(outerW, outerH, 40, 40);
  outerGeo.rotateX(-Math.PI / 2);
  const outerPos = outerGeo.attributes.position;
  for (let i = 0; i < outerPos.count; i++) {
    const vx = outerPos.getX(i);
    const vz = outerPos.getZ(i);
    const vy = getExtendedTerrainHeight(vx, vz, plotW, plotH, config) - 0.05;
    outerPos.setY(i, vy);
  }
  outerGeo.computeVertexNormals();

  const outerGrassTex = createGrassTexture();
  outerGrassTex.repeat.set(outerW / 12, outerH / 12);
  const outerMat = new THREE.MeshStandardMaterial({
    map: outerGrassTex,
    color: 0x15803d,
    roughness: 0.95
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  outerMesh.receiveShadow = true;
  group.add(outerMesh);

  // 4. Corner Elevation Survey Pins (survey pegs with LED beacons)
  if (config.showElevationPins) {
    const corners = [
      { name: 'NE (ईशान)', x: plotW / 2, z: -plotH / 2, elev: config.elevationNE, color: 0x06b6d4 },
      { name: 'NW (वायव्य)', x: -plotW / 2, z: -plotH / 2, elev: config.elevationNW, color: 0x3b82f6 },
      { name: 'SE (आग्नेय)', x: plotW / 2, z: plotH / 2, elev: config.elevationSE, color: 0xf97316 },
      { name: 'SW (नैरृत्य)', x: -plotW / 2, z: plotH / 2, elev: config.elevationSW, color: 0xef4444 }
    ];

    corners.forEach(c => {
      const pinGroup = new THREE.Group();
      // Surveyor pole
      const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 2.5;
      pole.castShadow = true;
      pinGroup.add(pole);

      // Red/White striped survey bands
      for (let b = 0; b < 4; b++) {
        const bandGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 8);
        const bandMat = new THREE.MeshBasicMaterial({ color: b % 2 === 0 ? 0xdc2626 : 0xffffff });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.position.y = 1 + b * 1.0;
        pinGroup.add(band);
      }

      // Top beacon sphere
      const beaconGeo = new THREE.SphereGeometry(0.5, 10, 10);
      const beaconMat = new THREE.MeshBasicMaterial({ color: c.color });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 5.2;
      pinGroup.add(beacon);

      pinGroup.position.set(c.x, c.elev, c.z);
      group.add(pinGroup);
    });
  }

  // 5. 3D Downhill Slope Vector Arrow
  if (config.showSlopeArrow) {
    const analysis = calculateTerrainVastuAnalysis(config, plotW, plotH);
    if (analysis.slopeDirection !== 'none') {
      const arrowGroup = new THREE.Group();
      
      const westAvg = (config.elevationNW + config.elevationSW) / 2;
      const eastAvg = (config.elevationNE + config.elevationSE) / 2;
      const ewDiff = westAvg - eastAvg;
      const southAvg = (config.elevationSE + config.elevationSW) / 2;
      const northAvg = (config.elevationNE + config.elevationNW) / 2;
      const nsDiff = southAvg - northAvg;
      const angle = Math.atan2(-nsDiff, ewDiff);

      const arrowLen = Math.min(plotW, plotH) * 0.45;
      const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, arrowLen, 8);
      const arrowMat = new THREE.MeshStandardMaterial({
        color: analysis.score >= 80 ? 0x22c55e : (analysis.score >= 50 ? 0xeab308 : 0xef4444),
        metalness: 0.6,
        roughness: 0.3
      });
      const shaft = new THREE.Mesh(shaftGeo, arrowMat);
      shaft.position.z = arrowLen / 2;
      shaft.rotation.x = Math.PI / 2;
      arrowGroup.add(shaft);

      // Arrow head
      const headGeo = new THREE.ConeGeometry(1.0, 2.5, 8);
      const head = new THREE.Mesh(headGeo, arrowMat);
      head.position.z = arrowLen + 1.25;
      head.rotation.x = Math.PI / 2;
      arrowGroup.add(head);

      // Center height of terrain
      const centerH = getTerrainHeight(0, 0, plotW, plotH, config) + 2.0;
      arrowGroup.position.set(0, centerH, 0);
      arrowGroup.rotation.y = -angle + Math.PI / 2;

      group.add(arrowGroup);
    }
  }

  return group;
}
