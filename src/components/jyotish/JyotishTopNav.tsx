import React, { memo, useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Hash,
  Compass,
  Calendar,
  Sun,
  HeartHandshake,
  FileText,
  Globe2,
  Clock,
  Layers,
  Award,
  Search,
  BookOpen,
  Printer,
  Briefcase,
  Receipt,
  Building2,
  ChevronDown,
  ChevronRight,
  User,
  Check,
  Palette
} from 'lucide-react';
import { JyotishSidebarTab } from './JyotishSidebar';
import { PATRIKA_TYPES_LIST } from '../PatrikaView';

export interface JyotishTopNavProps {
  activeTab: JyotishSidebarTab;
  onSelectTab: (tab: JyotishSidebarTab, subTab?: any) => void;
  onExit: () => void;
  clientName?: string;
  onOpenThemeModal?: () => void;
}

export const SAHAYAK_JYOTISH_SUBMENUS: Array<{
  id: JyotishSidebarTab;
  label: string;
  number: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}> = [
  { id: 'prashna', number: '०१', label: 'प्रश्न ज्योतिष', icon: HelpCircle, description: 'तत्काल प्रश्न, देवज्ञ उत्तर तथा प्रश्न फल' },
  { id: 'ankajyotish', number: '०२', label: 'अंक ज्योतिष', icon: Hash, description: 'मूलाङ्क, भाग्याङ्क र नामाङ्क विश्लेषण' },
  { id: 'kpjyotish', number: '०३', label: 'केपी ज्योतिष', icon: Compass, description: 'कृष्णमूर्ति पद्धति, उप-स्वामी (Sub-Lord) र कस्प' },
  { id: 'neemajyotish', number: '०४', label: 'नेमा ज्योतिष', icon: Compass, description: 'तिब्बती पञ्चतत्व, ९ मेवा र ८ पार्खा' },
];

export const FALADESH_SUBMENUS: Array<{
  id: JyotishSidebarTab;
  label: string;
  number: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}> = [
  { id: 'faladesh', number: '०७', label: 'फलादेश (समग्र भाव फल)', icon: Sparkles, description: 'भाव फल, ग्रह फल तथा विस्तृत जीवन विश्लेषण' },
  { id: 'gochar', number: '११', label: 'ग्रह गोचर', icon: Globe2, description: 'वर्तमान गोचर स्थिति र साढेसाती प्रभाव' },
  { id: 'yearly', number: '१२', label: 'वार्षिक फल', icon: Calendar, description: 'वर्षफल (Varshaphal), तजक र मुन्था विचार' },
  { id: 'dasha_fal', number: '१३', label: 'दशा फल', icon: Clock, description: 'विंशोत्तरी, त्रिभागी र योगिनी दशा फल' },
  { id: 'varga', number: '१४', label: 'वर्ग कुण्डली', icon: Layers, description: 'षोडशवर्ग (D1 देखि D60) र नवमांश विश्लेषण' },
  { id: 'yoga', number: '१५', label: 'योग फल', icon: Award, description: 'राजयोग, धनयोग, पञ्चमहापुरुष तथा विपरीत योग' },
  { id: 'nakshatra', number: '१६', label: 'नक्षत्र फल', icon: Sun, description: 'जन्म नक्षत्र, चरण, पद तथा स्वभाव फल' },
];

export const TOP_BAR_SUBMENUS: Array<{
  id: JyotishSidebarTab;
  label: string;
  number: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'workspace', number: '१०', label: 'जन्मकुण्डली', icon: Sparkles },
  { id: 'calendar', number: '०४', label: 'क्यालेन्डर', icon: Calendar },
  { id: 'panchanga', number: '०५', label: 'पञ्चाङ्ग', icon: Sun },
  { id: 'match', number: '०८', label: 'कुण्डली मिलान', icon: HeartHandshake },
  { id: 'patrika', number: '०९', label: 'पत्रिका', icon: FileText },
  { id: 'prashna_kundali', number: '१७', label: 'प्रश्न कुण्डली', icon: Search },
  { id: 'life_utility', number: '१८', label: 'जीवन उपयोगी', icon: BookOpen },
];

