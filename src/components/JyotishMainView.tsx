import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Award,
  Sun,
  FileText,
  Users,
  Search,
  BookOpen,
  Briefcase,
  Receipt,
  Building2,
  X,
  Printer,
  Compass,
  HelpCircle,
  Hash,
  CalendarDays,
  HeartHandshake,
  Globe2,
  Clock,
  ArrowLeft,
  User,
  Shield,
  Bot,
  Palette
} from 'lucide-react';

import {
  BirthDetails,
  PanchangaData,
  YogaResult,
  ApplicationSettings,
  OrganizationProfile,
  AstrologerProfile,
  PurohitProfile,
  PatrikaSubCategory,
  ConsultationRecord,
  FeeReceipt,
  PrintLogEntry
} from '../types/astrology';

import {
  getStoredConsultations,
  addConsultation,
  getStoredReceipts,
  addReceipt,
  getStoredPrintLogs
} from '../db/jyotishiStore';

import { getCachedAstroCalculation, createAstroCacheKey } from '../utils/astroCache';
import { calculateGocharAndSadeSati } from '../utils/gocharEngine';
import { toDevanagariNumerals, convertADToBS } from '../utils/nepaliCalendar';
import { NavTab } from './Navigation';

// Jyotish Workspace Modules
import { JyotishTopNav } from './jyotish/JyotishTopNav';
import { JyotishSidebarTab, JYOTISH_ALL_SUBMENUS } from './jyotish/JyotishSidebar';
import { BirthDetailsPanel } from './jyotish/BirthDetailsPanel';
import { KundaliChartPanel } from './jyotish/KundaliChartPanel';
import { PanchangaPanel } from './jyotish/PanchangaPanel';
import { PlanetPositionTable } from './jyotish/PlanetPositionTable';
import { BhavaTable } from './jyotish/BhavaTable';
import { VimshottariDashaPanel } from './jyotish/VimshottariDashaPanel';
import { ComprehensiveDashaPanel } from './jyotish/ComprehensiveDashaPanel';
import { YogaPanel } from './jyotish/YogaPanel';
import { VargaKundaliView } from './jyotish/VargaKundaliView';
import { TransitView } from './jyotish/TransitView';
import { KundaliMatchView } from './jyotish/KundaliMatchView';
import { KundaliReportView } from './jyotish/KundaliReportView';
import { PrintPreviewModal } from './PrintPreviewModal';
import { ClientThemeNotificationModal } from './subscription/ClientThemeNotificationModal';

// Dedicated Astrology Views Integrated into Workspace
import { PrashnaListView } from './PrashnaListView';
import { AnkaJyotishView } from './AnkaJyotishView';
import { KPJyotishView } from './KPJyotishView';
import { NeemaJyotishView } from './NeemaJyotishView';
import { NepaliCalendarView } from './NepaliCalendarView';
import { PanchangaView } from './PanchangaView';
import { FaladeshView } from './FaladeshView';
import { PatrikaView } from './PatrikaView';
import { AarjeView } from './AarjeView';
import { KnowledgeBaseView } from './KnowledgeBaseView';
import { DailyHoroscopeView } from './DailyHoroscopeView';
import { MuhurtaView } from './MuhurtaView';
import { VastuView } from './VastuView';
import { AIAssistantView } from './AIAssistantView';
import { JyotishVastuLicenseHeader } from './common/JyotishVastuLicenseHeader';

export interface JyotishMainViewProps {
  profiles: BirthDetails[];
  activeProfile: BirthDetails | null;
  onSelectProfile: (profile: BirthDetails) => void;
  onNewProfile: () => void;
  onDeleteProfile: (id: string) => void;
  settings: ApplicationSettings;
  onSaveSettings: (settings: ApplicationSettings) => void;
  onNavigate: (tab: NavTab) => void;
  onExit: () => void;
  onMembersUpdated?: () => void;
  orgProfile?: OrganizationProfile;
  astrologers?: AstrologerProfile[];
  purohits?: PurohitProfile[];
  onEditProfile?: (profile: BirthDetails) => void;
  initialSubTab?: PatrikaSubCategory;
  onOpenPurchaseModal?: () => void;
}

