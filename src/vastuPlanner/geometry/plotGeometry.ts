// Plot Geometry & Spatial Math Engine for Vastu Building Planner
// बालानन्द कर्मकाण्ड
import { 
  MeasurementUnit, 
  PlotShape, 
  PlotBoundaries, 
  RoadInfo, 
  CompassDirection 
} from '../types';

export interface CalculatedPlotGeometry {
  unit: MeasurementUnit;
  length: number;
  width: number;
  area: number; // in current unit²
  areaSqFt: number; // converted to sq. ft.
  polygonPoints: Array<{ x: number; y: number }>;
  aspectRatio: number; // length / width
  isIrregular: boolean;
  boundingBox: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
}

/**
 * Convert area in unit to sq. ft.
 */
export function convertToSqFt(area: number, unit: MeasurementUnit): number {
  if (unit === 'ft') return area;
  if (unit === 'm') return area * 10.7639; // 1 m² = 10.7639 sq ft
  if (unit === 'haat') return area * 2.25; // 1 haat = 1.5 ft, 1 haat² = 2.25 sq ft
  return area;
}

/**
 * Calculate plot geometry deterministically from dimensions and boundary inputs.
 */
export function calculatePlotGeometry(
  length: number,
  width: number,
  shape: PlotShape,
  unit: MeasurementUnit,
  boundaries?: PlotBoundaries
): CalculatedPlotGeometry {
  const safeLength = Math.max(1, length || 40);
  const safeWidth = Math.max(1, width || 30);

  let calculatedArea = safeLength * safeWidth;
  let polygonPoints: Array<{ x: number; y: number }> = [];
  let isIrregular = false;

  // Check if 4 boundary lengths are provided and differ significantly
  if (boundaries) {
    const n = boundaries.north.length || safeLength;
    const s = boundaries.south.length || safeLength;
    const e = boundaries.east.length || safeWidth;
    const w = boundaries.west.length || safeWidth;

    const maxDiffLength = Math.abs(n - s);
    const maxDiffWidth = Math.abs(e - w);

    if (maxDiffLength > 1 || maxDiffWidth > 1 || shape === 'irregular') {
      isIrregular = true;
      // Brahmagupta's approximation for cyclic/convex quadrilateral area:
      const semiPerimeter = (n + s + e + w) / 2;
      const term = (semiPerimeter - n) * (semiPerimeter - s) * (semiPerimeter - e) * (semiPerimeter - w);
      if (term > 0) {
        calculatedArea = Math.round(Math.sqrt(term) * 100) / 100;
      }
      
      // Compute 4 corner points
      // Top-left: (0, 0), Top-right: (n, 0), Bottom-right: (s + (n-s)*0.2, (e+w)/2), Bottom-left: (0, w)
      const avgH = (e + w) / 2;
      polygonPoints = [
        { x: 0, y: 0 },
        { x: n, y: 0 },
        { x: s + (n > s ? (n - s) * 0.1 : 0), y: avgH },
        { x: 0, y: w }
      ];
    }
  }

  // Default standard shapes
  if (polygonPoints.length === 0) {
    if (shape === 'square') {
      const side = safeLength;
      calculatedArea = side * side;
      polygonPoints = [
        { x: 0, y: 0 },
        { x: side, y: 0 },
        { x: side, y: side },
        { x: 0, y: side }
      ];
    } else if (shape === 'l_shaped') {
      // L-Shape with 70% cutout on bottom-right
      const w1 = safeLength;
      const h1 = safeWidth;
      const cutW = safeLength * 0.4;
      const cutH = safeWidth * 0.4;
      calculatedArea = safeLength * safeWidth - cutW * cutH;
      polygonPoints = [
        { x: 0, y: 0 },
        { x: w1, y: 0 },
        { x: w1, y: h1 - cutH },
        { x: w1 - cutW, y: h1 - cutH },
        { x: w1 - cutW, y: h1 },
        { x: 0, y: h1 }
      ];
    } else {
      // Rectangular standard: (0,0) -> (L, 0) -> (L, W) -> (0, W)
      calculatedArea = safeLength * safeWidth;
      polygonPoints = [
        { x: 0, y: 0 },
        { x: safeLength, y: 0 },
        { x: safeLength, y: safeWidth },
        { x: 0, y: safeWidth }
      ];
    }
  }

  // Calculate bounding box
  const xs = polygonPoints.map(p => p.x);
  const ys = polygonPoints.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const bbWidth = maxX - minX;
  const bbHeight = maxY - minY;

  return {
    unit,
    length: safeLength,
    width: safeWidth,
    area: Math.round(calculatedArea * 100) / 100,
    areaSqFt: Math.round(convertToSqFt(calculatedArea, unit) * 100) / 100,
    polygonPoints,
    aspectRatio: Math.round((safeLength / safeWidth) * 100) / 100,
    isIrregular,
    boundingBox: { minX, minY, maxX, maxY, width: bbWidth, height: bbHeight }
  };
}

