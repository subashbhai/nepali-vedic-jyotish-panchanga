import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Sun,
  FileText, 
  Compass, 
  Clock, 
  Globe2, 
  CalendarDays, 
  Timer, 
  HeartHandshake, 
  Scroll, 
  Building2, 
  ShoppingBag, 
  UserCheck, 
  UserPlus, 
  Search, 
  Briefcase, 
  BookOpen, 
  Bot, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  Settings,
  Home,
  Grid,
  Sparkle,
  Users,
  Calendar,
  Hash,
  HelpCircle
} from 'lucide-react';
import { NavTab, PATRIKA_SUBMENUS } from './Navigation';
import { PatrikaSubCategory } from '../types/astrology';

export interface AstrologyMenuItem {
  id: NavTab;
  labelNepali: string;
  labelEnglish?: string;
  descriptionNepali?: string;
  icon: React.FC<{ className?: string }>;
  highlight?: boolean;
  category: 'core' | 'sahayak' | 'panchanga' | 'services' | 'knowledge' | 'system';
  hasSubmenu?: boolean;
}

export interface AstrologyMenuCategory {
  key: 'core' | 'sahayak' | 'panchanga' | 'services' | 'knowledge' | 'system';
  titleNepali: string;
  titleEnglish: string;
  description?: string;
}

export const MENU_CATEGORIES: AstrologyMenuCategory[] = [
  {
    key: 'core',
    titleNepali: 'मुख्य कुण्डली र फलादेश',
    titleEnglish: 'Core Kundali & Predictions',
    description: 'जन्मकुण्डली, पत्रिका, दशा र ग्रह गोचर'
  },
  {
    key: 'sahayak',
    titleNepali: 'अन्य फलादेश',
    titleEnglish: 'Other Prediction Systems',
    description: 'नेमा ज्योतिष (तिब्बती), अंक ज्योतिष, केपी र प्रश्न ज्योतिष'
  },
  {
    key: 'panchanga',
    titleNepali: 'पञ्चाङ्ग र शुभ मुहूर्त',
    titleEnglish: 'Panchanga & Muhurta',
    description: 'दैनिक पञ्चाङ्ग, विवाह, मुहूर्त र वास्तु'
  },
  {
    key: 'services',
    titleNepali: 'विशेषज्ञ तथा सेवाहरू',
    titleEnglish: 'Services & Experts',
    description: 'ज्योतिषी मोड, खरिद र सदस्यता'
  },
  {
    key: 'knowledge',
    titleNepali: 'ज्ञान तथा AI सेवा',
    titleEnglish: 'Knowledge & AI Assistant',
    description: 'ज्योतिष ज्ञान र AI ज्योतिषी परामर्श'
  },
  {
    key: 'system',
    titleNepali: 'प्रणाली र सेटिंग्स',
    titleEnglish: 'System & Controls',
    description: 'प्रशासनिक नियन्त्रण र सेटिंग्स'
  }
];