export const JyotishMainView: React.FC<JyotishMainViewProps> = memo(({
  profiles,
  activeProfile,
  onSelectProfile,
  onNewProfile,
  onDeleteProfile,
  settings,
  onSaveSettings,
  onNavigate,
  onExit,
  onMembersUpdated,
  orgProfile,
  astrologers = [],
  purohits = [],
  onEditProfile,
  initialSubTab = 'china',
  onOpenPurchaseModal,
}) => {
  const [activeSidebarTab, setActiveSidebarTab] = useState<JyotishSidebarTab>('workspace');
  const [patrikaSubTab, setPatrikaSubTab] = useState<PatrikaSubCategory>(initialSubTab || 'china');

  useEffect(() => {
    if (initialSubTab) {
      setPatrikaSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Consolidate legacy 'patro' tab to 'calendar'
  useEffect(() => {
    if ((activeSidebarTab as string) === 'patro') {
      setActiveSidebarTab('calendar');
    }
  }, [activeSidebarTab]);

  // Quick Access Modal State
  const [quickAccessModal, setQuickAccessModal] = useState<string | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Store Records State
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [printLogs, setPrintLogs] = useState<PrintLogEntry[]>([]);

  // Search & Filters for Client List
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals state
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isNewConsultationModalOpen, setIsNewConsultationModalOpen] = useState(false);
  const [selectedClientForConsultation, setSelectedClientForConsultation] = useState<BirthDetails | null>(null);

  const [isNewReceiptModalOpen, setIsNewReceiptModalOpen] = useState(false);
  const [selectedReceiptToPrint, setSelectedReceiptToPrint] = useState<FeeReceipt | null>(null);

  // Consultation Form State
  const [consTopic, setConsTopic] = useState('करियर तथा व्यापार परामर्श');
  const [consNotes, setConsNotes] = useState('');
  const [consRemedies, setConsRemedies] = useState('');
  const [consFee, setConsFee] = useState(1000);
  const [consStatus, setConsStatus] = useState<'सम्पन्न' | 'बाँकी' | 'आंशिक'>('सम्पन्न');

  // Receipt Form State
  const [recPayerName, setRecPayerName] = useState('');
  const [recPurpose, setRecPurpose] = useState('कुण्डली निर्माण तथा फलादेश परामर्श');
  const [recAmount, setRecAmount] = useState(1100);
  const [recPaymentMethod, setRecPaymentMethod] = useState<'नगद' | 'ईसेवा' | 'फोनपे' | 'बैंक ट्रान्सफर'>('नगद');

  // Branding Form State
  const [brandingName, setBrandingName] = useState(settings.officeBranding?.nameNepali || 'श्री वैदिक ज्योतिष तथा वास्तु परामर्श केन्द्र');
  const [brandingTitle, setBrandingTitle] = useState(settings.officeBranding?.taglineNepali || 'वैदिक सिद्धान्त अनुसार सम्पूर्ण ज्योतिषीय सेवा');
  const [brandingPhone, setBrandingPhone] = useState(settings.officeBranding?.phone || '+९७७-९८५१२३४५६७');
  const [brandingAddress, setBrandingAddress] = useState(settings.officeBranding?.addressNepali || 'काठमाडौँ, नेपाल');

  // Sync state on load
  useEffect(() => {
    setConsultations(getStoredConsultations());
    setReceipts(getStoredReceipts());
    setPrintLogs(getStoredPrintLogs());
  }, []);

  // Today Date in AD and BS
  const todayAD = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayBS = useMemo(() => convertADToBS(todayAD).formattedBS, [todayAD]);

  // Ensure active profile is always present in displayProfiles
  const displayProfiles = useMemo(() => {
    const list = [...profiles];
    if (activeProfile && !list.some((p) => p.id === activeProfile.id)) {
      list.unshift(activeProfile);
    }
    return list;
  }, [profiles, activeProfile]);

  // Track selected profile locally for instantaneous UI synchronization
  const [selectedProfileId, setSelectedProfileId] = useState<string>(activeProfile?.id || displayProfiles[0]?.id || '');

  // Synchronize when activeProfile prop changes
  useEffect(() => {
    if (activeProfile?.id) {
      setSelectedProfileId(activeProfile.id);
    }
  }, [activeProfile?.id]);

  // Current active profile with robust fallback
  const currentProfile: BirthDetails = useMemo(() => {
    if (selectedProfileId) {
      const found = displayProfiles.find((p) => p.id === selectedProfileId);
      if (found) return found;
    }
    return activeProfile || displayProfiles[0] || {
      id: 'default',
      name: 'राम शर्मा',
      gender: 'male',
      dateAD: '1995-05-15',
      dateBS: '२०५२ जेठ ०१',
      time: '08:30',
      location: {
        name: 'काठमाडौँ (Kathmandu)',
        country: 'Nepal',
        latitude: 27.7172,
        longitude: 85.3240,
        timeZone: 5.75,
      },
      category: 'Client',
    };
  }, [selectedProfileId, displayProfiles, activeProfile]);

  const handleSelectProfileChange = useCallback((id: string) => {
    setSelectedProfileId(id);
    const found = displayProfiles.find((p) => p.id === id);
    if (found) {
      onSelectProfile(found);
    }
  }, [displayProfiles, onSelectProfile]);

  const birthAD = currentProfile.dateAD || '1995-05-15';
  const birthTime = currentProfile.time || '08:30';
  const lat = currentProfile.location?.latitude ?? 27.7172;
  const lng = currentProfile.location?.longitude ?? 85.3240;
  const tz = currentProfile.location?.timeZone ?? 5.75;
  const ayanSys = settings.ayanamsaSystem || 'Lahiri';

  // Astro Calculations for Active Profile
  const activeProfileCacheKey = createAstroCacheKey(birthAD, birthTime, lat, lng, tz, ayanSys);

  const { lagna, planets, moon, dasha, yogas, panchanga, gochar } = useMemo(() => {
    const cached = getCachedAstroCalculation(birthAD, birthTime, lat, lng, tz, ayanSys);
    const gch = calculateGocharAndSadeSati(cached.moon, cached.planets, todayAD);
    return {
      lagna: cached.lagna,
      planets: cached.planets,
      moon: cached.moon,
      dasha: cached.dasha,
      yogas: cached.yogas,
      panchanga: cached.panchanga,
      gochar: gch,
    };
  }, [activeProfileCacheKey, birthAD, birthTime, lat, lng, tz, ayanSys, todayAD]);

  // Section Title Mapping
  const getSectionTitle = useCallback((tab: JyotishSidebarTab): string => {
    const found = JYOTISH_ALL_SUBMENUS.find(item => item.id === tab);
    if (found) {
      return `${found.number}. ${found.label} (${found.category || 'ज्योतिष'})`;
    }
    switch (tab) {
      case 'workspace': return '१०. जन्मकुण्डली (लग्न, ग्रह, भाव तथा दशा)';
      case 'prashna': return '०१. प्रश्न ज्योतिष (ताजिक तथा एआई विश्लेषण)';
      case 'ankajyotish': return '०२. अंक ज्योतिष (Numerology)';
      case 'kpjyotish': return '०३. केपी ज्योतिष (KP System)';
      case 'calendar': return '०४. नेपाली क्यालेन्डर (BS/AD Calendar)';
      case 'patro': return '०५. नेपाली पात्रो (पर्व, तिथि तथा चाडवाड)';
      case 'panchanga': return '०६. दैनिक पञ्चाङ्ग (सूर्य, चन्द्र, योग, करण)';
      case 'faladesh': return '०७. फलादेश (समग्र जीवन फलादेश)';
      case 'match': return '०८. कुण्डली मिलान (विवाह अष्टकूट गुण मिलान)';
      case 'patrika': return '०९. पत्रिका (चिना, विवाह, व्रतबन्ध)';
      case 'gochar': return '११. ग्रह गोचर (Transit & Sade Sati)';
      case 'yearly': return '१२. वार्षिक फल (वर्ष कुण्डली तथा मुन्था)';
      case 'dasha_fal': return '१३. दशा फल (विंशोत्तरी, त्रिभागी, योगिनी)';
      case 'varga': return '१४. वर्ग कुण्डली (षोडशवर्ग D1-D60)';
      case 'yoga': return '१५. योग फल (राजयोग, धनयोग, अरिष्टयोग)';
      case 'nakshatra': return '१६. नक्षत्र फल (२७ नक्षत्र तथा चरण)';
      case 'prashna_kundali': return '१७. प्रश्न कुण्डली (आर्जे / हराएको खोजी)';
      case 'life_utility': return '१८. जीवन उपयोगी (रत्न, रुद्राक्ष, मन्त्र)';
      case 'report_print': return '१९. प्रतिवेदन तथा मुद्रण (A4 Print / PDF)';
      case 'consultations': return '२०. परामर्श रेकर्ड (ग्राहक इतिहास)';
      case 'receipts': return '२१. शुल्क रसिद (रसिद तथा भुक्तानी)';
      case 'branding': return '२२. कार्यालय सेटिङ (संस्था विवरण)';
      case 'rashifal': return 'दैनिक राशिफल';
      case 'muhurta': return 'शुभ मुहूर्त';
      case 'vastu': return 'वास्तु विश्लेषण';
      case 'ai_assistant': return 'एआई ज्योतिष सहायक';
      default: return 'नेपाली वैदिक ज्योतिष';
    }
  }, []);

  // Handler for creating consultation
  const handleCreateConsultation = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForConsultation) return;

    addConsultation({
      profileId: selectedClientForConsultation.id || 'N/A',
      clientName: selectedClientForConsultation.name,
      dateBS: convertADToBS(todayAD).formattedBS,
      dateAD: todayAD,
      topic: consTopic,
      notes: consNotes,
      remediesSuggested: consRemedies ? [consRemedies] : [],
      feeAmount: consFee,
      paymentStatus: consStatus,
    });

    setConsultations(getStoredConsultations());
    setIsNewConsultationModalOpen(false);
    setConsNotes('');
    setConsRemedies('');
  }, [selectedClientForConsultation, todayAD, consTopic, consNotes, consRemedies, consFee, consStatus]);

  // Handler for creating fee receipt
  const handleCreateReceipt = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const mappedPaymentMethod =
      recPaymentMethod === 'ईसेवा' || recPaymentMethod === 'फोनपे'
        ? 'ई-सेवा / फोनपे'
        : recPaymentMethod === 'बैंक ट्रान्सफर'
        ? 'बैंक ट्रान्सफर'
        : 'नगद';

    const newRec = addReceipt({
      receiptNo: `रसिद-${toDevanagariNumerals(receipts.length + 1)}`,
      clientName: recPayerName || currentProfile.name,
      dateBS: convertADToBS(todayAD).formattedBS,
      serviceTitle: recPurpose,
      totalFee: recAmount,
      paidAmount: recAmount,
      balanceAmount: 0,
      paymentMethod: mappedPaymentMethod,
    });

    setReceipts(getStoredReceipts());
    setIsNewReceiptModalOpen(false);
    setSelectedReceiptToPrint(newRec);
  }, [receipts.length, recPayerName, currentProfile.name, todayAD, recPurpose, recAmount, recPaymentMethod]);

  // Handler for saving branding
  const handleSaveBranding = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      officeBranding: {
        nameNepali: brandingName,
        taglineNepali: brandingTitle,
        phone: brandingPhone,
        addressNepali: brandingAddress,
      },
    });
    alert('कार्यालय ब्रान्डिङ सफलतापुर्वक सञ्चय भयो।');
  }, [onSaveSettings, settings, brandingName, brandingTitle, brandingPhone, brandingAddress]);

  const handleSelectSidebarTab = useCallback((tab: JyotishSidebarTab) => {
    const resolvedTab = (tab as string) === 'patro' ? 'calendar' : tab;
    setActiveSidebarTab(resolvedTab);
  }, []);

  const handleQuickAccess = useCallback((type: string) => {
    setQuickAccessModal(type);
  }, []);

  const handleCloseQuickAccess = useCallback(() => {
    setQuickAccessModal(null);
  }, []);

  const handlePrintReport = useCallback(() => {
    setActiveSidebarTab('report_print');
  }, []);

  const handleSelectAndOpenProfile = useCallback((profile: BirthDetails) => {
    onSelectProfile(profile);
    setActiveSidebarTab('workspace');
  }, [onSelectProfile]);

  const handleOpenNewConsultationModal = useCallback(() => {
    setSelectedClientForConsultation(currentProfile);
    setIsNewConsultationModalOpen(true);
  }, [currentProfile]);

  const handleCloseNewConsultationModal = useCallback(() => {
    setIsNewConsultationModalOpen(false);
  }, []);

  const handleOpenNewReceiptModal = useCallback(() => {
    setRecPayerName(currentProfile.name);
    setIsNewReceiptModalOpen(true);
  }, [currentProfile.name]);

  const handleCloseNewReceiptModal = useCallback(() => {
    setIsNewReceiptModalOpen(false);
  }, []);

  // Filtered Clients List
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.phone && p.phone.includes(searchQuery)) ||
        (p.dateBS && p.dateBS.includes(searchQuery));
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [profiles, searchQuery, categoryFilter]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1C1917] text-[#2D241E] dark:text-stone-100 font-sans selection:bg-amber-200 selection:text-amber-950 flex flex-col">
      {/* 1. Dedicated Jyotish Header Bar with Return to Main Menu */}
      <header className="bg-[#7A1C1C] text-white px-3 sm:px-4 py-2.5 shadow-md border-b border-amber-600/40 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Main Return Button */}
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 active:bg-amber-600/40 text-amber-100 font-bold text-xs sm:text-sm border border-amber-400/40 shadow-xs transition-all cursor-pointer group"
            title="मुख्य मेनुमा फर्कनुहोस्"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300 group-hover:-translate-x-1 transition-transform" />
            <span className="whitespace-nowrap font-medium">मुख्य मेनुमा फर्कनुहोस्</span>
          </button>

          <div className="h-5 w-[1px] bg-amber-500/30 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/25 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold font-serif text-amber-100 tracking-wide leading-tight">
                नेपाली वैदिक ज्योतिष
              </h1>
              <p className="text-[10.5px] text-amber-200/80 hidden sm:block">
                सम्पूर्ण २२ ज्योतिष विधा तथा सेवा कार्यक्षेत्र
              </p>
            </div>
          </div>
        </div>

        {/* Center Current Section Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/25 border border-amber-400/30 text-amber-200 text-xs font-bold font-serif">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{getSectionTitle(activeSidebarTab)}</span>
        </div>

        {/* Right Controls: Theme Modal, Profile Switcher & New Kundali Button */}
        <div className="flex items-center gap-2">
          {/* Theme & Notification Customization Button */}
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 active:bg-amber-600/40 text-amber-100 font-bold text-xs border border-amber-400/40 shadow-xs transition-all cursor-pointer"
            title="सफ्टवेयर थिम तथा यजमान सूचना"
          >
            <Palette className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">🎨 थिम र सूचना</span>
          </button>

          {/* Profile Switcher */}
          {displayProfiles.length > 0 && (
            <div className="relative flex items-center">
              <select
                value={currentProfile?.id || ''}
                onChange={(e) => handleSelectProfileChange(e.target.value)}
                className="bg-amber-950/80 text-amber-100 border border-amber-400/40 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm max-w-[130px] sm:max-w-[170px] truncate cursor-pointer font-medium"
              >
                {displayProfiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-stone-900 text-stone-100">
                    👤 {p.name} ({p.dateBS || 'वि.सं.'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* New Profile Button in Jyotish */}
          <button
            type="button"
            onClick={onNewProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D97706] hover:bg-[#b45309] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs border border-amber-300/40 transition-all cursor-pointer"
            title="नयाँ कुण्डली जन्म विवरण भर्नुहोस्"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="whitespace-nowrap">नयाँ कुण्डली</span>
          </button>
        </div>
      </header>

      {/* 2. Top Navigation Submenu Strip */}
      <JyotishTopNav
        activeTab={activeSidebarTab}
        onSelectTab={(tab, subTab) => {
          handleSelectSidebarTab(tab);
          if (subTab) {
            setPatrikaSubTab(subTab as PatrikaSubCategory);
          }
        }}
        onExit={onExit}
        clientName={currentProfile.name}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Dedicated Demo, Name, and Duration Status Bar for Jyotish */}
      <div className="max-w-[1700px] mx-auto px-2 sm:px-4 pt-3">
        <JyotishVastuLicenseHeader
          moduleName="ज्योतिष कार्यक्षेत्र"
          onOpenPurchase={onOpenPurchaseModal}
        />
      </div>

      {/* 3. Main Workspace Body Layout */}
      {activeSidebarTab === 'workspace' ? (
        <div className="max-w-[1700px] mx-auto px-2 sm:px-4 py-4 w-full space-y-5 flex-1">
          {/* Top 3-block row of EQUAL SIZE: LHS = विवरण, बीचमा = कुण्डली, RHS = जन्मकालीन पञ्चाङ्ग */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5 items-stretch w-full">
            {/* Block 1 (LHS): जन्म विवरण */}
            <div className="w-full h-full flex flex-col">
              <BirthDetailsPanel
                profile={currentProfile}
                panchanga={panchanga}
                lagna={lagna}
                onEdit={() => {
                  if (onEditProfile) onEditProfile(currentProfile);
                  else onNewProfile();
                }}
                onPrint={handlePrintReport}
              />
            </div>

            {/* Block 2 (बीचमा): मुख्य जन्मकुण्डली */}
            <div className="w-full h-full flex flex-col">
              <KundaliChartPanel
                lagna={lagna}
                planets={planets}
                chartTitle="मुख्य जन्मकुण्डली (लग्न D-1)"
                showLegendBar={false}
              />
            </div>

            {/* Block 3 (RHS): जन्मकालीन पञ्चाङ्ग (कुण्डलीको दायाँ) */}
            <div className="w-full h-full flex flex-col">
              <PanchangaPanel
                panchanga={panchanga}
                profile={currentProfile}
                lagna={lagna}
                planets={planets}
                title="जन्मकालीन पञ्चाङ्ग"
              />
            </div>
          </div>

          {/* Middle Row: Graha Sthiti & Bhava Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-5">
            <PlanetPositionTable lagna={lagna} planets={planets} />
            <BhavaTable lagna={lagna} planets={planets} />
          </div>

          {/* Full Width Multi-Dasha System Panel */}
          <div className="w-full">
            <ComprehensiveDashaPanel
              dasha={dasha}
              profile={currentProfile}
              moon={moon}
            />
          </div>

          {/* Full Width Yoga Panel */}
          <div className="w-full">
            <YogaPanel yogas={yogas} />
          </div>
        </div>
      ) : (
        <div className="max-w-[1700px] mx-auto px-2 sm:px-4 py-4 w-full min-w-0 space-y-5 flex-1">
          {/* १. प्रश्न ज्योतिष (Prashna List & Query View) */}
          {activeSidebarTab === 'prashna' && (
            <PrashnaListView
              activeProfile={currentProfile}
              todayPanchanga={panchanga}
              onNavigateToAIAssistant={() => setActiveSidebarTab('ai_assistant')}
              onNavigateToJyotish={() => setActiveSidebarTab('workspace')}
            />
          )}

          {/* २. अंक ज्योतिष (Numerology) */}
          {activeSidebarTab === 'ankajyotish' && (
            <AnkaJyotishView activeProfile={currentProfile} />
          )}

          {/* ३. केपी ज्योतिष (KP System) */}
          {activeSidebarTab === 'kpjyotish' && (
            <KPJyotishView activeProfile={currentProfile} />
          )}

          {/* ४. नेमा ज्योतिष (Tibetan Astrology) */}
          {activeSidebarTab === 'neemajyotish' && (
            <NeemaJyotishView
              activeProfile={currentProfile}
              profiles={profiles}
              onSelectProfile={onSelectProfile}
              onOpenNewProfileModal={onNewProfile}
            />
          )}

          {/* ४. क्यालेन्डर (Nepali Calendar) */}
          {(activeSidebarTab === 'calendar' || (activeSidebarTab as string) === 'patro') && (
            <NepaliCalendarView 
              onNavigateToPanchanga={() => setActiveSidebarTab('panchanga')}
            />
          )}

          {/* ६. पञ्चाङ्ग (Detailed Panchanga) */}
          {activeSidebarTab === 'panchanga' && (
            <PanchangaView initialPanchanga={panchanga} />
          )}

          {/* ७. फलादेश (Comprehensive Faladesh) */}
          {activeSidebarTab === 'faladesh' && (
            <FaladeshView
              profile={currentProfile}
              lagna={lagna}
              planets={planets}
              panchanga={panchanga}
              yogas={yogas}
              dasha={dasha}
              sadeSatiStatus={gochar.sadeSati.status}
              onNewProfile={onNewProfile}
            />
          )}

          {/* ८. कुण्डली मिलान (Kundali Milan) */}
          {activeSidebarTab === 'match' && (
            <KundaliMatchView
              profiles={profiles}
              activeProfile={currentProfile}
            />
          )}

          {/* ९. पत्रिका (Patrika / China) */}
          {activeSidebarTab === 'patrika' && (
            <PatrikaView
              profile={currentProfile}
              profiles={profiles}
              lagna={lagna}
              planets={planets}
              panchanga={panchanga}
              orgProfile={orgProfile || (settings.officeBranding ? {
                name: settings.officeBranding?.nameNepali || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
                tagline: settings.officeBranding?.taglineNepali || '',
                phone: settings.officeBranding?.phone || '+९७७-९७६४८४००५३३',
                address: settings.officeBranding?.addressNepali || 'काठमाडौँ, नेपाल',
                email: 'suwashdmk@gmail.com',
                intro: '',
                logoUrl: '/logo.png',
                showLogoOnBills: true,
                showPhotoOnReports: true
              } : undefined)}
              astrologers={astrologers}
              initialSubTab={patrikaSubTab}
              onSelectProfile={onSelectProfile}
              onNewProfile={onNewProfile}
              onEditProfile={onEditProfile || onNewProfile}
            />
          )}

          {/* ११. ग्रह गोचर (Transit & Gochar) */}
          {activeSidebarTab === 'gochar' && (
            <TransitView moon={moon} transitPlanets={planets} />
          )}

          {/* १२. वार्षिक फल (Varshaphal & Tajik) */}
          {activeSidebarTab === 'yearly' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                <Calendar className="w-5 h-5 text-[#7A1C1C] dark:text-amber-400" />
                <div>
                  <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif">
                    वार्षिक फल तथा वर्ष कुण्डली ({currentProfile.name})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    ताजिक पद्धति, मुन्था स्थिति, वर्षेश तथा दीप्त अंश फल
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 bg-amber-50/80 dark:bg-stone-800/80 rounded-xl border border-amber-200 dark:border-stone-700 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">वर्ष कुण्डली लग्न</span>
                  <p className="text-sm font-extrabold text-stone-900 dark:text-stone-100 font-serif">{lagna.rashiName} (लग्न स्वामी: {lagna.lord})</p>
                  <p className="text-[11.5px] text-stone-600 dark:text-stone-300">वर्ष प्रवेश लग्नले आगामी १२ महिनाको आधारभूत दिशा निर्धारण गर्छ।</p>
                </div>

                <div className="p-3.5 bg-amber-50/80 dark:bg-stone-800/80 rounded-xl border border-amber-200 dark:border-stone-700 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">मुन्था विचार</span>
                  <p className="text-sm font-extrabold text-stone-900 dark:text-stone-100 font-serif">शुभ स्थान (१० औँ भाव)</p>
                  <p className="text-[11.5px] text-stone-600 dark:text-stone-300">कार्यक्षेत्रमा नयाँ अवसर, व्यापार वृद्धि र प्रतिष्ठा अभिवृद्धि हुनेछ।</p>
                </div>

                <div className="p-3.5 bg-amber-50/80 dark:bg-stone-800/80 rounded-xl border border-amber-200 dark:border-stone-700 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">वर्षेश निर्णय</span>
                  <p className="text-sm font-extrabold text-stone-900 dark:text-stone-100 font-serif">बृहस्पति (गुरु)</p>
                  <p className="text-[11.5px] text-stone-600 dark:text-stone-300">विद्या, ज्ञान, तीर्थाटन र आर्थिक स्थिरतामा शुभ फलदायक।</p>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-stone-800/40 rounded-xl border border-[#E6E0D5] dark:border-stone-700 space-y-2.5 text-xs text-stone-800 dark:text-stone-200">
                <h4 className="font-bold text-[#7A1C1C] dark:text-amber-400 font-serif text-sm">
                  वर्ष फल सारांश तथा मार्गदर्शन
                </h4>
                <p className="leading-relaxed">
                  ताजिक सिद्धान्त अनुसार {currentProfile.name} को यस वर्षको वर्षेश गुरु शुभ भावमा अवस्थित रहेकोले कार्यक्षेत्रमा पदोन्नति, नयाँ कामको थालनी र आर्थिक उन्नति हुने सम्भावना छ। मुन्थाको शुभ दृष्टिले स्वास्थ्यमा सुधार तथा पारिवारिक सुख शान्ति प्रदान गर्नेछ।
                </p>
              </div>
            </div>
          )}

          {/* १३. दशा फल (Dasha System) */}
          {activeSidebarTab === 'dasha_fal' && (
            <ComprehensiveDashaPanel
              dasha={dasha}
              profile={currentProfile}
              moon={moon}
            />
          )}

          {/* १४. वर्ग कुण्डली (Divisional Charts) */}
          {activeSidebarTab === 'varga' && (
            <VargaKundaliView lagna={lagna} planets={planets} />
          )}

          {/* १५. योग फल (Astrological Yogas) */}
          {activeSidebarTab === 'yoga' && (
            <YogaPanel yogas={yogas} />
          )}

          {/* १६. नक्षत्र फल (Nakshatra Analysis) */}
          {activeSidebarTab === 'nakshatra' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                <Sun className="w-5 h-5 text-[#7A1C1C] dark:text-amber-400" />
                <div>
                  <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif">
                    जन्म नक्षत्र फल तथा चरण विश्लेषण ({currentProfile.name})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    २७ नक्षत्र, चरण, गण, योनि, नाडी तथा तारा चक्र
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-xs">
                  <span className="text-stone-500 dark:text-stone-400 block text-[11px]">जन्म नक्षत्र</span>
                  <span className="font-bold text-sm text-[#7A1C1C] dark:text-amber-400 font-serif">{moon.nakshatraName}</span>
                </div>
                <div className="p-3 bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-xs">
                  <span className="text-stone-500 dark:text-stone-400 block text-[11px]">नक्षत्र चरण</span>
                  <span className="font-bold text-sm text-stone-800 dark:text-stone-200">चरण {toDevanagariNumerals(moon.pada)}</span>
                </div>
                <div className="p-3 bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-xs">
                  <span className="text-stone-500 dark:text-stone-400 block text-[11px]">नक्षत्र स्वामी</span>
                  <span className="font-bold text-sm text-stone-800 dark:text-stone-200">{moon.nakshatraLord}</span>
                </div>
                <div className="p-3 bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-xs">
                  <span className="text-stone-500 dark:text-stone-400 block text-[11px]">चन्द्र राशि</span>
                  <span className="font-bold text-sm text-[#7A1C1C] dark:text-amber-400 font-serif">{moon.rashiName}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 dark:bg-stone-800/50 rounded-xl border border-amber-200/80 dark:border-stone-700 space-y-2 text-xs leading-relaxed text-stone-800 dark:text-stone-200">
                <h4 className="font-bold text-amber-950 dark:text-amber-300 font-serif">
                  नक्षत्र प्रभाव तथा स्वभावगत लक्षण:
                </h4>
                <p>
                  {moon.nakshatraName} नक्षत्रको {toDevanagariNumerals(moon.pada)} चरणमा जन्म भएको जातक बुद्धिमान्, कार्यदक्ष, धार्मिक एवं आध्यात्मिक चिन्तनयुक्त हुन्छन्। नक्षत्र स्वामी {moon.nakshatraLord} को प्रभावले गर्दा निर्णय क्षमता राम्रो रहनेछ।
                </p>
              </div>
            </div>
          )}

          {/* १७. प्रश्न कुण्डली (Aarje / Tajik Prashna Kundali) */}
          {(activeSidebarTab === 'prashna_kundali' || activeSidebarTab === 'aarje') && (
            <AarjeView
              profiles={profiles}
              activeProfile={currentProfile}
              orgProfile={orgProfile || {
                name: settings.officeBranding?.nameNepali || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
                phone: settings.officeBranding?.phone || '+९७७-९७६४८४००५३३',
                email: 'suwashdmk@gmail.com',
                address: settings.officeBranding?.addressNepali || 'काठमाडौँ, नेपाल',
                intro: 'हराएको, हराएको जस्तो भएको वा चोरी भएको वस्तु, धन, गहना, कागजात तथा उपकरणसम्बन्धी प्रश्नकुण्डलीमा आधारित शास्त्रीय विश्लेषण तथा अभिलेख प्रणाली।',
                tagline: settings.officeBranding?.taglineNepali || 'हराएको वस्तु तथा धन खोजी ज्योतिषीय विश्लेषण',
                logoUrl: '/logo.png',
                showLogoOnBills: true,
                showPhotoOnReports: true,
                registeredNo: 'वै-२०८३'
              }}
              astrologers={astrologers}
              settings={settings}
            />
          )}

          {/* १८. जीवन उपयोगी (Knowledge Base & Upay) */}
          {activeSidebarTab === 'life_utility' && (
            <KnowledgeBaseView />
          )}

          {/* १९. प्रतिवेदन तथा मुद्रण (Report & Print) */}
          {activeSidebarTab === 'report_print' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
                    <Printer className="w-5 h-5 text-amber-500" />
                    <span>वैदिक कुण्डली तथा पञ्चाङ्ग मुद्रण प्रणाली</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    A4 पृष्ठ ढाँचामा उच्च गुणस्तरको मुद्रण तथा PDF निर्यात प्रिभ्यु हेर्नुहोस्।
                  </p>
                </div>

                <button
                  onClick={() => setIsPrintPreviewOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-200" />
                  <span>A4 मुद्रण प्रिभ्यु (Print Preview / PDF) खोल्नुहोस्</span>
                </button>
              </div>

              <KundaliReportView
                profile={currentProfile}
                lagna={lagna}
                planets={planets}
                dasha={dasha}
                yogas={yogas}
                panchanga={panchanga}
                orgProfile={settings.officeBranding}
              />
            </div>
          )}

          {/* २०. परामर्श रेकर्ड (Consultations Record) */}
          {activeSidebarTab === 'consultations' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#7A1C1C] dark:text-amber-400" />
                  <div>
                    <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif">
                      परामर्श रेकर्ड खाता ({consultations.length})
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">जातकहरूलाई दिएको ज्योतिषीय सल्लाह, उपाय र इतिहास</p>
                  </div>
                </div>
                <button
                  onClick={handleOpenNewConsultationModal}
                  className="px-3.5 py-2 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>नयाँ परामर्श दर्ता</span>
                </button>
              </div>

              {consultations.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-stone-500 text-xs">
                  हालसम्म कुनै परामर्श दर्ता गरिएको छैन। "नयाँ परामर्श दर्ता" मा क्लिक गरी रेकर्ड थप्नुहोस्।
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#E6E0D5] dark:border-stone-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 font-bold border-b border-[#E6E0D5] dark:border-stone-700">
                      <tr>
                        <th className="p-3">मिति</th>
                        <th className="p-3">ग्राहकको नाम</th>
                        <th className="p-3">विषय</th>
                        <th className="p-3">शुल्क</th>
                        <th className="p-3">स्थिति</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E0D5] dark:divide-stone-800">
                      {consultations.map((c) => (
                        <tr key={c.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40">
                          <td className="p-3 font-mono">{c.dateBS}</td>
                          <td className="p-3 font-bold text-stone-900 dark:text-stone-100">{c.clientName}</td>
                          <td className="p-3">{c.topic}</td>
                          <td className="p-3 font-mono font-bold">रू. {toDevanagariNumerals(c.feeAmount)}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                              {c.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* २१. शुल्क रसिद (Fee Receipts) */}
          {activeSidebarTab === 'receipts' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#7A1C1C] dark:text-amber-400" />
                  <div>
                    <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif">
                      शुल्क रसिद खाता ({receipts.length})
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">सेवा शुल्क रसिद जारी, बिलिङ तथा भुक्तानी विवरण</p>
                  </div>
                </div>
                <button
                  onClick={handleOpenNewReceiptModal}
                  className="px-3.5 py-2 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>नयाँ रसिद जारी गर्नुहोस्</span>
                </button>
              </div>

              {receipts.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-stone-500 text-xs">
                  हालसम्म कुनै शुल्क रसिद काटिएको छैन। "नयाँ रसिद जारी गर्नुहोस्" मा क्लिक गर्नुहोस्।
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#E6E0D5] dark:border-stone-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 font-bold border-b border-[#E6E0D5] dark:border-stone-700">
                      <tr>
                        <th className="p-3">रसिद नं.</th>
                        <th className="p-3">मिति</th>
                        <th className="p-3">नाम</th>
                        <th className="p-3">सेवा</th>
                        <th className="p-3">रकम</th>
                        <th className="p-3">भुक्तानी माध्यम</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E0D5] dark:divide-stone-800">
                      {receipts.map((r) => (
                        <tr key={r.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40">
                          <td className="p-3 font-mono font-bold text-[#7A1C1C] dark:text-amber-400">{r.receiptNo}</td>
                          <td className="p-3 font-mono">{r.dateBS}</td>
                          <td className="p-3 font-bold text-stone-900 dark:text-stone-100">{r.clientName}</td>
                          <td className="p-3">{r.serviceTitle}</td>
                          <td className="p-3 font-mono font-bold">रू. {toDevanagariNumerals(r.totalFee)}</td>
                          <td className="p-3">{r.paymentMethod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* २२. कार्यालय सेटिङ (Office Branding) */}
          {activeSidebarTab === 'branding' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                <Building2 className="w-5 h-5 text-[#7A1C1C] dark:text-amber-400" />
                <div>
                  <h3 className="text-base font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif">
                    कार्यालय प्रोफाइल तथा ब्रान्डिङ सेटिङ
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">पत्रिका, रसिद तथा प्रतिवेदनमा देखिने कार्यालयको आधिकारिक विवरण</p>
                </div>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-4 text-xs max-w-xl">
                <div>
                  <label className="block font-bold mb-1.5 text-stone-800 dark:text-stone-200">कार्यालय / संस्थाको नाम:</label>
                  <input
                    type="text"
                    value={brandingName}
                    onChange={(e) => setBrandingName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5 text-stone-800 dark:text-stone-200">उप-शीर्षक / ट्यागलाइन:</label>
                  <input
                    type="text"
                    value={brandingTitle}
                    onChange={(e) => setBrandingTitle(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5 text-stone-800 dark:text-stone-200">सम्पर्क फोन / मोबाइल:</label>
                  <input
                    type="text"
                    value={brandingPhone}
                    onChange={(e) => setBrandingPhone(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5 text-stone-800 dark:text-stone-200">ठेगाना:</label>
                  <input
                    type="text"
                    value={brandingAddress}
                    onChange={(e) => setBrandingAddress(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl focus:outline-none focus:border-amber-600 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  ब्रान्डिङ सञ्चय गर्नुहोस्
                </button>
              </form>
            </div>
          )}

          {/* Supplementary: दैनिक राशिफल */}
          {activeSidebarTab === 'rashifal' && (
            <DailyHoroscopeView
              activeProfile={currentProfile}
              profiles={profiles}
              todayPanchanga={panchanga}
              transitPlanets={planets}
              natalPlanets={planets}
              lagna={lagna}
              dasha={dasha}
              onSelectProfile={onSelectProfile}
              onNewProfile={onNewProfile}
            />
          )}

          {/* Supplementary: मुहूर्त */}
          {activeSidebarTab === 'muhurta' && (
            <MuhurtaView />
          )}

          {/* Supplementary: वास्तु */}
          {activeSidebarTab === 'vastu' && (
            <VastuView
              orgProfile={orgProfile}
              activeProfile={activeProfile}
            />
          )}

          {/* Supplementary: एआई सहायक */}
          {activeSidebarTab === 'ai_assistant' && (
            <AIAssistantView
              profile={currentProfile}
              lagna={lagna}
              planets={planets}
              dasha={dasha}
              sadeSatiStatus={gochar.sadeSati.status}
            />
          )}

          {/* Supplementary: कुण्डली सूची */}
          {activeSidebarTab === 'profiles' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif">
                    दर्ता भएका ग्राहक / कुण्डली सूची ({filteredProfiles.length})
                  </h3>
                </div>

                <button
                  onClick={onNewProfile}
                  className="px-3.5 py-2 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>नयाँ कुण्डली जोड्नुहोस्</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="नाम, फोन नम्बर वा जन्म मितिबाट खोज्नुहोस्..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl text-xs text-[#2D241E] dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  />
                </div>
              </div>

              {/* Profiles Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E6E0D5] dark:border-stone-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] dark:bg-stone-800/80 text-[#7A1C1C] dark:text-amber-400 font-bold border-b border-[#E6E0D5] dark:border-stone-700">
                    <tr>
                      <th className="p-3">जातकको नाम</th>
                      <th className="p-3">लिङ्ग</th>
                      <th className="p-3">जन्म मिति (बि.सं / AD)</th>
                      <th className="p-3">जन्म समय</th>
                      <th className="p-3">जन्म स्थान</th>
                      <th className="p-3 text-right">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E0D5] dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                    {filteredProfiles.map((p) => {
                      const isSelected = p.id === currentProfile.id;
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-amber-50/50 dark:hover:bg-stone-800/50 transition-colors ${
                            isSelected ? 'bg-amber-100/40 dark:bg-stone-800 font-medium' : ''
                          }`}
                        >
                          <td className="p-3 font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <span>{p.name}</span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 font-bold">
                                सक्रिय
                              </span>
                            )}
                          </td>
                          <td className="p-3">{p.gender === 'male' ? 'पुरुष' : 'महिला'}</td>
                          <td className="p-3 font-mono">{p.dateBS || p.dateAD}</td>
                          <td className="p-3 font-mono">{p.time}</td>
                          <td className="p-3 truncate max-w-[150px]">{p.location?.name || 'नेपाल'}</td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleSelectAndOpenProfile(p)}
                              className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 hover:bg-amber-200 rounded-lg text-[11px] font-bold border border-amber-300 cursor-pointer"
                            >
                              खोल्नुहोस्
                            </button>
                            <button
                              onClick={() => onDeleteProfile(p.id)}
                              className="px-2 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200 rounded-lg text-[11px] font-bold border border-rose-300 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Access Modal */}
      {quickAccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                {quickAccessModal === 'panchanga' && 'आजको पञ्चाङ्ग'}
                {quickAccessModal === 'rahukal' && 'आजको राहुकाल'}
                {quickAccessModal === 'shubhamuhurta' && 'आजको शुभ समय'}
                {quickAccessModal === 'chaughadiya' && 'चौघडिया विवरण'}
                {quickAccessModal === 'tithi' && 'तिथि विवरण'}
                {quickAccessModal === 'moonrashi' && 'वर्तमान चन्द्रमा स्थिति'}
              </h3>
              <button
                onClick={handleCloseQuickAccess}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs space-y-2 text-stone-700 dark:text-stone-300">
              {quickAccessModal === 'panchanga' && (
                <p>तिथि: {panchanga.tithi.name} | वार: {panchanga.dayNameNepali} | नक्षत्र: {panchanga.nakshatra.name}</p>
              )}
              {quickAccessModal === 'rahukal' && (
                <p>आजको राहुकाल: {toDevanagariNumerals(panchanga.rahuKaal?.start || '१०:३०')} देखि {toDevanagariNumerals(panchanga.rahuKaal?.end || '१२:००')} सम्म। (अशुभ समय)</p>
              )}
              {quickAccessModal === 'shubhamuhurta' && (
                <p>आजको अभिजित मुहूर्त: १२:१५ देखि १:०५ सम्म। (सर्वकार्य सिद्धि)</p>
              )}
              {quickAccessModal === 'chaughadiya' && (
                <p>शुभ, लाभ, अमृत र चर चौघडिया समय शुभ मानिन्छ।</p>
              )}
              {quickAccessModal === 'tithi' && (
                <p>वर्तमान पक्ष: {panchanga.tithi.paksha} पक्ष | तिथि: {panchanga.tithi.name}</p>
              )}
              {quickAccessModal === 'moonrashi' && (
                <p>चन्द्र राशि: {panchanga.moonRashi || 'वृष'}</p>
              )}
            </div>
            <button
              onClick={handleCloseQuickAccess}
              className="w-full py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 rounded-xl font-bold text-xs cursor-pointer"
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      )}

      {/* New Consultation Modal */}
      {isNewConsultationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                नयाँ परामर्श रेकर्ड दर्ता
              </h3>
              <button
                onClick={handleCloseNewConsultationModal}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateConsultation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">ग्राहकको नाम:</label>
                <input
                  type="text"
                  value={selectedClientForConsultation?.name || ''}
                  disabled
                  className="w-full p-2 bg-stone-100 dark:bg-stone-800 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">परामर्श विषय:</label>
                <select
                  value={consTopic}
                  onChange={(e) => setConsTopic(e.target.value)}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                >
                  <option value="करियर तथा व्यापार परामर्श">करियर तथा व्यापार परामर्श</option>
                  <option value="विवाह तथा दाम्पत्य परामर्श">विवाह तथा दाम्पत्य परामर्श</option>
                  <option value="स्वास्थ्य तथा आयु सम्बन्धी">स्वास्थ्य तथा आयु सम्बन्धी</option>
                  <option value="शिक्षा तथा विदेश यात्रा">शिक्षा तथा विदेश यात्रा</option>
                  <option value="वास्तु तथा गृह निर्माण">वास्तु तथा गृह निर्माण</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">मुख्य टिप्पणी / विश्लेषण:</label>
                <textarea
                  rows={3}
                  value={consNotes}
                  onChange={(e) => setConsNotes(e.target.value)}
                  placeholder="ज्योतिषीय विश्लेषण टिप्पणी यहाँ लेख्नुहोस्..."
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">सुझाइएका उपायहरू:</label>
                <input
                  type="text"
                  value={consRemedies}
                  onChange={(e) => setConsRemedies(e.target.value)}
                  placeholder="उदा: रुद्राक्ष, पुजा वा पाठ..."
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">परामर्श शुल्क (रू.):</label>
                  <input
                    type="number"
                    value={consFee}
                    onChange={(e) => setConsFee(Number(e.target.value))}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">भुक्तानी स्थिति:</label>
                  <select
                    value={consStatus}
                    onChange={(e) => setConsStatus(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  >
                    <option value="सम्पन्न">सम्पन्न</option>
                    <option value="बाँकी">बाँकी</option>
                    <option value="आंशिक">आंशिक</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseNewConsultationModal}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl font-bold cursor-pointer"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7A1C1C] text-white rounded-xl font-bold cursor-pointer"
                >
                  दर्ता गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Receipt Modal */}
      {isNewReceiptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
              <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                नयाँ शुल्क रसिद जारी गर्नुहोस्
              </h3>
              <button
                onClick={handleCloseNewReceiptModal}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">भुक्तानीकर्ताको नाम:</label>
                <input
                  type="text"
                  value={recPayerName}
                  onChange={(e) => setRecPayerName(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">सेवाको शीर्षक:</label>
                <input
                  type="text"
                  value={recPurpose}
                  onChange={(e) => setRecPurpose(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">प्राप्त रकम (रू.):</label>
                  <input
                    type="number"
                    value={recAmount}
                    onChange={(e) => setRecAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">भुक्तानी माध्यम:</label>
                  <select
                    value={recPaymentMethod}
                    onChange={(e) => setRecPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-800 border rounded-xl"
                  >
                    <option value="नगद">नगद</option>
                    <option value="ईसेवा">ईसेवा</option>
                    <option value="फोनपे">फोनपे</option>
                    <option value="बैंक ट्रान्सफर">बैंक ट्रान्सफर</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseNewReceiptModal}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl font-bold cursor-pointer"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7A1C1C] text-white rounded-xl font-bold cursor-pointer"
                >
                  रसिद जारी गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Preview & PDF Export Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        profile={currentProfile}
        profiles={profiles}
        lagna={lagna}
        planets={planets}
        dasha={dasha}
        yogas={yogas}
        panchanga={panchanga}
        orgProfile={orgProfile || (settings.officeBranding ? {
          name: settings.officeBranding.nameNepali || settings.organizationName || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
          phone: settings.officeBranding.phone || settings.contactInfo || '+९७७-९७६४८४००५३३',
          email: 'suwashdmk@gmail.com',
          address: settings.officeBranding.addressNepali || 'काठमाडौँ, नेपाल',
          intro: settings.officeBranding.taglineNepali || '',
          logoUrl: '/logo.png',
          showLogoOnBills: true,
          showPhotoOnReports: true
        } : undefined)}
        defaultReportType="kundali"
      />

      {/* Software Theme & Yajaman Broadcast Modal */}
      <ClientThemeNotificationModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        astrologerName={settings.astrologerName}
      />
    </div>
  );
});
