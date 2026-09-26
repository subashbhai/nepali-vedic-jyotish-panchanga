// Interactive 2D House Plan Generator & Plan Editor with Live Vastu Recalculation
// बालानन्द कर्मकाण्ड
import React, { useState, useRef } from 'react';
import { 
  GeneratedFloorPlan, 
  GeneratedRoom, 
  VastuPlannerProject, 
  CompassDirection 
} from '../types';
import { analyzeVastuBuildingPlan } from '../engine/vastuAnalysisEngine';
import { canUserPrintDocuments } from '../../db/subscriptionStore';
import { 
  Layers, 
  Printer, 
  Compass, 
  Move, 
  Maximize2, 
  Minimize2,
  Sparkles, 
  RotateCw,
  Eye,
  Download,
  X,
  CheckCircle2,
  FileText,
  Building2
} from 'lucide-react';
import { DIRECTION_NAMES_NEPALI } from '../rules/vastuRules';
import { TenPageLegalBlueprintModal } from './TenPageLegalBlueprintModal';
import { generateVastuFloorPlan } from '../planner/planGenerator';

interface TwoDPlanViewerProps {
  project: VastuPlannerProject;
  plan: GeneratedFloorPlan;
  onPlanUpdate?: (updatedPlan: GeneratedFloorPlan, updatedProject: VastuPlannerProject) => void;
}

