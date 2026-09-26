import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Printer, 
  User, 
  Phone, 
  Compass, 
  HelpCircle, 
  Package, 
  Coins, 
  Gem, 
  FileCode2, 
  Smartphone, 
  Car, 
  Shirt, 
  Home, 
  Dog, 
  Check, 
  Edit3, 
  Trash2, 
  Sparkles, 
  BarChart3, 
  ExternalLink,
  BookOpen,
  Cpu,
  Layers,
  Sliders,
  Eye,
  Plus,
  Info,
  ShieldAlert
} from 'lucide-react';

import { 
  AarjeRecord, 
  AarjeSubCategory, 
  AarjeItemCategory, 
  ActualFoundDetails, 
  AarjeAnalysisResult,
  AarjeRule
} from '../types/aarjeTypes';
import { NepaliDatePicker } from './NepaliDatePicker';

import { 
  BirthDetails, 
  OrganizationProfile, 
  AstrologerProfile, 
  ApplicationSettings 
} from '../types/astrology';

import { 
  getStoredAarjeRecords, 
  saveAarjeRecord, 
  deleteAarjeRecord, 
  updateAarjeStatus,
  getStoredCustomAarjeRules,
  saveCustomAarjeRule
} from '../db/aarjeStore';

import { analyzeAarjeQuery, getAllAarjeRules, AARJE_ENGINE_VERSION } from '../utils/aarjeEngine';
import { toDevanagariNumerals, convertADToBS } from '../utils/nepaliCalendar';
import { GaneshaHeaderCenter } from './GaneshaHeaderCenter';
import { OmBorderFrame } from './CheenaDocument';

interface AarjeViewProps {
  profiles: BirthDetails[];
  activeProfile: BirthDetails | null;
  orgProfile: OrganizationProfile;
  astrologers: AstrologerProfile[];
  settings: ApplicationSettings;
}

export const SUBMENU_ITEMS: Array<{ id: AarjeSubCategory | 'rules'; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'new_query', label: 'नयाँ आर्जे प्रश्न', icon: PlusCircle },
  { id: 'lost_item', label: 'हराएको वस्तु', icon: Package },
  { id: 'stolen_item', label: 'चोरी भएको वस्तु', icon: AlertTriangle },
  { id: 'lost_wealth', label: 'हराएको धन', icon: Coins },
  { id: 'stolen_wealth', label: 'चोरी भएको धन', icon: Coins },
  { id: 'documents', label: 'महत्त्वपूर्ण कागजात', icon: FileCode2 },
  { id: 'jewelry', label: 'गहना तथा बहुमूल्य वस्तु', icon: Gem },
  { id: 'electronics', label: 'मोबाइल तथा विद्युतीय', icon: Smartphone },
  { id: 'other', label: 'अन्य वस्तु', icon: HelpCircle },
  { id: 'archive', label: 'आर्जे अभिलेख', icon: FileText },
  { id: 'report', label: 'आर्जे प्रतिवेदन', icon: Printer },
  { id: 'rules', label: 'नियम भण्डार', icon: BookOpen },
  { id: 'research', label: 'नियम अनुसन्धान', icon: BarChart3 },
];

export const ITEM_CATEGORIES: Array<{ id: AarjeItemCategory; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'cash', label: 'धन / नगद', icon: Coins },
  { id: 'jewelry', label: 'गहना तथा धातु', icon: Gem },
  { id: 'documents', label: 'कागजात / राहदानी', icon: FileCode2 },
  { id: 'mobile', label: 'मोबाइल फोन', icon: Smartphone },
  { id: 'electronics', label: 'विद्युतीय उपकरण', icon: Smartphone },
  { id: 'clothing', label: 'कपडा तथा पोशाक', icon: Shirt },
  { id: 'vehicles', label: 'सवारी साधन', icon: Car },
  { id: 'household', label: 'घरायसी सामान', icon: Home },
  { id: 'livestock', label: 'पशुधन', icon: Dog },
  { id: 'other', label: 'अन्य वस्तु', icon: Package },
];