export const ALL_ASTROLOGY_MENU_ITEMS: AstrologyMenuItem[] = [
  // Core Category
  { id: 'rashifal', labelNepali: 'दैनिक राशिफल', labelEnglish: 'Daily Horoscope', descriptionNepali: 'सक्रिय जातकको ग्रह गोचर र AI व्यक्तिगत फलादेश', icon: Sun, category: 'core', highlight: true },
  { id: 'kundali', labelNepali: 'जन्मकुण्डली', labelEnglish: 'Janma Kundali', descriptionNepali: 'विस्तृत लग्न, ग्रह र कुण्डली चक्र', icon: Sparkles, category: 'core', highlight: true },
  { id: 'patrika', labelNepali: 'पत्रिका', labelEnglish: 'Patrika & Documents', descriptionNepali: 'चिना, विवाह, व्रतबन्ध र अन्य पत्रिका', icon: FileText, category: 'core', hasSubmenu: true },
  { id: 'faladesh', labelNepali: 'फलादेश', labelEnglish: 'Faladesh / Horoscope', descriptionNepali: 'भाव फल र विस्तृत ग्रह विश्लेषण', icon: Compass, category: 'core' },
  { id: 'dasha', labelNepali: 'दशा विवरण', labelEnglish: 'Dasha System', descriptionNepali: 'विंशोत्तरी महादशा, अन्तर्दशा र प्रत्यन्तर', icon: Clock, category: 'core' },
  { id: 'gochar', labelNepali: 'ग्रह गोचर', labelEnglish: 'Transit & Sade Sati', descriptionNepali: 'वर्तमान गोचर स्थिति र साढेसाती', icon: Globe2, category: 'core' },

  // Sahayak Category (अन्य फलादेश)
  { id: 'neemajyotish', labelNepali: 'नेमा ज्योतिष', labelEnglish: 'Tibetan Astrology', descriptionNepali: 'पञ्चतत्व, ९ मेवा, ८ पार्खा, जीवनशक्ति एवं वैदूर्य कार्पो मिलान', icon: Compass, category: 'sahayak', highlight: true },
  { id: 'ankajyotish', labelNepali: 'अंक ज्योतिष', labelEnglish: 'Numerology', descriptionNepali: 'मूलाङ्क, भाग्याङ्क, नामाङ्क र वर्ष चक्र', icon: Hash, category: 'sahayak', highlight: true },
  { id: 'kpjyotish', labelNepali: 'केपी ज्योतिष', labelEnglish: 'KP System', descriptionNepali: 'कृष्णमूर्ति पद्धति, उप-स्वामी (Sub-Lord) र भाव कस्प', icon: Compass, category: 'sahayak', highlight: true },
  { id: 'prashna', labelNepali: 'प्रश्न ज्योतिष', labelEnglish: 'Prashna Horary', descriptionNepali: 'आरुढ, तत्काल प्रश्न कुण्डली तथा कार्य सिद्धि विचार', icon: HelpCircle, category: 'sahayak', highlight: true },

  // Panchanga Category
  { id: 'calendar', labelNepali: 'नेपाली क्यालेन्डर', labelEnglish: 'Nepali Calendar', descriptionNepali: 'मासिक क्यालेन्डर, चाडपर्व, बिदाहरू र दैनिक पञ्चाङ्ग', icon: CalendarDays, category: 'panchanga', highlight: true },
  { id: 'panchanga', labelNepali: 'पञ्चाङ्ग', labelEnglish: 'Panchanga', descriptionNepali: 'तिथि, वार, नक्षत्र, योग र करण', icon: Sun, category: 'panchanga' },
  { id: 'muhurta', labelNepali: 'शुभ मुहूर्त', labelEnglish: 'Auspicious Timing', descriptionNepali: 'गृहप्रवेश, यात्रा र शुभ कार्य समय', icon: Timer, category: 'panchanga' },
  { id: 'vivah', labelNepali: 'विवाह मिलान', labelEnglish: 'Gun Milan', descriptionNepali: 'अष्टकूट गुण मिलान र भकूट दोष', icon: HeartHandshake, category: 'panchanga' },
  { id: 'sanskar', labelNepali: 'संस्कार दस्तावेज', labelEnglish: 'Sanskar Rituals', descriptionNepali: 'षोडश संस्कार र विधि विधान', icon: Scroll, category: 'panchanga' },
  { id: 'vastu', labelNepali: 'वास्तुशास्त्र', labelEnglish: 'Vastu Shastra', descriptionNepali: 'दिक्पाल, भवन र कक्ष वास्तु दिशा', icon: Building2, category: 'panchanga' },

  // Services Category
  { id: 'yajaman', labelNepali: 'यजमान सेवा मार्केटप्लेस', labelEnglish: 'Yajaman Service Booking', descriptionNepali: 'ज्योतिषी, पुरोहित तथा वास्तु विशेषज्ञ अनलाइन बुकिंग', icon: Users, category: 'services', highlight: true },
  { id: 'jyotishi', labelNepali: 'ज्योतिषी मोड', labelEnglish: 'Astrologer Mode', descriptionNepali: 'व्यावसायिक ज्योतिषी उपकरण र तालिका', icon: Briefcase, category: 'services' },
  { id: 'kharedi', labelNepali: 'सेवा खरिद', labelEnglish: 'Purchase Services', descriptionNepali: 'विशिष्ट पत्रिका तथा प्रतिवेदन खरिद', icon: ShoppingBag, category: 'services', highlight: true },
  { id: 'my_subscription', labelNepali: 'मेरो सदस्यता', labelEnglish: 'My Subscription', descriptionNepali: 'सदस्यता स्थिति र भुक्तानी विवरण', icon: UserCheck, category: 'services' },
  { id: 'apply_expert', labelNepali: 'विशेषज्ञ सदस्य आवेदन', labelEnglish: 'Become an Expert', descriptionNepali: 'हाम्रो संजालमा विशेषज्ञको रूपमा जोडिनुहोस्', icon: UserPlus, category: 'services' },

  // Knowledge & AI
  { id: 'knowledge', labelNepali: 'ज्योतिष ज्ञानकोश', labelEnglish: 'Astrology Knowledge Base', descriptionNepali: 'वैदिक लेख, ९ ग्रह प्रभाव, राजयोग तथा पारिभाषिक शब्दावली', icon: BookOpen, category: 'knowledge', highlight: true },
  { id: 'ai_assistant', labelNepali: 'AI ज्योतिषी', labelEnglish: 'AI Astrologer', descriptionNepali: 'कृत्रिम बुद्धिमत्ताबाट तत्काल प्रश्नोत्तर', icon: Bot, category: 'knowledge', highlight: true },

  // System Controls
  { id: 'settings', labelNepali: 'प्रणाली सेटिंग्स', labelEnglish: 'Settings', descriptionNepali: 'अयनांश, भाषा र विषयवस्तु सेटिंग्स', icon: Settings, category: 'system' }
];