export const KARYALAYA_SUBMENUS: Array<{
  id: JyotishSidebarTab;
  label: string;
  number: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}> = [
  { id: 'report_print', number: '१९', label: 'प्रतिवेदन तथा मुद्रण', icon: Printer, description: 'A4 मुद्रण तथा PDF प्रतिवेदन' },
  { id: 'consultations', number: '२०', label: 'परामर्श रेकर्ड', icon: Briefcase, description: 'ग्राहक परामर्श इतिहास तथा टिप्पणी' },
  { id: 'receipts', number: '२१', label: 'शुल्क रसिद', icon: Receipt, description: 'सेवा शुल्क रसिद तथा भुक्तानी' },
  { id: 'branding', number: '२२', label: 'कार्यालय सेटिङ', icon: Building2, description: 'लेटरहेड, लोगो तथा संस्थागत सेटिङ' },
];

export const JyotishTopNav: React.FC<JyotishTopNavProps> = memo(({
  activeTab,
  onSelectTab,
  onExit,
  clientName,
  onOpenThemeModal,
}) => {
  // Sahayak Jyotish Dropdown State
  const [isSahayakOpen, setIsSahayakOpen] = useState(false);
  const [sahayakDropdownPosition, setSahayakDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const sahayakButtonRef = useRef<HTMLButtonElement>(null);
  const sahayakDropdownRef = useRef<HTMLDivElement>(null);

  // Faladesh Dropdown State
  const [isFaladeshOpen, setIsFaladeshOpen] = useState(false);
  const [faladeshDropdownPosition, setFaladeshDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const faladeshButtonRef = useRef<HTMLButtonElement>(null);
  const faladeshDropdownRef = useRef<HTMLDivElement>(null);

  // Karyalaya Dropdown State
  const [isKaryalayaOpen, setIsKaryalayaOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const karyalayaButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Patrika Dropdown State
  const [isPatrikaOpen, setIsPatrikaOpen] = useState(false);
  const [patrikaDropdownPosition, setPatrikaDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const patrikaButtonRef = useRef<HTMLButtonElement>(null);
  const patrikaDropdownRef = useRef<HTMLDivElement>(null);

  const isSahayakActive = SAHAYAK_JYOTISH_SUBMENUS.some((item) => item.id === activeTab);
  const activeSahayakItem = SAHAYAK_JYOTISH_SUBMENUS.find((item) => item.id === activeTab);

  const isFaladeshActive = FALADESH_SUBMENUS.some((item) => item.id === activeTab);
  const activeFaladeshItem = FALADESH_SUBMENUS.find((item) => item.id === activeTab);

  const isKaryalayaActive = KARYALAYA_SUBMENUS.some((item) => item.id === activeTab);
  const activeKaryalayaItem = KARYALAYA_SUBMENUS.find((item) => item.id === activeTab);

  // Position calculation for Sahayak Jyotish dropdown
  const updateSahayakPosition = () => {
    if (sahayakButtonRef.current) {
      const rect = sahayakButtonRef.current.getBoundingClientRect();
      const dropdownWidth = 270;
      let calculatedLeft = rect.left;
      if (calculatedLeft + dropdownWidth > window.innerWidth - 12) {
        calculatedLeft = window.innerWidth - dropdownWidth - 12;
      }
      setSahayakDropdownPosition({
        top: rect.bottom + 6,
        left: Math.max(8, calculatedLeft),
      });
    }
  };

  const toggleSahayak = () => {
    if (!isSahayakOpen) {
      updateSahayakPosition();
      setIsFaladeshOpen(false);
      setIsKaryalayaOpen(false);
    }
    setIsSahayakOpen((prev) => !prev);
  };

  // Position calculation for Faladesh dropdown
  const updateFaladeshPosition = () => {
    if (faladeshButtonRef.current) {
      const rect = faladeshButtonRef.current.getBoundingClientRect();
      const dropdownWidth = 280;
      let calculatedLeft = rect.left;
      if (calculatedLeft + dropdownWidth > window.innerWidth - 12) {
        calculatedLeft = window.innerWidth - dropdownWidth - 12;
      }
      setFaladeshDropdownPosition({
        top: rect.bottom + 6,
        left: Math.max(8, calculatedLeft),
      });
    }
  };

  const toggleFaladesh = () => {
    if (!isFaladeshOpen) {
      updateFaladeshPosition();
      setIsSahayakOpen(false);
      setIsKaryalayaOpen(false);
    }
    setIsFaladeshOpen((prev) => !prev);
  };

  // Position calculation for Karyalaya dropdown
  const updateDropdownPosition = () => {
    if (karyalayaButtonRef.current) {
      const rect = karyalayaButtonRef.current.getBoundingClientRect();
      const dropdownWidth = 260;
      let calculatedLeft = rect.left;
      if (calculatedLeft + dropdownWidth > window.innerWidth - 12) {
        calculatedLeft = window.innerWidth - dropdownWidth - 12;
      }
      setDropdownPosition({
        top: rect.bottom + 6,
        left: Math.max(8, calculatedLeft),
      });
    }
  };

  const toggleKaryalaya = () => {
    if (!isKaryalayaOpen) {
      updateDropdownPosition();
      setIsSahayakOpen(false);
      setIsFaladeshOpen(false);
      setIsPatrikaOpen(false);
    }
    setIsKaryalayaOpen((prev) => !prev);
  };

  const updatePatrikaPosition = () => {
    if (patrikaButtonRef.current) {
      const rect = patrikaButtonRef.current.getBoundingClientRect();
      const dropdownWidth = 280;
      let calculatedLeft = rect.left;
      if (calculatedLeft + dropdownWidth > window.innerWidth - 12) {
        calculatedLeft = window.innerWidth - dropdownWidth - 12;
      }
      setPatrikaDropdownPosition({
        top: rect.bottom + 6,
        left: Math.max(8, calculatedLeft),
      });
    }
  };

  const togglePatrika = () => {
    if (!isPatrikaOpen) {
      updatePatrikaPosition();
      setIsSahayakOpen(false);
      setIsFaladeshOpen(false);
      setIsKaryalayaOpen(false);
    }
    setIsPatrikaOpen((prev) => !prev);
  };

  // Click outside and escape handler
  useEffect(() => {
    if (!isKaryalayaOpen && !isSahayakOpen && !isFaladeshOpen && !isPatrikaOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsKaryalayaOpen(false);
        setIsSahayakOpen(false);
        setIsFaladeshOpen(false);
        setIsPatrikaOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        karyalayaButtonRef.current &&
        !karyalayaButtonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsKaryalayaOpen(false);
      }
      if (
        sahayakButtonRef.current &&
        !sahayakButtonRef.current.contains(target) &&
        sahayakDropdownRef.current &&
        !sahayakDropdownRef.current.contains(target)
      ) {
        setIsSahayakOpen(false);
      }
      if (
        faladeshButtonRef.current &&
        !faladeshButtonRef.current.contains(target) &&
        faladeshDropdownRef.current &&
        !faladeshDropdownRef.current.contains(target)
      ) {
        setIsFaladeshOpen(false);
      }
      if (
        patrikaButtonRef.current &&
        !patrikaButtonRef.current.contains(target) &&
        patrikaDropdownRef.current &&
        !patrikaDropdownRef.current.contains(target)
      ) {
        setIsPatrikaOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isKaryalayaOpen) {
        updateDropdownPosition();
      }
      if (isSahayakOpen) {
        updateSahayakPosition();
      }
      if (isFaladeshOpen) {
        updateFaladeshPosition();
      }
      if (isPatrikaOpen) {
        updatePatrikaPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isKaryalayaOpen, isSahayakOpen, isFaladeshOpen, isPatrikaOpen]);

  // Separate workspace (first item) and the rest
  const workspaceItem = TOP_BAR_SUBMENUS.find((item) => item.id === 'workspace') || TOP_BAR_SUBMENUS[0];
  const remainingSubmenus = TOP_BAR_SUBMENUS.filter((item) => item.id !== 'workspace');

  return (
    <div className="bg-[#FAF7F2] dark:bg-stone-900 border-b border-[#E6E0D5] dark:border-stone-800 shadow-2xs sticky top-0 z-30">
      {/* Horizontal Scrollable Submenu Strip */}
      <div className="max-w-[1700px] mx-auto px-2 sm:px-4 flex items-center gap-1 overflow-x-auto py-1.5 no-scrollbar">
        {/* Workspace: जन्मकुण्डली */}
        {(() => {
          const Icon = workspaceItem.icon;
          const isActive = activeTab === workspaceItem.id || activeTab === ('kundali' as any);
          return (
            <button
              key={workspaceItem.id}
              onClick={() => {
                setIsKaryalayaOpen(false);
                setIsSahayakOpen(false);
                setIsFaladeshOpen(false);
                onSelectTab(workspaceItem.id);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#7A1C1C] text-white shadow-xs font-bold'
                  : 'text-[#2D241E] dark:text-stone-300 hover:bg-[#EAE4D9] dark:hover:bg-stone-800 hover:text-[#7A1C1C]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-amber-800 dark:text-amber-400'}`} />
              <span>{workspaceItem.label}</span>
            </button>
          );
        })()}

        {/* 'अन्य फलादेश' Dropdown Menu Trigger Button */}
        <div className="relative shrink-0">
          <button
            ref={sahayakButtonRef}
            type="button"
            onClick={toggleSahayak}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
              isSahayakActive
                ? 'bg-[#7A1C1C] text-white border-[#5A1212] shadow-xs font-bold'
                : isSahayakOpen
                ? 'bg-amber-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 border-amber-300 dark:border-stone-700 shadow-2xs'
                : 'bg-white dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-750 hover:text-[#7A1C1C]'
            }`}
            title="अन्य फलादेश विधा (प्रश्न, अंक, केपी, नेमा ज्योतिष)"
          >
            {activeSahayakItem ? (
              <activeSahayakItem.icon className={`w-3.5 h-3.5 ${isSahayakActive ? 'text-amber-300' : 'text-amber-800 dark:text-amber-400'}`} />
            ) : (
              <Compass className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            )}
            <span>अन्य फलादेश</span>
            {isSahayakActive && activeSahayakItem && (
              <span className="hidden xl:inline text-[11px] font-normal opacity-90">
                : {activeSahayakItem.label}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isSahayakOpen ? 'rotate-180 text-amber-400' : isSahayakActive ? 'text-amber-300' : 'opacity-70'
              }`}
            />
          </button>
        </div>

        {/* 'फलादेश' Dropdown Menu Trigger Button */}
        <div className="relative shrink-0">
          <button
            ref={faladeshButtonRef}
            type="button"
            onClick={toggleFaladesh}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
              isFaladeshActive
                ? 'bg-[#7A1C1C] text-white border-[#5A1212] shadow-xs font-bold'
                : isFaladeshOpen
                ? 'bg-amber-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 border-amber-300 dark:border-stone-700 shadow-2xs'
                : 'bg-white dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-750 hover:text-[#7A1C1C]'
            }`}
            title="फलादेश तथा फल विश्लेषण (गोचर, वार्षिक फल, दशा, वर्ग, योग, नक्षत्र)"
          >
            {activeFaladeshItem ? (
              <activeFaladeshItem.icon className={`w-3.5 h-3.5 ${isFaladeshActive ? 'text-amber-300' : 'text-amber-800 dark:text-amber-400'}`} />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            )}
            <span>फलादेश</span>
            {isFaladeshActive && activeFaladeshItem && (
              <span className="hidden xl:inline text-[11px] font-normal opacity-90">
                : {activeFaladeshItem.label}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isFaladeshOpen ? 'rotate-180 text-amber-400' : isFaladeshActive ? 'text-amber-300' : 'opacity-70'
              }`}
            />
          </button>
        </div>

        {/* Remaining Main Submenus (क्यालेन्डर, पञ्चाङ्ग, ...) */}
        {remainingSubmenus.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || 
            (item.id === 'prashna_kundali' && activeTab === 'aarje');

          if (item.id === 'patrika') {
            const isPatrikaActive = activeTab === 'patrika';
            return (
              <div key={item.id} className="relative shrink-0">
                <button
                  ref={patrikaButtonRef}
                  type="button"
                  onClick={() => {
                    togglePatrika();
                    if (!isPatrikaOpen && !isPatrikaActive) {
                      onSelectTab('patrika');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
                    isPatrikaActive
                      ? 'bg-[#7A1C1C] text-white border-[#5A1212] shadow-xs font-bold'
                      : isPatrikaOpen
                      ? 'bg-amber-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 border-amber-300 dark:border-stone-700 shadow-2xs'
                      : 'bg-white dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-750 hover:text-[#7A1C1C]'
                  }`}
                  title="जन्मपत्रिका तथा दस्तावेज (चिना, टिप्पन, विवाह, व्रतबन्ध...)"
                >
                  <Icon className={`w-3.5 h-3.5 ${isPatrikaActive ? 'text-amber-300' : 'text-amber-800 dark:text-amber-400'}`} />
                  <span>{item.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isPatrikaOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                setIsKaryalayaOpen(false);
                setIsSahayakOpen(false);
                setIsFaladeshOpen(false);
                setIsPatrikaOpen(false);
                onSelectTab(item.id);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#7A1C1C] text-white shadow-xs font-bold'
                  : 'text-[#2D241E] dark:text-stone-300 hover:bg-[#EAE4D9] dark:hover:bg-stone-800 hover:text-[#7A1C1C]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-amber-800 dark:text-amber-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* 'कार्यालय' Dropdown Menu Trigger Button */}
        <div className="relative shrink-0 ml-0.5">
          <button
            ref={karyalayaButtonRef}
            type="button"
            onClick={toggleKaryalaya}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
              isKaryalayaActive
                ? 'bg-[#7A1C1C] text-white border-[#5A1212] shadow-xs font-bold'
                : isKaryalayaOpen
                ? 'bg-amber-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 border-amber-300 dark:border-stone-700 shadow-2xs'
                : 'bg-white dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-750 hover:text-[#7A1C1C]'
            }`}
            title="कार्यालय व्यवस्थापन सुविधाहरू"
          >
            <Building2 className={`w-3.5 h-3.5 ${isKaryalayaActive ? 'text-amber-300' : 'text-amber-800 dark:text-amber-400'}`} />
            <span>कार्यालय</span>
            {isKaryalayaActive && activeKaryalayaItem && (
              <span className="hidden xl:inline text-[11px] font-normal opacity-90">
                : {activeKaryalayaItem.label}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isKaryalayaOpen ? 'rotate-180 text-amber-400' : isKaryalayaActive ? 'text-amber-300' : 'opacity-70'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Floating Sahayak Jyotish Dropdown Menu */}
      {isSahayakOpen && sahayakDropdownPosition && (
        <div
          ref={sahayakDropdownRef}
          style={{
            position: 'fixed',
            top: `${sahayakDropdownPosition.top}px`,
            left: `${sahayakDropdownPosition.left}px`,
            width: '270px',
            zIndex: 9999,
          }}
          className="bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-amber-200/80 dark:border-stone-700 p-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-2.5 py-1.5 border-b border-stone-100 dark:border-stone-800 text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#7A1C1C] dark:text-amber-400" />
              <span>अन्य फलादेश शाखाहरू</span>
            </span>
            <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-300">
              ४ विधा
            </span>
          </div>

          <div className="py-1 space-y-0.5">
            {SAHAYAK_JYOTISH_SUBMENUS.map((sub) => {
              const SubIcon = sub.icon;
              const isItemActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(sub.id);
                    setIsSahayakOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                    isItemActive
                      ? 'bg-amber-100 dark:bg-amber-950/70 text-[#7A1C1C] dark:text-amber-300 font-bold border border-amber-300/80 dark:border-amber-800'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isItemActive
                          ? 'bg-[#7A1C1C] text-amber-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400'
                      }`}
                    >
                      <SubIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-xs leading-tight">
                        {sub.label}
                      </div>
                      <div className="text-[10px] font-normal text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {sub.description}
                      </div>
                    </div>
                  </div>

                  {isItemActive && (
                    <Check className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400 shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Faladesh Dropdown Menu */}
      {isFaladeshOpen && faladeshDropdownPosition && (
        <div
          ref={faladeshDropdownRef}
          style={{
            position: 'fixed',
            top: `${faladeshDropdownPosition.top}px`,
            left: `${faladeshDropdownPosition.left}px`,
            width: '290px',
            zIndex: 9999,
          }}
          className="bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-amber-200/80 dark:border-stone-700 p-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-2.5 py-1.5 border-b border-stone-100 dark:border-stone-800 text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7A1C1C] dark:text-amber-400" />
              <span>फलादेश तथा फल विश्लेषण</span>
            </span>
            <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-300">
              ७ शाखाहरू
            </span>
          </div>

          <div className="py-1 space-y-0.5">
            {FALADESH_SUBMENUS.map((sub) => {
              const SubIcon = sub.icon;
              const isItemActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(sub.id);
                    setIsFaladeshOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                    isItemActive
                      ? 'bg-amber-100 dark:bg-amber-950/70 text-[#7A1C1C] dark:text-amber-300 font-bold border border-amber-300/80 dark:border-amber-800'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isItemActive
                          ? 'bg-[#7A1C1C] text-amber-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400'
                      }`}
                    >
                      <SubIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-xs leading-tight">
                        {sub.label}
                      </div>
                      <div className="text-[10px] font-normal text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {sub.description}
                      </div>
                    </div>
                  </div>

                  {isItemActive && (
                    <Check className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400 shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Dropdown Menu (Fixed positioned so it's never clipped by overflow-x container) */}
      {isKaryalayaOpen && dropdownPosition && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: '260px',
            zIndex: 9999,
          }}
          className="bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-amber-200/80 dark:border-stone-700 p-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-2.5 py-1.5 border-b border-stone-100 dark:border-stone-800 text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#7A1C1C] dark:text-amber-400" />
              <span>कार्यालय व्यवस्थापन</span>
            </span>
            <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-300">
              ४ सुविधाहरू
            </span>
          </div>

          <div className="py-1 space-y-0.5">
            {KARYALAYA_SUBMENUS.map((sub) => {
              const SubIcon = sub.icon;
              const isItemActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(sub.id);
                    setIsKaryalayaOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                    isItemActive
                      ? 'bg-amber-100 dark:bg-amber-950/70 text-[#7A1C1C] dark:text-amber-300 font-bold border border-amber-300/80 dark:border-amber-800'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isItemActive
                          ? 'bg-[#7A1C1C] text-amber-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400'
                      }`}
                    >
                      <SubIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-xs leading-tight">
                        {sub.label}
                      </div>
                      <div className="text-[10px] font-normal text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {sub.description}
                      </div>
                    </div>
                  </div>

                  {isItemActive && (
                    <Check className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400 shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Patrika Dropdown Menu */}
      {isPatrikaOpen && patrikaDropdownPosition && (
        <div
          ref={patrikaDropdownRef}
          style={{
            position: 'fixed',
            top: `${patrikaDropdownPosition.top}px`,
            left: `${patrikaDropdownPosition.left}px`,
            width: '290px',
            zIndex: 9999,
          }}
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-amber-300 dark:border-stone-700 p-2 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[420px] overflow-y-auto"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-[#D97706] uppercase tracking-wider border-b border-amber-200 dark:border-stone-700 flex justify-between">
            <span>जन्मपत्रिका तथा दस्तावेजहरू</span>
            <span>छनोट</span>
          </div>
          <div className="space-y-0.5 mt-1">
            {PATRIKA_TYPES_LIST.map((sub) => (
              <button
                key={sub.key}
                type="button"
                onClick={() => {
                  setIsPatrikaOpen(false);
                  onSelectTab('patrika', sub.key);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="truncate pr-1">
                  <div className="font-bold text-stone-800 dark:text-stone-100 group-hover:text-[#D97706] truncate">
                    {sub.label}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {sub.desc}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#D97706] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
