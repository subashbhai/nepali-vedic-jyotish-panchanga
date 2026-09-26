// Step-by-Step Vastu Building Planner Wizard
// बालानन्द कर्मकाण्ड
import React, { useState } from 'react';
import { 
  VastuPlannerProject, 
  MeasurementUnit, 
  PlotShape, 
  BoundaryType, 
  CompassDirection, 
  RoadInfo, 
  RoomCategory, 
  PlannedRoom,
  VastuProfile
} from '../types';
import { 
  Building2, 
  MapPin, 
  Compass, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Layers, 
  Home, 
  Navigation,
  Car,
  Trees,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PlotGeometryPreview } from './PlotGeometryPreview';
import { DIRECTION_NAMES_NEPALI } from '../rules/vastuRules';

interface PlotStepWizardProps {
  project: VastuPlannerProject;
  onChange: (updated: VastuPlannerProject) => void;
  onGeneratePlan: () => void;
}

export const PlotStepWizard: React.FC<PlotStepWizardProps> = ({
  project,
  onChange,
  onGeneratePlan
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 8;
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Helper to update project fields
  const update = (partial: Partial<VastuPlannerProject>) => {
    onChange({ ...project, ...partial, updatedAt: new Date().toISOString() });
  };

  // Step 1: Calculate area automatically when length or width changes
  const handleDimensionChange = (field: 'plotLength' | 'plotWidth', val: number) => {
    const newL = field === 'plotLength' ? val : project.plotLength;
    const newW = field === 'plotWidth' ? val : project.plotWidth;
    const newArea = Math.round(newL * newW * 100) / 100;
    update({
      [field]: val,
      plotArea: newArea,
      boundaries: {
        ...project.boundaries,
        north: { ...project.boundaries.north, length: newL },
        south: { ...project.boundaries.south, length: newL },
        east: { ...project.boundaries.east, length: newW },
        west: { ...project.boundaries.west, length: newW }
      }
    });
  };

  // Browser Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('तपाईंको ब्राउजरले Geolocation समर्थन गर्दैन। कृपया म्यानुअल्ली भर्नुहोस्।');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        update({
          geoLocation: {
            ...project.geoLocation,
            latitude: Math.round(pos.coords.latitude * 10000) / 10000,
            longitude: Math.round(pos.coords.longitude * 10000) / 10000,
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : project.geoLocation.altitude,
            locationName: 'मेरो वर्तमान स्थान (GPS)'
          }
        });
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(`स्थान पत्ता लगाउन सकिएन: ${err.message}। म्यानुअल रूपमा राख्न सक्नुहुन्छ।`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Road Handlers
  const handleAddRoad = () => {
    const newRoad: RoadInfo = {
      id: `road-${Date.now()}`,
      direction: 'N',
      width: 12,
      sideLength: project.plotLength || 40,
      isMainRoad: project.roads.length === 0,
      gatePlacement: 'center',
      roadLevel: 'level',
      name: `सडक ${project.roads.length + 1}`
    };
    update({ roads: [...project.roads, newRoad] });
  };

  const handleUpdateRoad = (idx: number, updated: Partial<RoadInfo>) => {
    const copy = [...project.roads];
    copy[idx] = { ...copy[idx], ...updated };
    update({ roads: copy });
  };

  const handleRemoveRoad = (idx: number) => {
    if (project.roads.length <= 1) return;
    const copy = project.roads.filter((_, i) => i !== idx);
    update({ roads: copy });
  };

  // Room Builder Handlers
  const handleAddRoom = () => {
    const newRoom: PlannedRoom = {
      id: `room-${Date.now()}`,
      category: 'bedroom',
      nameNepali: 'नयाँ कोठा',
      preferredDirection: 'W',
      floorNumber: 0,
      minLength: 12,
      minWidth: 12,
      attachedToilet: false,
      priority: 'medium'
    };
    update({ rooms: [...project.rooms, newRoom] });
  };

  const handleUpdateRoom = (idx: number, updated: Partial<PlannedRoom>) => {
    const copy = [...project.rooms];
    copy[idx] = { ...copy[idx], ...updated };
    update({ rooms: copy });
  };

  const handleRemoveRoom = (idx: number) => {
    const copy = project.rooms.filter((_, i) => i !== idx);
    update({ rooms: copy });
  };

  // Validation before generating plan
  const validateAndGenerate = () => {
    if (!project.plotLength || project.plotLength <= 0 || !project.plotWidth || project.plotWidth <= 0) {
      alert('कृपया जग्गाको लम्बाइ र चौडाइ अनिवार्य भर्नुहोस्।');
      setCurrentStep(1);
      return;
    }
    if (project.rooms.length === 0) {
      alert('कृपया कमसेकम एउटा कोठा थप्नुहोस्।');
      setCurrentStep(7);
      return;
    }
    onGeneratePlan();
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar Steps */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 font-bold mb-2">
          <span>चरण {currentStep} को {totalSteps}</span>
          <span className="text-[#7A1C1C] dark:text-amber-400 font-serif">
            {currentStep === 1 && 'जग्गाको आधारभूत विवरण'}
            {currentStep === 2 && 'चारै सिमानाको विवरण'}
            {currentStep === 3 && 'सडक तथा बाटो'}
            {currentStep === 4 && 'भौगोलिक अवस्थिति र कम्पास'}
            {currentStep === 5 && 'भू-आकृति र ढलान'}
            {currentStep === 6 && 'घरको आवश्यकता र सेटब्याक'}
            {currentStep === 7 && 'तला संख्या र कोठाहरू'}
            {currentStep === 8 && 'वास्तु प्राथमिकता'}
          </span>
        </div>
        <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#7A1C1C] dark:bg-amber-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Buttons for quick navigation */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setCurrentStep(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                currentStep === s
                  ? 'bg-[#7A1C1C] text-white'
                  : currentStep > s
                  ? 'bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300'
                  : 'bg-stone-100 dark:bg-stone-800/60 text-stone-500'
              }`}
            >
              चरण {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form + Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          
          {/* STEP 1: BASIC PLOT DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span>चरण १ — जग्गाको आधारभूत विवरण</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जग्गाको नाम / पहिचान <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="उदा: काठमाडौं घडेरी, गृहस्वामी"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    नापको एकाइ (Measurement Unit)
                  </label>
                  <select
                    value={project.unit}
                    onChange={(e) => update({ unit: e.target.value as MeasurementUnit })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="ft">फिट (Feet - ft)</option>
                    <option value="m">मिटर (Meter - m)</option>
                    <option value="haat">हात (Haat - १ हात = १.५ फिट)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जग्गाको लम्बाइ (Length) [{project.unit}] <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="0.5"
                    value={project.plotLength || ''}
                    onChange={(e) => handleDimensionChange('plotLength', parseFloat(e.target.value) || 0)}
                    placeholder="उदा: 40"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जग्गाको चौडाइ (Width) [{project.unit}] <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="0.5"
                    value={project.plotWidth || ''}
                    onChange={(e) => handleDimensionChange('plotWidth', parseFloat(e.target.value) || 0)}
                    placeholder="उदा: 30"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Automatic Area Output Box */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-900 dark:text-amber-200 font-bold block">
                    कुल क्षेत्रफल (Automatic Calculation):
                  </span>
                  <span className="text-lg font-black text-[#7A1C1C] dark:text-amber-300">
                    {project.plotArea} {project.unit}²
                  </span>
                  {project.unit !== 'ft' && (
                    <span className="text-xs text-stone-500 ml-2">
                      (करिब {project.unit === 'm' ? (project.plotArea * 10.7639).toFixed(1) : (project.plotArea * 2.25).toFixed(1)} sq.ft.)
                    </span>
                  )}
                </div>
                <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                  <span>अनुपात: {((project.plotLength || 1) / (project.plotWidth || 1)).toFixed(2)}:1</span>
                </div>
              </div>

              {/* Plot Shape */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  जग्गाको आकार (Plot Shape)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'rectangular', label: 'आयताकार (Rectangular)' },
                    { id: 'square', label: 'वर्गाकार (Square)' },
                    { id: 'l_shaped', label: 'L-आकार (L-Shaped)' },
                    { id: 'irregular', label: 'अनियमित (Irregular)' }
                  ].map(shape => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => update({ plotShape: shape.id as PlotShape })}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        project.plotShape === shape.id
                          ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-sm'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Floors Selection */}
              <div className="bg-amber-50/60 dark:bg-stone-800/60 border border-amber-300 dark:border-stone-700 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>कति तलाको घर बनाउने हो? (Building Floors):</span>
                  </label>
                  <span className="text-xs font-bold bg-amber-400 text-stone-900 px-2.5 py-0.5 rounded-full">
                    {project.floorCount || 1} तला प्रस्तावित
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => update({ floorCount: cnt })}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        (project.floorCount || 1) === cnt
                          ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-sm'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:bg-amber-100/50'
                      }`}
                    >
                      {cnt} तला {cnt === 1 ? '(Ground)' : cnt === 2 ? '(G+1)' : cnt === 3 ? '(G+2)' : `(G+${cnt-1})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 4-DIRECTION BOUNDARIES */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" />
                <span>चरण २ — जग्गाको चार दिशाको वास्तविक विवरण</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                चारै दिशाको वास्तविक सिमाना लम्बाइ र प्रकार भर्नुहोस्। यदि लम्बाइ फरक छ भने system ले अनियमित जग्गाको रूपमा विश्लेषण गर्छ।
              </p>

              {(['north', 'south', 'east', 'west'] as const).map(dir => {
                const label = dir === 'north' ? 'उत्तर (North)' : dir === 'south' ? 'दक्षिण (South)' : dir === 'east' ? 'पूर्व (East)' : 'पश्चिम (West)';
                const side = project.boundaries[dir];
                return (
                  <div key={dir} className="p-3 rounded-xl border border-amber-200 dark:border-stone-800 bg-amber-50/20 dark:bg-stone-800/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                        {label} सिमाना लम्बाइ [{project.unit}]
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={side.length || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          update({
                            boundaries: {
                              ...project.boundaries,
                              [dir]: { ...side, length: val }
                            }
                          });
                        }}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                        सिमानाको प्रकार (Boundary Type)
                      </label>
                      <select
                        value={side.boundaryType}
                        onChange={(e) => {
                          update({
                            boundaries: {
                              ...project.boundaries,
                              [dir]: { ...side, boundaryType: e.target.value as BoundaryType }
                            }
                          });
                        }}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      >
                        <option value="neighbor">छिमेकी जग्गा (Neighbor)</option>
                        <option value="open">खुला ठाउँ (Open Land)</option>
                        <option value="road">सडक / बाटो (Road)</option>
                        <option value="river">खोला / नदी (River/Stream)</option>
                        <option value="mountain">पहाड / डाँडा (Hill)</option>
                        <option value="building">अग्लो भवन (Tall Building)</option>
                        <option value="other">अन्य (Other)</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 3: ROAD / बाटो विवरण */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-amber-600" />
                  <span>चरण ३ — ROAD / बाटो विवरण</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddRoad}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>अर्को बाटो थप्नुहोस्</span>
                </button>
              </div>

              {project.roads.map((road, idx) => (
                <div key={road.id || idx} className="p-4 rounded-xl border border-amber-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                    <span className="font-bold text-xs text-[#7A1C1C] dark:text-amber-400">
                      सडक #{idx + 1} {road.isMainRoad ? '(मुख्य सडक)' : ''}
                    </span>
                    {project.roads.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRoad(idx)}
                        className="text-red-600 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>हटाउनुहोस्</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        बाटोको दिशा (Road Direction)
                      </label>
                      <select
                        value={road.direction}
                        onChange={(e) => handleUpdateRoad(idx, { direction: e.target.value as CompassDirection })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      >
                        <option value="N">उत्तर (North)</option>
                        <option value="NE">उत्तर-पूर्व (North-East)</option>
                        <option value="E">पूर्व (East)</option>
                        <option value="SE">दक्षिण-पूर्व (South-East)</option>
                        <option value="S">दक्षिण (South)</option>
                        <option value="SW">दक्षिण-पश्चिम (South-West)</option>
                        <option value="W">पश्चिम (West)</option>
                        <option value="NW">उत्तर-पश्चिम (North-West)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        सडकको चौडाइ (Width) [{project.unit}]
                      </label>
                      <input
                        type="number"
                        value={road.width || ''}
                        onChange={(e) => handleUpdateRoad(idx, { width: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        प्रवेशद्वारको सम्भावित स्थान (Gate)
                      </label>
                      <select
                        value={road.gatePlacement}
                        onChange={(e) => handleUpdateRoad(idx, { gatePlacement: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      >
                        <option value="left">बायाँ (Left)</option>
                        <option value="center">केन्द्र (Center)</option>
                        <option value="right">दायाँ (Right)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        सडकको सतह (Road Level)
                      </label>
                      <select
                        value={road.roadLevel}
                        onChange={(e) => handleUpdateRoad(idx, { roadLevel: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      >
                        <option value="level">जग्गासँग समान (Level)</option>
                        <option value="higher">जग्गाभन्दा अग्लो (Higher)</option>
                        <option value="lower">जग्गाभन्दा होचो (Lower)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800 dark:text-stone-200">
                        <input
                          type="checkbox"
                          checked={road.isMainRoad}
                          onChange={(e) => handleUpdateRoad(idx, { isMainRoad: e.target.checked })}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span>मुख्य सडक (Main Road)</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: GEO LOCATION & ORIENTATION COMPASS */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <span>चरण ४ — GEO LOCATION र कम्पास अभिमुखीकरण</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{geoLoading ? 'स्थान लिँदै...' : 'मेरो स्थान प्रयोग गर्नुहोस् (GPS)'}</span>
                </button>
              </div>

              {geoError && (
                <div className="p-2.5 bg-amber-50 dark:bg-stone-800 text-amber-800 dark:text-amber-300 text-xs rounded-xl border border-amber-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{geoError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Latitude (अक्षांश)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={project.geoLocation.latitude || ''}
                    onChange={(e) => update({ geoLocation: { ...project.geoLocation, latitude: parseFloat(e.target.value) || 0 } })}
                    placeholder="27.7172"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Longitude (देशान्तर)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={project.geoLocation.longitude || ''}
                    onChange={(e) => update({ geoLocation: { ...project.geoLocation, longitude: parseFloat(e.target.value) || 0 } })}
                    placeholder="85.3240"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    स्थानको नाम (Location Name)
                  </label>
                  <input
                    type="text"
                    value={project.geoLocation.locationName}
                    onChange={(e) => update({ geoLocation: { ...project.geoLocation, locationName: e.target.value } })}
                    placeholder="काठमाडौं, नेपाल"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जिल्ला / प्रदेश
                  </label>
                  <input
                    type="text"
                    value={project.geoLocation.district || ''}
                    onChange={(e) => update({ geoLocation: { ...project.geoLocation, district: e.target.value } })}
                    placeholder="बागमती प्रदेश"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Interactive Orientation Compass slider */}
              <div className="p-4 bg-amber-50/50 dark:bg-stone-800/50 rounded-xl border border-amber-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-red-600" />
                    <span>Plot Orientation (उत्तर दिशा विचलन कोण): {project.orientationAngle}°</span>
                  </label>
                  <span className="text-xs font-serif font-bold text-amber-800 dark:text-amber-300">
                    {project.orientationAngle === 0 ? 'सत्य उत्तर (True North)' : `${project.orientationAngle}° झुकाव`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={project.orientationAngle}
                  onChange={(e) => update({ orientationAngle: parseInt(e.target.value) || 0 })}
                  className="w-full accent-[#7A1C1C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>०° (North)</span>
                  <span>९०° (East)</span>
                  <span>१८०° (South)</span>
                  <span>२७०° (West)</span>
                  <span>३५९°</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SITE DETAILS & SLOPE */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                <Trees className="w-5 h-5 text-amber-600" />
                <span>चरण ५ — भू-आकृति र ढलान (Site Details)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जग्गाको समथरता
                  </label>
                  <select
                    value={project.siteConditions.isFlat ? 'yes' : 'no'}
                    onChange={(e) => update({ siteConditions: { ...project.siteConditions, isFlat: e.target.value === 'yes' } })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="yes">जग्गा समथर छ (Flat)</option>
                    <option value="no">जग्गामा ढलान छ (Sloped)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ढलान दिशा (Slope Direction)
                  </label>
                  <select
                    value={project.siteConditions.slopeDirection}
                    onChange={(e) => update({ siteConditions: { ...project.siteConditions, slopeDirection: e.target.value as any } })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="none">कुनै ढलान छैन (समथर)</option>
                    <option value="NE">उत्तर-पूर्व (ईशान - सर्वोत्तम)</option>
                    <option value="N">उत्तर (North - उत्तम)</option>
                    <option value="E">पूर्व (East - उत्तम)</option>
                    <option value="NW">उत्तर-पश्चिम (वायव्य)</option>
                    <option value="SE">दक्षिण-पूर्व (आग्नेय)</option>
                    <option value="W">पश्चिम (West)</option>
                    <option value="S">दक्षिण (South - दोष)</option>
                    <option value="SW">दक्षिण-पश्चिम (नैऋत्य - महादोष)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    वर्षाको पानी निकास दिशा
                  </label>
                  <select
                    value={project.siteConditions.waterDrainageDirection}
                    onChange={(e) => update({ siteConditions: { ...project.siteConditions, waterDrainageDirection: e.target.value as any } })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="NE">उत्तर-पूर्व (ईशान - सर्वोत्कृष्ट)</option>
                    <option value="N">उत्तर (North)</option>
                    <option value="E">पूर्व (East)</option>
                    <option value="NW">उत्तर-पश्चिम (वायव्य)</option>
                    <option value="SE">दक्षिण-पूर्व (आग्नेय)</option>
                    <option value="W">पश्चिम (West)</option>
                    <option value="S">दक्षिण (South)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.siteConditions.nearbyWaterBody}
                      onChange={(e) => update({ siteConditions: { ...project.siteConditions, nearbyWaterBody: e.target.checked } })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>नजिकै नदी, खोला वा पोखरी छ</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.siteConditions.nearbyMountainOrHighRise}
                      onChange={(e) => update({ siteConditions: { ...project.siteConditions, nearbyMountainOrHighRise: e.target.checked } })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>नजिकै अग्लो पहाड वा ठूलो भवन छ</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.siteConditions.existingTreeOrWell}
                      onChange={(e) => update({ siteConditions: { ...project.siteConditions, existingTreeOrWell: e.target.checked } })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>जग्गाभित्र पुरानो रुख, इनार वा मन्दिर छ</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: BUILDING REQUIREMENTS & SETBACKS */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-600" />
                <span>चरण ६ — घरको आवश्यकता र सेटब्याक (Setbacks)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    भवनको प्रकार (Building Type)
                  </label>
                  <select
                    value={project.buildingReqs.buildingType}
                    onChange={(e) => update({ buildingReqs: { ...project.buildingReqs, buildingType: e.target.value as any } })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="residential">आवासीय घर (Residential)</option>
                    <option value="office">कार्यालय / व्यापारिक (Office)</option>
                    <option value="mixed">मिश्रित (Residential + Commercial)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    भवनको कुल तला (Floors)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => update({ floorCount: cnt })}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                          (project.floorCount || 1) === cnt
                            ? 'bg-[#7A1C1C] text-white border-[#7A1C1C]'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                        }`}
                      >
                        {cnt} तला
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    पार्किङ आवश्यकता
                  </label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.buildingReqs.parkingRequired}
                        onChange={(e) => update({ buildingReqs: { ...project.buildingReqs, parkingRequired: e.target.checked } })}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <span>पार्किङ चाहिन्छ</span>
                    </label>
                    {project.buildingReqs.parkingRequired && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={project.buildingReqs.carParkingCount}
                          onChange={(e) => update({ buildingReqs: { ...project.buildingReqs, carParkingCount: parseInt(e.target.value) || 1 } })}
                          className="w-16 px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-700"
                        />
                        <span className="text-xs text-stone-500">कार</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Setbacks Input */}
              <div className="p-3.5 bg-amber-50/40 dark:bg-stone-800/40 rounded-xl border border-amber-200 dark:border-stone-800 space-y-2">
                <span className="block text-xs font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                  चारै दिशाको खुला ठाउँ / सेटब्याक (Setbacks) [{project.unit}]
                </span>
                <p className="text-[11px] text-stone-500">
                  वास्तु नियम: उत्तर र पूर्वमा खुला ठाउँ दक्षिण र पश्चिम भन्दा बढी वा बराबर हुनुपर्छ।
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      उत्तर (North)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={project.buildingReqs.setbacks.north}
                      onChange={(e) => update({
                        buildingReqs: {
                          ...project.buildingReqs,
                          setbacks: { ...project.buildingReqs.setbacks, north: parseFloat(e.target.value) || 0 }
                        }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      पूर्व (East)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={project.buildingReqs.setbacks.east}
                      onChange={(e) => update({
                        buildingReqs: {
                          ...project.buildingReqs,
                          setbacks: { ...project.buildingReqs.setbacks, east: parseFloat(e.target.value) || 0 }
                        }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      दक्षिण (South)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={project.buildingReqs.setbacks.south}
                      onChange={(e) => update({
                        buildingReqs: {
                          ...project.buildingReqs,
                          setbacks: { ...project.buildingReqs.setbacks, south: parseFloat(e.target.value) || 0 }
                        }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      पश्चिम (West)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={project.buildingReqs.setbacks.west}
                      onChange={(e) => update({
                        buildingReqs: {
                          ...project.buildingReqs,
                          setbacks: { ...project.buildingReqs.setbacks, west: parseFloat(e.target.value) || 0 }
                        }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: FLOORS & ROOM BUILDER */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-600" />
                  <span>चरण ७ — तला संख्या र कोठाहरू</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddRoom}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>कोठा थप्नुहोस्</span>
                </button>
              </div>

              {/* Floor count selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  घरको तला संख्या (Total Floors):
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => update({ floorCount: cnt })}
                      className={`w-9 h-8 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        project.floorCount === cnt
                          ? 'bg-[#7A1C1C] text-white border-[#7A1C1C]'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                      }`}
                    >
                      {cnt === 1 ? '१ (G)' : `${cnt}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room list */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {project.rooms.map((room, idx) => (
                  <div key={room.id || idx} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">प्रकार</label>
                      <select
                        value={room.category}
                        onChange={(e) => handleUpdateRoom(idx, { category: e.target.value as RoomCategory })}
                        className="w-full px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                      >
                        <option value="living">बैठक (Living)</option>
                        <option value="kitchen">भान्सा (Kitchen)</option>
                        <option value="pooja">पूजा कोठा (Pooja)</option>
                        <option value="master_bedroom">मुख्य शयनकक्ष (Master Bed)</option>
                        <option value="bedroom">शयनकक्ष (Bedroom)</option>
                        <option value="dining">भोजन (Dining)</option>
                        <option value="guest_room">अतिथि (Guest)</option>
                        <option value="study">अध्ययन (Study)</option>
                        <option value="office">कार्यालय (Office)</option>
                        <option value="toilet">शौचालय (Toilet)</option>
                        <option value="bathroom">स्नानघर (Bathroom)</option>
                        <option value="staircase">भर्याङ (Stairs)</option>
                        <option value="store">भण्डार (Store)</option>
                        <option value="balcony">बालकनी (Balcony)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">नाम</label>
                      <input
                        type="text"
                        value={room.nameNepali}
                        onChange={(e) => handleUpdateRoom(idx, { nameNepali: e.target.value })}
                        className="w-full px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">इच्छित दिशा</label>
                      <select
                        value={room.preferredDirection || 'CENTER'}
                        onChange={(e) => handleUpdateRoom(idx, { preferredDirection: e.target.value as any })}
                        className="w-full px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                      >
                        <option value="NE">उत्तर-पूर्व (ईशान)</option>
                        <option value="N">उत्तर (North)</option>
                        <option value="E">पूर्व (East)</option>
                        <option value="SE">दक्षिण-पूर्व (आग्नेय)</option>
                        <option value="S">दक्षिण (South)</option>
                        <option value="SW">दक्षिण-पश्चिम (नैऋत्य)</option>
                        <option value="W">पश्चिम (West)</option>
                        <option value="NW">उत्तर-पश्चिम (वायव्य)</option>
                        <option value="CENTER">केन्द्र (ब्रह्मस्थान)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-3 sm:pt-0">
                      <div className="text-[11px] text-stone-600 dark:text-stone-400">
                        <span>तला: {room.floorNumber === 0 ? 'Ground' : `${room.floorNumber + 1}`}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoom(idx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: VASTU PREFERENCE & GENERATION */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>चरण ८ — वास्तु प्रोफाइल र प्रारम्भिक नक्सा निर्माण</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'standard', label: 'सामान्य वास्तु', desc: 'आधारभूत दिशा सन्तुलन र खुला ठाउँ नियम' },
                  { id: 'vedic', label: 'परम्परागत वैदिक वास्तु', desc: '८१-पद वास्तुपुरुष मण्डल, पञ्चतत्त्व र दिशा देवता सन्तुलन' },
                  { id: 'residential', label: 'आवासीय वास्तु', desc: 'आधुनिक पारिवारिक सुविधा र वास्तु समन्वय' },
                  { id: 'comprehensive', label: 'विस्तृत वास्तु विश्लेषण', desc: 'गहन मण्डल गणना, तोडफोडविहीन उपचार र पूर्ण प्रतिवेदन' }
                ].map(p => (
                  <div
                    key={p.id}
                    onClick={() => update({ vastuProfile: p.id as VastuProfile })}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      project.vastuProfile === p.id
                        ? 'border-[#7A1C1C] bg-amber-50/60 dark:bg-amber-950/40 text-stone-900 dark:text-amber-100 shadow-sm'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{p.label}</span>
                      {project.vastuProfile === p.id && <CheckCircle2 className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>

              {/* Final action banner */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-700 to-red-800 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm">सबै विवरण भरिसक्नुभयो?</h4>
                  <p className="text-xs text-amber-200">
                    प्रणालीले जग्गाको ज्यामिति, बाटो र वास्तु नियम अनुसार २D नक्सा र ३D दृश्य तयार गर्नेछ।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={validateAndGenerate}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm shadow-lg cursor-pointer transition flex items-center gap-2 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>वास्तु अनुसार प्रारम्भिक नक्सा बनाउनुहोस्</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons (Previous / Next) */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>अघिल्लो</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#7A1C1C] hover:bg-[#5C1515] text-white cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>अर्को चरण</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={validateAndGenerate}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>नक्सा तयार गर्नुहोस्</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Plot Preview Sticky Sidebar Column */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <PlotGeometryPreview project={project} />
        </div>
      </div>
    </div>
  );
};
