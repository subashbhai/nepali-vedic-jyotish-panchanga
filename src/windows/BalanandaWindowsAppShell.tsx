import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Home, 
  Compass, 
  Moon, 
  ShieldCheck, 
  WifiOff, 
  Printer, 
  Settings, 
  LogOut,
  Layers,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { WindowsPrimaryService, WindowsJyotishTab, WindowsVastuTab } from './types/windowsAppTypes';
import { WindowsHomeLandingView } from './views/WindowsHomeLandingView';
import { WindowsJyotishDashboardView } from './views/jyotish/WindowsJyotishDashboardView';
import { WindowsVastuProjectsView } from './views/vastu/WindowsVastuProjectsView';
import { WindowsVastuFloorPlanEditor } from './views/vastu/WindowsVastuFloorPlanEditor';
import { WindowsVastuAnalysisView } from './views/vastu/WindowsVastuAnalysisView';
import { WindowsVastuReportView } from './views/vastu/WindowsVastuReportView';
import { 
  initWindowsOfflineDatabase, 
  getAllVastuProjects, 
  getFloorPlanByProjectId, 
  getAllBirthProfiles,
  saveFloorPlan
} from './db/windowsSecureStore';
import { analyzeVastuFloorPlan } from '../core/vastu/vastuAnalysis';
import { DeviceUpdateNotificationBanner } from '../components/common/DeviceUpdateNotificationBanner';

interface BalanandaWindowsAppShellProps {
  onExitToWeb?: () => void;
}

