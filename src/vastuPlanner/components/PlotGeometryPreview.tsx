// Interactive 2D Plot Boundary Preview with North Arrow, Roads, Gate & Setbacks
// बालानन्द कर्मकाण्ड
import React from 'react';
import { 
  VastuPlannerProject, 
  CompassDirection 
} from '../types';
import { calculatePlotGeometry, calculateBuildingFootprint, calculateGatePlacement } from '../geometry/plotGeometry';
import { Compass, Navigation } from 'lucide-react';

interface PlotGeometryPreviewProps {
  project: VastuPlannerProject;
  showFootprint?: boolean;
}

export const PlotGeometryPreview: React.FC<PlotGeometryPreviewProps> = ({
  project,
  showFootprint = true
}) => {
  const geom = calculatePlotGeometry(
    project.plotLength,
    project.plotWidth,
    project.plotShape,
    project.unit,
    project.boundaries
  );

  const footprint = calculateBuildingFootprint(geom.length, geom.width, project.buildingReqs.setbacks);
  const primaryRoad = project.roads[0] || {
    id: 'road-default',
    direction: 'E',
    width: 16,
    sideLength: geom.width,
    isMainRoad: true,
    gatePlacement: 'center',
    roadLevel: 'level'
  };
  const gate = calculateGatePlacement(geom.length, geom.width, primaryRoad);

  // Normalized coordinate system (640x480) so labels never overlap or appear disproportionate
  const V_WIDTH = 640;
  const V_HEIGHT = 480;

  // Maximum dimension including roads
  const maxPlotDim = Math.max(geom.length, geom.width);
  // Fit scale: maps 1 foot/unit into ~6.5 to 8 SVG pixels
  const scale = Math.min(320 / (geom.length || 40), 240 / (geom.width || 30));

  // Scaled dimensions
  const scaledPlotW = geom.length * scale;
  const scaledPlotH = geom.width * scale;

  // Center plot on the canvas
  const plotLeft = (V_WIDTH - scaledPlotW) / 2;
  const plotTop = (V_HEIGHT - scaledPlotH) / 2;

  // Scaled Footprint
  const fpLeft = plotLeft + footprint.x * scale;
  const fpTop = plotTop + footprint.y * scale;
  const fpWidth = footprint.width * scale;
  const fpHeight = footprint.height * scale;

  // Scaled Road
  const roadWidthPx = Math.max(28, (primaryRoad.width || 14) * scale * 0.7);

  let roadRect = { x: 0, y: 0, w: 0, h: 0, lineX1: 0, lineY1: 0, lineX2: 0, lineY2: 0, isHorizontal: false };
  if (primaryRoad.direction === 'N') {
    roadRect = {
      x: plotLeft - 30,
      y: plotTop - roadWidthPx - 10,
      w: scaledPlotW + 60,
      h: roadWidthPx,
      lineX1: plotLeft - 30,
      lineY1: plotTop - roadWidthPx / 2 - 10,
      lineX2: plotLeft + scaledPlotW + 30,
      lineY2: plotTop - roadWidthPx / 2 - 10,
      isHorizontal: true
    };
  } else if (primaryRoad.direction === 'S') {
    roadRect = {
      x: plotLeft - 30,
      y: plotTop + scaledPlotH + 10,
      w: scaledPlotW + 60,
      h: roadWidthPx,
      lineX1: plotLeft - 30,
      lineY1: plotTop + scaledPlotH + 10 + roadWidthPx / 2,
      lineX2: plotLeft + scaledPlotW + 30,
      lineY2: plotTop + scaledPlotH + 10 + roadWidthPx / 2,
      isHorizontal: true
    };
  } else if (primaryRoad.direction === 'W') {
    roadRect = {
      x: plotLeft - roadWidthPx - 10,
      y: plotTop - 30,
      w: roadWidthPx,
      h: scaledPlotH + 60,
      lineX1: plotLeft - 10 - roadWidthPx / 2,
      lineY1: plotTop - 30,
      lineX2: plotLeft - 10 - roadWidthPx / 2,
      lineY2: plotTop + scaledPlotH + 30,
      isHorizontal: false
    };
  } else {
    // Default East road
    roadRect = {
      x: plotLeft + scaledPlotW + 10,
      y: plotTop - 30,
      w: roadWidthPx,
      h: scaledPlotH + 60,
      lineX1: plotLeft + scaledPlotW + 10 + roadWidthPx / 2,
      lineY1: plotTop - 30,
      lineX2: plotLeft + scaledPlotW + 10 + roadWidthPx / 2,
      lineY2: plotTop + scaledPlotH + 30,
      isHorizontal: false
    };
  }

  // Scaled Gate
  const gateSizePx = Math.max(26, gate.width * scale * 0.8);
  let gateX = plotLeft + scaledPlotW / 2 - gateSizePx / 2;
  let gateY = plotTop - 4;
  if (primaryRoad.direction === 'S') {
    gateX = plotLeft + scaledPlotW / 2 - gateSizePx / 2;
    gateY = plotTop + scaledPlotH - 4;
  } else if (primaryRoad.direction === 'E') {
    gateX = plotLeft + scaledPlotW - 4;
    gateY = plotTop + scaledPlotH / 2 - gateSizePx / 2;
  } else if (primaryRoad.direction === 'W') {
    gateX = plotLeft - 4;
    gateY = plotTop + scaledPlotH / 2 - gateSizePx / 2;
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-amber-200 dark:border-stone-800 p-4 shadow-sm flex flex-col items-center">
      {/* Top status bar */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-amber-100 dark:border-stone-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
            {project.name || 'घडेरी रेखाङ्कन'}
          </span>
          <span className="bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-sans text-[11px] font-semibold">
            {geom.length} × {geom.width} {project.unit} ({geom.area} {project.unit}²)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 text-[11px] font-medium">
          <Navigation className="w-3.5 h-3.5 text-red-600" style={{ transform: `rotate(${project.orientationAngle || 0}deg)` }} />
          <span>उत्तर {project.orientationAngle || 0}°</span>
        </div>
      </div>

      {/* SVG Canvas with normalized viewport */}
      <div className="relative w-full aspect-[4/3] max-h-[400px] my-3 flex items-center justify-center overflow-hidden rounded-xl bg-amber-50/40 dark:bg-stone-950/60 border border-amber-200/80 dark:border-stone-800">
        <svg
          viewBox={`0 0 ${V_WIDTH} ${V_HEIGHT}`}
          className="w-full h-full select-none"
        >
          <defs>
            {/* Setback hatch pattern */}
            <pattern id="setbackHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#F59E0B" strokeWidth="1" opacity="0.35" />
            </pattern>
            {/* Dimension arrow markers */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
            </marker>
          </defs>

          {/* 1. Road Geometry */}
          <g>
            <rect
              x={roadRect.x}
              y={roadRect.y}
              width={roadRect.w}
              height={roadRect.h}
              rx={6}
              fill="#334155"
              stroke="#1E293B"
              strokeWidth="1.5"
            />
            {/* Road center dashed line */}
            <line
              x1={roadRect.lineX1}
              y1={roadRect.lineY1}
              x2={roadRect.lineX2}
              y2={roadRect.lineY2}
              stroke="#FBBF24"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            {/* Road Label Badge */}
            <g transform={`translate(${roadRect.x + roadRect.w / 2}, ${roadRect.y + roadRect.h / 2})`}>
              <rect
                x="-65"
                y="-11"
                width="130"
                height="22"
                rx="11"
                fill="#1E293B"
                stroke="#64748B"
                strokeWidth="1"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="#F8FAFC"
                fontSize="10"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                {primaryRoad.name || `सडक (${primaryRoad.width} ${project.unit})`}
              </text>
            </g>
          </g>

          {/* 2. Plot Boundary Box */}
          <rect
            x={plotLeft}
            y={plotTop}
            width={scaledPlotW}
            height={scaledPlotH}
            rx={4}
            fill="#ECFDF5"
            stroke="#7A1C1C"
            strokeWidth="2.5"
          />

          {/* Setback Area Hatch */}
          {showFootprint && (
            <rect
              x={plotLeft}
              y={plotTop}
              width={scaledPlotW}
              height={scaledPlotH}
              rx={4}
              fill="url(#setbackHatch)"
            />
          )}

          {/* 3. Building Footprint */}
          {showFootprint && (
            <g>
              <rect
                x={fpLeft}
                y={fpTop}
                width={fpWidth}
                height={fpHeight}
                rx={4}
                fill="#FFFFFF"
                stroke="#2563EB"
                strokeWidth="2.2"
                filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.08))"
              />
              {/* Footprint Badge in Center */}
              <g transform={`translate(${fpLeft + fpWidth / 2}, ${fpTop + fpHeight / 2})`}>
                <rect
                  x="-75"
                  y="-18"
                  width="150"
                  height="36"
                  rx="8"
                  fill="#EFF6FF"
                  stroke="#93C5FD"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-2"
                  textAnchor="middle"
                  fill="#1E40AF"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  भवन निर्माण क्षेत्र
                </text>
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="9.5"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="600"
                >
                  {footprint.width.toFixed(1)} × {footprint.height.toFixed(1)} {project.unit} ({footprint.area} {project.unit}²)
                </text>
              </g>
            </g>
          )}

          {/* 4. Main Gate Marker */}
          <g>
            {primaryRoad.direction === 'E' || primaryRoad.direction === 'W' ? (
              <rect
                x={gateX}
                y={gateY}
                width={8}
                height={gateSizePx}
                rx={2}
                fill="#DC2626"
                stroke="#991B1B"
                strokeWidth="1.5"
              />
            ) : (
              <rect
                x={gateX}
                y={gateY}
                width={gateSizePx}
                height={8}
                rx={2}
                fill="#DC2626"
                stroke="#991B1B"
                strokeWidth="1.5"
              />
            )}
            {/* Gate Pill Label */}
            <g
              transform={`translate(${
                primaryRoad.direction === 'E'
                  ? gateX - 45
                  : primaryRoad.direction === 'W'
                  ? gateX + 50
                  : gateX + gateSizePx / 2
              }, ${
                primaryRoad.direction === 'S'
                  ? gateY - 14
                  : primaryRoad.direction === 'N'
                  ? gateY + 22
                  : gateY + gateSizePx / 2
              })`}
            >
              <rect
                x="-36"
                y="-9"
                width="72"
                height="18"
                rx="9"
                fill="#FEF2F2"
                stroke="#F87171"
                strokeWidth="1"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#B91C1C"
                fontSize="9"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                🚪 मूलद्वार (Gate)
              </text>
            </g>
          </g>

          {/* 5. Dimension Lines & Badges along 4 Cardinal Directions */}
          {/* North (Top) */}
          <g transform={`translate(${plotLeft + scaledPlotW / 2}, ${plotTop - 18})`}>
            <rect
              x="-50"
              y="-11"
              width="100"
              height="22"
              rx="11"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#334155"
              fontSize="10"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              उत्तर: {project.boundaries?.north?.length || geom.length} {project.unit}
            </text>
          </g>

          {/* South (Bottom) */}
          <g transform={`translate(${plotLeft + scaledPlotW / 2}, ${plotTop + scaledPlotH + 20})`}>
            <rect
              x="-50"
              y="-11"
              width="100"
              height="22"
              rx="11"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#334155"
              fontSize="10"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              दक्षिण: {project.boundaries?.south?.length || geom.length} {project.unit}
            </text>
          </g>

          {/* West (Left) */}
          <g transform={`translate(${plotLeft - 55}, ${plotTop + scaledPlotH / 2})`}>
            <rect
              x="-45"
              y="-11"
              width="90"
              height="22"
              rx="11"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#334155"
              fontSize="10"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              पश्चिम: {project.boundaries?.west?.length || geom.width} {project.unit}
            </text>
          </g>

          {/* East (Right) */}
          <g transform={`translate(${plotLeft + scaledPlotW + 55}, ${plotTop + scaledPlotH / 2})`}>
            <rect
              x="-45"
              y="-11"
              width="90"
              height="22"
              rx="11"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#334155"
              fontSize="10"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              पूर्व: {project.boundaries?.east?.length || geom.width} {project.unit}
            </text>
          </g>
        </svg>

        {/* Floating Compass Rose Widget */}
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border border-amber-200 dark:border-stone-800 rounded-xl p-1.5 shadow-md flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-red-600" />
          <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200">उत्तर (N)</span>
        </div>
      </div>

      {/* Legend and boundary indicators */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-100 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-100 border border-[#7A1C1C]" />
          <span>जग्गा सिमाना</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-white border border-blue-600" />
          <span>भवन संरचना</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-amber-200/60 border border-amber-500" />
          <span>सेटब्याक (खुला क्षेत्र)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-red-600" />
          <span>प्रवेशद्वार (Gate)</span>
        </div>
      </div>
    </div>
  );
};

