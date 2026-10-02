import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Download, 
  Search, 
  User, 
  UserPlus, 
  Scroll, 
  Sparkles, 
  Check, 
  History, 
  Sliders, 
  Heart, 
  BookOpen, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  FileCheck,
  Building,
  CheckSquare,
  Square,
  Edit,
  Trash2,
  ChevronRight,
  Eye,
  Settings,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Loader2,
  Share2
} from 'lucide-react';
import { WhatsAppIcon, FacebookIcon, MessengerIcon } from './common/WhatsAppShareModal';

import { 
  BirthDetails, 
  LagnaInfo, 
  PlanetPosition, 
  PanchangaData, 
  PatrikaSubCategory, 
  PatrikaStatus, 
  OrganizationProfile, 
  AstrologerProfile 
} from '../types/astrology';
import { exportElementToPDF, printElement, generatePNGFileFromElement, sharePDFToWhatsApp } from '../utils/pdfGenerator';
import { toDevanagariNumerals, convertADToBS } from '../utils/nepaliCalendar';
import { getStoredPatrikaRecords, savePatrikaRecord } from '../db/profileStore';
import { CheenaDocument, OmBorderFrame } from './CheenaDocument';
import { TipanDocument } from './TipanDocument';
import { SanskriticPatrikaDocument } from './SanskriticPatrikaDocument';
import { DynamicPatrikaDocument } from './DynamicPatrikaDocument';
import { GaneshaHeaderCenter } from './GaneshaHeaderCenter';
import { CheenaQuickEditModal } from './CheenaQuickEditModal';
import { PrintPreviewModal } from './PrintPreviewModal';
import { canUserPrintDocuments } from '../db/subscriptionStore';

interface PatrikaViewProps {
  profile: BirthDetails;
  profiles: BirthDetails[];
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  panchanga: PanchangaData;
  orgProfile: OrganizationProfile;
  astrologers: AstrologerProfile[];
  initialSubTab?: PatrikaSubCategory;
  onSelectProfile: (p: BirthDetails) => void;
  onNewProfile: () => void;
  onEditProfile?: (p: BirthDetails) => void;
}

export const PATRIKA_TYPES_LIST: Array<{ key: PatrikaSubCategory; label: string; desc: string }> = [
  { key: 'brihat_china', label: 'बृहत् चिना', desc: '१० पृष्ठको सम्पूर्ण बृहत् जन्मपत्रिका तथा फलादेश' },
  { key: 'china', label: 'चिना', desc: '३ पृष्ठको परम्परागत सङ्कल्प, कुण्डली र दशा सहितको चिना' },
  { key: 'tippan', label: 'टिप्पन', desc: '१ पृष्ठको संक्षिप्त जन्म टिपण तथा कुण्डली' },
  { key: 'vivah', label: 'विवाह पत्रिका', desc: '१ पृष्ठको विवाह संस्कार मुहूर्त तथा ३६ गुण मिलान पत्र' },
  { key: 'bartabandha', label: 'व्रतबन्ध', desc: '१ पृष्ठको व्रतबन्ध संस्कार तथा सङ्कल्प मुहूर्त पत्रिका' },
  { key: 'upanayan', label: 'उपनयन', desc: '१ पृष्ठको उपनयन संस्कार तथा गायत्री मन्त्र उपदेश पत्रिका' },
  { key: 'naamkaran', label: 'नामकरण', desc: '१ पृष्ठको नामकरण संस्कार नक्षत्र अक्षर तथा मुहूर्त पत्रिका' },
  { key: 'grihapravesh', label: 'गृहप्रवेश', desc: '१ पृष्ठको वास्तु तथा गृहप्रवेश शुभ मुहूर्त पत्रिका' },
  { key: 'muhurta', label: 'मुहूर्त पत्रिका', desc: '१ पृष्ठको शुभ कर्मका लागि मुहूर्त चयन प्रतिवेदन' },
  { key: 'dasha', label: 'दशा विवरण', desc: '१ पृष्ठको विंशोत्तरी महादशा तथा अन्तरदशा तालिका' },
  { key: 'graha', label: 'ग्रह विवरण', desc: '१ पृष्ठको स्पष्ट ग्रह स्थिति, नक्षत्र, पाद तथा बल' },
  { key: 'varga', label: 'वर्ग कुण्डली', desc: '१ पृष्ठको मुख्य वर्ग कुण्डलीहरू' },
  { key: 'bhavachalit', label: 'भावचलित', desc: '१ पृष्ठको भाव स्पष्ट तथा भाव चक्र' },
  { key: 'gochar', label: 'गोचर', desc: '१ पृष्ठको हालको नवग्रह गोचर तथा साढेसाती प्रभाव' },
  { key: 'faladesh', label: 'फलादेश', desc: '१ पृष्ठको समग्र जीवन फलादेश तथा उपाय प्रतिवेदन' },
  { key: 'anya', label: 'अन्य पत्रिका', desc: '१ पृष्ठको विशेष पूजा, अनुष्ठान तथा अन्य ज्योतिष पत्र' },
];

