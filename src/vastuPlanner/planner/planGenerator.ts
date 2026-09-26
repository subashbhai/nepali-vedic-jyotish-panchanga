// Deterministic 2D/3D Floor Plan Generator based on Vastu Zoning
// बालानन्द कर्मकाण्ड
import { 
  VastuPlannerProject, 
  GeneratedFloorPlan, 
  GeneratedFloor, 
  GeneratedRoom, 
  CompassDirection, 
  RoomCategory,
  PlannedRoom
} from '../types';
import { 
  calculateBuildingFootprint, 
  calculateGatePlacement 
} from '../geometry/plotGeometry';
import { ROOM_VASTU_RULES } from '../rules/vastuRules';

// Color palette for rooms (Tailwind soft pastel shades)
const ROOM_COLORS: Record<RoomCategory, string> = {
  pooja: '#FEF3C7', // amber-100 (gold/divine)
  kitchen: '#FFEDD5', // orange-100 (agni)
  master_bedroom: '#EDE9FE', // violet-100 (stability)
  living: '#E0F2FE', // sky-100 (prana)
  dining: '#DCFCE7', // emerald-100 (nutrition)
  bedroom: '#F1F5F9', // slate-100
  guest_room: '#F3E8FF', // purple-100
  study: '#E0E7FF', // indigo-100
  office: '#CFFAFE', // cyan-100
  bathroom: '#E0F2FE', // sky-100
  toilet: '#FEE2E2', // red-100
  staircase: '#F3F4F6', // gray-100
  lift: '#E5E7EB', // gray-200
  store: '#FEF9C3', // yellow-100
  laundry: '#F0FDFA', // teal-100
  balcony: '#F0FDF4', // green-50
  veranda: '#ECFDF5', // emerald-50
  courtyard: '#FFFFFF', // white / pure
  garage: '#E2E8F0', // slate-200
  utility: '#F1F5F9',
  other: '#F9FAFB'
};

interface GridCell {
  direction: CompassDirection | 'CENTER';
  row: number; // 0, 1, 2
  col: number; // 0, 1, 2
}

// 3x3 Vastu Mandala Grid:
// Top row (North is Up): [NW, N, NE]
// Middle row:            [W,  C, E]
// Bottom row:           [SW, S, SE]
const VASTU_GRID: GridCell[] = [
  { direction: 'NW', row: 0, col: 0 },
  { direction: 'N',  row: 0, col: 1 },
  { direction: 'NE', row: 0, col: 2 },
  { direction: 'W',  row: 1, col: 0 },
  { direction: 'CENTER', row: 1, col: 1 },
  { direction: 'E',  row: 1, col: 2 },
  { direction: 'SW', row: 2, col: 0 },
  { direction: 'S',  row: 2, col: 1 },
  { direction: 'SE', row: 2, col: 2 },
];

/**
 * Generate conceptual 2D/3D floor plan from user requirements
 */