export interface AstrologyMenuProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab, subTab?: PatrikaSubCategory) => void;
  className?: string;
  buttonLabel?: string;
  compact?: boolean;
}

export const AstrologyMenu: React.FC<AstrologyMenuProps> = ({
  activeTab,
  onTabChange,
  className = '',
  buttonLabel = '✨ ज्योतिष',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPatrika, setExpandedPatrika] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setExpandedPatrika(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setExpandedPatrika(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeItem = ALL_ASTROLOGY_MENU_ITEMS.find((item) => item.id === activeTab) || ALL_ASTROLOGY_MENU_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  // Filter items based on search query
  const filteredItems = ALL_ASTROLOGY_MENU_ITEMS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      item.labelNepali.toLowerCase().includes(query) ||
      (item.labelEnglish && item.labelEnglish.toLowerCase().includes(query)) ||
      (item.descriptionNepali && item.descriptionNepali.toLowerCase().includes(query))
    );
  });

  const handleSelectTab = (tab: NavTab, subTab?: PatrikaSubCategory) => {
    onTabChange(tab, subTab);
    setIsOpen(false);
    setExpandedPatrika(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      {/* Dropdown Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border shadow-sm ${
          isOpen
            ? 'bg-[#D97706] text-white border-[#B45309] ring-2 ring-amber-500/30'
            : 'bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 text-[#D97706] dark:text-amber-300 border-amber-400/30 dark:border-amber-700/50'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Grid className="w-4 h-4 shrink-0 text-[#D97706] dark:text-amber-400" />
          <span className="font-bold tracking-wide truncate max-w-[120px] sm:max-w-none">
            {buttonLabel}
          </span>
          {!compact && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 dark:bg-amber-400/20 text-[#B45309] dark:text-amber-200 font-medium">
              <ActiveIcon className="w-3 h-3" />
              {activeItem.labelNepali}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : 'text-[#D97706] dark:text-amber-400'
          }`}
        />
      </motion.button>

      {/* Main Dropdown Panel with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 sm:left-0 md:left-0 mt-2 w-[320px] sm:w-[540px] md:w-[680px] bg-white dark:bg-[#1C1917] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-[#2D241E] dark:text-stone-100 backdrop-blur-xl origin-top"
          >
            {/* Top Header Bar */}
            <div className="p-3 sm:p-4 bg-stone-50/90 dark:bg-stone-900/90 border-b border-[#E6E0D5] dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-[#D97706] dark:text-amber-400">
                <Sparkle className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100 font-serif">
                  ज्योतिष सेवा र मोड्युलहरू
                </h3>
                <p className="text-[11px] text-[#78716C] dark:text-stone-400">
                  नेपाली ज्योतिष, पञ्चाङ्ग र कुण्डली सेवा
                </p>
              </div>
            </div>

            {/* Quick Search Input */}
            <div className="relative flex-1 max-w-full sm:max-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="खोज्नुहोस् (उदा: पत्रिका, दशा)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#2D241E] dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                autoFocus
              />
            </div>
          </div>

          {/* Menu Sections Grid */}
          <div className="max-h-[70vh] sm:max-h-[520px] overflow-y-auto p-3 sm:p-4 space-y-5 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
            {MENU_CATEGORIES.map((category) => {
              const categoryItems = filteredItems.filter((item) => item.category === category.key);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.key} className="space-y-2">
                  {/* Category Label */}
                  <div className="flex items-center justify-between pb-1 border-b border-[#E6E0D5]/60 dark:border-stone-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 rounded-full bg-[#D97706] dark:bg-amber-500" />
                      <span className="text-xs font-bold text-[#D97706] dark:text-amber-400 uppercase tracking-wider">
                        {category.titleNepali}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {category.titleEnglish}
                    </span>
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {categoryItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const isPatrika = item.id === 'patrika';

                      return (
                        <div key={item.id} className="relative group">
                          <button
                            type="button"
                            onClick={() => {
                              if (isPatrika) {
                                onTabChange('patrika');
                                setExpandedPatrika(!expandedPatrika);
                              } else {
                                handleSelectTab(item.id);
                              }
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-start gap-2.5 border ${
                              isActive
                                ? 'bg-[#F59E0B]/15 dark:bg-amber-500/20 text-[#D97706] dark:text-amber-300 border-[#D97706]/40 dark:border-amber-500/40 font-bold shadow-sm'
                                : 'bg-stone-50/50 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-800/80 border-transparent hover:border-[#E6E0D5] dark:hover:border-stone-700 text-[#2D241E] dark:text-stone-200'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isActive
                                  ? 'bg-[#D97706] text-white shadow-sm'
                                  : 'bg-white dark:bg-stone-800 text-[#D97706] dark:text-amber-400 border border-[#E6E0D5] dark:border-stone-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-semibold truncate flex items-center gap-1">
                                  {item.labelNepali}
                                  {item.highlight && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0 animate-ping" />
                                  )}
                                </span>
                                {isPatrika && (
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform text-stone-400 ${
                                      expandedPatrika ? 'rotate-180' : ''
                                    }`}
                                  />
                                )}
                              </div>
                              {item.descriptionNepali && (
                                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5 leading-snug">
                                  {item.descriptionNepali}
                                </p>
                              )}
                            </div>
                          </button>

                          {/* Nested Patrika Submenu Options */}
                          {isPatrika && expandedPatrika && (
                            <div className="mt-1.5 ml-3 pl-3 border-l-2 border-[#D97706]/30 dark:border-amber-500/30 grid grid-cols-2 gap-1 py-1.5 bg-stone-100/50 dark:bg-stone-800/40 rounded-xl p-2 animate-in fade-in duration-150">
                              {PATRIKA_SUBMENUS.map((sub) => (
                                <button
                                  key={sub.key}
                                  type="button"
                                  onClick={() => handleSelectTab('patrika', sub.key)}
                                  className="text-left px-2 py-1 rounded-lg text-[11px] font-medium text-stone-700 dark:text-stone-300 hover:bg-[#D97706]/15 hover:text-[#D97706] dark:hover:text-amber-300 transition-colors flex items-center justify-between truncate"
                                >
                                  <span>{sub.label}</span>
                                  <ChevronRight className="w-3 h-3 text-stone-400 opacity-60" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-stone-400 text-xs">
                कुनै नतिजा भेटिएन। कृपया अर्को खोज शब्द प्रयोग गर्नुहोस्।
              </div>
            )}
          </div>

          {/* Bottom Bar Info */}
          <div className="px-4 py-2.5 bg-stone-100/80 dark:bg-stone-900/80 border-t border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span>सक्रिय मोड्युल: <strong className="text-[#D97706] dark:text-amber-400">{activeItem.labelNepali}</strong></span>
            <span className="hidden sm:inline">बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा v2.0</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
};
