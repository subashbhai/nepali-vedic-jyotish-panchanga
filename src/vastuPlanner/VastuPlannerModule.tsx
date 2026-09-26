// Master Vastu Building Planner Module
// बालानन्द कर्मकाण्ड
import React, { useState, useEffect } from 'react';
import { 
  VastuPlannerProject, 
  GeneratedFloorPlan, 
  PlannedRoom 
} from './types';
import { generateVastuFloorPlan } from './planner/planGenerator';
import { analyzeVastuBuildingPlan } from './engine/vastuAnalysisEngine';
import { PlotStepWizard } from './components/PlotStepWizard';
import { TwoDPlanViewer } from './components/TwoDPlanViewer';
import { ThreeDHouseViewer } from './components/ThreeDHouseViewer';
import { VastuReportView } from './components/VastuReportView';
import { VastuRoomPlanner } from '../components/VastuRoomPlanner';
import { NepalDesignsGalleryModal } from './components/NepalDesignsGalleryModal';
import { HouseCustomizerModal } from './components/HouseCustomizerModal';
import { NepalHouseDesign, loadNepalDesignToProject } from './data/nepalHouseDesigns';
import { 
  Building2, 
  Compass, 
  Layers, 
  Eye, 
  FileText, 
  Save, 
  FolderOpen, 
  Plus, 
  Download, 
  Upload, 
  Sparkles, 
  Check, 
  Share2,
  Trash2
} from 'lucide-react';

const STORAGE_KEY = 'balananda_vastu_building_projects_v1';