/**
 * Calculate building footprint inside plot adhering to setbacks
 */
export function calculateBuildingFootprint(
  plotWidth: number,
  plotHeight: number,
  setbacks: { north: number; south: number; east: number; west: number }
) {
  // Assume:
  // North is top (y = 0), South is bottom (y = plotHeight)
  // West is left (x = 0), East is right (x = plotWidth)
  const sbWest = Math.max(0, setbacks.west || 0);
  const sbEast = Math.max(0, setbacks.east || 0);
  const sbNorth = Math.max(0, setbacks.north || 0);
  const sbSouth = Math.max(0, setbacks.south || 0);

  const availableWidth = plotWidth - (sbWest + sbEast);
  const availableHeight = plotHeight - (sbNorth + sbSouth);

  const finalWidth = Math.max(10, availableWidth);
  const finalHeight = Math.max(10, availableHeight);

  return {
    x: sbWest,
    y: sbNorth,
    width: finalWidth,
    height: finalHeight,
    area: Math.round(finalWidth * finalHeight * 100) / 100
  };
}

/**
 * Determine gate coordinates based on road direction and placement
 */
export function calculateGatePlacement(
  plotWidth: number,
  plotHeight: number,
  road?: RoadInfo
): { x: number; y: number; width: number; direction: CompassDirection } {
  const gateWidth = 10; // 10 ft standard main gate
  if (!road) {
    // Default gate on East or North
    return {
      x: plotWidth * 0.5 - gateWidth / 2,
      y: 0,
      width: gateWidth,
      direction: 'N'
    };
  }

  const offsetRatio = road.gatePlacement === 'left' ? 0.2 : road.gatePlacement === 'right' ? 0.8 : 0.5;

  switch (road.direction) {
    case 'N':
    case 'NE':
      return {
        x: Math.max(0, Math.min(plotWidth - gateWidth, plotWidth * offsetRatio - gateWidth / 2)),
        y: 0,
        width: gateWidth,
        direction: road.direction
      };
    case 'S':
    case 'SE':
    case 'SW':
      return {
        x: Math.max(0, Math.min(plotWidth - gateWidth, plotWidth * offsetRatio - gateWidth / 2)),
        y: plotHeight,
        width: gateWidth,
        direction: road.direction
      };
    case 'E':
      return {
        x: plotWidth,
        y: Math.max(0, Math.min(plotHeight - gateWidth, plotHeight * offsetRatio - gateWidth / 2)),
        width: gateWidth,
        direction: road.direction
      };
    case 'W':
    case 'NW':
    default:
      return {
        x: 0,
        y: Math.max(0, Math.min(plotHeight - gateWidth, plotHeight * offsetRatio - gateWidth / 2)),
        width: gateWidth,
        direction: road.direction
      };
  }
}
