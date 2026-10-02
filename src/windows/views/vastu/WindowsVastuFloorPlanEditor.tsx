import React, { useState } from 'react';
import { 
  Compass, 
  RotateCw, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  ArrowRight,
  Info,
  ShieldAlert
} from 'lucide-react';
import { 
  VastuPrimaryDirection, 
  VASTU_PRIMARY_DIRECTIONS,
  getVastuDirectionByCode 
} from '../../../core/vastu/vastuDirections';
import { 
  VASTU_ROOM_CATEGORIES, 
  VastuRoomCategory,
  RoomRating
} from '../../../core/vastu/vastuRules';
import { 
  RoomPlacementEntry, 
  analyzeVastuFloorPlan, 
  VastuAnalysisResult 
} from '../../../core/vastu/vastuAnalysis';
import { 
  WindowsVastuFloorPlanRecord,
  saveFloorPlan 
} from '../../db/windowsSecureStore';

interface WindowsVastuFloorPlanEditorProps {
  floorPlan: WindowsVastuFloorPlanRecord;
  projectName: string;
  onUpdateFloorPlan: (updatedPlan: WindowsVastuFloorPlanRecord) => void;
  onNavigateToAnalysis: () => void;
}

export const WindowsVastuFloorPlanEditor: React.FC<WindowsVastuFloorPlanEditorProps> = ({
  floorPlan,
  projectName,
  onUpdateFloorPlan,
  onNavigateToAnalysis,
}) => {
  const [placements, setPlacements] = useState<RoomPlacementEntry[]>(floorPlan.placements || []);
  const [selectedZone, setSelectedZone] = useState<VastuPrimaryDirection>('NE');
  const [selectedRoomCategory, setSelectedRoomCategory] = useState<string>('puja_room');
  const [customRoomName, setCustomRoomName] = useState<string>('');
  const [compassAngle, setCompassAngle] = useState<number>(floorPlan.compassRotationDegree || 0);

  // Realtime Analysis Preview
  const currentAnalysis: VastuAnalysisResult = analyzeVastuFloorPlan(placements);

  const handleAddPlacement = () => {
    const roomCat = VASTU_ROOM_CATEGORIES.find((r) => r.id === selectedRoomCategory);
    if (!roomCat) return;

    const newEntry: RoomPlacementEntry = {
      roomId: roomCat.id,
      direction: selectedZone,
      customName: customRoomName.trim() || roomCat.nameNepali.split(' ')[0],
    };

    const updated = [...placements, newEntry];
    setPlacements(updated);
    setCustomRoomName('');

    const updatedRecord: WindowsVastuFloorPlanRecord = {
      ...floorPlan,
      placements: updated,
      compassRotationDegree: compassAngle,
      analysisCache: analyzeVastuFloorPlan(updated),
      updatedAt: new Date().toISOString(),
    };
    saveFloorPlan(updatedRecord);
    onUpdateFloorPlan(updatedRecord);
  };

  const handleRemovePlacement = (index: number) => {
    const updated = placements.filter((_, i) => i !== index);
    setPlacements(updated);

    const updatedRecord: WindowsVastuFloorPlanRecord = {
      ...floorPlan,
      placements: updated,
      compassRotationDegree: compassAngle,
      analysisCache: analyzeVastuFloorPlan(updated),
      updatedAt: new Date().toISOString(),
    };
    saveFloorPlan(updatedRecord);
    onUpdateFloorPlan(updatedRecord);
  };

  // 3x3 Grid Visual Matrix
  const gridCells: { direction: VastuPrimaryDirection; label: string; sublabel: string }[] = [
    { direction: 'NW', label: 'वायव्य (NW)', sublabel: 'वायु तत्व' },
    { direction: 'N', label: 'उत्तर (N)', sublabel: 'जल तत्व • कुबेर' },
    { direction: 'NE', label: 'ईशान (NE)', sublabel: 'जल तत्व • देवस्थान' },
    { direction: 'W', label: 'पश्चिम (W)', sublabel: 'वायु तत्व • वरुण' },
    { direction: 'CENTER', label: 'ब्रह्मस्थान (केन्द्र)', sublabel: 'आकाश तत्व • खुला' },
    { direction: 'E', label: 'पूर्व (E)', sublabel: 'वायु तत्व • इन्द्र' },
    { direction: 'SW', label: 'नैऋत्य (SW)', sublabel: 'पृथ्वी तत्व • स्थिर' },
    { direction: 'S', label: 'दक्षिण (S)', sublabel: 'अग्नि तत्व • यम' },
    { direction: 'SE', label: 'आग्नेय (SE)', sublabel: 'अग्नि तत्व • चुलो' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Editor Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md">
              {projectName}
            </span>
            <span className="text-xs text-stone-400">• {floorPlan.floorName}</span>
          </div>
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 font-serif mt-1 flex items-center gap-2">
            <span>📐</span>
            <span>इन्टरएक्टिभ वास्तु नक्सा सम्पादक (Floor Plan Grid Editor)</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Quick Score Meter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
            <div className="text-right">
              <div className="text-[10px] text-stone-400 font-medium">वास्तु अनुकूलता</div>
              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                {currentAnalysis.percentage}% ({currentAnalysis.gradeNepali.split(' ')[0]})
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center font-black text-xs text-emerald-700 dark:text-emerald-300">
              {currentAnalysis.gradeNepali.includes('A') ? 'A+' : 'B'}
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToAnalysis}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <span>विस्तृत विश्लेषण हेर्नुहोस्</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual 3x3 Floor Plan Grid (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border-2 border-stone-200 dark:border-stone-800 shadow-md">
            
            {/* North Compass Arrow Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800 text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>वास्तु मण्डल (९-क्षेत्रीय ग्रिड)</span>
              </span>
              <span className="text-[11px] text-stone-500">
                कुनै पनि कोठा थप्न वा हेर्न सम्बन्धित कोठामा क्लिक गर्नुहोस्
              </span>
            </div>

            {/* 3x3 Grid Floor Matrix */}
            <div className="grid grid-cols-3 gap-3 aspect-square max-w-lg mx-auto p-2 bg-[#F9F7F3] dark:bg-[#141210] rounded-2xl border border-stone-300 dark:border-stone-800">
              {gridCells.map((cell) => {
                const isSelected = selectedZone === cell.direction;
                const cellPlacements = placements.filter((p) => p.direction === cell.direction);

                return (
                  <div
                    key={cell.direction}
                    onClick={() => setSelectedZone(cell.direction)}
                    className={`rounded-2xl p-2.5 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden select-none ${
                      isSelected
                        ? 'border-2 border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${
                          isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-stone-800 dark:text-stone-200'
                        }`}>
                          {cell.label}
                        </span>
                        {cellPlacements.length > 0 && (
                          <span className="text-[9px] bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-1.5 py-0.2 rounded-full font-bold">
                            {cellPlacements.length}
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-stone-400 font-medium leading-none mt-0.5">
                        {cell.sublabel}
                      </div>
                    </div>

                    {/* Placed Rooms Inside this Cell */}
                    <div className="my-1.5 space-y-1 overflow-y-auto max-h-24 pr-0.5">
                      {cellPlacements.map((p, idx) => {
                        const cat = VASTU_ROOM_CATEGORIES.find((c) => c.id === p.roomId);
                        const rule = cat?.directionRules[cell.direction];
                        const isSevere = rule?.rating === 'severe';
                        const isBad = rule?.rating === 'bad';
                        const isGood = rule?.rating === 'excellent' || rule?.rating === 'good';

                        return (
                          <div
                            key={idx}
                            className={`px-1.5 py-1 rounded-md text-[10px] font-bold flex items-center justify-between gap-1 shadow-2xs ${
                              isSevere
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300'
                                : isBad
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300'
                            }`}
                          >
                            <span className="truncate">{p.customName || cat?.nameNepali}</span>
                            <span className="shrink-0 text-[8px] font-mono">
                              {isSevere ? '❌' : isBad ? '⚠️' : '✅'}
                            </span>
                          </div>
                        );
                      })}

                      {cellPlacements.length === 0 && (
                        <div className="text-[10px] text-stone-400 italic text-center py-2">
                          (खाली)
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] text-stone-400 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-1">
                      <span>{cell.direction}</span>
                      {isSelected && <span className="text-emerald-600 font-bold">चयनित</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direction Legend Note */}
            <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-4 text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>शास्त्रोक्त उत्तम स्थान (Good/A+)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>मध्यम दोष (Bad)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>गम्भीर दोष (Severe)</span>
              </span>
            </div>

          </div>

        </div>

        {/* Right Column: Room Addition & Placed Items List (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Add Room Panel */}
          <div className="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>नयाँ कोठा वा संरचना थप्नुहोस्</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                  १. कोठा / संरचनाको प्रकार (१७ शास्त्रोक्त वर्ग)
                </label>
                <select
                  value={selectedRoomCategory}
                  onChange={(e) => setSelectedRoomCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                >
                  {VASTU_ROOM_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameNepali}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                  २. कुन दिशा / कोणमा राख्ने?
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value as VastuPrimaryDirection)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                >
                  {VASTU_PRIMARY_DIRECTIONS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.nameNepali} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                  ३. आफ्नै नाम (ऐच्छिक)
                </label>
                <input
                  type="text"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  placeholder="उदा. पाहुना कोठा, बालबालिकाको कोठा"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                />
              </div>

              <button
                type="button"
                onClick={handleAddPlacement}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>नक्सामा थप्नुहोस् (Add to Plan)</span>
              </button>
            </div>
          </div>

          {/* List of Already Placed Rooms */}
          <div className="p-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                हाल राखिएका कोठाहरू ({placements.length})
              </h3>
              <span className="text-[11px] text-stone-400">क्रमबद्ध सूची</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {placements.map((p, idx) => {
                const cat = VASTU_ROOM_CATEGORIES.find((c) => c.id === p.roomId);
                const dir = getVastuDirectionByCode(p.direction);
                const rule = cat?.directionRules[p.direction];
                const isSevere = rule?.rating === 'severe';
                const isBad = rule?.rating === 'bad';

                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>{p.customName || cat?.nameNepali}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSevere
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : isBad
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {isSevere ? 'महादोष' : isBad ? 'दोष' : 'उत्तम'}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <span>दिशा: {dir.nameNepali}</span>
                        <span>•</span>
                        <span>{dir.element} तत्व</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePlacement(idx)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="हटाउनुहोस्"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {placements.length === 0 && (
                <div className="text-center py-6 text-stone-400 text-xs">
                  नक्सामा कुनै कोठा राखिएको छैन। माथिको फारमबाट थप्नुहोस्।
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