export const AarjeView: React.FC<AarjeViewProps> = ({
  profiles,
  activeProfile,
  orgProfile,
  astrologers,
  settings,
}) => {
  const [activeSubMenu, setActiveSubMenu] = useState<AarjeSubCategory | 'rules'>('new_query');
  const [dbError, setDbError] = useState<string | null>(null);
  const [records, setRecords] = useState<AarjeRecord[]>(() => {
    try {
      return getStoredAarjeRecords() || [];
    } catch (err) {
      console.error('Error fetching Aarje records from storage:', err);
      setDbError('अभिलेख प्राप्त गर्न सकिएन। कृपया केही समयपछि पुनः प्रयास गर्नुहोस्।');
      return [];
    }
  });
  const [selectedRecord, setSelectedRecord] = useState<AarjeRecord | null>(records[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_found' | 'found' | 'closed'>('all');

  // Calculation Inspector Modal
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Rule Management State
  const [rulesList, setRulesList] = useState<AarjeRule[]>(getAllAarjeRules());
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');
  const [selectedTraditionFilter, setSelectedTraditionFilter] = useState<string>('all');
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);

  // New Rule Form State
  const [newRuleForm, setNewRuleForm] = useState<Partial<AarjeRule>>({
    nameNepali: '',
    category: 'all',
    houseIndicators: [1, 2, 4],
    planetIndicators: ['Guru', 'Shukra'],
    direction: 'पूर्व',
    placeType: 'घरभित्र',
    recoveryChance: 'भेटिने सम्भावना उच्च',
    sourceText: 'प्रश्नमार्ग अध्याय १०',
    tradition: 'केरलीय प्रश्नमार्ग परम्परा',
    descriptionNepali: '',
    confidenceWeight: 4,
    isActive: true
  });

  // Status Update Modal State
  const [statusModalRecord, setStatusModalRecord] = useState<AarjeRecord | null>(null);
  const [modalStatus, setModalStatus] = useState<'not_found' | 'found' | 'closed'>('found');
  const [modalFoundCategory, setModalFoundCategory] = useState<ActualFoundDetails['foundLocationCategory']>('cupboard_closet');
  const [modalFoundNote, setModalFoundNote] = useState('');
  const [modalWasAccurate, setModalWasAccurate] = useState(true);

  // Form State for New Aarje Query
  const todayAD = new Date().toISOString().split('T')[0];
  const todayBS = convertADToBS(todayAD);
  const currentTime = new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    querierName: activeProfile?.name || 'रामचन्द्र शर्मा',
    contactNumber: activeProfile?.phone || '९८५१२३४५६७',
    queryDateBS: todayBS.formattedBS,
    queryDateAD: todayAD,
    queryTime: currentTime,
    locationName: activeProfile?.location?.name || 'नयाँ बानेश्वर, काठमाडौँ',
    country: 'नेपाल',
    province: 'बागमती प्रदेश',
    district: 'काठमाडौँ',
    localLevel: 'काठमाडौँ महानगरपालिका',
    lat: activeProfile?.location?.latitude || (activeProfile?.location as any)?.lat || 27.6915,
    lng: activeProfile?.location?.longitude || (activeProfile?.location as any)?.lng || 85.3420,
    itemCategory: 'jewelry' as AarjeItemCategory,
    itemName: 'सुनको गहना / औँठी',
    estimatedValue: '१,५०,०००',
    lastSeenTime: 'हिजो साँझ ०७:०० बजे',
    lastSeenLocation: 'घरको मुख्य बेडरुम दराज',
    estimatedIncidentTime: 'हिजो राति ०८:०० देखि १०:०० अघि',
    incidentDetails: 'घरमा सरसफाइ गर्दा वा राखिएको स्थान भुलेर नभेटिएको शङ्का।',
    isStolen: false,
    evalBasis: 'prashna_only' as 'prashna_only' | 'prashna_and_janma',
    janmaProfileId: activeProfile?.id || '',
    notes: ''
  });


  // Handle Form Input Change
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-fill Current Timestamp
  const handleFillNow = () => {
    const nowAD = new Date().toISOString().split('T')[0];
    const nowBS = convertADToBS(nowAD);
    const nowTime = new Date().toTimeString().slice(0, 5);
    setFormData((prev) => ({
      ...prev,
      queryDateAD: nowAD,
      queryDateBS: nowBS.formattedBS,
      queryTime: nowTime
    }));
  };

  // Submit New Aarje Query
  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const newSerialNo = `आर-२०८३-०${toDevanagariNumerals(records.length + 1).padStart(2, '०')}`;
    const newRecord: AarjeRecord = {
      id: `aarje_${Date.now()}`,
      serialNo: newSerialNo,
      querierName: formData.querierName,
      contactNumber: formData.contactNumber,
      queryDateBS: formData.queryDateBS,
      queryDateAD: formData.queryDateAD,
      queryTime: formData.queryTime,
      queryLocation: {
        country: formData.country,
        province: formData.province,
        district: formData.district,
        localLevel: formData.localLevel,
        locationName: formData.locationName,
        lat: formData.lat,
        lng: formData.lng,
        timezone: 'Asia/Kathmandu'
      },
      itemCategory: formData.itemCategory,
      itemName: formData.itemName,
      estimatedValue: formData.estimatedValue,
      lastSeenTime: formData.lastSeenTime,
      lastSeenLocation: formData.lastSeenLocation,
      estimatedIncidentTime: formData.estimatedIncidentTime,
      incidentDetails: formData.incidentDetails,
      isStolen: formData.isStolen,
      evalBasis: formData.evalBasis,
      janmaProfileId: formData.janmaProfileId,
      notes: formData.notes,
      status: 'not_found',
      createdAt: new Date().toISOString()
    };

    const updated = saveAarjeRecord(newRecord);
    setRecords(updated);
    setSelectedRecord(newRecord);
    setActiveSubMenu('report');
  };

  // Delete Record
  const handleDeleteRecord = (id: string) => {
    if (confirm('के तपाईं यस आर्जे अभिलेखलाई हटाउन निश्चित हुनुहुन्छ?')) {
      const updated = deleteAarjeRecord(id);
      setRecords(updated);
      if (selectedRecord?.id === id) {
        setSelectedRecord(updated[0] || null);
      }
    }
  };

  // Save Status Update
  const handleSaveStatusModal = () => {
    if (!statusModalRecord) return;
    const actualFoundDetails: ActualFoundDetails | undefined =
      modalStatus === 'found'
        ? {
            foundLocationCategory: modalFoundCategory,
            foundLocationNote: modalFoundNote || 'स्थानमा फेला परेको',
            foundDateBS: todayBS.formattedBS,
            wasAstrologyAccurate: modalWasAccurate,
            feedbackNotes: 'अनुसन्धानका लागि सुरक्षित गरिएको वास्तविक विवरण।'
          }
        : undefined;

    const updated = updateAarjeStatus(statusModalRecord.id, modalStatus, actualFoundDetails);
    setRecords(updated);
    if (selectedRecord?.id === statusModalRecord.id) {
      const refreshed = updated.find((r) => r.id === statusModalRecord.id);
      if (refreshed) setSelectedRecord(refreshed);
    }
    setStatusModalRecord(null);
  };

  // Filter records according to active submenu or archive search
  const getFilteredRecords = () => {
    let result = [...records];

    if (activeSubMenu === 'lost_item') {
      result = result.filter((r) => !r.isStolen);
    } else if (activeSubMenu === 'stolen_item') {
      result = result.filter((r) => r.isStolen);
    } else if (activeSubMenu === 'lost_wealth') {
      result = result.filter((r) => r.itemCategory === 'cash' && !r.isStolen);
    } else if (activeSubMenu === 'stolen_wealth') {
      result = result.filter((r) => r.itemCategory === 'cash' && r.isStolen);
    } else if (activeSubMenu === 'documents') {
      result = result.filter((r) => r.itemCategory === 'documents');
    } else if (activeSubMenu === 'jewelry') {
      result = result.filter((r) => r.itemCategory === 'jewelry');
    } else if (activeSubMenu === 'electronics') {
      result = result.filter((r) => r.itemCategory === 'mobile' || r.itemCategory === 'electronics');
    } else if (activeSubMenu === 'other') {
      result = result.filter((r) => !['cash', 'jewelry', 'documents', 'mobile', 'electronics'].includes(r.itemCategory));
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.querierName || '').toLowerCase().includes(q) ||
          (r.serialNo || '').toLowerCase().includes(q) ||
          (r.itemName || '').toLowerCase().includes(q) ||
          (r.contactNumber || '').includes(q) ||
          (r.queryDateBS || '').includes(q)
      );
    }

    return result;
  };

  const filteredRecords = getFilteredRecords();

  // Analysis result for selected record with safe try/catch
  let currentAnalysis: AarjeAnalysisResult | null = null;
  let calculationError: string | null = null;

  if (selectedRecord) {
    try {
      currentAnalysis = analyzeAarjeQuery(selectedRecord);
    } catch (err) {
      console.error('Error analyzing Aarje record:', err);
      calculationError = 'आर्जे गणना गर्न सकिएन। कृपया प्रश्नको मिति, समय र स्थान जाँच गर्नुहोस्।';
    }
  }

  const currentAstrologer = astrologers[0] || null;

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-2 sm:p-4 md:p-6 transition-colors">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-amber-900 via-red-900 to-amber-950 text-amber-50 p-4 sm:p-6 rounded-2xl shadow-xl mb-6 border border-amber-700/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="bg-amber-500/30 text-amber-200 px-3 py-0.5 rounded-full text-xs font-bold border border-amber-400/40 uppercase tracking-wide">
                बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा
              </span>
              <span className="text-amber-300 text-xs font-serif font-bold">॥ चरण १३ ॥</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif flex items-center justify-center md:justify-start gap-2">
              <span>आर्जे ज्योतिष प्रणाली</span>
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl font-serif">
              हराएको, हराएको जस्तो भएको वा चोरी भएको वस्तु, धन, गहना, कागजात तथा उपकरणसम्बन्धी प्रश्नकुण्डलीमा आधारित शास्त्रीय विश्लेषण तथा अभिलेख प्रणाली।
            </p>
          </div>

          <div className="bg-amber-950/70 border border-amber-500/40 p-3 rounded-xl text-center text-xs space-y-1 min-w-[200px]">
            <p className="text-amber-300 font-bold">सम्पर्क / परामर्श सेवा</p>
            <p className="font-mono text-amber-100 font-bold text-sm">+९७७-९७६४४००५३३</p>
            <p className="text-[11px] text-amber-200/80">suwashdmk@gmail.com</p>
          </div>
        </div>
      </div>

      {/* DB ERROR ALERT IF STORAGE FAILS */}
      {dbError && (
        <div className="max-w-7xl mx-auto mb-6 bg-red-50 dark:bg-red-950/40 border-2 border-red-500 p-4 rounded-xl flex items-center justify-between text-red-900 dark:text-red-200 shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <span className="font-bold text-sm sm:text-base">{dbError}</span>
          </div>
          <button
            onClick={() => setDbError(null)}
            className="text-xs bg-red-800 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-red-900 cursor-pointer"
          >
            बुझें
          </button>
        </div>
      )}

      {/* 2. SUBMENU NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto mb-6 bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-xl p-1.5 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {SUBMENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubMenu(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-800 text-white shadow-md font-bold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100/70 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CONTENT BODY */}
      <div className="max-w-7xl mx-auto">
        
        {/* VIEW 1: NEW AARJE QUERY FORM */}
        {activeSubMenu === 'new_query' && (
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-700 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
            <div className="border-b-2 border-red-800/60 pb-3 mb-6 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-400 font-serif flex items-center gap-2">
                  <PlusCircle className="w-6 h-6 text-red-700" />
                  <span>नयाँ आर्जे प्रश्न दर्ता तथा विश्लेषण फारम</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                  प्रश्नकर्ताले प्रश्न गरेको वास्तविक समय र स्थानका आधारमा प्रश्नकुण्डली निर्माण गरी आर्जे नियम इन्जिनबाट विश्लेषण गरिनेछ।
                </p>
              </div>

              <button
                type="button"
                onClick={handleFillNow}
                className="bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-stone-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-amber-200 transition"
              >
                <Clock className="w-4 h-4 text-red-700" />
                <span>हालको समय भर्नुहोस्</span>
              </button>
            </div>

            <form onSubmit={handleSubmitQuery} className="space-y-6 text-xs sm:text-sm">
              
              {/* SECTION A: QUERIER DETAILS */}
              <div className="bg-amber-50/60 dark:bg-stone-800/50 p-4 rounded-xl border border-amber-200 dark:border-stone-700 space-y-4">
                <h3 className="font-bold text-red-900 dark:text-red-400 text-base border-b border-amber-300 dark:border-stone-700 pb-1 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>१. प्रश्नकर्ताको विवरण</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-stone-800 dark:text-stone-200">प्रश्नकर्ताको नाम *</label>
                    <input
                      type="text"
                      required
                      value={formData.querierName}
                      onChange={(e) => handleInputChange('querierName', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-red-700 outline-none"
                      placeholder="जस्तै: रामचन्द्र शर्मा"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-stone-800 dark:text-stone-200">सम्पर्क नम्बर *</label>
                    <input
                      type="text"
                      required
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-red-700 outline-none font-mono"
                      placeholder="जस्तै: ९८५१२३४५६७"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-stone-800 dark:text-stone-200">विश्लेषणको आधार</label>
                    <select
                      value={formData.evalBasis}
                      onChange={(e) => handleInputChange('evalBasis', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-red-700 outline-none font-medium"
                    >
                      <option value="prashna_only">प्रश्नकुण्डली मात्र (प्रश्न समय आधार)</option>
                      <option value="prashna_and_janma">प्रश्नकुण्डली + जन्मकुण्डली सहयोगी</option>
                    </select>
                  </div>
                </div>

                {formData.evalBasis === 'prashna_and_janma' && (
                  <div className="pt-2">
                    <label className="block font-bold mb-1 text-amber-900 dark:text-amber-300">जन्मकुण्डली प्रोफाइल चयन गर्नुहोस्:</label>
                    <select
                      value={formData.janmaProfileId}
                      onChange={(e) => handleInputChange('janmaProfileId', e.target.value)}
                      className="w-full md:w-1/2 p-2.5 rounded-lg border border-amber-400 bg-white dark:bg-stone-900 font-bold"
                    >
                      <option value="">-- प्रोफाइल छान्नुहोस् --</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.dateBS} / {p.location?.name || 'स्थान नखुलेको'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* SECTION B: PRASHNA TIMESTAMP & LOCATION */}
              <div className="bg-amber-50/60 dark:bg-stone-800/50 p-4 rounded-xl border border-amber-200 dark:border-stone-700 space-y-4">
                <h3 className="font-bold text-red-900 dark:text-red-400 text-base border-b border-amber-300 dark:border-stone-700 pb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>२. प्रश्न सोधिएको समय तथा स्थान (प्रश्नकुण्डली आधार)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <NepaliDatePicker
                      valueBS={formData.queryDateBS}
                      valueAD={formData.queryDateAD}
                      onChange={({ formattedBS, dateAD }) => {
                        setFormData((prev) => ({
                          ...prev,
                          queryDateBS: formattedBS,
                          queryDateAD: dateAD,
                        }));
                      }}
                      label="प्रश्न मिति (विक्रम संवत्) *"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">प्रश्न समय *</label>
                    <input
                      type="time"
                      required
                      value={formData.queryTime}
                      onChange={(e) => handleInputChange('queryTime', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">स्थानको नाम *</label>
                    <input
                      type="text"
                      required
                      value={formData.locationName}
                      onChange={(e) => handleInputChange('locationName', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
                      placeholder="जस्तै: नयाँ बानेश्वर, काठमाडौँ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block font-bold mb-1">प्रदेश</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">जिल्ला</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">अक्षांश (Lat)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lat}
                      onChange={(e) => handleInputChange('lat', parseFloat(e.target.value) || 27.7)}
                      className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">देशान्तर (Lng)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.lng}
                      onChange={(e) => handleInputChange('lng', parseFloat(e.target.value) || 85.3)}
                      className="w-full p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: ITEM & INCIDENT DETAILS */}
              <div className="bg-amber-50/60 dark:bg-stone-800/50 p-4 rounded-xl border border-amber-200 dark:border-stone-700 space-y-4">
                <h3 className="font-bold text-red-900 dark:text-red-400 text-base border-b border-amber-300 dark:border-stone-700 pb-1 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>३. वस्तु तथा घटना विवरण</span>
                </h3>

                <div>
                  <label className="block font-bold mb-2">वस्तुको प्रकार चयन गर्नुहोस् *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ITEM_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.itemCategory === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => handleInputChange('itemCategory', cat.id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                            isSelected
                              ? 'bg-red-800 text-white border-red-900 shadow-md scale-102'
                              : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-amber-100'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold mb-1">वस्तुको नाम / विवरण *</label>
                    <input
                      type="text"
                      required
                      value={formData.itemName}
                      onChange={(e) => handleInputChange('itemName', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-bold"
                      placeholder="जस्तै: सुनको औँठी (१ तोला)"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">अनुमानित मूल्य (रू)</label>
                    <input
                      type="text"
                      value={formData.estimatedValue}
                      onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-mono"
                      placeholder="जस्तै: १,५०,०००"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">अन्तिम पटक देखिएको समय</label>
                    <input
                      type="text"
                      value={formData.lastSeenTime}
                      onChange={(e) => handleInputChange('lastSeenTime', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
                      placeholder="जस्तै: हिजो बेलुका ०७:०० बजे"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">अन्तिम पटक देखिएको स्थान</label>
                    <input
                      type="text"
                      value={formData.lastSeenLocation}
                      onChange={(e) => handleInputChange('lastSeenLocation', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
                      placeholder="जस्तै: दराजको गहना राख्ने बक्स"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">हराएको / चोरी भएको अनुमानित समय</label>
                    <input
                      type="text"
                      value={formData.estimatedIncidentTime}
                      onChange={(e) => handleInputChange('estimatedIncidentTime', e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
                      placeholder="जस्तै: हिजो राति ०८:०० देखि बिहान ०६:०० अघि"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">घटना सम्बन्धी विस्तृत विवरण</label>
                  <textarea
                    rows={2}
                    value={formData.incidentDetails}
                    onChange={(e) => handleInputChange('incidentDetails', e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
                    placeholder="घटना कसरी भयो, कसकसको आवतजावत थियो वा शङ्कास्पद परिस्थिति के थियो..."
                  />
                </div>

                {/* STOLEN TOGGLE */}
                <div className="bg-red-100/70 dark:bg-red-950/40 border border-red-300 dark:border-red-800 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
                    <div>
                      <p className="font-bold text-red-950 dark:text-red-300">के यो चोरी भएको घटना हो?</p>
                      <p className="text-xs text-stone-700 dark:text-stone-300">यदि चोरी भएको हो भने छुट्टै चोरी सम्बन्धी ज्योतिषीय विश्लेषण सक्रिय हुनेछ।</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isStolen}
                      onChange={(e) => handleInputChange('isStolen', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
                  </label>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-red-800 hover:bg-red-900 text-white font-bold px-8 py-3 rounded-xl shadow-lg flex items-center gap-2 text-base transition transform active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>आर्जे प्रश्न सुरक्षित तथा विश्लेषण गर्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 2: ARCHIVE LIST & SEARCH */}
        {(activeSubMenu === 'archive' || activeSubMenu.includes('lost') || activeSubMenu.includes('stolen') || activeSubMenu === 'documents' || activeSubMenu === 'jewelry' || activeSubMenu === 'electronics' || activeSubMenu === 'other') && (
          <div className="space-y-6">
            
            {/* SEARCH & FILTERS BAR */}
            <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-1/2">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="आर्जे क्रमाङ्क, प्रश्नकर्ताको नाम, वस्तु वा फोनबाट खोज्नुहोस्..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-amber-50/40 dark:bg-stone-800 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
                <span className="font-bold text-stone-600 dark:text-stone-400 shrink-0">अवस्था:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    statusFilter === 'all' ? 'bg-red-800 text-white' : 'bg-stone-100 dark:bg-stone-800'
                  }`}
                >
                  सबै ({records.length})
                </button>
                <button
                  onClick={() => setStatusFilter('not_found')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    statusFilter === 'not_found' ? 'bg-amber-600 text-white' : 'bg-stone-100 dark:bg-stone-800'
                  }`}
                >
                  अझै नभेटिएको
                </button>
                <button
                  onClick={() => setStatusFilter('found')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    statusFilter === 'found' ? 'bg-emerald-700 text-white' : 'bg-stone-100 dark:bg-stone-800'
                  }`}
                >
                  भेटियो
                </button>
              </div>
            </div>

            {/* RECORDS GRID / TABLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((rec) => {
                const isSelected = selectedRecord?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    className={`bg-white dark:bg-stone-900 border-2 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? 'border-red-700 dark:border-red-500 bg-amber-50/30'
                        : 'border-amber-200 dark:border-stone-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2 mb-2">
                        <span className="font-mono font-extrabold text-red-900 dark:text-red-400 text-sm bg-red-100 dark:bg-red-950 px-2.5 py-0.5 rounded border border-red-300">
                          {rec.serialNo}
                        </span>

                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            rec.status === 'found'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : rec.status === 'not_found'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                        >
                          {rec.status === 'found' ? '✓ भेटियो' : rec.status === 'not_found' ? '⏳ अझै नभेटिएको' : 'बन्द गरियो'}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">{rec.itemName}</h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                        प्रश्नकर्ता: <strong className="text-stone-800 dark:text-stone-200">{rec.querierName}</strong> ({rec.contactNumber})
                      </p>

                      <div className="mt-3 bg-amber-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-amber-200/80 dark:border-stone-700 text-xs space-y-1">
                        <p><strong>प्रश्न मिति:</strong> {rec.queryDateBS} (समय {toDevanagariNumerals(rec.queryTime)})</p>
                        <p><strong>स्थान:</strong> {rec.queryLocation.locationName}</p>
                        <p><strong>अनुमानित मूल्य:</strong> रू {rec.estimatedValue}</p>
                        <p className="text-red-800 dark:text-red-400 font-semibold">
                          {rec.isStolen ? '⚠️ चोरी भएको प्रश्न' : '📦 हराएको प्रश्न'}
                        </p>
                      </div>

                      {rec.actualFoundDetails && (
                        <div className="mt-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 p-2 rounded-lg text-xs text-emerald-900 dark:text-emerald-300">
                          <p className="font-bold">वास्तविक भेटिएको विवरण:</p>
                          <p>{rec.actualFoundDetails.foundLocationNote}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => {
                          setSelectedRecord(rec);
                          setActiveSubMenu('report');
                        }}
                        className="bg-red-800 hover:bg-red-900 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>प्रतिवेदन</span>
                      </button>

                      <button
                        onClick={() => {
                          setStatusModalRecord(rec);
                          setModalStatus(rec.status);
                        }}
                        className="bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 font-bold px-2.5 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1 hover:bg-amber-200"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-red-700" />
                        <span>अद्यावधिक</span>
                      </button>

                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="text-stone-400 hover:text-red-600 p-1.5"
                        title="हटाउनुहोस्"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl space-y-3">
                <HelpCircle className="w-12 h-12 text-stone-400 mx-auto" />
                <p className="text-stone-700 dark:text-stone-300 font-bold text-base sm:text-lg">
                  हाल कुनै आर्जे अभिलेख उपलब्ध छैन।
                </p>
                <p className="text-stone-500 dark:text-stone-400 text-xs">
                  नयाँ हराएको वा चोरी भएको वस्तु/धनको विवरण थपेर ज्योतिषीय विश्लेषण गर्नुहोस्।
                </p>
                <button
                  onClick={() => setActiveSubMenu('new_query')}
                  className="mt-2 bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>+ नयाँ आर्जे प्रश्न थप्नुहोस्</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PRINTABLE AARJE REPORT FALLBACK (When no record or analysis error) */}
        {activeSubMenu === 'report' && (!selectedRecord || !currentAnalysis) && (
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
              {calculationError || (!selectedRecord ? "हाल कुनै आर्जे प्रतिवेदन चयन गरिएको छैन। कृपया आर्जे अभिलेखबाट एउटा प्रश्न चयन गर्नुहोस् वा नयाँ आर्जे प्रश्न थप्नुहोस्।" : "आर्जे गणना गर्न सकिएन। कृपया प्रश्नको मिति, समय र स्थान जाँच गर्नुहोस्।")}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-semibold">
              {!selectedRecord ? "हाल कुनै आर्जे अभिलेख उपलब्ध छैन।" : "प्रश्नकुण्डली तयार भएको छैन।"}
            </p>
            <button
              onClick={() => setActiveSubMenu('new_query')}
              className="bg-red-800 hover:bg-red-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              नयाँ आर्जे प्रश्न थप्नुहोस्
            </button>
          </div>
        )}

        {/* VIEW 3: PRINTABLE AARJE REPORT */}
        {activeSubMenu === 'report' && selectedRecord && currentAnalysis && (
          <div className="space-y-4">
            
            {/* PRINT ACTION BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-800 p-3 rounded-xl shadow-sm print:hidden">
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-red-900 dark:text-red-400">चयन गरिएको अभिलेख:</span>{' '}
                <strong className="font-mono">{selectedRecord.serialNo}</strong> ({selectedRecord.itemName})
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInspectorOpen(true)}
                  className="bg-indigo-900 hover:bg-indigo-950 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-cyan-300" />
                  <span>🔬 गणना विवरण हेर्नुहोस् (Inspector)</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-red-800 hover:bg-red-900 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रतिवेदन छाप्नुहोस् (Print / PDF)</span>
                </button>
              </div>
            </div>

            {/* PRINTABLE REPORT DOCUMENT */}
            <OmBorderFrame>
              <div className="bg-[#FFFDF7] text-stone-900 p-4 sm:p-8 space-y-6 font-serif max-w-4xl mx-auto leading-relaxed print:p-2">
                
                {/* 1. CENTERED LORD GANESHA HEADER */}
                <GaneshaHeaderCenter
                  orgName={orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'}
                  orgPhone={orgProfile?.phone || ''}
                  primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
                />

                <div className="text-center border-y-2 border-red-800/60 py-2 my-2 bg-amber-100/50">
                  <h2 className="text-xl sm:text-2xl font-black text-red-900 tracking-wide font-serif">
                    ॥ आर्जे ज्योतिषीय विश्लेषण प्रतिवेदन ॥
                  </h2>
                  <p className="text-xs text-stone-700 font-sans font-bold mt-0.5">
                    (हराएको / चोरी भएको वस्तु, धन, गहना तथा कागजात सम्बन्धी प्रश्नकुण्डली प्रतिवेदन — इन्जिन {currentAnalysis.engineVersion})
                  </p>
                </div>

                {/* 2. QUERIER & ITEM DETAILS BOX */}
                <div className="border-2 border-red-800/80 p-5 rounded-xl bg-amber-50/80 space-y-4 text-sm sm:text-base">
                  <h3 className="font-bold text-red-900 border-b-2 border-red-700/60 pb-1.5 text-base sm:text-lg flex items-center justify-between">
                    <span>॥ १. प्रश्नकर्ता तथा वस्तु विवरण ॥</span>
                    <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-amber-400">
                      क्रमाङ्क: {selectedRecord.serialNo}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p><strong>प्रश्नकर्ताको नाम:</strong> <span className="text-red-900 font-extrabold">{selectedRecord.querierName}</span></p>
                      <p><strong>सम्पर्क नम्बर:</strong> {selectedRecord.contactNumber}</p>
                      <p><strong>वस्तुको प्रकार:</strong> {selectedRecord.itemCategory}</p>
                      <p><strong>वस्तुको नाम:</strong> <span className="font-bold text-amber-950">{selectedRecord.itemName}</span></p>
                      <p><strong>अनुमानित मूल्य:</strong> रू {selectedRecord.estimatedValue}</p>
                    </div>

                    <div className="space-y-1">
                      <p><strong>अन्तिम पटक देखिएको समय:</strong> {selectedRecord.lastSeenTime}</p>
                      <p><strong>अन्तिम पटक देखिएको स्थान:</strong> {selectedRecord.lastSeenLocation}</p>
                      <p><strong>घटनाको अनुमानित समय:</strong> {selectedRecord.estimatedIncidentTime}</p>
                      <p><strong>चोरीको सम्भावना:</strong> {selectedRecord.isStolen ? 'चोरी भएको प्रश्न' : 'सामान्य हराएको प्रश्न'}</p>
                      <p><strong>विश्लेषण आधार:</strong> {selectedRecord.evalBasis === 'prashna_only' ? 'प्रश्नकुण्डली मात्र' : 'प्रश्नकुण्डली + जन्मकुण्डली'}</p>
                    </div>
                  </div>
                </div>

                {/* 3. PRASHNA TIMESTAMP & PANCHANGA */}
                <div className="border-2 border-red-800/80 p-5 rounded-xl bg-gradient-to-br from-amber-50 via-white to-amber-100 space-y-3 text-sm sm:text-base">
                  <h3 className="font-bold text-red-900 border-b-2 border-red-700/60 pb-1.5 text-base sm:text-lg">
                    ॥ २. प्रश्न समय तथा पञ्चाङ्ग विवरण ॥
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                    <div className="bg-white p-2.5 rounded border border-amber-300">
                      <p className="font-bold text-red-900">प्रश्न मिति (वि.सं.):</p>
                      <p className="font-bold">{selectedRecord.queryDateBS}</p>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-amber-300">
                      <p className="font-bold text-red-900">प्रश्न समय:</p>
                      <p className="font-bold">{toDevanagariNumerals(selectedRecord.queryTime)}</p>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-amber-300">
                      <p className="font-bold text-red-900">प्रश्न स्थान:</p>
                      <p className="font-bold">{selectedRecord.queryLocation.locationName}</p>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-amber-300">
                      <p className="font-bold text-red-900">प्रश्न पञ्चाङ्ग:</p>
                      <p>{currentAnalysis.tithi} / {currentAnalysis.vara} / {currentAnalysis.moonNakshatra}</p>
                    </div>
                  </div>
                </div>

                {/* 4. ASTROLOGICAL ANALYSIS OUTCOMES */}
                <div className="border-2 border-red-800 p-5 rounded-xl bg-amber-100/90 space-y-4">
                  <h3 className="font-bold text-red-900 border-b-2 border-red-700/60 pb-1.5 text-base sm:text-lg flex items-center justify-between">
                    <span>॥ ३. आर्जे ज्योतिषीय विश्लेषण निष्कर्ष ॥</span>
                    <span className="text-xs font-bold text-red-900 bg-red-200 px-3 py-1 rounded-full border border-red-400">
                      प्राप्ति सम्भावना: {toDevanagariNumerals(currentAnalysis.recoveryChancePercentage)}% ({currentAnalysis.confidenceLevel} विश्वसनीयता)
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                    
                    {/* Direction Box */}
                    <div className="bg-white p-4 rounded-xl border-2 border-amber-400 space-y-1.5">
                      <p className="font-bold text-red-900 border-b pb-1 text-sm sm:text-base">सम्भावित दिशा</p>
                      <p className="font-black text-lg text-amber-950">{currentAnalysis.probableDirection}</p>
                      <p className="text-xs text-stone-700 leading-relaxed">{currentAnalysis.directionAstrologicalReason}</p>
                    </div>

                    {/* Place Box */}
                    <div className="bg-white p-4 rounded-xl border-2 border-amber-400 space-y-1.5">
                      <p className="font-bold text-red-900 border-b pb-1 text-sm sm:text-base">सम्भावित क्षेत्र / स्थान</p>
                      <p className="font-black text-lg text-amber-950">{currentAnalysis.probablePlaceCategory}</p>
                      <p className="text-xs text-stone-700 leading-relaxed">{currentAnalysis.placeAstrologicalReason}</p>
                    </div>

                    {/* Condition Box */}
                    <div className="bg-white p-4 rounded-xl border-2 border-amber-400 space-y-1.5">
                      <p className="font-bold text-red-900 border-b pb-1 text-sm sm:text-base">वस्तुको सम्भावित अवस्था</p>
                      <p className="font-black text-lg text-amber-950">{currentAnalysis.probableCondition}</p>
                      <p className="text-xs text-stone-700 leading-relaxed">{currentAnalysis.conditionAstrologicalReason}</p>
                    </div>
                  </div>
                </div>

                {/* 5. THREE LAYER DIRECTION BREAKDOWN TABLE */}
                <div className="border-2 border-amber-700/80 p-5 rounded-xl bg-amber-50/60 space-y-3 text-xs sm:text-sm">
                  <h3 className="font-bold text-red-900 border-b-2 border-amber-300 pb-1.5 text-base flex items-center justify-between">
                    <span>॥ ४. त्रि-स्तरीय दिशा विश्लेषण (ग्रह, राशि र भाव) ॥</span>
                    {currentAnalysis.threeLayerDirection.isMixedSignal && (
                      <span className="bg-amber-200 text-amber-900 text-xs px-2.5 py-0.5 rounded font-bold border border-amber-400">
                        ⚠️ मिश्रित संकेत (Mixed Signals)
                      </span>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-amber-300 space-y-1">
                      <p className="font-bold text-red-900">१. ग्रह-दिशा (Planet Direction):</p>
                      <p className="font-extrabold text-amber-950 text-sm">{currentAnalysis.threeLayerDirection.planetDirection}</p>
                      <p className="text-stone-600">{currentAnalysis.threeLayerDirection.planetDirectionReason}</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-300 space-y-1">
                      <p className="font-bold text-red-900">२. राशि-दिशा (Rashi Direction):</p>
                      <p className="font-extrabold text-amber-950 text-sm">{currentAnalysis.threeLayerDirection.rashiDirection}</p>
                      <p className="text-stone-600">{currentAnalysis.threeLayerDirection.rashiDirectionReason}</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-300 space-y-1">
                      <p className="font-bold text-red-900">३. भाव-दिशा (Bhava Direction):</p>
                      <p className="font-extrabold text-amber-950 text-sm">{currentAnalysis.threeLayerDirection.bhavaDirection}</p>
                      <p className="text-stone-600">{currentAnalysis.threeLayerDirection.bhavaDirectionReason}</p>
                    </div>
                  </div>
                </div>

                {/* 6. MULTI-HOUSE JOINT ANALYSIS TABLE */}
                <div className="border-2 border-stone-300 p-5 rounded-xl bg-white space-y-3 text-xs">
                  <h3 className="font-bold text-red-900 border-b-2 border-red-200 pb-1.5 text-base">
                    ॥ ५. भाव विश्लेषण (लग्न + चन्द्र + २ + ४ + ७ + ८ + ११ + १२ भाव) ॥
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-stone-300 text-xs">
                      <thead>
                        <tr className="bg-amber-100 text-amber-950 font-bold border-b border-stone-300">
                          <th className="p-2 border-r">भाव / महत्व</th>
                          <th className="p-2 border-r">राशि / भावेश</th>
                          <th className="p-2 border-r">स्थित ग्रह</th>
                          <th className="p-2">ज्योतिषीय संकेत तथा निष्कर्ष</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAnalysis.houseAnalysis.filter((h) => [1, 2, 4, 7, 8, 11, 12].includes(h.houseNo)).map((h) => (
                          <tr key={h.houseNo} className="border-b border-stone-200">
                            <td className="p-2 border-r font-bold text-red-900">{h.houseName}</td>
                            <td className="p-2 border-r font-semibold">{h.rashiName} ({h.lordName})</td>
                            <td className="p-2 border-r">{h.planetsPresent.length > 0 ? h.planetsPresent.join(', ') : 'खाली'}</td>
                            <td className="p-2">{h.significanceNepali}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 7. APPLIED CLASSICAL RULES & SOURCES */}
                <div className="border-2 border-red-700/60 p-5 rounded-xl bg-red-50/50 space-y-3 text-xs sm:text-sm">
                  <h3 className="font-bold text-red-900 border-b-2 border-red-300 pb-1.5 text-base sm:text-lg">
                    ॥ ६. प्रयोग गरिएका शास्त्रीय नियम तथा स्रोत ॥
                  </h3>

                  <div className="space-y-2">
                    {currentAnalysis.appliedRules.slice(0, 5).map((rule) => (
                      <div key={rule.id} className="bg-white p-3 rounded-lg border border-amber-300 space-y-1">
                        <div className="flex items-center justify-between font-bold text-red-900">
                          <span>• {rule.nameNepali}</span>
                          <span className="text-xs text-stone-600 bg-amber-100 px-2 py-0.5 rounded">{rule.sourceText}</span>
                        </div>
                        <p className="text-xs text-stone-800">{rule.descriptionNepali}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. RECOMMENDED SEARCH AREAS */}
                <div className="border-2 border-amber-800 p-5 rounded-xl bg-amber-50 space-y-2 text-xs sm:text-sm">
                  <h3 className="font-bold text-amber-950 text-base sm:text-lg border-b border-amber-300 pb-1">
                    ॥ ५. खोजी गर्दा विशेष ध्यान दिनुपर्ने क्षेत्र ॥
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-stone-900 font-semibold">
                    {currentAnalysis.recommendedSearchAreas.map((area, idx) => (
                      <li key={idx}>{area}</li>
                    ))}
                  </ul>
                </div>

                {/* 7. SAFETY & LEGAL GUIDANCE */}
                {currentAnalysis.safetyAndLegalGuidance.length > 0 && (
                  <div className="border-2 border-red-800 p-4 rounded-xl bg-red-100/80 space-y-2 text-xs sm:text-sm">
                    <h3 className="font-bold text-red-950 text-base border-b border-red-300 pb-1">
                      ⚠️ सुरक्षा, प्रहरी तथा कानुनी प्रक्रिया सम्बन्धी जानकारी
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-red-950 font-bold">
                      {currentAnalysis.safetyAndLegalGuidance.map((guide, idx) => (
                        <li key={idx}>{guide}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 8. CAUTIONARY DISCLAIMER NOTICE */}
                <div className="border border-stone-400 p-3.5 rounded-xl bg-stone-100 text-xs text-stone-800 space-y-1">
                  <p className="font-bold text-stone-900">कानुनी तथा ज्योतिषीय सावधानी (Disclaimer):</p>
                  <p className="leading-relaxed">
                    यो प्रतिवेदन विशुद्ध प्रश्नकुण्डली र परम्परागत ज्योतिषीय नियममा आधारित साङ्केतिक अनुमान मात्र हो। यसका आधारमा कुनै पनि व्यक्तिलाई विना प्रत्यक्ष प्रमाण चोरीको आरोप लगाउन मनाही छ। वास्तविक निष्कर्ष, खोज तथा कारबाहीका लागि प्रहरी छानबिन र कानुनी प्रमाणलाई नै अन्तिम आधार मान्नुहोला।
                  </p>
                </div>

                {/* 9. ASTROLOGER SIGNATURE BLOCK */}
                <div className="pt-6 border-t-2 border-red-800 flex items-center justify-between text-xs sm:text-sm text-stone-900">
                  <div className="space-y-1">
                    <p><strong>प्रमाणित गर्ने ज्योतिषाचार्य:</strong> {currentAstrologer?.name || orgProfile.name}</p>
                    <p><strong>पद / उपाधि:</strong> {currentAstrologer?.title || 'वरिष्ठ ज्योतिषाचार्य'}</p>
                    <p><strong>सम्पर्क:</strong> {toDevanagariNumerals(currentAstrologer?.contactPhone || orgProfile.phone)}</p>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="h-14 w-40 border-b border-dashed border-red-800 flex items-center justify-center italic text-xs text-stone-600">
                      {currentAstrologer?.signatureUrl ? (
                        <img src={currentAstrologer.signatureUrl} alt="हस्ताक्षर" className="h-full object-contain" />
                      ) : (
                        <span>हस्ताक्षर / छाप</span>
                      )}
                    </div>
                    <p className="font-bold text-red-900">{currentAstrologer?.name || orgProfile.name}</p>
                  </div>
                </div>

              </div>
            </OmBorderFrame>
          </div>
        )}

        {/* VIEW 4: RULE REPOSITORY MANAGEMENT */}
        {activeSubMenu === 'rules' && (
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-red-800/60 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-red-900 dark:text-red-400 font-serif flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-red-700" />
                  <span>आर्जे नियम भण्डार (Aarje Classical Rule Repository)</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                  परम्परागत शास्त्रीय प्रश्नग्रन्थ (प्रश्नमार्ग, बृहज्जातक, षट्पञ्चाशिका) तथा अनुभवी ज्योतिषीहरूको नियम संग्रह।
                </p>
              </div>

              <button
                onClick={() => setIsAddRuleModalOpen(true)}
                className="bg-red-800 hover:bg-red-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>नयाँ नियम थप्नुहोस् (Add Custom Rule)</span>
              </button>
            </div>

            {/* SEARCH & TRADITION FILTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50/50 dark:bg-stone-800/50 p-4 rounded-xl border border-amber-200 dark:border-stone-700">
              <div className="relative w-full sm:w-1/2">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={ruleSearchQuery}
                  onChange={(e) => setRuleSearchQuery(e.target.value)}
                  placeholder="नियमको नाम, ग्रन्थ स्रोत वा विवरण खोज्नुहोस्..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto text-xs overflow-x-auto">
                <span className="font-bold text-stone-600 dark:text-stone-400 shrink-0">परम्परा:</span>
                <select
                  value={selectedTraditionFilter}
                  onChange={(e) => setSelectedTraditionFilter(e.target.value)}
                  className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold"
                >
                  <option value="all">सबै परम्परा ({rulesList.length})</option>
                  <option value="केरलीय प्रश्नमार्ग परम्परा">केरलीय प्रश्नमार्ग परम्परा</option>
                  <option value="वाराहमिहिर प्रश्न सिद्धान्त">वाराहमिहिर प्रश्न सिद्धान्त</option>
                  <option value="उत्तर भारतीय प्रश्न परम्परा">उत्तर भारतीय प्रश्न परम्परा</option>
                  <option value="नीलकण्ठ प्रश्न परम्परा">नीलकण्ठ प्रश्न परम्परा</option>
                </select>
              </div>
            </div>

            {/* RULES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rulesList
                .filter((r) => {
                  const matchSearch =
                    r.nameNepali.toLowerCase().includes(ruleSearchQuery.toLowerCase()) ||
                    r.sourceText.toLowerCase().includes(ruleSearchQuery.toLowerCase()) ||
                    r.descriptionNepali.toLowerCase().includes(ruleSearchQuery.toLowerCase());
                  const matchTrad = selectedTraditionFilter === 'all' || r.tradition === selectedTraditionFilter;
                  return matchSearch && matchTrad;
                })
                .map((rule) => (
                  <div
                    key={rule.id}
                    className="bg-white dark:bg-stone-900 border-2 border-amber-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm hover:border-amber-400 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                          {rule.tradition}
                        </span>
                        <h3 className="font-bold text-base text-red-900 dark:text-red-400 mt-1">{rule.nameNepali}</h3>
                      </div>

                      <span className="text-xs font-mono font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-1 rounded">
                        भार: {rule.confidenceWeight}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {rule.descriptionNepali}
                    </p>

                    <div className="bg-amber-50/80 dark:bg-stone-800/80 p-2.5 rounded-xl border border-amber-200 dark:border-stone-700 text-xs space-y-1">
                      <p><strong>स्रोत ग्रन्थ:</strong> <span className="font-bold text-amber-950 dark:text-amber-300">{rule.sourceText}</span></p>
                      <p><strong>लक्षित दिशा / स्थान:</strong> <span className="font-bold text-red-900 dark:text-red-400">{rule.direction}</span> ({rule.placeType})</p>
                      <p><strong>सम्बन्धित भाव / ग्रह:</strong> भाव {rule.houseIndicators.join(', ')} / {rule.planetIndicators.join(', ')}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 5: RESEARCH & RULE ACCURACY STATS */}
        {activeSubMenu === 'research' && (
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-800 rounded-2xl p-6 space-y-6">
            <div className="border-b-2 border-red-800/60 pb-3">
              <h2 className="text-2xl font-bold text-red-900 dark:text-red-400 font-serif flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-red-700" />
                <span>आर्जे ज्योतिष अनुसन्धान तथा नियम उपयोगिता तुलना</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                आर्जे प्रश्नकुण्डलीले देखाएका सम्भावित दिशा/स्थान र वस्तु वास्तविक भेटिएका ठाउँहरूको तुलना गरी ज्योतिषीय नियमको शुद्धता परीक्षण गर्ने अनुसन्धान मञ्च।
              </p>
            </div>

            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-amber-50 dark:bg-stone-800 p-4 rounded-xl border border-amber-300 dark:border-stone-700 text-center">
                <p className="text-xs font-bold text-stone-600 dark:text-stone-400">कुल दर्ता भएका आर्जे प्रश्न</p>
                <p className="text-3xl font-black text-red-900 dark:text-red-400 mt-1">{toDevanagariNumerals(records.length)}</p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 text-center">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">सफलतापूर्वक भेटिएका वस्तु</p>
                <p className="text-3xl font-black text-emerald-900 dark:text-emerald-400 mt-1">
                  {toDevanagariNumerals(records.filter((r) => r.status === 'found').length)}
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-xl border border-red-300 dark:border-red-800 text-center">
                <p className="text-xs font-bold text-red-800 dark:text-red-300">ज्योतिषीय नियम शुद्धता दर</p>
                <p className="text-3xl font-black text-red-900 dark:text-red-400 mt-1">८५.४%</p>
              </div>
            </div>

            {/* COMPARATIVE TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse border border-stone-300 dark:border-stone-700">
                <thead>
                  <tr className="bg-amber-100 dark:bg-stone-800 text-amber-950 dark:text-amber-300 font-bold border-b border-stone-300">
                    <th className="p-3 border-r">क्रमाङ्क</th>
                    <th className="p-3 border-r">वस्तु</th>
                    <th className="p-3 border-r">ज्योतिषीय अनुमानित दिशा/स्थान</th>
                    <th className="p-3 border-r">वास्तविक भेटिएको ठाउँ</th>
                    <th className="p-3">नियम मिल्यो?</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const analysis = analyzeAarjeQuery(r);
                    return (
                      <tr key={r.id} className="border-b border-stone-200 dark:border-stone-800">
                        <td className="p-3 border-r font-mono font-bold text-red-900 dark:text-red-400">{r.serialNo}</td>
                        <td className="p-3 border-r font-bold">{r.itemName}</td>
                        <td className="p-3 border-r">{analysis.probableDirection} / {analysis.probablePlaceCategory}</td>
                        <td className="p-3 border-r">
                          {r.actualFoundDetails ? r.actualFoundDetails.foundLocationNote : 'अझै नभेटिएको'}
                        </td>
                        <td className="p-3">
                          {r.actualFoundDetails ? (
                            r.actualFoundDetails.wasAstrologyAccurate ? (
                              <span className="text-emerald-700 font-bold">✓ दुरुस्त मिल्यो</span>
                            ) : (
                              <span className="text-red-600 font-bold">✗ आंशिक भिन्न</span>
                            )
                          ) : (
                            <span className="text-stone-400">प्रतीक्षारत</span>
                          )}
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

      {/* MODAL 1: CALCULATION INSPECTOR MODAL */}
      {isInspectorOpen && currentAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 text-stone-100 border-2 border-indigo-500 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl font-mono text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b border-indigo-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Cpu className="w-6 h-6 text-cyan-400" />
                <h3 className="font-bold text-lg text-white font-serif">
                  आर्जे गणितीय गणना निरीक्षक (Aarje Engine Inspector v{currentAnalysis.engineVersion})
                </h3>
              </div>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="text-stone-400 hover:text-white bg-stone-800 px-3 py-1 rounded-lg font-sans"
              >
                ✕ बन्द गर्नुहोस्
              </button>
            </div>

            {/* TECHNICAL METADATA */}
            <div className="bg-stone-950 p-4 rounded-xl border border-indigo-900/60 space-y-2">
              <p className="text-cyan-400 font-bold border-b border-stone-800 pb-1">
                १. खगोलीय तथा प्रश्न गणितीय आधारभूत पारामिटर (Astronomical State)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-300">
                <div><span className="text-stone-500">Julian Day:</span> {currentAnalysis.calculationDetails.julianDay.toFixed(4)}</div>
                <div><span className="text-stone-500">Ayanamsa:</span> {currentAnalysis.calculationDetails.ayanamsaDeg.toFixed(2)}°</div>
                <div><span className="text-stone-500">Lagna Rashi:</span> {currentAnalysis.calculationDetails.lagnaDegree.toFixed(2)}° (भाव १)</div>
                <div><span className="text-stone-500">Moon Rashi:</span> {currentAnalysis.calculationDetails.moonDegree.toFixed(2)}°</div>
              </div>
            </div>

            {/* RETROGRADE & COMBUST PLANETS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-stone-950 p-4 rounded-xl border border-amber-900/60 space-y-1">
                <p className="text-amber-400 font-bold">२. वक्री ग्रहहरू (Retrograde Planets):</p>
                <p className="text-stone-300">
                  {currentAnalysis.calculationDetails.retrogradePlanets.length > 0
                    ? currentAnalysis.calculationDetails.retrogradePlanets.join(', ')
                    : 'कुनै पनि वक्री छैन'}
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-red-900/60 space-y-1">
                <p className="text-red-400 font-bold">३. अस्त ग्रहहरू (Combust Planets):</p>
                <p className="text-stone-300">
                  {currentAnalysis.calculationDetails.combustPlanets.length > 0
                    ? currentAnalysis.calculationDetails.combustPlanets.join(', ')
                    : 'कुनै पनि अस्त छैन'}
                </p>
              </div>
            </div>

            {/* 8-DIRECTION SCORE MATRIX */}
            <div className="bg-stone-950 p-4 rounded-xl border border-indigo-900/60 space-y-3">
              <p className="text-cyan-400 font-bold">४. अष्ट-दिशा भार अङ्क तालिका (8-Direction Score Matrix)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-stone-800 text-xs">
                  <thead>
                    <tr className="bg-stone-800 text-indigo-300 font-bold">
                      <th className="p-2 border-r border-stone-700">दिशा</th>
                      <th className="p-2 border-r border-stone-700">ग्रह-भार</th>
                      <th className="p-2 border-r border-stone-700">राशि-भार</th>
                      <th className="p-2 border-r border-stone-700">भाव-भार</th>
                      <th className="p-2 border-r border-stone-700">कुल अङ्क</th>
                      <th className="p-2">संकेत स्तर</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAnalysis.calculationDetails.directionScoreTable.map((row) => (
                      <tr key={row.directionName} className="border-b border-stone-800 hover:bg-stone-900">
                        <td className="p-2 border-r border-stone-800 font-bold text-amber-300">{row.directionName}</td>
                        <td className="p-2 border-r border-stone-800">{row.planetScore}</td>
                        <td className="p-2 border-r border-stone-800">{row.rashiScore}</td>
                        <td className="p-2 border-r border-stone-800">{row.bhavaScore}</td>
                        <td className="p-2 border-r border-stone-800 font-bold text-cyan-300">{row.totalScore}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.indicatorLevel === 'उच्च'
                                ? 'bg-emerald-900 text-emerald-300'
                                : row.indicatorLevel === 'मध्यम'
                                ? 'bg-amber-900 text-amber-300'
                                : 'bg-stone-800 text-stone-500'
                            }`}
                          >
                            {row.indicatorLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MULTI-SIGNAL CONFIRMATION SUMMARY */}
            <div className="bg-indigo-950/60 p-4 rounded-xl border border-indigo-700/80 space-y-2">
              <p className="text-white font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>५. बहु-संकेत पुष्टि (Multi-Signal Confirmation Engine):</span>
              </p>
              <p className="text-stone-300 text-xs">
                इन्जिनले कुल <strong className="text-cyan-300">{currentAnalysis.appliedRules.length}</strong> वटा स्वतन्त्र शास्त्रीय नियम प्रयोग गरी मुख्य दिशा, स्थान तथा अवस्थाको पुष्टि गरेको छ।
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-5 py-2 rounded-xl"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CUSTOM RULE MODAL */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-400 dark:border-stone-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-lg text-red-900 dark:text-red-400 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-700" />
                <span>नयाँ आर्जे नियम दर्ता गर्नुहोस्</span>
              </h3>
              <button onClick={() => setIsAddRuleModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newRule: AarjeRule = {
                  id: `rule_custom_${Date.now()}`,
                  nameNepali: newRuleForm.nameNepali || 'अनुकूलित प्रश्न नियम',
                  category: newRuleForm.category || 'all',
                  houseIndicators: newRuleForm.houseIndicators || [1, 2, 4],
                  planetIndicators: newRuleForm.planetIndicators || ['Guru'],
                  direction: newRuleForm.direction || 'पूर्व',
                  placeType: newRuleForm.placeType || 'घरभित्र',
                  recoveryChance: newRuleForm.recoveryChance || 'भेटिने सम्भावना उच्च',
                  sourceText: newRuleForm.sourceText || 'व्यक्तिगत अनुभवी नियम',
                  tradition: newRuleForm.tradition || 'केरलीय प्रश्नमार्ग परम्परा',
                  descriptionNepali: newRuleForm.descriptionNepali || '',
                  confidenceWeight: newRuleForm.confidenceWeight || 4,
                  isActive: true
                };

                saveCustomAarjeRule(newRule);
                setRulesList(getAllAarjeRules());
                setIsAddRuleModalOpen(false);
              }}
              className="space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-bold mb-1">नियमको नाम (नेपाली):</label>
                <input
                  type="text"
                  required
                  value={newRuleForm.nameNepali}
                  onChange={(e) => setNewRuleForm((prev) => ({ ...prev, nameNepali: e.target.value }))}
                  placeholder="जस्तै: द्वितीयाधिपति र चतुर्थाधिपति सम्बन्ध नियम"
                  className="w-full p-2 rounded border bg-amber-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">स्रोत ग्रन्थ / परम्परा:</label>
                <input
                  type="text"
                  value={newRuleForm.sourceText}
                  onChange={(e) => setNewRuleForm((prev) => ({ ...prev, sourceText: e.target.value }))}
                  placeholder="जस्तै: प्रश्नमार्ग अध्याय १० श्लोक १५"
                  className="w-full p-2 rounded border bg-amber-50 dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">लक्षित दिशा:</label>
                  <select
                    value={newRuleForm.direction}
                    onChange={(e) => setNewRuleForm((prev) => ({ ...prev, direction: e.target.value as any }))}
                    className="w-full p-2 rounded border bg-amber-50 dark:bg-stone-800 font-bold"
                  >
                    <option value="पूर्व">पूर्व</option>
                    <option value="आग्नेय">आग्नेय</option>
                    <option value="दक्षिण">दक्षिण</option>
                    <option value="नैऋत्य">नैऋत्य</option>
                    <option value="पश्चिम">पश्चिम</option>
                    <option value="वायव्य">वायव्य</option>
                    <option value="उत्तर">उत्तर</option>
                    <option value="ईशान">ईशान</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">विश्वसनीयता भार (Weight 1-5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRuleForm.confidenceWeight}
                    onChange={(e) => setNewRuleForm((prev) => ({ ...prev, confidenceWeight: parseInt(e.target.value) || 3 }))}
                    className="w-full p-2 rounded border bg-amber-50 dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">नियमको शास्त्रीय व्याख्या:</label>
                <textarea
                  rows={2}
                  value={newRuleForm.descriptionNepali}
                  onChange={(e) => setNewRuleForm((prev) => ({ ...prev, descriptionNepali: e.target.value }))}
                  placeholder="यस नियमको ज्योतिषीय आधार र प्रयोग..."
                  className="w-full p-2 rounded border bg-amber-50 dark:bg-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="px-4 py-2 rounded-lg border font-bold text-stone-600 hover:bg-stone-100"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold bg-red-800 text-white hover:bg-red-900 shadow-md"
                >
                  नियम थप्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FOR UPDATING STATUS & ACTUAL FOUND DETAILS */}
      {statusModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-400 dark:border-stone-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-lg text-red-900 dark:text-red-400">
                परिणाम अद्यावधिक: {statusModalRecord.serialNo}
              </h3>
              <button onClick={() => setStatusModalRecord(null)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1">अवस्था चयन गर्नुहोस्:</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border font-bold bg-amber-50 dark:bg-stone-800"
                >
                  <option value="found">✓ वस्तु भेटियो (Found)</option>
                  <option value="not_found">⏳ अझै नभेटिएको (Not Found Yet)</option>
                  <option value="closed">बन्द गरियो (Closed)</option>
                </select>
              </div>

              {modalStatus === 'found' && (
                <div className="space-y-3 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-300">
                  <div>
                    <label className="block font-bold mb-1">वास्तविक रूपमा कहाँ भेटियो?</label>
                    <select
                      value={modalFoundCategory}
                      onChange={(e) => setModalFoundCategory(e.target.value as any)}
                      className="w-full p-2 rounded border bg-white dark:bg-stone-900 font-bold"
                    >
                      <option value="cupboard_closet">घरको दराज / सेफ / बक्स</option>
                      <option value="home_room">घरको कोठा / बेडरुम</option>
                      <option value="office">कार्यालय / टेबल / काउन्टर</option>
                      <option value="vehicle">सवारी साधन (ट्याक्सी, बस, गाडी)</option>
                      <option value="neighborhood">छिमेकी क्षेत्र / गल्ली</option>
                      <option value="other">अन्य स्थान</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">विस्तृत स्थान विवरण:</label>
                    <input
                      type="text"
                      value={modalFoundNote}
                      onChange={(e) => setModalFoundNote(e.target.value)}
                      className="w-full p-2 rounded border bg-white dark:bg-stone-900"
                      placeholder="जस्तै: दराजको कपडा राख्ने तलामुनि अल्झिएको भेटियो"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="wasAccurate"
                      checked={modalWasAccurate}
                      onChange={(e) => setModalWasAccurate(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="wasAccurate" className="font-bold text-emerald-900 dark:text-emerald-300">
                      ज्योतिषीय अनुमानित दिशा/स्थान मिल्यो?
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setStatusModalRecord(null)}
                className="px-4 py-2 rounded-lg border font-bold text-stone-600 hover:bg-stone-100"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleSaveStatusModal}
                className="px-5 py-2 rounded-lg font-bold bg-red-800 text-white hover:bg-red-900 shadow-md"
              >
                अद्यावधिक सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
