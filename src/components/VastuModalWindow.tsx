import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  X, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  FolderPlus, 
  Compass, 
  Layers, 
  CheckCircle2, 
  Shovel, 
  Sparkles, 
  FileCheck,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { VastuView, VastuSubTab } from './VastuView';
import { OrganizationProfile, BirthDetails } from '../types/astrology';

export interface VastuModalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  orgProfile?: OrganizationProfile;
  activeProfile?: BirthDetails | null;
  initialSubTab?: VastuSubTab;
}

interface VastuNavMenuItem {
  id: VastuSubTab;
  labelNepali: string;
  labelEnglish: string;
  descriptionNepali: string;
  badge: string;
  colorClass: string;
  icon: React.FC<{ className?: string }>;
}

export const VASTU_WINDOW_NAV_ITEMS: VastuNavMenuItem[] = [
  {
    id: 'planner',
    labelNepali: 'वास्तु भवन योजना',
    labelEnglish: 'Vastu Building Planner (2D/3D)',
    descriptionNepali: 'जग्गा नाप, २D/३D भवन नक्सा, कोठा व्यवस्थापन र वास्तु विश्लेषण',
    badge: '२D/३D नक्सा',
    colorClass: 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-300 dark:border-amber-700',
    icon: Building2
  },
  {
    id: 'project',
    labelNepali: 'वास्तु परियोजना',
    labelEnglish: 'Vastu Projects Hub',
    descriptionNepali: 'नयाँ परियोजना, ग्राहक विवरण तथा घडेरी नाप व्यवस्थापन',
    badge: 'केन्द्र',
    colorClass: 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-300 dark:border-amber-700',
    icon: FolderPlus
  },
  {
    id: 'compass',
    labelNepali: 'दिशा कम्पास',
    labelEnglish: 'Digital 360° Compass',
    descriptionNepali: '३६०° डिजिटल कम्पास, दिक्पाल दिशा तथा सेन्सर',
    badge: '३६०°',
    colorClass: 'text-blue-700 dark:text-blue-300 bg-blue-500/15 border-blue-300 dark:border-blue-700',
    icon: Compass
  },
  {
    id: 'mandala',
    labelNepali: 'वास्तुपुरुष मण्डल',
    labelEnglish: '81-Pada Mandala',
    descriptionNepali: '१६ दिशा, ९ क्षेत्र, पद देवता तथा मण्डल ग्रिड विश्लेषण',
    badge: '८१ पद',
    colorClass: 'text-purple-700 dark:text-purple-300 bg-purple-500/15 border-purple-300 dark:border-purple-700',
    icon: Layers
  },
  {
    id: 'audit',
    labelNepali: 'संरचना वास्तु अडिट',
    labelEnglish: 'Room Placement Audit',
    descriptionNepali: 'मुख्यद्वार, भान्छा, पूजा, शयनकक्ष अवस्थिति र उपचार',
    badge: 'अङ्कन',
    colorClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-300 dark:border-emerald-700',
    icon: CheckCircle2
  },
  {
    id: 'bhumi',
    labelNepali: 'भूमि परीक्षण',
    labelEnglish: 'Land & Soil Vedic Test',
    descriptionNepali: 'माटोको रङ्ग, स्वाद, खाल्डो, जल धारणा र ढलान परीक्षण',
    badge: 'माटो',
    colorClass: 'text-amber-800 dark:text-amber-200 bg-amber-700/15 border-amber-600 dark:border-amber-700',
    icon: Shovel
  },
  {
    id: 'panchatattva',
    labelNepali: 'पञ्चतत्त्व चक्र',
    labelEnglish: '5 Elements Balance',
    descriptionNepali: 'जल, अग्नि, पृथ्वी, वायु र आकाश तत्त्व सन्तुलन विश्लेषण',
    badge: 'तत्त्व',
    colorClass: 'text-orange-700 dark:text-orange-300 bg-orange-500/15 border-orange-300 dark:border-orange-700',
    icon: Sparkles
  },
  {
    id: 'report',
    labelNepali: 'वास्तु प्रतिवेदन / प्रमाणपत्र',
    labelEnglish: 'Vastu Audit Certificate',
    descriptionNepali: 'आधिकारिक संस्थागत लेटरहेडसहितको प्रिन्ट योग्य प्रमाणपत्र',
    badge: 'प्रमाणपत्र',
    colorClass: 'text-red-700 dark:text-red-300 bg-red-500/15 border-red-300 dark:border-red-700',
    icon: FileCheck
  }
];