// Initial starter project
const DEFAULT_INITIAL_PROJECT: VastuPlannerProject = {
  id: 'proj-default-1',
  name: 'आदर्श पारिवारिक भवन (40 × 30 ft)',
  clientName: 'गृहस्वामी',
  unit: 'ft',
  plotLength: 40,
  plotWidth: 30,
  plotArea: 1200,
  plotShape: 'rectangular',
  boundaries: {
    north: { length: 40, boundaryType: 'neighbor' },
    south: { length: 40, boundaryType: 'neighbor' },
    east: { length: 30, boundaryType: 'road' },
    west: { length: 30, boundaryType: 'open' }
  },
  roads: [
    {
      id: 'road-1',
      direction: 'E',
      width: 16,
      sideLength: 30,
      isMainRoad: true,
      gatePlacement: 'center',
      roadLevel: 'level',
      name: 'पूर्व मुख्य सडक (१६ फिट)'
    }
  ],
  geoLocation: {
    latitude: 27.7172,
    longitude: 85.3240,
    altitude: 1350,
    locationName: 'काठमाडौं, नेपाल',
    district: 'काठमाडौं',
    province: 'बागमती प्रदेश',
    country: 'नेपाल',
    timezone: 5.75
  },
  orientationAngle: 0,
  siteConditions: {
    isFlat: true,
    slopeDirection: 'NE',
    waterDrainageDirection: 'NE',
    nearbyWaterBody: false,
    nearbyMountainOrHighRise: false,
    existingStructures: [],
    existingTreeOrWell: false
  },
  buildingReqs: {
    buildingType: 'residential',
    estimatedBuiltUpArea: 900,
    setbacks: {
      north: 5,
      east: 5,
      south: 4,
      west: 4
    },
    parkingRequired: true,
    carParkingCount: 1,
    bikeParkingCount: 2,
    hasGarden: true,
    hasCourtyard: true,
    hasTerrace: true,
    hasBalcony: true
  },
  floorCount: 2,
  rooms: [
    { id: 'rm-1', category: 'living', nameNepali: 'बैठक कोठा (Living Room)', preferredDirection: 'NE', floorNumber: 0, minLength: 12, minWidth: 14, priority: 'high' },
    { id: 'rm-2', category: 'kitchen', nameNepali: 'भान्सा (Kitchen)', preferredDirection: 'SE', floorNumber: 0, minLength: 10, minWidth: 10, priority: 'high' },
    { id: 'rm-3', category: 'pooja', nameNepali: 'पूजा कोठा (Pooja Room)', preferredDirection: 'NE', floorNumber: 0, minLength: 6, minWidth: 8, priority: 'high' },
    { id: 'rm-4', category: 'master_bedroom', nameNepali: 'मुख्य शयनकक्ष (Master Bed)', preferredDirection: 'SW', floorNumber: 0, minLength: 12, minWidth: 14, priority: 'high' },
    { id: 'rm-5', category: 'dining', nameNepali: 'भोजन कक्ष (Dining)', preferredDirection: 'E', floorNumber: 0, minLength: 10, minWidth: 12, priority: 'medium' },
    { id: 'rm-6', category: 'toilet', nameNepali: 'शौचालय (Common Toilet)', preferredDirection: 'NW', floorNumber: 0, minLength: 6, minWidth: 8, priority: 'high' },
    { id: 'rm-7', category: 'staircase', nameNepali: 'भर्याङ (Staircase)', preferredDirection: 'S', floorNumber: 0, minLength: 8, minWidth: 10, priority: 'high' },
    // First floor rooms
    { id: 'rm-8', category: 'bedroom', nameNepali: 'शयनकक्ष १ (Bed 1)', preferredDirection: 'W', floorNumber: 1, minLength: 12, minWidth: 14, priority: 'high' },
    { id: 'rm-9', category: 'bedroom', nameNepali: 'शयनकक्ष २ (Bed 2)', preferredDirection: 'SW', floorNumber: 1, minLength: 12, minWidth: 12, priority: 'medium' },
    { id: 'rm-10', category: 'study', nameNepali: 'अध्ययन कक्ष (Study)', preferredDirection: 'NE', floorNumber: 1, minLength: 10, minWidth: 10, priority: 'medium' },
    { id: 'rm-11', category: 'balcony', nameNepali: 'खुला बालकनी (Balcony)', preferredDirection: 'E', floorNumber: 1, minLength: 6, minWidth: 12, priority: 'low' }
  ],
  vastuProfile: 'vedic',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const VastuPlannerModule: React.FC = () => {
  const [project, setProject] = useState<VastuPlannerProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const list: VastuPlannerProject[] = JSON.parse(saved);
        if (list.length > 0) return list[0];
      }
    } catch (e) {
      console.error('Failed to parse saved vastu projects:', e);
    }
    return DEFAULT_INITIAL_PROJECT;
  });

  const [savedProjects, setSavedProjects] = useState<VastuPlannerProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [DEFAULT_INITIAL_PROJECT];
  });

  // Current sub-view: 'wizard' | 'room_planner' | '2d_plan' | '3d_view' | 'report' | 'saved'
  const [activeTab, setActiveTab] = useState<'wizard' | 'room_planner' | '2d_plan' | '3d_view' | 'report' | 'saved'>('wizard');
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedFloorPlan>(() => generateVastuFloorPlan(DEFAULT_INITIAL_PROJECT));
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modals for Nepal Designs & Room/Floor/Appliance Customizer
  const [isDesignsGalleryOpen, setIsDesignsGalleryOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);

  // Generate analysis on project load
  useEffect(() => {
    const analysis = analyzeVastuBuildingPlan(project);
    const plan = generateVastuFloorPlan(project);
    setProject(prev => ({ ...prev, analysisResult: analysis }));
    setGeneratedPlan(plan);
  }, []);

  // Save project to localStorage
  const handleSaveProject = () => {
    const analysis = analyzeVastuBuildingPlan(project);
    const updatedProj = { ...project, analysisResult: analysis, updatedAt: new Date().toISOString() };
    const filtered = savedProjects.filter(p => p.id !== updatedProj.id);
    const updatedList = [updatedProj, ...filtered];
    setSavedProjects(updatedList);
    setProject(updatedProj);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      setSaveSuccessMsg('परियोजना सफलतापूर्वक सुरक्षित गरियो!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Load a saved project
  const handleLoadProject = (proj: VastuPlannerProject) => {
    setProject(proj);
    const plan = generateVastuFloorPlan(proj);
    setGeneratedPlan(plan);
    setActiveTab('2d_plan');
  };

  // Create new project
  const handleCreateNew = () => {
    const newProj: VastuPlannerProject = {
      ...DEFAULT_INITIAL_PROJECT,
      id: `proj-${Date.now()}`,
      name: `नयाँ भवन योजना #${savedProjects.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProject(newProj);
    const plan = generateVastuFloorPlan(newProj);
    setGeneratedPlan(plan);
    setActiveTab('wizard');
  };

  // Delete saved project
  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedProjects.length <= 1) {
      alert('कमसेकम एउटा परियोजना सुरक्षित हुनुपर्छ।');
      return;
    }
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Triggered when wizard completes
  const handleGenerateFromWizard = () => {
    const analysis = analyzeVastuBuildingPlan(project);
    const plan = generateVastuFloorPlan(project);
    const updatedProj = { ...project, analysisResult: analysis };
    setProject(updatedProj);
    setGeneratedPlan(plan);
    setActiveTab('2d_plan');
  };

  // Load Nepal House Design Template
  const handleSelectNepalDesign = (design: NepalHouseDesign) => {
    const updated = loadNepalDesignToProject(design, project);
    const analysis = analyzeVastuBuildingPlan(updated);
    const updatedWithAnalysis = { ...updated, analysisResult: analysis };
    setProject(updatedWithAnalysis);
    const plan = generateVastuFloorPlan(updatedWithAnalysis);
    setGeneratedPlan(plan);
    setActiveTab('2d_plan');
    setSaveSuccessMsg(`'${design.nameNepali}' इन्जिनियरिङ नक्सा लोड गरियो!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Update from House Customizer Modal
  const handleUpdateCustomizedProject = (updated: VastuPlannerProject) => {
    const analysis = analyzeVastuBuildingPlan(updated);
    const updatedWithAnalysis = { ...updated, analysisResult: analysis, updatedAt: new Date().toISOString() };
    setProject(updatedWithAnalysis);
    const plan = generateVastuFloorPlan(updatedWithAnalysis);
    setGeneratedPlan(plan);
    setSaveSuccessMsg('कोठा, झ्याल-ढोका, धारापानी, बत्ती तथा घरायसी सामग्री अपडेट भयो!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Handle updates from 2D Plan Editor
  const handlePlanUpdate = (updatedPlan: GeneratedFloorPlan, updatedProj: VastuPlannerProject) => {
    setGeneratedPlan(updatedPlan);
    setProject(updatedProj);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_vastu_plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as VastuPlannerProject;
        if (imported.plotLength && imported.plotWidth) {
          imported.id = `proj-imported-${Date.now()}`;
          setProject(imported);
          const plan = generateVastuFloorPlan(imported);
          setGeneratedPlan(plan);
          setActiveTab('2d_plan');
          alert('परियोजना सफलतापूर्वक लोड गरियो!');
        }
      } catch (err) {
        alert('अमान्य JSON फाइल। कृपया पुनः प्रयास गर्नुहोस्।');
      }
    };
    reader.readAsText(file);
  };

  const mainFacing = project.roads?.find(r => r.isMainRoad)?.direction || project.roads?.[0]?.direction || 'N';
  const facingTextMap: Record<string, string> = {
    N: 'उत्तर',
    NE: 'ईशान',
    E: 'पूर्व',
    SE: 'आग्नेय',
    S: 'दक्षिण',
    SW: 'नैऋत्य',
    W: 'पश्चिम',
    NW: 'वायव्य'
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Module Navigation Header */}
      <div className="bg-gradient-to-br from-[#7A1C1C] via-[#8B2323] to-[#551414] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-red-900/40">
        {/* Top Row: Title, Subtitle, and Active Plan Summary Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-white/15">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-amber-400/25 text-amber-300 border border-amber-400/50 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                वैदिक वास्तु भवन योजना
              </span>
              <span className="text-amber-200/90 text-xs font-medium">| 2D/3D इन्टर्याक्टिभ मोड्युल</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black font-serif tracking-tight text-white">
              वास्तु भवन योजना (Vastu Building Planner)
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-3xl leading-relaxed">
              जग्गाको वास्तविक नाप, सडकको दिशा र आवश्यकता अनुसार वैदिक वास्तु मण्डलमा आधारित २D नक्सा, ३D मोडल र तोडफोडविहीन वास्तु विश्लेषण।
            </p>
          </div>

          {/* Quick Info Box for Active Project */}
          <div className="bg-black/25 backdrop-blur-xs border border-white/15 rounded-xl px-3.5 py-2 shrink-0 flex items-center gap-3 text-xs self-start lg:self-center">
            <div>
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">हालको नक्सा</div>
              <div className="font-bold text-white max-w-[170px] sm:max-w-[210px] truncate" title={project.name}>
                {project.name}
              </div>
            </div>
            <div className="h-7 w-px bg-white/20" />
            <div className="text-right">
              <div className="text-amber-200 font-extrabold">{project.plotLength}′ × {project.plotWidth}′</div>
              <div className="text-[10px] text-stone-300">{facingTextMap[mainFacing] || mainFacing} मोहोडा • {project.floorCount || 2} तला</div>
            </div>
          </div>
        </div>

        {/* 6 Action Tiles ("सानो सानो कोठा") - Full Width, No Blank Space */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3.5">
          {/* Tile 1: 32+ Nepal Designs */}
          <button
            type="button"
            onClick={() => setIsDesignsGalleryOpen(true)}
            className="group relative overflow-hidden bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 p-2.5 rounded-xl text-left border border-amber-300 shadow-md transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between min-h-[76px]"
            title="नेपालमा बन्ने ३२+ RCC तथा परम्परागत छाना भएका इन्जिनियरिङ नक्साहरू"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">🏛️</span>
              <span className="text-[10px] font-black bg-stone-950/20 text-stone-950 px-1.5 py-0.5 rounded-md">३२+</span>
            </div>
            <div>
              <div className="text-xs font-black leading-tight text-stone-950">नेपाली नक्सा सङ्ग्रह</div>
              <div className="text-[10px] font-semibold text-stone-800 leading-tight mt-0.5">RCC र परम्परागत छाना</div>
            </div>
          </button>

          {/* Tile 2: Customizer */}
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="group bg-white/15 hover:bg-white/25 text-white p-2.5 rounded-xl text-left border border-white/25 shadow-sm transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between min-h-[76px]"
            title="तला अनुसार कोठा, झ्याल-ढोका, धारापानी र घरायसी सामग्री सम्पादन"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">🛠️</span>
              <span className="text-[10px] font-bold bg-amber-400/25 text-amber-300 px-1.5 py-0.5 rounded-md">सम्पादन</span>
            </div>
            <div>
              <div className="text-xs font-black leading-tight text-white">कोठा र सामग्री</div>
              <div className="text-[10px] text-amber-200/90 leading-tight mt-0.5">झ्याल-ढोका, धारा, बत्ती</div>
            </div>
          </button>

          {/* Tile 3: New Plan */}
          <button
            type="button"
            onClick={handleCreateNew}
            className="group bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl text-left border border-white/20 shadow-sm transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between min-h-[76px]"
            title="नयाँ जग्गा नाप र विजार्ड फारम सुरु गर्नुहोस्"
          >
            <div className="flex items-center justify-between">
              <Plus className="w-5 h-5 text-amber-300" />
              <span className="text-[10px] text-stone-300">नयाँ</span>
            </div>
            <div>
              <div className="text-xs font-black leading-tight text-white">नयाँ योजना सुरु</div>
              <div className="text-[10px] text-stone-300 leading-tight mt-0.5">जग्गाको नयाँ नाप विजार्ड</div>
            </div>
          </button>

          {/* Tile 4: Save Project */}
          <button
            type="button"
            onClick={handleSaveProject}
            className="group bg-amber-400 hover:bg-amber-300 text-stone-950 p-2.5 rounded-xl text-left border border-amber-300 shadow-sm transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between min-h-[76px]"
            title="हालको परियोजना सुरक्षित गर्नुहोस्"
          >
            <div className="flex items-center justify-between">
              <Save className="w-5 h-5 text-stone-950" />
              <span className="text-[10px] font-bold bg-stone-950/15 px-1.5 py-0.5 rounded-md">सेभ</span>
            </div>
            <div>
              <div className="text-xs font-black leading-tight text-stone-950">परियोजना सेभ</div>
              <div className="text-[10px] font-semibold text-stone-800 leading-tight mt-0.5">स्थानिय रूपमा सुरक्षित</div>
            </div>
          </button>

          {/* Tile 5: Export JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="group bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl text-left border border-white/20 shadow-sm transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between min-h-[76px]"
            title="परियोजनालाई JSON फाइलमा डाउनलोड गर्नुहोस्"
          >
            <div className="flex items-center justify-between">
              <Download className="w-5 h-5 text-amber-300" />
              <span className="text-[10px] text-stone-300">.JSON</span>
            </div>
            <div>
              <div className="text-xs font-black leading-tight text-white">JSON डाउनलोड</div>
              <div className="text-[10px] text-stone-300 leading-tight mt-0.5">फाइल एक्सपोर्ट / ब्याकअप</div>
            </div>
          </button>

          {/* Tile 6: Import JSON */}
          <label
            className="group bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl text-left border border-white/20 shadow-sm transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between min-h-[76px]"
            title="पहिले सुरक्षित गरिएको JSON परियोजना फाइल खोल्नुहोस्"
          >
            <div className="flex items-center justify-between">
              <Upload className="w-5 h-5 text-amber-300" />
              <span className="text-[10px] text-stone-300">अपलोड</span>
            </div>
            <div>
              <div className="text-xs font-black leading-tight text-white">JSON अपलोड</div>
              <div className="text-[10px] text-stone-300 leading-tight mt-0.5">पहिलेको फाइल खोल्नुहोस्</div>
            </div>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>

        {/* Save confirmation message */}
        {saveSuccessMsg && (
          <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
        )}

        {/* View Switcher Tabs - Symmetrically Arranged in Small Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3.5 border-t border-white/15 pt-3.5">
          {[
            { id: 'wizard', label: '१. फारम (Wizard)', icon: Building2 },
            { id: 'room_planner', label: '२. कोठा म्यापिङ (Planner)', icon: Compass },
            { id: '2d_plan', label: '३. २D नक्सा (Floor Plan)', icon: Layers },
            { id: '3d_view', label: '४. ३D दृश्य (House View)', icon: Eye },
            { id: 'report', label: '५. वास्तु प्रतिवेदन (Report)', icon: FileText },
            { id: 'saved', label: `६. सुरक्षित (${savedProjects.length})`, icon: FolderOpen },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-white text-[#7A1C1C] border-white shadow-md'
                    : 'bg-black/20 hover:bg-white/15 text-amber-100 border-white/10 hover:border-white/20'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#7A1C1C]' : 'text-amber-300'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="w-full">
        {activeTab === 'wizard' && (
          <PlotStepWizard
            project={project}
            onChange={setProject}
            onGeneratePlan={handleGenerateFromWizard}
          />
        )}

        {activeTab === 'room_planner' && (
          <VastuRoomPlanner
            initialProject={{
              id: project.id,
              name: project.name,
              clientName: project.clientName,
              plotLength: project.plotLength,
              plotWidth: project.plotWidth,
              unit: project.unit,
              orientationAngle: project.orientationAngle,
              floorCount: project.floorCount
            }}
            onProceedTo3D={() => setActiveTab('3d_view')}
          />
        )}

        {activeTab === '2d_plan' && (
          <TwoDPlanViewer
            project={project}
            plan={generatedPlan}
            onPlanUpdate={handlePlanUpdate}
          />
        )}

        {activeTab === '3d_view' && (
          <ThreeDHouseViewer
            project={project}
            plan={generatedPlan}
            onPlanUpdate={handlePlanUpdate}
          />
        )}

        {activeTab === 'report' && project.analysisResult && (
          <VastuReportView
            project={project}
            analysis={project.analysisResult}
          />
        )}

        {activeTab === 'saved' && (
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold font-serif text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-600" />
                <span>सुरक्षित गरिएका भवन योजनाहरू ({savedProjects.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>नयाँ योजना बनाउनुहोस्</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleLoadProject(p)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    project.id === p.id
                      ? 'border-[#7A1C1C] bg-amber-50/50 dark:bg-amber-950/30 shadow-md'
                      : 'border-stone-200 dark:border-stone-800 hover:border-amber-400 bg-stone-50/40 dark:bg-stone-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 font-serif">
                        {p.name}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                        title="मेटाउनुहोस्"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-2 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                      <p>नाप: {p.plotLength} × {p.plotWidth} {p.unit} ({p.plotArea} {p.unit}²)</p>
                      <p>सडक: {p.roads[0]?.direction || 'N'} ({p.roads[0]?.width || 12} {p.unit})</p>
                      <p>तला: {p.floorCount} | कोठाहरू: {p.rooms.length}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">
                      {new Date(p.updatedAt).toLocaleDateString('ne-NP')}
                    </span>
                    <span className="font-bold text-[#7A1C1C] dark:text-amber-400">
                      नक्सा खोल्नुहोस् →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Nepal Designs Gallery Modal */}
      <NepalDesignsGalleryModal
        isOpen={isDesignsGalleryOpen}
        onClose={() => setIsDesignsGalleryOpen(false)}
        onSelectDesign={handleSelectNepalDesign}
      />

      {/* Floor, Room, Doors, Windows, Plumbing, Electrical & Appliances Customizer Modal */}
      <HouseCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        project={project}
        onUpdateProject={handleUpdateCustomizedProject}
      />
    </div>
  );
};