export const TwoDPlanViewer: React.FC<TwoDPlanViewerProps> = ({
  project,
  plan,
  onPlanUpdate
}) => {
  const [activeFloorIndex, setActiveFloorIndex] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editFeedback, setEditFeedback] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleSetFloorCount = (newCount: number) => {
    if (!onPlanUpdate) return;
    const updatedProject: VastuPlannerProject = {
      ...project,
      floorCount: newCount,
      updatedAt: new Date().toISOString()
    };
    const updatedPlan = generateVastuFloorPlan(updatedProject);
    onPlanUpdate(updatedPlan, updatedProject);
    setEditFeedback(`भवनको तला ${newCount} तलामा परिवर्तन गरियो र सम्पूर्ण २D/३D नक्सा अपडेट भयो।`);
    setTimeout(() => setEditFeedback(null), 4000);
  };

  const activeFloor = plan.floors[activeFloorIndex] || plan.floors[0];
  const plotW = plan.plotBounds.width;
  const plotH = plan.plotBounds.height;

  // Normalized coordinate system (960 x 720) so all text, dimensions, and furniture scale pristinely
  const SVG_W = 960;
  const SVG_H = 720;

  // Scale: maps plot units (feet) into high-resolution SVG units
  const scale = Math.min(680 / (plotW || 40), 480 / (plotH || 30));
  const scaledPlotW = plotW * scale;
  const scaledPlotH = plotH * scale;

  const plotOriginX = (SVG_W - scaledPlotW) / 2;
  const plotOriginY = (SVG_H - scaledPlotH) / 2;

  // Scaled Building Bounds
  const bX = plotOriginX + plan.buildingBounds.x * scale;
  const bY = plotOriginY + plan.buildingBounds.y * scale;
  const bW = plan.buildingBounds.width * scale;
  const bH = plan.buildingBounds.height * scale;

  // Primary Road
  const road = project.roads[0] || { direction: 'E', width: 16, name: 'मुख्य सडक (१६ फिट)' };
  const roadW = Math.max(34, (road.width || 16) * scale * 0.7);

  let roadBox = { x: 0, y: 0, w: 0, h: 0, lineX1: 0, lineY1: 0, lineX2: 0, lineY2: 0, name: road.name || `सडक (${road.width} ${project.unit})` };
  if (road.direction === 'N') {
    roadBox = {
      x: plotOriginX - 40,
      y: plotOriginY - roadW - 14,
      w: scaledPlotW + 80,
      h: roadW,
      lineX1: plotOriginX - 40,
      lineY1: plotOriginY - roadW / 2 - 14,
      lineX2: plotOriginX + scaledPlotW + 40,
      lineY2: plotOriginY - roadW / 2 - 14,
      name: road.name || `उत्तर सडक (${road.width} ${project.unit})`
    };
  } else if (road.direction === 'S') {
    roadBox = {
      x: plotOriginX - 40,
      y: plotOriginY + scaledPlotH + 14,
      w: scaledPlotW + 80,
      h: roadW,
      lineX1: plotOriginX - 40,
      lineY1: plotOriginY + scaledPlotH + 14 + roadW / 2,
      lineX2: plotOriginX + scaledPlotW + 40,
      lineY2: plotOriginY + scaledPlotH + 14 + roadW / 2,
      name: road.name || `दक्षिण सडक (${road.width} ${project.unit})`
    };
  } else if (road.direction === 'W') {
    roadBox = {
      x: plotOriginX - roadW - 14,
      y: plotOriginY - 40,
      w: roadW,
      h: scaledPlotH + 80,
      lineX1: plotOriginX - 14 - roadW / 2,
      lineY1: plotOriginY - 40,
      lineX2: plotOriginX - 14 - roadW / 2,
      lineY2: plotOriginY + scaledPlotH + 40,
      name: road.name || `पश्चिम सडक (${road.width} ${project.unit})`
    };
  } else {
    // East Road
    roadBox = {
      x: plotOriginX + scaledPlotW + 14,
      y: plotOriginY - 40,
      w: roadW,
      h: scaledPlotH + 80,
      lineX1: plotOriginX + scaledPlotW + 14 + roadW / 2,
      lineY1: plotOriginY - 40,
      lineX2: plotOriginX + scaledPlotW + 14 + roadW / 2,
      lineY2: plotOriginY + scaledPlotH + 40,
      name: road.name || `पूर्व सडक (${road.width} ${project.unit})`
    };
  }

  // Swap / Move room to another sector
  const handleMoveRoomSector = (roomId: string, newDir: CompassDirection) => {
    if (!onPlanUpdate || !activeFloor) return;

    const updatedFloors = plan.floors.map((fl, fIdx) => {
      if (fIdx !== activeFloorIndex) return fl;
      const updatedRooms = fl.rooms.map(rm => {
        if (rm.id === roomId) {
          return {
            ...rm,
            direction: newDir,
            nameNepali: `${rm.nameNepali.split(' (')[0]} (${DIRECTION_NAMES_NEPALI[newDir]?.name || newDir})`
          };
        }
        return rm;
      });
      return { ...fl, rooms: updatedRooms };
    });

    const updatedPlannedRooms = project.rooms.map(pr => {
      const matched = activeFloor.rooms.find(r => r.id === roomId);
      if (matched && matched.roomId === pr.id) {
        return { ...pr, preferredDirection: newDir };
      }
      return pr;
    });

    const updatedProject: VastuPlannerProject = {
      ...project,
      rooms: updatedPlannedRooms,
      updatedAt: new Date().toISOString()
    };

    const newAnalysis = analyzeVastuBuildingPlan(updatedProject);
    updatedProject.analysisResult = newAnalysis;

    const updatedPlan: GeneratedFloorPlan = {
      ...plan,
      floors: updatedFloors
    };

    onPlanUpdate(updatedPlan, updatedProject);
    setEditFeedback(`कोठाको दिशा ${DIRECTION_NAMES_NEPALI[newDir]?.name} मा सारियो। नयाँ वास्तु स्कोर: ${newAnalysis.overallScore}%`);
    setTimeout(() => setEditFeedback(null), 4000);
  };

  const handlePrint = () => {
    const check = canUserPrintDocuments('vastu');
    if (!check.allowed) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'vastu' } }));
      }
      return;
    }
    window.print();
  };

  // Helper to render furniture icons cleanly inside rooms
  const renderRoomFurniture = (room: GeneratedRoom, rx: number, ry: number, rw: number, rh: number) => {
    const isPooja = room.nameNepali.includes('पूजा') || room.id.includes('pooja');
    const isKitchen = room.nameNepali.includes('भान्सा') || room.id.includes('kitchen');
    const isBed = room.nameNepali.includes('शयन') || room.nameNepali.includes('बेड') || room.id.includes('bed');
    const isLiving = room.nameNepali.includes('बैठक') || room.nameNepali.includes('हल') || room.id.includes('living');
    const isBath = room.nameNepali.includes('शौचालय') || room.nameNepali.includes('बाथ') || room.id.includes('toilet');

    if (isPooja) {
      return (
        <g transform={`translate(${rx + rw / 2}, ${ry + rh / 2 - 20})`}>
          <circle r="9" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
          <path d="M -4 2 Q 0 -6 4 2 Z" fill="#D97706" />
          <circle cx="0" cy="-6" r="2.5" fill="#EF4444" />
        </g>
      );
    }
    if (isKitchen) {
      return (
        <g transform={`translate(${rx + rw - 35}, ${ry + 8})`}>
          <rect x="0" y="0" width="28" height="16" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
          <circle cx="8" cy="8" r="4" fill="#94A3B8" />
          <circle cx="20" cy="8" r="4" fill="#94A3B8" />
        </g>
      );
    }
    if (isBed) {
      return (
        <g transform={`translate(${rx + 8}, ${ry + 8})`}>
          <rect x="0" y="0" width="36" height="42" rx="3" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1" />
          <rect x="4" y="4" width="13" height="10" rx="2" fill="#FFFFFF" stroke="#818CF8" strokeWidth="0.8" />
          <rect x="19" y="4" width="13" height="10" rx="2" fill="#FFFFFF" stroke="#818CF8" strokeWidth="0.8" />
        </g>
      );
    }
    if (isLiving) {
      return (
        <g transform={`translate(${rx + rw / 2 - 24}, ${ry + rh / 2 - 24})`}>
          <rect x="0" y="0" width="48" height="12" rx="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" />
          <rect x="4" y="16" width="40" height="20" rx="3" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.8" />
        </g>
      );
    }
    if (isBath) {
      return (
        <g transform={`translate(${rx + rw - 24}, ${ry + 8})`}>
          <ellipse cx="10" cy="10" rx="7" ry="9" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1" />
          <rect x="3" y="1" width="14" height="4" rx="1" fill="#BAE6FD" />
        </g>
      );
    }
    return null;
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[1000] w-screen h-screen bg-[#FAF7F2] dark:bg-stone-950 flex flex-col p-3 sm:p-4 overflow-hidden" : "space-y-4"}>
      {/* Top Controls Toolbar */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
        {/* Floor selector tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Layers className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">तला छनोट:</span>
          <div className="flex gap-1 overflow-x-auto">
            {plan.floors.map((fl, idx) => (
              <button
                key={fl.floorNumber}
                type="button"
                onClick={() => setActiveFloorIndex(idx)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeFloorIndex === idx
                    ? 'bg-[#7A1C1C] text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100'
                }`}
              >
                {fl.floorNameNepali}
              </button>
            ))}
          </div>

          {/* Quick Floor Count Selector */}
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-stone-200 dark:border-stone-700">
            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">कुल तला:</span>
            {[1, 2, 3, 4, 5].map(cnt => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleSetFloorCount(cnt)}
                className={`w-6 h-6 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                  (project.floorCount || 1) === cnt
                    ? 'bg-[#7A1C1C] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100'
                }`}
                title={`${cnt} तलाको घर बनाउने (Set ${cnt} Floors)`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            title={isFullscreen ? "सामान्य दृश्यमा फर्कनुहोस्" : "२D नक्सालाई पूर्ण स्क्रिन बनाउनुहोस् (Full Screen 2D Map)"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'सामान्य' : 'फुलस्क्रिन २D'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              isEditMode
                ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'सम्पादन मोड सक्रिय' : 'नक्सा सम्पादन'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="१०-पृष्ठ कानूनी तथा नगरपालिका नक्सा प्रिन्ट सेट (Formal 10-Page Blueprint Set)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>१०-पृष्ठ कानूनी नक्सा प्रिन्ट</span>
          </button>
        </div>
      </div>

      {/* Edit feedback alert */}
      {editFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 print:hidden">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{editFeedback}</span>
        </div>
      )}

      {/* Main 2D SVG Blueprint */}
      <div className="bg-[#FFFDF9] dark:bg-stone-950 border-2 border-stone-300 dark:border-stone-800 rounded-2xl p-2 sm:p-5 shadow-md relative overflow-x-auto print:border-none print:shadow-none print:p-0">
        
        {/* Title Badge inside blueprint */}
        <div className="flex items-center justify-between mb-3 text-xs border-b border-stone-200 dark:border-stone-800 pb-2.5">
          <div>
            <span className="font-serif font-black text-sm text-[#7A1C1C] dark:text-amber-400 block">
              {project.name} — २D वास्तु भवन नक्सा ({activeFloor?.floorNameNepali})
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              जग्गा नाप: {plotW} × {plotH} {project.unit} ({project.plotArea} {project.unit}²) | निर्माण क्षेत्र: {plan.buildingBounds.width} × {plan.buildingBounds.height} {project.unit}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-200 font-bold px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
              वास्तु मूल्याङ्कन: {project.analysisResult?.grade || 'उत्तम'} ({project.analysisResult?.overallScore || 85}%)
            </span>
          </div>
        </div>

        {/* Scaled SVG Canvas */}
        <div className="w-full aspect-[4/3] max-h-[640px] mx-auto flex items-center justify-center select-none">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-full"
          >
            <defs>
              {/* Hatching for compound / open space */}
              <pattern id="yardHatch2D" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="12" stroke="#E2E8F0" strokeWidth="1" opacity="0.6" />
              </pattern>
            </defs>

            {/* 1. Road Geometry */}
            <g>
              <rect
                x={roadBox.x}
                y={roadBox.y}
                width={roadBox.w}
                height={roadBox.h}
                rx={6}
                fill="#334155"
                stroke="#1E293B"
                strokeWidth="1.5"
              />
              <line
                x1={roadBox.lineX1}
                y1={roadBox.lineY1}
                x2={roadBox.lineX2}
                y2={roadBox.lineY2}
                stroke="#FBBF24"
                strokeWidth="2"
                strokeDasharray="8 6"
              />
              <g transform={`translate(${roadBox.x + roadBox.w / 2}, ${roadBox.y + roadBox.h / 2})`}>
                <rect x="-70" y="-11" width="140" height="22" rx="11" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
                <text x="0" y="4" textAnchor="middle" fill="#F8FAFC" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
                  {roadBox.name}
                </text>
              </g>
            </g>

            {/* 2. Plot boundary box */}
            <rect
              x={plotOriginX}
              y={plotOriginY}
              width={scaledPlotW}
              height={scaledPlotH}
              fill="url(#yardHatch2D)"
              stroke="#7A1C1C"
              strokeWidth="2.8"
              rx={3}
            />

            {/* Outdoor Parking */}
            {plan.parking && (
              <g>
                <rect
                  x={plotOriginX + plan.parking.x * scale}
                  y={plotOriginY + plan.parking.y * scale}
                  width={plan.parking.width * scale}
                  height={plan.parking.height * scale}
                  rx={4}
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x={plotOriginX + (plan.parking.x + plan.parking.width / 2) * scale}
                  y={plotOriginY + (plan.parking.y + plan.parking.height / 2 - 4) * scale}
                  textAnchor="middle"
                  fill="#92400E"
                  fontSize="10"
                  fontWeight="bold"
                >
                  🚗 गाडी पार्किङ
                </text>
                <text
                  x={plotOriginX + (plan.parking.x + plan.parking.width / 2) * scale}
                  y={plotOriginY + (plan.parking.y + plan.parking.height / 2 + 10) * scale}
                  textAnchor="middle"
                  fill="#78350F"
                  fontSize="8.5"
                >
                  {plan.parking.capacity}
                </text>
              </g>
            )}

            {/* Main Gate */}
            {plan.gate && (
              <g>
                {road.direction === 'E' || road.direction === 'W' ? (
                  <rect
                    x={road.direction === 'E' ? plotOriginX + scaledPlotW - 4 : plotOriginX - 4}
                    y={plotOriginY + scaledPlotH / 2 - 20}
                    width={8}
                    height={40}
                    rx={2}
                    fill="#DC2626"
                    stroke="#991B1B"
                    strokeWidth="1.5"
                  />
                ) : (
                  <rect
                    x={plotOriginX + scaledPlotW / 2 - 20}
                    y={road.direction === 'S' ? plotOriginY + scaledPlotH - 4 : plotOriginY - 4}
                    width={40}
                    height={8}
                    rx={2}
                    fill="#DC2626"
                    stroke="#991B1B"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            )}

            {/* 3. Building Footprint Outer Wall */}
            <rect
              x={bX}
              y={bY}
              width={bW}
              height={bH}
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="3.5"
              rx={2}
            />

            {/* Central Brahmasthan / Courtyard marker */}
            {activeFloor?.passage && (
              <g>
                <rect
                  x={bX + activeFloor.passage.x * scale}
                  y={bY + activeFloor.passage.y * scale}
                  width={activeFloor.passage.width * scale}
                  height={activeFloor.passage.height * scale}
                  fill="#FFFBEB"
                  stroke="#FCD34D"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
                <text
                  x={bX + (activeFloor.passage.x + activeFloor.passage.width / 2) * scale}
                  y={bY + (activeFloor.passage.y + activeFloor.passage.height / 2 + 3) * scale}
                  textAnchor="middle"
                  fill="#B45309"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="serif"
                >
                  ब्रह्मस्थान / प्यासेज
                </text>
              </g>
            )}

            {/* Staircase */}
            {activeFloor?.staircase && (
              <g>
                <rect
                  x={bX + activeFloor.staircase.x * scale}
                  y={bY + activeFloor.staircase.y * scale}
                  width={activeFloor.staircase.width * scale}
                  height={activeFloor.staircase.height * scale}
                  fill="#F1F5F9"
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                {[1, 2, 3, 4, 5, 6].map((st) => (
                  <line
                    key={st}
                    x1={bX + activeFloor.staircase!.x * scale}
                    y1={bY + (activeFloor.staircase!.y + (activeFloor.staircase!.height / 7) * st) * scale}
                    x2={bX + (activeFloor.staircase!.x + activeFloor.staircase!.width) * scale}
                    y2={bY + (activeFloor.staircase!.y + (activeFloor.staircase!.height / 7) * st) * scale}
                    stroke="#94A3B8"
                    strokeWidth="1"
                  />
                ))}
                <text
                  x={bX + (activeFloor.staircase.x + activeFloor.staircase.width / 2) * scale}
                  y={bY + (activeFloor.staircase.y + activeFloor.staircase.height / 2 + 4) * scale}
                  textAnchor="middle"
                  fill="#1E293B"
                  fontSize="10"
                  fontWeight="bold"
                >
                  🪜 भर्याङ (Stairs)
                </text>
              </g>
            )}

            {/* Individual Rooms */}
            {activeFloor?.rooms.map((room) => {
              const rx = bX + room.x * scale;
              const ry = bY + room.y * scale;
              const rw = room.width * scale;
              const rh = room.height * scale;

              const isSelected = selectedRoomId === room.id;
              const ratingBadge = room.vastuRating === 'recommended' ? '🟢 उत्तम' : room.vastuRating === 'conflict' ? '🔴 दोष' : '🟡 मान्य';

              return (
                <g
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className="cursor-pointer group"
                >
                  {/* Room Floor Box */}
                  <rect
                    x={rx}
                    y={ry}
                    width={rw}
                    height={rh}
                    fill={room.color || '#F8FAFC'}
                    stroke="#334155"
                    strokeWidth={isSelected ? 2.5 : 1.6}
                    className={isSelected ? 'stroke-amber-600' : 'group-hover:opacity-90'}
                  />

                  {/* Render furniture hints */}
                  {renderRoomFurniture(room, rx, ry, rw, rh)}

                  {/* Room Name Badge */}
                  <g transform={`translate(${rx + rw / 2}, ${ry + rh / 2 - 4})`}>
                    <rect
                      x="-48"
                      y="-12"
                      width="96"
                      height="20"
                      rx="4"
                      fill="#FFFFFF"
                      fillOpacity="0.9"
                      stroke="#CBD5E1"
                      strokeWidth="0.8"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#0F172A"
                      fontWeight="bold"
                      fontSize="10.5"
                      fontFamily="system-ui, sans-serif"
                    >
                      {room.nameNepali.split(' (')[0]}
                    </text>
                  </g>

                  {/* Dimensions & Area */}
                  <g transform={`translate(${rx + rw / 2}, ${ry + rh / 2 + 16})`}>
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      {room.width.toFixed(1)}' × {room.height.toFixed(1)}' ({room.area} {project.unit}²)
                    </text>
                  </g>

                  {/* Vastu Rating Indicator */}
                  <g transform={`translate(${rx + rw - 32}, ${ry + 14})`}>
                    <text
                      x="0"
                      y="0"
                      textAnchor="end"
                      fontSize="8"
                      fontWeight="bold"
                      fill={room.vastuRating === 'recommended' ? '#15803D' : room.vastuRating === 'conflict' ? '#B91C1C' : '#B45309'}
                    >
                      {ratingBadge}
                    </text>
                  </g>

                  {/* Doors */}
                  {room.doors?.map((door, dIdx) => {
                    const dw = (door.wall === 'top' || door.wall === 'bottom') ? door.width * scale : 4;
                    const dh = (door.wall === 'left' || door.wall === 'right') ? door.width * scale : 4;
                    const dx = (door.wall === 'top' || door.wall === 'bottom') ? rx + (door.offset * scale) - dw / 2 : (door.wall === 'left' ? rx - 2 : rx + rw - 2);
                    const dy = (door.wall === 'left' || door.wall === 'right') ? ry + (door.offset * scale) - dh / 2 : (door.wall === 'top' ? ry - 2 : ry + rh - 2);
                    return (
                      <g key={dIdx}>
                        <rect x={dx} y={dy} width={dw} height={dh} fill="#FFFFFF" stroke="#7A1C1C" strokeWidth="1.5" />
                        <path
                          d={door.wall === 'bottom' ? `M ${dx} ${dy} A ${dw} ${dw} 0 0 1 ${dx + dw} ${dy - dw}` : `M ${dx} ${dy} A ${dw} ${dw} 0 0 0 ${dx + dw} ${dy + dw}`}
                          fill="none"
                          stroke="#7A1C1C"
                          strokeWidth="0.8"
                          strokeDasharray="2 2"
                        />
                      </g>
                    );
                  })}

                  {/* Windows */}
                  {room.windows?.map((win, wIdx) => {
                    const ww = (win.wall === 'top' || win.wall === 'bottom') ? win.width * scale : 4;
                    const wh = (win.wall === 'left' || win.wall === 'right') ? win.width * scale : 4;
                    const wx = (win.wall === 'top' || win.wall === 'bottom') ? rx + (win.offset * scale) - ww / 2 : (win.wall === 'left' ? rx - 2 : rx + rw - 2);
                    const wy = (win.wall === 'left' || win.wall === 'right') ? ry + (win.offset * scale) - wh / 2 : (win.wall === 'top' ? ry - 2 : ry + rh - 2);
                    return (
                      <g key={wIdx}>
                        <rect x={wx} y={wy} width={ww} height={wh} fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1" />
                        <line
                          x1={win.wall === 'top' || win.wall === 'bottom' ? wx : wx + ww / 2}
                          y1={win.wall === 'top' || win.wall === 'bottom' ? wy + wh / 2 : wy}
                          x2={win.wall === 'top' || win.wall === 'bottom' ? wx + ww : wx + ww / 2}
                          y2={win.wall === 'top' || win.wall === 'bottom' ? wy + wh / 2 : wy + wh}
                          stroke="#FFFFFF"
                          strokeWidth="0.8"
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Dimension Lines around plot */}
            {/* North */}
            <g transform={`translate(${plotOriginX + scaledPlotW / 2}, ${plotOriginY - 14})`}>
              <rect x="-45" y="-10" width="90" height="20" rx="10" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              <text x="0" y="4" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="bold">
                उत्तर: {plotW} {project.unit}
              </text>
            </g>
            {/* South */}
            <g transform={`translate(${plotOriginX + scaledPlotW / 2}, ${plotOriginY + scaledPlotH + 16})`}>
              <rect x="-45" y="-10" width="90" height="20" rx="10" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              <text x="0" y="4" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="bold">
                दक्षिण: {plotW} {project.unit}
              </text>
            </g>
            {/* West */}
            <g transform={`translate(${plotOriginX - 52}, ${plotOriginY + scaledPlotH / 2})`}>
              <rect x="-45" y="-10" width="90" height="20" rx="10" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              <text x="0" y="4" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="bold">
                पश्चिम: {plotH} {project.unit}
              </text>
            </g>
            {/* East */}
            <g transform={`translate(${plotOriginX + scaledPlotW + 52}, ${plotOriginY + scaledPlotH / 2})`}>
              <rect x="-45" y="-10" width="90" height="20" rx="10" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
              <text x="0" y="4" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="bold">
                पूर्व: {plotH} {project.unit}
              </text>
            </g>

            {/* Compass Rose */}
            <g transform={`translate(${plotOriginX + scaledPlotW - 35}, ${plotOriginY + 35})`}>
              <circle r="22" fill="#FFFFFF" stroke="#7A1C1C" strokeWidth="1.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
              <polygon points="0,-18 5,0 -5,0" fill="#DC2626" />
              <polygon points="0,18 5,0 -5,0" fill="#4B5563" />
              <polygon points="18,0 0,5 0,-5" fill="#9CA3AF" />
              <polygon points="-18,0 0,5 0,-5" fill="#9CA3AF" />
              <text y="-22" textAnchor="middle" fill="#DC2626" fontSize="10" fontWeight="bold">N</text>
            </g>
          </svg>
        </div>

        {/* Selected Room Editor Panel (when in Edit Mode) */}
        {isEditMode && selectedRoomId && (
          <div className="mt-4 p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-stone-900 shadow-sm space-y-3 print:hidden">
            {(() => {
              const selectedRoom = activeFloor?.rooms.find(r => r.id === selectedRoomId);
              if (!selectedRoom) return null;

              return (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#7A1C1C] dark:text-amber-400">
                      कोठा सम्पादन: {selectedRoom.nameNepali}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      हालको दिशा: {DIRECTION_NAMES_NEPALI[selectedRoom.direction as CompassDirection]?.name || selectedRoom.direction}
                    </span>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      दिशा सार्नुहोस् (Vastu Recalculation):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'] as CompassDirection[]).map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => handleMoveRoomSector(selectedRoom.id, d)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            selectedRoom.direction === d
                              ? 'bg-[#7A1C1C] text-white border-[#7A1C1C]'
                              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-amber-400'
                          }`}
                        >
                          {DIRECTION_NAMES_NEPALI[d].name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Blueprint Legend */}
      <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-amber-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400 print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>उत्तम वास्तु (Recommended)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>स्वीकार्य (Acceptable)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>वास्तु दोष (Conflict)</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 bg-blue-500 rounded-xs" />
            <span>झ्याल (Window)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 bg-white border border-red-700 rounded-xs" />
            <span>ढोका (Door)</span>
          </div>
        </div>
      </div>

      {/* 10-Page Formal Legal Blueprint Modal */}
      {showPrintModal && (
        <TenPageLegalBlueprintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          project={project}
          plan={plan}
          onProjectUpdate={(updatedProj, updatedPlan) => {
            if (onPlanUpdate) {
              onPlanUpdate(updatedPlan, updatedProj);
            }
          }}
        />
      )}
    </div>
  );
};