export const VastuModalWindow: React.FC<VastuModalWindowProps> = ({
  isOpen,
  onClose,
  orgProfile,
  activeProfile,
  initialSubTab = 'planner'
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<VastuSubTab>(initialSubTab);
  const [isFullScreen, setIsFullScreen] = useState(true);

  // Synchronize when initialSubTab changes from caller
  useEffect(() => {
    if (initialSubTab) {
      setSelectedSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while modal window is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleOpenBrowserWindow = () => {
    const targetUrl = `${window.location.origin}${window.location.pathname}?tab=vastu&subtab=${selectedSubTab}`;
    // Opens as an actual dedicated browser popup window
    const windowFeatures = 'popup=yes,width=1440,height=900,left=100,top=100,resizable=yes,scrollbars=yes,status=yes';
    window.open(targetUrl, 'VastuWindow', windowFeatures);
  };

  const handleToggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullScreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="vastu-new-window-overlay"
        className={`fixed inset-0 z-[9999] flex flex-col bg-[#FAF7F2] dark:bg-[#191715] overflow-hidden ${
          isFullScreen ? 'w-screen h-screen p-0' : 'items-center justify-center p-2 sm:p-5 bg-black/75 backdrop-blur-md'
        }`}
      >
        {/* Animated Window Container */}
        <motion.div
          id="vastu-new-window-modal"
          initial={{ opacity: 0, y: isFullScreen ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isFullScreen ? 0 : 16 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`relative bg-[#FAF7F2] dark:bg-[#191715] text-[#2D241E] dark:text-stone-100 flex flex-col overflow-hidden ${
            isFullScreen 
              ? 'w-full h-full rounded-none border-none shadow-none' 
              : 'w-full max-w-[1550px] h-[95vh] rounded-2xl shadow-2xl border border-amber-500/40'
          }`}
        >
          {/* WINDOW TITLEBAR / TOP HEADER */}
          <header className="px-4 py-2.5 bg-gradient-to-r from-[#7A1C1C] via-[#942424] to-[#5E1414] text-white flex items-center justify-between gap-3 border-b border-amber-600/40 shrink-0 shadow-md">
            {/* Left: Window Identity & Logo */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-200 shrink-0 shadow-inner">
                <Compass className="w-5 h-5 animate-[spin_20s_linear_infinite]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold font-serif text-amber-100 truncate">
                    वैदिक वास्तुशास्त्र परामर्श तथा भवन योजना पूर्ण कार्यक्षेत्र (Full Window Workspace)
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-amber-400 text-stone-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    पूर्ण विन्डो (Full Screen)
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/90 truncate hidden md:block">
                  २D/३D भवन नक्सा, १०-पृष्ठ कानूनी प्रिन्ट, दिशा कम्पास, भूमि परीक्षण र पञ्चतत्त्व सन्तुलन
                </p>
              </div>
            </div>

            {/* Right: Window Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Open in external browser popup window button */}
              <button
                type="button"
                id="vastu-window-external-tab-btn"
                onClick={handleOpenBrowserWindow}
                className="px-2.5 py-1.5 bg-black/20 hover:bg-black/35 text-amber-200 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-amber-400/30"
                title="नयाँ ब्राउजर विन्डोमा खोल्नुहोस् (Open New Browser Window)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">नयाँ विन्डोमा खोल्नुहोस्</span>
              </button>

              {/* Fullscreen toggle */}
              <button
                type="button"
                id="vastu-window-fullscreen-btn"
                onClick={handleToggleNativeFullscreen}
                className="p-1.5 text-amber-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isFullScreen ? "सामान्य आकारमा फर्काउनुहोस्" : "पूर्ण स्क्रिन बनाउनुहोस्"}
                aria-label="Toggle Fullscreen"
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                id="vastu-window-close-btn"
                onClick={onClose}
                className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs ml-1"
                title="विन्डो बन्द गर्नुहोस् (Esc)"
                aria-label="Close Window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* DEDICATED VASTU NAVIGATION MENU BAR (NEW WINDOWS MA MENU JASARI) */}
          <nav 
            id="vastu-window-nav-menu"
            className="px-3 sm:px-4 py-2.5 bg-white dark:bg-[#201C19] border-b border-amber-200/80 dark:border-stone-800 shrink-0 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar"
            aria-label="Vastu Window Navigation Menu"
          >
            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider pr-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>मेनु:</span>
              </span>

              {VASTU_WINDOW_NAV_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                const isSelected = selectedSubTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    id={`vastu-win-nav-${item.id}`}
                    onClick={() => setSelectedSubTab(item.id)}
                    className={`group relative px-3 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                      isSelected
                        ? 'bg-[#7A1C1C] text-white border-[#5C1515] shadow-md ring-2 ring-amber-400/40'
                        : 'bg-stone-100/90 dark:bg-stone-800/80 hover:bg-amber-50 dark:hover:bg-stone-700 text-[#2D241E] dark:text-stone-200 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-amber-400 text-stone-950' 
                        : 'text-amber-700 dark:text-amber-400'
                    }`}>
                      <ItemIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="block leading-tight whitespace-nowrap">{item.labelNepali}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase transition-colors shrink-0 ${
                      isSelected 
                        ? 'bg-amber-300 text-stone-900' 
                        : 'bg-stone-200/80 dark:bg-stone-700 text-stone-600 dark:text-stone-300 group-hover:bg-amber-200 group-hover:text-stone-900'
                    }`}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* WINDOW BODY: Fully functional embedded Vastu Workspace */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 min-h-0 bg-[#FAF7F2] dark:bg-[#191715]">
            <VastuView
              orgProfile={orgProfile}
              activeProfile={activeProfile}
              initialSubTab={selectedSubTab}
              onSubTabChange={(newSubTab) => setSelectedSubTab(newSubTab)}
              inModalWindow={true}
              onCloseWindow={onClose}
            />
          </div>

          {/* WINDOW FOOTER BAR */}
          <footer className="px-4 py-2 bg-stone-100 dark:bg-[#201C19] border-t border-amber-200/60 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                सक्रिय मोड्युल: {VASTU_WINDOW_NAV_ITEMS.find(m => m.id === selectedSubTab)?.labelNepali}
              </span>
              <span className="text-stone-400 dark:text-stone-600">|</span>
              <span className="hidden sm:inline">
                {VASTU_WINDOW_NAV_ITEMS.find(m => m.id === selectedSubTab)?.descriptionNepali}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                बन्द गर्न <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-[10px] font-mono">Esc</kbd> थिच्नुहोस्
              </span>
              <button
                type="button"
                onClick={onClose}
                className="font-bold text-red-700 dark:text-red-400 hover:underline cursor-pointer"
              >
                विन्डो बन्द गर्नुहोस्
              </button>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