export const PatrikaView: React.FC<PatrikaViewProps> = ({
  profile,
  profiles,
  lagna,
  planets,
  panchanga,
  orgProfile,
  astrologers,
  initialSubTab = 'china',
  onSelectProfile,
  onNewProfile,
  onEditProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<PatrikaSubCategory>(initialSubTab);
  const [isPatrikaDropdownOpen, setIsPatrikaDropdownOpen] = useState(false);
  const patrikaDropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize with external navigation changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Click outside listener to close Patrika dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (patrikaDropdownRef.current && !patrikaDropdownRef.current.contains(e.target as Node)) {
        setIsPatrikaDropdownOpen(false);
      }
    };
    if (isPatrikaDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPatrikaDropdownOpen]);

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Astrologer Selection
  const [selectedAstrologerId, setSelectedAstrologerId] = useState<string>(
    astrologers?.[0]?.id || ''
  );
  const activeAstrologer = (astrologers || []).find((a) => a.id === selectedAstrologerId) || astrologers?.[0];

  // Document Mode: Full vs Short
  const [patrikaFormatMode, setPatrikaFormatMode] = useState<'full' | 'short'>('full');

  // Privacy Options
  const [hideParentPhone, setHideParentPhone] = useState(false);

  // Page Selection Checkboxes for Multi-page Print
  const [selectedPrintPages, setSelectedPrintPages] = useState({
    profileDetails: true,
    china: true,
    janmakundali: true,
    grahaTable: true,
    bhavaTable: true,
    vargaCharts: true,
    dashaDetails: true,
    yogas: true,
    doshas: true,
    gochar: true,
    faladesh: true,
    remedies: true,
  });

  // Patrika Serial & Status State
  const [patrikaStatus, setPatrikaStatus] = useState<PatrikaStatus>('स्वीकृत');
  const [patrikaHistory, setPatrikaHistory] = useState<any[]>(getStoredPatrikaRecords());

  // Cheena Quick Edit Modal State
  const [isCheenaQuickEditOpen, setIsCheenaQuickEditOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(e.target as Node)) {
        setShowDownloadDropdown(false);
      }
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target as Node)) {
        setShowShareDropdown(false);
      }
    };
    if (showDownloadDropdown || showShareDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDownloadDropdown, showShareDropdown]);

  // Filtered Jatak Search Results
  const filteredProfiles = (profiles || []).filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.jatakSerialNo && p.jatakSerialNo.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q)) ||
      (p.dateBS && p.dateBS.includes(q)) ||
      (p.fatherDetails?.name && p.fatherDetails.name.toLowerCase().includes(q)) ||
      (p.motherDetails?.name && p.motherDetails.name.toLowerCase().includes(q))
    );
  });

  // Handle Print Action
  const handlePrint = () => {
    const check = canUserPrintDocuments('kundali');
    if (!check.allowed) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'kundali' } }));
      return;
    }

    // Record Patrika Print Log
    const record = {
      jatakId: profile.id,
      jatakName: profile.name,
      subCategory: activeSubTab,
      version: 1,
      status: 'छापिएको',
      printedAtBS: panchanga.dateBS,
      astrologerName: activeAstrologer?.name || orgProfile.name,
      createdDateBS: panchanga.dateBS,
    };
    savePatrikaRecord(record);
    setPatrikaHistory(getStoredPatrikaRecords());
    printElement('patrika_printable_document_area');
  };

  // Handle PDF Export
  const handlePDFExport = async () => {
    setShowDownloadDropdown(false);
    const check = canUserPrintDocuments('kundali');
    if (!check.allowed) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'kundali' } }));
      return;
    }

    setIsExportingPDF(true);
    setDownloadStatus('PDF प्रतिवेदन तयार हुँदैछ, कृपया केही सेकेन्ड पर्खनुहोस्...');
    try {
      const fileName = `${activeSubTab}_${profile.name}_${panchanga.dateBS.replace(/\s+/g, '_')}.pdf`;
      const success = await exportElementToPDF('patrika_printable_document_area', fileName);
      if (success) {
        setDownloadStatus('PDF प्रतिवेदन सफलतापूर्वक डाउनलोड भयो!');
      } else {
        setDownloadStatus('त्रुटि: PDF डाउनलोड हुन सकेन।');
      }
    } catch (e) {
      console.error('PDF Export error:', e);
      setDownloadStatus('त्रुटि: PDF तयार गर्न सकिएन।');
    } finally {
      setIsExportingPDF(false);
      setTimeout(() => setDownloadStatus(null), 3500);
    }
  };

  // Handle PNG Export
  const handlePNGExport = async () => {
    setShowDownloadDropdown(false);
    const check = canUserPrintDocuments('kundali');
    if (!check.allowed) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'kundali' } }));
      return;
    }

    setDownloadStatus('PNG तस्बिर तयार हुँदैछ...');
    try {
      const fileName = `${activeSubTab}_${profile.name}_${panchanga.dateBS.replace(/\s+/g, '_')}.png`;
      await generatePNGFileFromElement('patrika_printable_document_area', fileName);
      setDownloadStatus('PNG तस्बिर सफलतापूर्वक डाउनलोड भयो!');
    } catch (e) {
      console.error('PNG Export error:', e);
      setDownloadStatus('त्रुटि: PNG तयार गर्न सकिएन।');
    } finally {
      setTimeout(() => setDownloadStatus(null), 3500);
    }
  };

  const getPatrikaShareText = () => {
    return `॥ वैदिक जन्मपत्रिका प्रतिवेदन ॥\n👤 जातकको नाम: ${profile.name}\n📅 जन्म मिति: वि.सं. ${toDevanagariNumerals(profile.dateBS)} | समय: ${toDevanagariNumerals(profile.time)}\n📍 जन्म स्थान: ${profile.location?.name || 'नेपाल'}\n📜 प्रतिवेदन प्रकार: ${currentPatrikaMeta?.label || 'जन्मपत्रिका'}\n\n— ${orgProfile?.name || 'बालानन्द वैदिक ज्योतिष सेवा'}\n🌐 ${typeof window !== 'undefined' ? window.location.href : 'https://suwashdmk.com'}`;

  };

  const handleShareWhatsApp = () => {
    setShowShareDropdown(false);
    const text = getPatrikaShareText();
    const phone = profile.phone || profile.fatherDetails?.phone;
    let cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      cleanPhone = '977' + cleanPhone;
    }
    const encoded = encodeURIComponent(text);
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleShareFacebook = () => {
    setShowShareDropdown(false);
    const text = getPatrikaShareText();
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=620,height=540');
  };

  const handleShareMessenger = async () => {
    setShowShareDropdown(false);
    const text = getPatrikaShareText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (isMobile) {
      window.location.href = `fb-messenger://share?link=${encodeURIComponent(url)}`;
    } else {
      window.open('https://www.messenger.com/', '_blank');
    }
    setDownloadStatus('विवरण कपी भयो र Messenger खुल्दैछ!');
    setTimeout(() => setDownloadStatus(null), 3000);
  };

  const handleCopyShareText = async () => {
    setShowShareDropdown(false);
    const text = getPatrikaShareText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setDownloadStatus('जन्मपत्रिका विवरण क्लिपबोर्डमा कपी भयो!');
        setTimeout(() => setDownloadStatus(null), 3000);
      }
    } catch {}
  };

  const togglePageSelection = (key: keyof typeof selectedPrintPages) => {
    setSelectedPrintPages({
      ...selectedPrintPages,
      [key]: !selectedPrintPages[key],
    });
  };

  const currentPatrikaMeta = PATRIKA_TYPES_LIST.find((t) => t.key === activeSubTab) || PATRIKA_TYPES_LIST[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP BAR: Jatak Search & Quick Actions */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input for Jatak */}
        <div className="relative flex-1 max-w-lg">
          <div className="relative">
            <Search className="w-4 h-4 text-[#D97706] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              placeholder="जातक खोज्नुहोस् (नाम, जातक क्रमाङ्क, फोन, मिति, बाबु/आमाको नाम...)"
              className="w-full bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2 text-xs text-[#2D241E] dark:text-stone-100 focus:ring-2 focus:ring-[#D97706]"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto p-1">
              <div className="px-3 py-1.5 border-b border-stone-100 dark:border-stone-700 text-[10px] font-bold text-[#D97706] uppercase flex justify-between">
                <span>अभिलेखमा रहेका जातक सूची ({filteredProfiles.length})</span>
                <button
                  type="button"
                  onClick={() => setShowSearchDropdown(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  बंद
                </button>
              </div>

              {filteredProfiles.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-500">
                  कुनै मिल्दो जातक भेटिएन।
                </div>
              ) : (
                filteredProfiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProfile(p);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex items-center justify-between border-b border-stone-100 dark:border-stone-700/50 last:border-0 ${
                      p.id === profile.id ? 'bg-amber-50 dark:bg-amber-950/40 font-bold border-l-4 border-l-[#D97706]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-200 shrink-0 flex items-center justify-center text-xs font-bold text-stone-600">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          p.name[0]
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#1A1A1A] dark:text-stone-100">
                          {p.name} <span className="text-[10px] text-[#D97706] font-mono">({p.jatakSerialNo || p.customerId})</span>
                        </div>
                        <div className="text-[10px] text-stone-500">
                          जन्म: {p.dateBS} | {p.location?.name || '—'}
                        </div>
                      </div>
                    </div>
                    {p.id === profile.id && (
                      <span className="text-[10px] font-bold text-[#D97706] bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-md">
                        चयनित
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: New Jatak & Edit Jatak */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewProfile}
            className="flex items-center gap-1.5 bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>नयाँ जातक थप्नुहोस्</span>
          </button>

          {onEditProfile && (
            <button
              onClick={() => onEditProfile(profile)}
              className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[#2D241E] dark:text-stone-100 font-semibold text-xs px-3.5 py-2 rounded-xl border border-[#E6E0D5] dark:border-stone-700 transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-[#D97706]" />
              <span>जातक विवरण सम्पादन</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SELECTED JATAK SUMMARY CARD (PROFESSIONAL 2-COLUMN LAYOUT) */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Card Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#D97706] shadow-md bg-stone-200 shrink-0">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-base text-amber-800 bg-amber-100">
                  {profile.name[0]}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100">
                  {profile.name}
                </h3>
                <span className="text-xs font-bold font-mono bg-amber-500/20 text-[#D97706] px-2.5 py-0.5 rounded-lg border border-[#D97706]/30">
                  क्रमाङ्क: {profile.jatakSerialNo || profile.customerId || 'जातक-००१'}
                </span>
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md">
                  {profile.gender === 'male' ? 'पुरुष' : 'महिला'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-0.5">
                जन्म मिति: {toDevanagariNumerals(profile.dateBS)} | समय: {toDevanagariNumerals(profile.time)}
              </p>
            </div>
          </div>

          {/* Action Buttons: Edit Family, Print, Download ▾ (PDF/PNG), WhatsApp Share */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={() => setIsCheenaQuickEditOpen(true)}
              className="flex items-center gap-1.5 bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 border border-amber-500/30 cursor-pointer"
              title="अभिभावक, गोत्र, कुलदेवता तथा वंश विवरण सम्पादन गर्नुहोस्"
            >
              <Edit className="w-4 h-4" />
              <span>वंश विवरण</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 text-[#2D241E] dark:text-stone-100 text-xs font-bold px-3.5 py-2 rounded-xl border border-[#E6E0D5] dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D97706]" />
              <span>प्रिन्ट</span>
            </button>

            {/* Download Status Toast / Pill */}
            {downloadStatus && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-[#7A1C1C] dark:text-amber-300 text-xs font-bold animate-in fade-in flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>{downloadStatus}</span>
              </div>
            )}

            {/* Unified Download Dropdown (PDF & PNG) */}
            <div className="relative" ref={downloadDropdownRef}>
              <button
                type="button"
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                disabled={isExportingPDF}
                className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-900 disabled:opacity-75 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Download className="w-4 h-4 text-amber-400" />
                )}
                <span>{isExportingPDF ? 'तयार हुँदै...' : 'डाउनलोड'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {showDownloadDropdown && (
                <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl z-30 py-1 min-w-[130px] overflow-hidden">
                  <button
                    type="button"
                    onClick={handlePDFExport}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePNGExport}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PNG</span>
                  </button>
                </div>
              )}
            </div>

            {/* Unified Share Dropdown Button */}
            <div className="relative" ref={shareDropdownRef}>
              <button
                type="button"
                onClick={() => setShowShareDropdown(!showShareDropdown)}
                className="flex items-center gap-1.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                title="सामाजिक सञ्जालमा सेयर गर्नुहोस्"
              >
                <Share2 className="w-4 h-4 text-emerald-300" />
                <span>सेयर</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-80 transition-transform duration-150 ${showShareDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showShareDropdown && (
                <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl z-30 py-1 min-w-[160px] overflow-hidden divide-y divide-stone-100 dark:divide-stone-700 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <FacebookIcon className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Facebook</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareMessenger}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-sky-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <MessengerIcon className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>Messenger</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyShareText}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>विवरण कपी गर्नुहोस्</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Structured Overview: Left (Jataka Core), Right (Family & Lineage) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          
          {/* LEFT SIDE: जातकको मुख्य जन्म विवरण */}
          <div className="bg-stone-50 dark:bg-stone-800/40 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 space-y-2">
            <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-700 pb-1.5 font-bold text-[#D97706]">
              <span className="flex items-center gap-1.5 text-xs">
                <User className="w-4 h-4" />
                <span>१. जातकको मुख्य विवरण (Core Details)</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">बायाँ भाग</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-stone-700 dark:text-stone-300">
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">जातकको नाम:</span>
                <span className="font-bold text-[#1A1A1A] dark:text-stone-100 text-xs">{profile.name}</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">लिङ्ग:</span>
                <span className="font-semibold">{profile.gender === 'male' ? 'पुरुष' : 'महिला'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] text-stone-500 font-semibold">जन्म मिति (विक्रम संवत्):</span>
                <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">{toDevanagariNumerals(profile.dateBS)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">स्थानीय जन्म समय:</span>
                <span className="font-semibold">{toDevanagariNumerals(profile.time)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">जन्म स्थान:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{profile.location?.name || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] text-stone-500 font-semibold">अक्षांश तथा देशान्तर:</span>
                <span className="font-mono text-[11px] text-stone-600 dark:text-stone-400">
                  {toDevanagariNumerals(profile?.location?.latitude || '27.7172')} अक्षांश, {toDevanagariNumerals(profile?.location?.longitude || '85.3240')} देशान्तर
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: अभिभावक, गोत्र तथा वंश विवरण */}
          <div className="bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center justify-between border-b border-amber-300 dark:border-amber-800 pb-1.5 font-bold text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span>२. अभिभावक, गोत्र तथा वंश विवरण (Family & Lineage)</span>
              </span>
              <button
                onClick={() => setIsCheenaQuickEditOpen(true)}
                className="flex items-center gap-1 text-[11px] bg-[#D97706] hover:bg-[#b45309] text-white font-bold px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                title="अभिभावक र वंश विवरण सम्पादन गर्नुहोस्"
              >
                <Edit className="w-3 h-3" />
                <span>वंश विवरण सम्पादन</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-stone-700 dark:text-stone-300">
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">बाबुको नाम:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {profile.fatherDetails?.name || profile.parentName || '—'}
                  {profile.fatherDetails?.occupation ? ` (${profile.fatherDetails.occupation})` : ''}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">आमाको नाम:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {profile.motherDetails?.name || '—'}
                  {profile.motherDetails?.occupation ? ` (${profile.motherDetails.occupation})` : ''}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">मुख्य गोत्र:</span>
                <span className="font-bold text-red-700 dark:text-red-400">
                  {profile.fatherDetails?.gotra || '—'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">आमाको मायती गोत्र:</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {profile.motherDetails?.gotra || '—'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">सन्तान क्रम / दर्जा:</span>
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  {[profile.familyHistory?.childOrder || 'द्वितिय', profile.familyHistory?.childType || (profile.gender === 'male' ? 'पुत्र' : 'पुत्री')].filter(Boolean).join(' ')}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">कुलदेवता:</span>
                <span className="font-semibold">{profile.familyHistory?.kuldevata || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-semibold">वंश / प्रवर:</span>
                <span className="font-semibold">{profile.familyHistory?.vamsa || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] text-stone-500 font-semibold">ठेगाना (गाउँ/नगर/जिल्ला/देश):</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  {[
                    profile?.location?.tole,
                    profile?.location?.localBody,
                    profile?.location?.district,
                    profile?.location?.province,
                    profile?.location?.country || 'नेपाल'
                  ].filter(Boolean).join(', ') || profile?.location?.name || '—'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. PATRIKA SELECTION DROPDOWN MENU */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Interactive Dropdown Menu */}
        <div className="relative flex-1 max-w-md" ref={patrikaDropdownRef}>
          <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Scroll className="w-3.5 h-3.5 text-[#D97706]" />
              <span>जन्मपत्रिका तथा दस्तावेज छनोट (Patrika Document Menu):</span>
            </span>
            <span className="text-[10px] text-[#D97706] font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-300 dark:border-stone-700">
              {currentPatrikaMeta.desc.split(' ')[0]}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsPatrikaDropdownOpen(!isPatrikaDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 bg-[#FAF7F2] dark:bg-stone-800 border-2 border-[#D97706] hover:border-amber-600 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 shadow-xs transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-6 h-6 rounded-lg bg-[#D97706]/15 flex items-center justify-center text-[#D97706] shrink-0 font-bold text-xs">
                📜
              </div>
              <div className="truncate">
                <span className="font-extrabold text-[#7A1C1C] dark:text-amber-300">{currentPatrikaMeta.label}</span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate font-normal">
                  {currentPatrikaMeta.desc}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#D97706] transition-transform shrink-0 ${isPatrikaDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Categorized Dropdown Menu */}
          {isPatrikaDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-stone-800 border border-amber-300 dark:border-stone-700 rounded-2xl shadow-2xl z-40 p-2.5 max-h-96 overflow-y-auto space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Group 1: मुख्य जन्मपत्रिका */}
              <div>
                <div className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider px-2 py-0.5 border-b border-amber-200 dark:border-stone-700 flex justify-between">
                  <span>१. मुख्य जन्मपत्रिका तथा कुण्डली</span>
                  <span>१० / ३ / १ पृष्ठ</span>
                </div>
                <div className="grid grid-cols-1 gap-1 mt-1">
                  {PATRIKA_TYPES_LIST.filter((t) => ['brihat_china', 'china', 'tippan'].includes(t.key)).map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setActiveSubTab(t.key);
                        setIsPatrikaDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        activeSubTab === t.key
                          ? 'bg-[#D97706] text-white font-bold shadow-xs'
                          : 'hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Scroll className={`w-3.5 h-3.5 ${activeSubTab === t.key ? 'text-white' : 'text-[#D97706]'}`} />
                        <div>
                          <div className="font-bold">{t.label}</div>
                          <div className={`text-[10px] ${activeSubTab === t.key ? 'text-amber-100' : 'text-stone-500 dark:text-stone-400'}`}>
                            {t.desc}
                          </div>
                        </div>
                      </div>
                      {activeSubTab === t.key && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group 2: संस्कार तथा मांगलिक पत्रिका */}
              <div>
                <div className="text-[10px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider px-2 py-0.5 border-b border-red-200 dark:border-stone-700 flex justify-between">
                  <span>२. संस्कार तथा मांगलिक पत्रिका</span>
                  <span>१ पृष्ठ (A4 Single Page)</span>
                </div>
                <div className="grid grid-cols-1 gap-1 mt-1">
                  {PATRIKA_TYPES_LIST.filter((t) => ['vivah', 'bartabandha', 'upanayan', 'naamkaran', 'grihapravesh', 'muhurta'].includes(t.key)).map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setActiveSubTab(t.key);
                        setIsPatrikaDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        activeSubTab === t.key
                          ? 'bg-[#D97706] text-white font-bold shadow-xs'
                          : 'hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className={`w-3.5 h-3.5 ${activeSubTab === t.key ? 'text-white' : 'text-red-600'}`} />
                        <div>
                          <div className="font-bold">{t.label}</div>
                          <div className={`text-[10px] ${activeSubTab === t.key ? 'text-amber-100' : 'text-stone-500 dark:text-stone-400'}`}>
                            {t.desc}
                          </div>
                        </div>
                      </div>
                      {activeSubTab === t.key && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group 3: ज्योतिषीय विवरण तथा चक्र */}
              <div>
                <div className="text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider px-2 py-0.5 border-b border-blue-200 dark:border-stone-700 flex justify-between">
                  <span>३. ज्योतिषीय विवरण तथा चक्र</span>
                  <span>१ पृष्ठ (A4 Single Page)</span>
                </div>
                <div className="grid grid-cols-1 gap-1 mt-1">
                  {PATRIKA_TYPES_LIST.filter((t) => ['dasha', 'graha', 'varga', 'bhavachalit', 'gochar', 'faladesh', 'anya'].includes(t.key)).map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setActiveSubTab(t.key);
                        setIsPatrikaDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        activeSubTab === t.key
                          ? 'bg-[#D97706] text-white font-bold shadow-xs'
                          : 'hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className={`w-3.5 h-3.5 ${activeSubTab === t.key ? 'text-white' : 'text-blue-600'}`} />
                        <div>
                          <div className="font-bold">{t.label}</div>
                          <div className={`text-[10px] ${activeSubTab === t.key ? 'text-amber-100' : 'text-stone-500 dark:text-stone-400'}`}>
                            {t.desc}
                          </div>
                        </div>
                      </div>
                      {activeSubTab === t.key && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Right: Quick shortcut pills for the most common 5 documents */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 mr-1 hidden lg:inline">
            द्रुत पहुँच:
          </span>
          {[
            { key: 'brihat_china', label: 'बृहत् चिना' },
            { key: 'china', label: 'चिना' },
            { key: 'tippan', label: 'टिप्पन' },
            { key: 'vivah', label: 'विवाह पत्रिका' },
            { key: 'bartabandha', label: 'व्रतबन्ध' },
          ].map((item) => {
            const isActive = activeSubTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveSubTab(item.key as PatrikaSubCategory);
                  setIsPatrikaDropdownOpen(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#D97706] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PRINT CONTROL PANEL & OPTIONS */}
      <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-700/60 pb-2">
          <div className="flex items-center gap-2 font-bold text-[#1A1A1A] dark:text-stone-100">
            <Sliders className="w-4 h-4 text-[#D97706]" />
            <span>पत्रिका छपाइ छनोट तथा पण्डित सेटिङ (Print Settings)</span>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'china' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200 rounded-lg text-[11px] font-extrabold border border-emerald-300 dark:border-emerald-700">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>परम्परागत प्रामाणिक जन्मपत्रिका ढाँचा (A4 Authentic Format)</span>
              </span>
            ) : (
              <>
                <span className="text-stone-500">ढाँचा:</span>
                <button
                  onClick={() => setPatrikaFormatMode('full')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    patrikaFormatMode === 'full' ? 'bg-[#D97706] text-white' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                >
                  पूर्ण पत्रिका
                </button>
                <button
                  onClick={() => setPatrikaFormatMode('short')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    patrikaFormatMode === 'short' ? 'bg-[#D97706] text-white' : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                >
                  छोटो पत्रिका
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Astrologer Selector */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
              प्रमाणित गर्ने ज्योतिषी / पण्डित चयन:
            </label>
            <select
              value={selectedAstrologerId}
              onChange={(e) => setSelectedAstrologerId(e.target.value)}
              className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-medium"
            >
              {astrologers.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.title})
                </option>
              ))}
            </select>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="hidePhoneCheck"
              checked={hideParentPhone}
              onChange={(e) => setHideParentPhone(e.target.checked)}
              className="rounded text-[#D97706]"
            />
            <label htmlFor="hidePhoneCheck" className="text-stone-700 dark:text-stone-300 font-medium cursor-pointer">
              बाबु/आमाको फोन नम्बर नछाप्ने (गोपनीयता)
            </label>
          </div>

          {/* Patrika Status Selector */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
              पत्रिका अभिलेख अवस्था (Status):
            </label>
            <select
              value={patrikaStatus}
              onChange={(e) => setPatrikaStatus(e.target.value as PatrikaStatus)}
              className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-medium"
            >
              <option value="मस्यौदा">मस्यौदा (Draft)</option>
              <option value="स्वीकृत">स्वीकृत (Approved)</option>
              <option value="छापिएको">छापिएको (Printed)</option>
              <option value="संशोधित">संशोधित (Revised)</option>
            </select>
          </div>
        </div>

        {/* Page Checkboxes */}
        <div className="pt-2 border-t border-[#E6E0D5] dark:border-stone-700/60">
          <div className="text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-2">
            छाप्ने पृष्ठहरू/भागहरू छनोट गर्नुहोस्:
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {Object.entries(selectedPrintPages).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => togglePageSelection(key as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                  val
                    ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-200 font-bold'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400'
                }`}
              >
                {val ? <CheckSquare className="w-3.5 h-3.5 text-[#D97706]" /> : <Square className="w-3.5 h-3.5" />}
                <span>
                  {key === 'profileDetails' && 'जातक विवरण'}
                  {key === 'china' && 'चिना'}
                  {key === 'janmakundali' && 'जन्मकुण्डली'}
                  {key === 'grahaTable' && 'ग्रह विवरण'}
                  {key === 'bhavaTable' && 'भाव विवरण'}
                  {key === 'vargaCharts' && 'वर्ग कुण्डली'}
                  {key === 'dashaDetails' && 'दशा'}
                  {key === 'yogas' && 'योग'}
                  {key === 'doshas' && 'दोष'}
                  {key === 'gochar' && 'गोचर'}
                  {key === 'faladesh' && 'फलादेश'}
                  {key === 'remedies' && 'उपाय'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. RHS CHEENA DETAILS ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 border border-amber-300 dark:border-stone-700 p-3.5 rounded-2xl shadow-sm gap-3">
        <div className="flex items-center gap-2.5 text-xs text-amber-950 dark:text-amber-100 font-bold">
          <Sparkles className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>चिना/टिपणमा देखिने बाबु, आमा, गोत्र, गाउँ, शहर तथा देश विवरण:</span>
          <span className="text-[#D97706] font-extrabold bg-white dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-stone-700">
            {profile.fatherDetails?.name || profile.parentName || '—'} ({profile.fatherDetails?.gotra || 'गोत्र नभरिएको'}) | {profile.location?.name || '—'}
          </span>
        </div>

        <button
          onClick={() => setIsCheenaQuickEditOpen(true)}
          className="flex items-center gap-2 bg-[#D97706] hover:bg-[#b45309] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
        >
          <Edit className="w-4 h-4" />
          <span>वंश तथा पारिवारिक विवरण सम्पादन</span>
        </button>
      </div>

      {/* 6. PRINTABLE PATRIKA DOCUMENT AREA */}
      <div id="patrika_printable_document_area">
        <DynamicPatrikaDocument
          subCategory={activeSubTab}
          profile={profile}
          lagna={lagna}
          planets={planets}
          panchanga={panchanga}
          orgProfile={orgProfile}
          astrologer={activeAstrologer}
          patrikaFormatMode={patrikaFormatMode}
          selectedPrintPages={selectedPrintPages}
          hideParentPhone={hideParentPhone}
        />
      </div>

      {/* 6. PATRIKA ARCHIVE & HISTORY LOG */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
          <History className="w-4 h-4 text-[#D97706]" />
          <span>{profile.name} को पत्रिका इतिहास तथा पुनःछाप्ने अभिलेख (Patrika History)</span>
        </h3>

        {patrikaHistory.filter((h) => h.jatakId === profile.id).length === 0 ? (
          <div className="text-center py-6 text-xs text-stone-500 border border-dashed rounded-xl">
            यस जातकको कुनै पत्रिका छापिएको वा सुरक्षित गरिएको छैन।
          </div>
        ) : (
          <div className="space-y-2">
            {patrikaHistory
              .filter((h) => h.jatakId === profile.id)
              .map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
                      <span>{rec.patrikaNo}</span>
                      <span className="text-[#D97706] font-normal">({rec.subCategory})</span>
                      <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-[10px] px-2 py-0.5 rounded-md font-bold">
                        {rec.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      मिती: {rec.printedAtBS || rec.createdDateBS} | प्रमाणितकर्ता: {rec.astrologerName}
                    </div>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 bg-[#D97706] text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-[#b45309]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>पुनःछाप्नुहोस्</span>
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Cheena Quick Edit Modal */}
      <CheenaQuickEditModal
        isOpen={isCheenaQuickEditOpen}
        onClose={() => setIsCheenaQuickEditOpen(false)}
        profile={profile}
        onSave={(updated) => {
          onSelectProfile(updated);
        }}
      />

      {/* Print Preview & PDF Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        profile={profile}
        profiles={profiles}
        lagna={lagna}
        planets={planets}
        panchanga={panchanga}
        orgProfile={orgProfile}
        astrologer={activeAstrologer}
        defaultReportType={activeSubTab === 'china' ? 'brihat_china' : 'kundali'}
      />

    </div>
  );
};


export default PatrikaView;