export const BalanandaWindowsAppShell: React.FC<BalanandaWindowsAppShellProps> = ({
  onExitToWeb,
}) => {
  // Ensure database initialized
  useEffect(() => {
    initWindowsOfflineDatabase();
  }, []);

  const [activeService, setActiveService] = useState<WindowsPrimaryService>('HOME');
  const [activeJyotishTab, setActiveJyotishTab] = useState<WindowsJyotishTab>('KUNDALI');
  const [activeVastuTab, setActiveVastuTab] = useState<WindowsVastuTab>('FLOOR_PLAN');

  // Vastu State
  const [vastuProjects, setVastuProjects] = useState(() => getAllVastuProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(vastuProjects[0]?.id || 'vp_demo_1');

  const activeProject = vastuProjects.find((p) => p.id === activeProjectId) || vastuProjects[0];
  const [floorPlan, setFloorPlan] = useState(() => getFloorPlanByProjectId(activeProjectId));

  // Sync floor plan when project changes
  useEffect(() => {
    const fp = getFloorPlanByProjectId(activeProjectId);
    setFloorPlan(fp);
  }, [activeProjectId]);

  const vastuAnalysis = analyzeVastuFloorPlan(floorPlan?.placements || []);

  const birthProfiles = getAllBirthProfiles();
  const activeProfile = birthProfiles[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100 flex flex-col font-sans select-none antialiased">
      {/* ── Direct Device Auto-Update Notification Banner ── */}
      <DeviceUpdateNotificationBanner />
      
      {/* ============================================================== */}
      {/* 1. TOP WINDOWS DESKTOP APP HEADER BAR                           */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#181614]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-xs px-4 py-2.5 flex items-center justify-between print:hidden">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setActiveService('HOME')}
            className="flex items-center gap-2 cursor-pointer group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-white text-lg font-serif shadow-xs group-hover:scale-105 transition-transform">
              🕉
            </div>
            <div>
              <div className="font-serif font-black text-sm tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>बालानन्द वैदिक ज्योतिष तथा वास्तु सेवा</span>
              </div>
              <div className="text-[10px] text-stone-500 flex items-center gap-1.5">
                <span>Windows Offline Edition</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  <WifiOff className="w-2.5 h-2.5" />
                  <span>१००% अफलाइन</span>
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Primary Service Selector (Center) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-750 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveService('HOME')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeService === 'HOME'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>होम (Home)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveService('JYOTISH')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeService === 'JYOTISH'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-amber-600'
            }`}
          >
            <span>🔮</span>
            <span>ज्योतिष सेवा</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveService('VASTU')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeService === 'VASTU'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-emerald-600'
            }`}
          >
            <span>🏠</span>
            <span>वास्तु सेवा</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {activeService !== 'HOME' && (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1 hover:bg-stone-100 transition-colors cursor-pointer"
              title="प्रिन्ट / PDF"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">प्रिन्ट</span>
            </button>
          )}

          {/* Switch to Full Desktop/Web Application */}
          {onExitToWeb && (
            <button
              type="button"
              onClick={onExitToWeb}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="सम्पूर्ण मुख्य सफ्टवेयर खोल्नुहोस्"
            >
              <span>🖥️</span>
              <span className="hidden sm:inline">वेब सफ्टवेयर</span>
            </button>
          )}
        </div>

      </header>

      {/* ============================================================== */}
      {/* 2. SECONDARY NAVIGATION FOR VASTU SERVICE                       */}
      {/* ============================================================== */}
      {activeService === 'VASTU' && (
        <div className="bg-white/80 dark:bg-[#161412]/80 border-b border-stone-200 dark:border-stone-800 px-4 py-2 flex items-center justify-between overflow-x-auto text-xs font-bold print:hidden">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveVastuTab('PROJECTS')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeVastuTab === 'PROJECTS'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              📁 प्रोजेक्टहरू ({vastuProjects.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveVastuTab('FLOOR_PLAN')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeVastuTab === 'FLOOR_PLAN'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              📐 नक्सा सम्पादक (Floor Plan)
            </button>

            <button
              type="button"
              onClick={() => setActiveVastuTab('ANALYSIS')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeVastuTab === 'ANALYSIS'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              📊 वास्तु विश्लेषण (Analysis)
            </button>

            <button
              type="button"
              onClick={() => setActiveVastuTab('REPORT')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeVastuTab === 'REPORT'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              📜 प्रतिवेदन (Report & Print)
            </button>
          </div>

          <div className="text-[11px] text-stone-400 shrink-0 hidden md:block">
            सक्रिय: <strong>{activeProject?.projectName || 'वास्तु प्रोजेक्ट'}</strong> ({activeProject?.ownerName || 'गृहस्वामी'})
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN WORKSPACE BODY                                          */}
      {/* ============================================================== */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col">
        
        {/* VIEW 1: HOME LANDING SCREEN */}
        {activeService === 'HOME' && (
          <WindowsHomeLandingView
            onSelectService={(srv) => setActiveService(srv)}
            activeProfileName={activeProfile?.name}
            activeProjectName={activeProject?.projectName}
          />
        )}

        {/* VIEW 2: JYOTISH SEWA */}
        {activeService === 'JYOTISH' && (
          <WindowsJyotishDashboardView
            activeTab={activeJyotishTab}
            onTabChange={(tab) => setActiveJyotishTab(tab)}
          />
        )}

        {/* VIEW 3: VASTU SEWA */}
        {activeService === 'VASTU' && (
          <div className="flex-1 flex flex-col">
            {activeVastuTab === 'PROJECTS' && (
              <WindowsVastuProjectsView
                activeProjectId={activeProjectId}
                onSelectProject={(id) => {
                  setActiveProjectId(id);
                  setFloorPlan(getFloorPlanByProjectId(id));
                }}
                onNavigateToFloorPlan={() => setActiveVastuTab('FLOOR_PLAN')}
              />
            )}

            {activeVastuTab === 'FLOOR_PLAN' && (
              <WindowsVastuFloorPlanEditor
                floorPlan={floorPlan}
                projectName={activeProject?.projectName || 'वास्तु प्रोजेक्ट'}
                onUpdateFloorPlan={(up) => setFloorPlan(up)}
                onNavigateToAnalysis={() => setActiveVastuTab('ANALYSIS')}
              />
            )}

            {activeVastuTab === 'ANALYSIS' && (
              <WindowsVastuAnalysisView
                analysis={vastuAnalysis}
                projectName={activeProject?.projectName || 'वास्तु प्रोजेक्ट'}
                onNavigateToReport={() => setActiveVastuTab('REPORT')}
              />
            )}

            {activeVastuTab === 'REPORT' && (
              <WindowsVastuReportView
                project={activeProject || vastuProjects[0]}
                placements={floorPlan?.placements || []}
                analysis={vastuAnalysis}
              />
            )}
          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* 4. DESKTOP STATUS BAR (Bottom)                                  */}
      {/* ============================================================== */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 px-4 py-2 text-[11px] text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-3">
          <span className="font-bold text-stone-700 dark:text-stone-300">
            बालानन्द वैदिक ज्योतिष तथा वास्तु सेवा
          </span>
          <span>•</span>
          <span>संस्करण १.०.२ (Offline Safe)</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-600">
            <ShieldCheck className="w-3 h-3" />
            <span>इन्क्रिप्टेड डाटाबेस सुरक्षित</span>
          </span>
          <span>•</span>
          <span>© २०२६ बालानन्द सेवा केन्द्र</span>
        </div>
      </footer>

    </div>
  );
};