export function generateVastuFloorPlan(project: VastuPlannerProject): GeneratedFloorPlan {
  const plotWidth = project.plotLength || 40; // in ft (horizontal length)
  const plotHeight = project.plotWidth || 30; // in ft (vertical depth)
  const setbacks = project.buildingReqs.setbacks;

  const footprint = calculateBuildingFootprint(plotWidth, plotHeight, setbacks);
  const gate = calculateGatePlacement(plotWidth, plotHeight, project.roads[0]);

  // Dimensions of a 3x3 Vastu sector
  const cellWidth = Math.round((footprint.width / 3) * 10) / 10;
  const cellHeight = Math.round((footprint.height / 3) * 10) / 10;

  const floorCount = Math.max(1, project.floorCount || 1);
  const generatedFloors: GeneratedFloor[] = [];

  const floorNames = ['भुइँतला (Ground Floor)', 'पहिलो तला (First Floor)', 'दोस्रो तला (Second Floor)', 'तेस्रो तला (Third Floor)', 'चौथो तला (Fourth Floor)'];

  for (let f = 0; f < floorCount; f++) {
    // Rooms for this floor
    const floorRooms = project.rooms.filter(r => (r.floorNumber ?? 0) === f);
    
    // If no rooms defined for upper floor, copy smart default layout
    const activeRooms: PlannedRoom[] = floorRooms.length > 0 
      ? floorRooms 
      : getFallbackRoomsForFloor(f, project.rooms);

    const generatedRoomsList: GeneratedRoom[] = [];
    const occupiedCells = new Set<string>();

    // Sort rooms by Vastu priority (Pooja, Kitchen, Master Bedroom first, then Living, then others)
    const priorityOrder: Record<RoomCategory, number> = {
      pooja: 1,
      kitchen: 2,
      master_bedroom: 3,
      living: 4,
      dining: 5,
      staircase: 6,
      toilet: 7,
      bathroom: 8,
      bedroom: 9,
      guest_room: 10,
      study: 11,
      office: 12,
      store: 13,
      laundry: 14,
      lift: 15,
      balcony: 16,
      veranda: 17,
      courtyard: 18,
      garage: 19,
      utility: 20,
      other: 21
    };

    const sortedRooms = [...activeRooms].sort((a, b) => 
      (priorityOrder[a.category] || 99) - (priorityOrder[b.category] || 99)
    );

    for (const room of sortedRooms) {
      const rule = ROOM_VASTU_RULES[room.category];
      const preferred = room.preferredDirection;

      // Find best available grid cell
      let targetCell: GridCell | undefined;

      // 1. Try user preferred direction
      if (preferred && preferred !== 'CENTER') {
        targetCell = VASTU_GRID.find(c => c.direction === preferred && !occupiedCells.has(`${c.row}-${c.col}`));
      }

      // 2. Try rule's ideal directions
      if (!targetCell && rule) {
        for (const idealDir of rule.ideal) {
          const match = VASTU_GRID.find(c => c.direction === idealDir && !occupiedCells.has(`${c.row}-${c.col}`));
          if (match) {
            targetCell = match;
            break;
          }
        }
      }

      // 3. Try acceptable directions
      if (!targetCell && rule) {
        for (const accDir of rule.acceptable) {
          const match = VASTU_GRID.find(c => c.direction === accDir && !occupiedCells.has(`${c.row}-${c.col}`));
          if (match) {
            targetCell = match;
            break;
          }
        }
      }

      // 4. Fallback to any empty cell
      if (!targetCell) {
        targetCell = VASTU_GRID.find(c => !occupiedCells.has(`${c.row}-${c.col}`));
      }

      if (!targetCell) {
        // If all 9 cells occupied, share a cell by shrinking
        targetCell = VASTU_GRID[generatedRoomsList.length % VASTU_GRID.length];
      }

      const cellKey = `${targetCell.row}-${targetCell.col}`;
      occupiedCells.add(cellKey);

      // Determine size: respect minLength/minWidth but bound inside cell
      const rW = Math.max(8, Math.min(cellWidth, room.minLength || cellWidth));
      const rH = Math.max(8, Math.min(cellHeight, room.minWidth || cellHeight));

      const roomX = Math.round(targetCell.col * cellWidth * 10) / 10;
      const roomY = Math.round(targetCell.row * cellHeight * 10) / 10;

      // Doors and windows configuration
      const doors = [
        { wall: (targetCell.row === 2 ? 'top' : 'bottom') as 'top' | 'bottom', offset: Math.round(rW * 0.5), width: 3 }
      ];

      const windows: Array<{ wall: 'top' | 'bottom' | 'left' | 'right'; offset: number; width: number }> = [];
      if (targetCell.row === 0) windows.push({ wall: 'top', offset: Math.round(rW * 0.5), width: 4 });
      if (targetCell.row === 2) windows.push({ wall: 'bottom', offset: Math.round(rW * 0.5), width: 4 });
      if (targetCell.col === 0) windows.push({ wall: 'left', offset: Math.round(rH * 0.5), width: 4 });
      if (targetCell.col === 2) windows.push({ wall: 'right', offset: Math.round(rH * 0.5), width: 4 });

      // Determine rating
      let rating: 'recommended' | 'acceptable' | 'caution' | 'conflict' = 'acceptable';
      if (rule) {
        if (rule.ideal.includes(targetCell.direction as CompassDirection)) rating = 'recommended';
        else if (rule.acceptable.includes(targetCell.direction as CompassDirection)) rating = 'acceptable';
        else if (rule.forbidden.includes(targetCell.direction as CompassDirection)) rating = 'conflict';
        else rating = 'caution';
      }

      generatedRoomsList.push({
        id: `gen-${f}-${room.id}`,
        roomId: room.id,
        nameNepali: room.nameNepali,
        category: room.category,
        x: roomX,
        y: roomY,
        width: rW,
        height: rH,
        area: Math.round(rW * rH * 10) / 10,
        direction: targetCell.direction,
        vastuRating: rating,
        color: ROOM_COLORS[room.category] || '#F9FAFB',
        doors,
        windows
      });
    }

    // Always include a staircase in S or SW sector if not already created
    const hasStair = generatedRoomsList.some(r => r.category === 'staircase');
    const staircaseObj = hasStair ? undefined : {
      x: cellWidth * 1,
      y: cellHeight * 2,
      width: cellWidth,
      height: cellHeight,
      direction: 'S'
    };

    generatedFloors.push({
      floorNumber: f,
      floorNameNepali: floorNames[f] || `${f + 1} तला`,
      rooms: generatedRoomsList,
      staircase: staircaseObj,
      passage: {
        x: cellWidth,
        y: cellHeight,
        width: cellWidth,
        height: cellHeight
      },
      balconies: f > 0 ? [
        { x: 0, y: 0, width: cellWidth, height: 4, nameNepali: 'उत्तर-पूर्व बालकनी' }
      ] : undefined
    });
  }

  // Outdoor parking in front yard/setback
  const parkingObj = project.buildingReqs.parkingRequired ? {
    x: Math.max(0, gate.x - 4),
    y: Math.max(0, gate.y > 0 ? plotHeight - 14 : 2),
    width: 12,
    height: 14,
    capacity: `${project.buildingReqs.carParkingCount || 1} कार + ${project.buildingReqs.bikeParkingCount || 2} बाइक`
  } : undefined;

  return {
    buildingBounds: {
      x: footprint.x,
      y: footprint.y,
      width: footprint.width,
      height: footprint.height
    },
    plotBounds: {
      width: plotWidth,
      height: plotHeight
    },
    floors: generatedFloors,
    parking: parkingObj,
    gate: {
      x: gate.x,
      y: gate.y,
      width: gate.width,
      direction: gate.direction
    },
    setbacksApplied: {
      north: setbacks.north || 0,
      south: setbacks.south || 0,
      east: setbacks.east || 0,
      west: setbacks.west || 0
    },
    unit: project.unit
  };
}

/**
 * Helper to generate logical upper floor rooms if user only populated Ground floor
 */
function getFallbackRoomsForFloor(floorNum: number, groundRooms: PlannedRoom[]): PlannedRoom[] {
  if (floorNum === 0) {
    return [
      { id: 'living-1', category: 'living', nameNepali: 'बैठक कोठा (Living Room)', preferredDirection: 'NE', floorNumber: 0, minLength: 12, minWidth: 14, priority: 'high' },
      { id: 'kitchen-1', category: 'kitchen', nameNepali: 'भान्सा (Kitchen)', preferredDirection: 'SE', floorNumber: 0, minLength: 10, minWidth: 10, priority: 'high' },
      { id: 'pooja-1', category: 'pooja', nameNepali: 'पूजा कोठा (Pooja Room)', preferredDirection: 'NE', floorNumber: 0, minLength: 6, minWidth: 8, priority: 'high' },
      { id: 'master-1', category: 'master_bedroom', nameNepali: 'मुख्य शयनकक्ष (Master Bed)', preferredDirection: 'SW', floorNumber: 0, minLength: 12, minWidth: 14, priority: 'high' },
      { id: 'dining-1', category: 'dining', nameNepali: 'भोजन कक्ष (Dining)', preferredDirection: 'E', floorNumber: 0, minLength: 10, minWidth: 12, priority: 'medium' },
      { id: 'toilet-1', category: 'toilet', nameNepali: 'शौचालय (Common Toilet)', preferredDirection: 'NW', floorNumber: 0, minLength: 6, minWidth: 8, priority: 'high' }
    ];
  }

  // Upper floor bedrooms & family hall
  return [
    { id: `bed-${floorNum}-1`, category: 'bedroom', nameNepali: `शयनकक्ष ${floorNum}-A`, preferredDirection: 'SW', floorNumber: floorNum, minLength: 12, minWidth: 14, priority: 'high' },
    { id: `bed-${floorNum}-2`, category: 'bedroom', nameNepali: `शयनकक्ष ${floorNum}-B`, preferredDirection: 'W', floorNumber: floorNum, minLength: 12, minWidth: 12, priority: 'medium' },
    { id: `study-${floorNum}`, category: 'study', nameNepali: 'अध्ययन कक्ष (Study Room)', preferredDirection: 'NE', floorNumber: floorNum, minLength: 10, minWidth: 10, priority: 'medium' },
    { id: `toilet-${floorNum}`, category: 'toilet', nameNepali: 'शौचालय / स्नानघर', preferredDirection: 'NW', floorNumber: floorNum, minLength: 6, minWidth: 8, priority: 'high' },
    { id: `balcony-${floorNum}`, category: 'balcony', nameNepali: 'खुला बालकनी', preferredDirection: 'E', floorNumber: floorNum, minLength: 8, minWidth: 12, priority: 'low' }
  ];
}
