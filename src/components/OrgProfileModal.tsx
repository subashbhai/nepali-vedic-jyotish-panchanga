import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Camera, 
  RotateCcw, 
  Eye, 
  Edit3, 
  ArrowRight, 
  Compass, 
  Scroll, 
  HeartHandshake, 
  Home, 
  Timer, 
  BookOpen, 
  ShoppingBag, 
  Users, 
  Flame, 
  Lightbulb, 
  Target, 
  Landmark, 
  FileText,
  ChevronRight,
  Lock
} from 'lucide-react';
import { OrganizationProfile } from '../types/astrology';
import { NavTab } from './Navigation';
import { DEFAULT_ORG_PROFILE } from '../db/profileStore';
import { ImageCropModal } from './ImageCropModal';
import { ServiceLoginRequiredModal, ServiceItemInfo } from './common/ServiceLoginRequiredModal';

interface OrgProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgProfile: OrganizationProfile;
  onSaveOrgProfile: (updated: OrganizationProfile) => void;
  onNavigate?: (tab: NavTab) => void;
  astrologers?: any[];
  onSaveAstrologer?: (astro: any) => void;
  onDeleteAstrologer?: (id: string) => void;
  purohits?: any[];
  onSavePurohit?: (purohit: any) => void;
  onDeletePurohit?: (id: string) => void;
  onOpenCropModal?: (type: 'org_logo' | 'org_hero', title: string, existingImage?: string) => void;
  isSuperAdmin?: boolean;
  isLoggedIn?: boolean;
  onOpenAuthModal?: () => void;
  onOpenTrialModal?: () => void;
}

export const OrgProfileModal: React.FC<OrgProfileModalProps> = ({
  isOpen,
  onClose,
  orgProfile,
  onSaveOrgProfile,
  onNavigate,
  isSuperAdmin = false,
  isLoggedIn = false,
  onOpenAuthModal,
  onOpenTrialModal
}) => {
  const [viewMode, setViewMode] = useState<'public' | 'edit'>('public');
  const [formData, setFormData] = useState<OrganizationProfile>(orgProfile);
  const [activeCropTarget, setActiveCropTarget] = useState<'logo' | 'mainPhoto' | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [selectedServiceForAuth, setSelectedServiceForAuth] = useState<ServiceItemInfo | null>(null);
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false);

  // Allow all users / licensees to customize their organization branding
  // so any buyer can configure their own name and letterhead

  useEffect(() => {
    // Merge with defaults for missing optional fields if any
    setFormData({
      ...DEFAULT_ORG_PROFILE,
      ...orgProfile,
    });
  }, [orgProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOrgProfile(formData);
    setSuccessMsg('संस्थाको प्रोफाइल विवरण सफलतापूर्वक अद्यावधिक गरियो।');
    setTimeout(() => {
      setSuccessMsg('');
      setViewMode('public');
    }, 1200);
  };

  const handleResetDefaults = () => {
    if (confirm('के तपाईं पूर्वनिर्धारित आधिकारिक संस्था प्रोफाइल (बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा) मा फर्किन चाहनुहुन्छ?')) {
      setFormData(DEFAULT_ORG_PROFILE);
      onSaveOrgProfile(DEFAULT_ORG_PROFILE);
      setSuccessMsg('पूर्वनिर्धारित प्रोफाइल पुनर्स्थापित गरियो।');
      setTimeout(() => setSuccessMsg(''), 1500);
    }
  };

  // Core Service Mapping
  const majorServices: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: React.FC<{ className?: string }>;
    tabKey: NavTab;
    badge: string;
  }> = [
    {
      id: 'jyotish',
      title: '🔱 ज्योतिष सेवा',
      subtitle: 'कुण्डली विश्लेषण, फलादेश, ग्रहदशा, एवं परामर्श सेवा',
      icon: Compass,
      tabKey: 'kundali',
      badge: 'कुण्डली / फलादेश',
    },
    {
      id: 'patrika',
      title: '📜 पत्रिका तथा जन्मकुण्डली',
      subtitle: 'चिना, जन्मकुण्डली, विवाह पत्रिका, तथा डिजिटल पत्रिका मुद्रण',
      icon: FileText,
      tabKey: 'patrika',
      badge: 'डिजिटल पत्रिका',
    },
    {
      id: 'karmakanda',
      title: '🕉️ कर्मकाण्ड तथा संस्कार',
      subtitle: 'नामकरण, व्रतबन्ध, विवाह, पूजापाठ, अनुष्ठान तथा संस्कार व्यवस्थापन',
      icon: Scroll,
      tabKey: 'sanskar',
      badge: 'वैदिक संस्कार',
    },
    {
      id: 'vastu',
      title: '🏠 वास्तु सेवा',
      subtitle: 'गृहप्रवेश, भूमिपूजन, आवासीय तथा व्यावसायिक वास्तु परामर्श',
      icon: Landmark,
      tabKey: 'vastu',
      badge: 'वास्तुशास्त्र',
    },
    {
      id: 'muhurta',
      title: '📅 मुहूर्त सेवा',
      subtitle: 'विवाह, व्रतबन्ध, गृहप्रवेश, यात्रा, एवं शुभकार्य मुहूर्त निर्णय',
      icon: Timer,
      tabKey: 'muhurta',
      badge: 'शुभ मुहूर्त',
    },
    {
      id: 'yajaman',
      title: '🙏 यजमान सेवा',
      subtitle: 'यजमान दर्ता, पारिवारिक लग, सेवा बुकिङ तथा डिजिटल प्रोफाइल',
      icon: Users,
      tabKey: 'yajaman',
      badge: 'यजमान व्यवस्थापन',
    },
    {
      id: 'store',
      title: '📚 वैदिक सामग्री तथा पुस्तक',
      subtitle: 'शुद्ध पूजा सामग्री, यन्त्र, रुद्राक्ष, रत्न, तथा वैदिक पञ्चाङ्ग/पुस्तक',
      icon: ShoppingBag,
      tabKey: 'kharedi',
      badge: 'वैदिक पसल',
    },
    {
      id: 'spiritual',
      title: '🛕 धार्मिक तथा आध्यात्मिक सेवा',
      subtitle: 'आध्यात्मिक परामर्श, तीर्थयात्रा सूचना, आर्जे तथा ज्ञान भण्डार',
      icon: BookOpen,
      tabKey: 'aarje',
      badge: 'आध्यात्मिक ज्ञान',
    },
  ];

  // Core Values list
  const coreValuesList = formData.coreValues || DEFAULT_ORG_PROFILE.coreValues || [
    { title: 'ज्ञान', desc: 'सनातन वैदिक शास्त्र, ज्योतिष र कर्मकाण्डको सही तथा प्रमाणिक ज्ञानप्रतिको प्रतिबद्धता।' },
    { title: 'परम्परा', desc: 'प्राचीन गुरु-परम्परा र वैदिक रीतिरिवाजको मर्यादा संरक्षण।' },
    { title: 'विश्वसनीयता', desc: 'सेवाग्राहीप्रतिको पूर्ण उत्तरदायित्व, यथार्थपरक परामर्श र गोपनीयता।' },
    { title: 'पारदर्शिता', desc: 'दक्षता, शुल्क तथा सेवा प्रक्रियामा पूर्ण स्पष्टता र पारदर्शिता।' },
    { title: 'सेवा', desc: 'व्यावसायिकताभन्दा माथि उठेर धर्म, संस्कृति र समाज कल्याणको सेवाभाव।' },
  ];

  // Objectives List
  const objectives = formData.objectivesList || DEFAULT_ORG_PROFILE.objectivesList || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-[#FFFDF7] dark:bg-[#1C1712] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl sm:rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-[#2D241E] dark:text-stone-100">
        
        {/* Top Navigation Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between bg-[#FDFCF8] dark:bg-[#211B14] shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center shadow-md border-2 border-amber-400/50 shrink-0 overflow-hidden p-0.5">
              <img 
                src={formData.logoUrl || '/logo.png'} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-full" 
                onError={(e) => {
                  e.currentTarget.src = '/logo.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-bold font-serif text-[#1A1A1A] dark:text-amber-100 leading-snug">
                  {formData.name}
                </h2>
                <span className="hidden md:inline-flex items-center gap-1 bg-amber-500/10 text-[#D97706] dark:text-amber-300 text-[11px] px-2.5 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> आधिकारिक प्रोफाइल
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] dark:text-stone-400 font-medium">
                {formData.tagline || 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Show Edit Switcher ONLY for Super Admin */}
            {isSuperAdmin && (
              <div className="bg-stone-200/80 dark:bg-stone-800/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-stone-300/50 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setViewMode('public')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'public'
                      ? 'bg-white dark:bg-[#2D2319] text-[#D97706] dark:text-amber-300 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">संस्था प्रोफाइल</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'edit'
                      ? 'bg-[#D97706] text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title="सुपरएडमिन सम्पादन मोड"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">सम्पादन (Super Admin)</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors cursor-pointer"
              title="बन्द गर्नुहोस्"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        {viewMode === 'public' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 p-4 sm:p-6 md:p-8">
            
            {/* HERO SECTION */}
            <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFFDF7] via-[#FAF3E6] to-[#FFFDF7] dark:from-[#211B14] dark:via-[#2D2319] dark:to-[#1C1712] border border-[#E6E0D5] dark:border-stone-800 p-6 sm:p-8 md:p-10 shadow-lg overflow-hidden text-center sm:text-left">
              
              {/* Subtle Decorative Vedic Patterns & Motifs in Background */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Watermark Temple Silhouette & Diya Motifs */}
              <div className="absolute top-3 right-4 opacity-10 dark:opacity-20 pointer-events-none select-none text-[#D97706]">
                <svg className="w-32 h-32 sm:w-48 sm:h-48" viewBox="0 0 100 100" fill="currentColor">
                  {/* Subtle Temple Contour SVG */}
                  <path d="M50 5 L65 30 L85 30 L80 40 L90 40 L85 90 L15 90 L10 40 L20 40 L15 30 L35 30 Z M50 15 L40 30 L60 30 Z M35 90 L35 60 L65 60 L65 90 Z" />
                </svg>
              </div>

              {/* Top & Bottom Decorative Trim Line */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#D97706]/40 to-transparent mb-6" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8">
                {/* Organization Logo */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white dark:bg-stone-900 border-2 border-[#D97706]/60 rounded-full p-1 flex items-center justify-center shadow-xl overflow-hidden ring-4 ring-amber-500/20">
                    <img 
                      src={formData.logoUrl || '/logo.png'} 
                      alt={formData.name} 
                      className="w-full h-full object-cover rounded-full" 
                      onError={(e) => {
                        e.currentTarget.src = '/logo.png';
                      }}
                    />
                  </div>
                  {/* Subtle Diya Icon Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-1.5 rounded-full shadow-md border-2 border-white dark:border-stone-900" title="वैदिक ज्योति">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>

                {/* Main Hero Details */}
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/20 text-[#B45309] dark:text-amber-300 border border-[#D97706]/30 px-3.5 py-1 rounded-full text-xs font-bold shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{formData.tagline || 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा'}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-[#1A1A1A] dark:text-amber-100 tracking-tight leading-tight">
                    {formData.name}
                  </h1>

                  <p className="text-xs text-[#78716C] dark:text-stone-400 italic">
                    * यो ट्यागलाइन संस्थाको सेवा प्रतिबद्धता र गुणस्तर जनाउने प्रवर्द्धनात्मक ध्येय वाक्य हो।
                  </p>

                  <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed max-w-3xl font-medium">
                    सनातन वैदिक परम्परा, ज्योतिषीय गणना, वास्तुशास्त्र तथा कर्मकाण्डीय संस्कारलाई आधुनिक डिजिटल प्रविधिसँग जोड्दै अनुशासित र सेवामुखी रूपमा सञ्चालित संस्था।
                  </p>

                  {/* Contact Chips */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-semibold">
                    <a
                      href={`tel:${formData.phone.replace(/[^0-9+]/g, '')}`}
                      className="bg-white dark:bg-stone-800 hover:bg-stone-50 border border-[#E6E0D5] dark:border-stone-700 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[#D97706] shadow-2xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{formData.phone}</span>
                    </a>
                    <a
                      href={`mailto:${formData.email}`}
                      className="bg-white dark:bg-stone-800 hover:bg-stone-50 border border-[#E6E0D5] dark:border-stone-700 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-stone-700 dark:text-stone-300 shadow-2xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{formData.email}</span>
                    </a>
                    <span className="bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-stone-700 dark:text-stone-300 shadow-2xs">
                      <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{formData.address}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Subtle Trim Line */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#D97706]/40 to-transparent mt-6" />
            </div>

            {/* VEDIC SHLOKA SECTION */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/40 border border-amber-500/30 rounded-2xl p-6 text-center space-y-2 shadow-sm relative overflow-hidden">
              <div className="text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <span>॥ मङ्गल मन्त्र ॥</span>
              </div>
              <div className="font-serif text-base sm:text-lg md:text-xl font-bold text-[#2D241E] dark:text-amber-100 leading-relaxed whitespace-pre-line">
                {formData.shlokaText || 'ॐ सह नाववतु।\nसह नौ भुनक्तु।\nसह वीर्यं करवावहै।\nतेजस्विनावधीतमस्तु मा विद्विषावहै॥\nॐ शान्तिः शान्तिः शान्तिः॥'}
              </div>
            </div>

            {/* हाम्रो परिचय (OUR INTRO) SECTION */}
            <div className="bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="w-8 h-8 bg-amber-500/10 text-[#D97706] rounded-xl flex items-center justify-center font-bold">
                  ॐ
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A] dark:text-amber-100">
                  हाम्रो संस्था
                </h3>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
                {formData.intro.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* हाम्रो दृष्टिकोण (VISION) SECTION */}
            <div className="bg-gradient-to-br from-[#FFFDF7] to-[#FAF3E6] dark:from-[#231C15] dark:to-[#1A1510] border-l-4 border-l-[#D97706] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-[#D97706] dark:text-amber-400 font-bold text-base sm:text-lg font-serif">
                <Lightbulb className="w-5 h-5 text-[#D97706]" />
                <span>हाम्रो दृष्टिकोण (Vision)</span>
              </div>
              <p className="text-sm sm:text-base text-stone-800 dark:text-stone-200 font-medium leading-relaxed italic">
                “{formData.visionText || 'वैदिक ज्ञान र परम्पराको मूल भावनालाई संरक्षण गर्दै आधुनिक प्रविधिको माध्यमबाट ज्योतिष, वास्तु तथा कर्मकाण्डीय सेवाहरूलाई व्यवस्थित, पारदर्शी, सुरक्षित र सेवाग्राहीमैत्री बनाउनु।'}"
              </p>
            </div>

            {/* हाम्रो उद्देश्य (OBJECTIVES) SECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                <Target className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A] dark:text-amber-100">
                  हाम्रो उद्देश्य (Mission & Objectives)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {objectives.map((item, idx) => {
                  const devanagariNums = ['१', '२', '३', '४', '५', '६', '७', '८'];
                  return (
                    <div
                      key={idx}
                      className="bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl p-4 flex items-start gap-3 shadow-2xs hover:border-amber-400/50 transition-colors"
                    >
                      <span className="w-7 h-7 bg-amber-500/10 text-[#D97706] dark:bg-amber-500/20 dark:text-amber-300 font-bold rounded-lg flex items-center justify-center text-xs shrink-0">
                        {devanagariNums[idx] || idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 leading-snug pt-0.5">
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* हाम्रा प्रमुख सेवाहरू (CORE SERVICES CONNECTED TO EXISTING MODULES) */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#D97706]" />
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A] dark:text-amber-100">
                    हाम्रा प्रमुख सेवाहरू (Core Digital Services)
                  </h3>
                </div>
                <span className="text-xs text-[#78716C] dark:text-stone-400 font-medium">
                  सम्बन्धित कार्डमा क्लिक गरी सीधा सेवा मोड्युलमा जानुहोस्:
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {majorServices.map((service) => {
                  const IconComp = service.icon;
                  return (
                    <div
                      key={service.id}
                      onClick={() => {
                        if (!isLoggedIn) {
                          setSelectedServiceForAuth(service);
                          setIsAuthRequiredModalOpen(true);
                        } else if (onNavigate) {
                          onNavigate(service.tabKey);
                        }
                      }}
                      className="group bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 hover:border-[#D97706] rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden active:scale-[0.98]"
                    >
                      {!isLoggedIn && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9.5px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          <span>लगइन</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-amber-500/10 text-[#D97706] dark:bg-amber-500/20 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {service.badge}
                          </span>
                          <IconComp className="w-5 h-5 text-[#D97706] group-hover:scale-110 transition-transform" />
                        </div>
                        <h4 className="text-sm font-bold text-[#1A1A1A] dark:text-amber-100 group-hover:text-[#D97706] transition-colors">
                          {service.title}
                        </h4>
                        <p className="text-xs text-[#78716C] dark:text-stone-400 leading-relaxed">
                          {service.subtitle}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#D97706] border-t border-stone-100 dark:border-stone-800">
                        <span>सेवा खोल्नुहोस्</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* नवस्थापित संस्था — नयाँ यात्रा (HIGHLIGHT SECTION) */}
            <div className="bg-gradient-to-br from-[#D97706]/10 via-amber-500/10 to-orange-500/10 dark:from-amber-950/50 dark:via-amber-900/40 dark:to-stone-900 border-2 border-[#D97706]/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-2 text-[#D97706] dark:text-amber-300 font-bold text-base sm:text-lg font-serif">
                <Sparkles className="w-5 h-5 text-[#D97706]" />
                <span>{formData.newJourneyTitle || 'नवप्रारम्भ — दीर्घकालीन यात्रा'}</span>
              </div>
              <p className="text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                {formData.newJourneyText || 'यो संस्था हालै स्थापना भएको नयाँ संस्था हो। नयाँ सुरुवातसँगै दीर्घकालीन लक्ष्य बोकेर वैदिक ज्ञान, परम्परा, प्रविधि र सेवाको समन्वय गर्दै क्रमशः अझ व्यवस्थित तथा विश्वसनीय सेवा प्रणाली निर्माण गर्ने हाम्रो संकल्प हो।'}
              </p>
            </div>

            {/* हाम्रा मूल मूल्यहरू (CORE VALUES) SECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
                <Award className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A] dark:text-amber-100">
                  हाम्रा मूल मूल्यहरू (Core Values)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {coreValuesList.map((val, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl p-4 space-y-1.5 shadow-2xs hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] dark:text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{val.title}</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* VEDIC INSPIRATION SECTION */}
            <div className="bg-[#FAF3E6] dark:bg-[#26201A] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 text-center space-y-2 shadow-2xs">
              <p className="text-xs font-bold text-[#D97706] uppercase tracking-wider">
                ॥ वैदिक प्रेरणा ॥
              </p>
              <h4 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-amber-100">
                “ज्ञानबाट सेवा — सेवाबाट कल्याण”
              </h4>
              <p className="text-sm font-serif italic text-stone-700 dark:text-stone-300">
                “विद्या ददाति विनयं। विनयाद् याति पात्रताम्।”
              </p>
            </div>

            {/* OFFICIAL CONTACT & REGISTRATION FOOTER */}
            <div className="bg-stone-100 dark:bg-stone-900/80 border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                  संस्थाको नाम:
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {formData.name}
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                  सम्पर्क तथा इमेल:
                </span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                  फोन: {formData.phone}
                </span>
                <span className="text-stone-600 dark:text-stone-400 block">
                  इमेल: {formData.email}
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                  दर्ता तथा स्थायी लेखा नम्बर:
                </span>
                <span className="text-stone-800 dark:text-stone-200 font-semibold block">
                  {formData.registeredNo || 'दर्ता नं. १२३४/०८०'}
                </span>
                <span className="text-stone-600 dark:text-stone-400 block">
                  {formData.panNo || 'PAN: ६०१२३४५६७'}
                </span>
              </div>
            </div>

          </div>
        ) : (
          /* ADMIN EDIT MODE FORM */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold block flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#D97706]" />
                प्रशासनिक सम्पादन कक्ष (Admin Edit Panel)
              </span>
              <p>
                यहाँबाट तपाईंले संस्थाको नाम, ट्यागलाइन, लोगो, मुख्य फोटो, परिचय, दृष्टिकोण, सम्पर्क विवरण तथा रिपोर्ट फुटर सम्पादन गर्न सक्नुहुन्छ।
              </p>
            </div>

            {/* Logo and Main Photo Upload Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo Preview Card */}
              <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-[#E6E0D5] dark:border-stone-800 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                    संस्थाको लोगो (Logo)
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">PNG / SVG</span>
                </div>
                <div className="aspect-square max-w-[120px] mx-auto bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-full p-1 flex items-center justify-center overflow-hidden shadow-inner">
                  <img 
                    src={formData.logoUrl || '/logo.png'} 
                    alt="Logo" 
                    className="w-full h-full object-cover rounded-full" 
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCropTarget('logo')}
                  className="w-full py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-[#D97706]" />
                  लोगो परिवर्तन गर्नुहोस्
                </button>
              </div>

              {/* Main Org Hero Photo Card */}
              <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-[#E6E0D5] dark:border-stone-800 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#D97706]" />
                    मुख्य फोटो (Main Photo)
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Banner / Image</span>
                </div>
                <div className="aspect-video max-w-[180px] mx-auto bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                  {formData.mainPhotoUrl ? (
                    <img src={formData.mainPhotoUrl} alt="Main Org" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-stone-400">फोटो छैन</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCropTarget('mainPhoto')}
                  className="w-full py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-[#D97706]" />
                  मुख्य फोटो परिवर्तन गर्नुहोस्
                </button>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mangal Shloka */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  शीर्ष मङ्गल श्लोक / स्तुति (Top Sacred Invocation):
                </label>
                <input
                  type="text"
                  value={formData.mangalShloka || ''}
                  onChange={(e) => setFormData({ ...formData, mangalShloka: e.target.value })}
                  placeholder="॥ श्री गणेशाय नमः ॥ ॥ कुलदेवतायै नमः ॥"
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-serif text-[#1A1A1A] dark:text-stone-100 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              {/* Organization Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  संस्थाको नाम (Official Name):
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-bold text-[#1A1A1A] dark:text-stone-100 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              {/* Tagline */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  मुख्य ट्यागलाइन (Tagline):
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-medium text-[#1A1A1A] dark:text-stone-100 focus:ring-2 focus:ring-[#D97706]"
                  placeholder="नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#D97706]" />
                  सम्पर्क नम्बर (Phone):
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-semibold text-[#1A1A1A] dark:text-stone-100 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#D97706]" />
                  इमेल (Email):
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm font-medium text-[#1A1A1A] dark:text-stone-100 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                  ठेगाना (Address):
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-[#1A1A1A] dark:text-stone-100"
                />
              </div>

              {/* Website */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#D97706]" />
                  वेबसाइट लिङ्क:
                </label>
                <input
                  type="text"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-[#1A1A1A] dark:text-stone-100"
                />
              </div>

              {/* Registration & PAN */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  दर्ता नम्बर (Registration No):
                </label>
                <input
                  type="text"
                  value={formData.registeredNo || ''}
                  onChange={(e) => setFormData({ ...formData, registeredNo: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-[#1A1A1A] dark:text-stone-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  स्थायी लेखा नम्बर (PAN):
                </label>
                <input
                  type="text"
                  value={formData.panNo || ''}
                  onChange={(e) => setFormData({ ...formData, panNo: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-[#1A1A1A] dark:text-stone-100"
                />
              </div>

              {/* Astrologer Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  मुख्य ज्योतिषी / विज्ञको नाम:
                </label>
                <input
                  type="text"
                  value={formData.astrologerName || ''}
                  onChange={(e) => setFormData({ ...formData, astrologerName: e.target.value })}
                  placeholder="ज्योतिषाचार्य सुकदेव शर्मा"
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-[#1A1A1A] dark:text-stone-100"
                />
              </div>

              {/* Astrologer Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  पद / उपाधि:
                </label>
                <input
                  type="text"
                  value={formData.astrologerTitle || ''}
                  onChange={(e) => setFormData({ ...formData, astrologerTitle: e.target.value })}
                  placeholder="मुख्य ज्योतिषाचार्य / वरिष्ठ वास्तुविद्"
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-[#1A1A1A] dark:text-stone-100"
                />
              </div>

              {/* Intro / Bio */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  संस्थाको परिचय (Organization Introduction):
                </label>
                <textarea
                  rows={4}
                  value={formData.intro}
                  onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-[#1A1A1A] dark:text-stone-100 leading-relaxed"
                />
              </div>

              {/* Vision Text */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  हाम्रो दृष्टिकोण (Vision Statement):
                </label>
                <textarea
                  rows={2}
                  value={formData.visionText || ''}
                  onChange={(e) => setFormData({ ...formData, visionText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-[#1A1A1A] dark:text-stone-100 leading-relaxed"
                />
              </div>

              {/* Report Header & Footer Notes */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  प्रतिवेदनको शीर्ष सूचना (Report Header Note):
                </label>
                <input
                  type="text"
                  value={formData.headerNote || ''}
                  onChange={(e) => setFormData({ ...formData, headerNote: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-[#1A1A1A] dark:text-stone-100"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  प्रतिवेदनको फुटर सूचना (Report Footer Note):
                </label>
                <input
                  type="text"
                  value={formData.footerNote || ''}
                  onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-[#1A1A1A] dark:text-stone-100"
                />
              </div>
            </div>

            {/* Display Toggles */}
            <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                छपाइ तथा प्रतिवेदन विकल्पहरू:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer bg-stone-50 dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.showLogoOnBills}
                    onChange={(e) => setFormData({ ...formData, showLogoOnBills: e.target.checked })}
                    className="rounded text-[#D97706] focus:ring-[#D97706] w-4 h-4 accent-[#D97706]"
                  />
                  <span>बिल तथा रसिदमा लोगो देखाउनुहोस्</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer bg-stone-50 dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                  <input
                    type="checkbox"
                    checked={formData.showPhotoOnReports}
                    onChange={(e) => setFormData({ ...formData, showPhotoOnReports: e.target.checked })}
                    className="rounded text-[#D97706] focus:ring-[#D97706] w-4 h-4 accent-[#D97706]"
                  />
                  <span>प्रतिवेदनहरूमा फोटो देखाउनुहोस्</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-[#D97706] dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                पूर्वनिर्धारितमा फर्काउनुहोस्
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('public')}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-colors"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  सुरक्षित गर्नुहोस्
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Image Crop Modal for Logo / Main Photo */}
        {activeCropTarget && (
          <ImageCropModal
            isOpen={true}
            onClose={() => setActiveCropTarget(null)}
            titleNepali={activeCropTarget === 'logo' ? 'संस्थाको लोगो व्यवस्थापन' : 'मुख्य फोटो व्यवस्थापन'}
            currentPhotoUrl={activeCropTarget === 'logo' ? formData.logoUrl : formData.mainPhotoUrl}
            onSavePhoto={(photoUrl) => {
              if (activeCropTarget === 'logo') {
                setFormData({ ...formData, logoUrl: photoUrl });
              } else {
                setFormData({ ...formData, mainPhotoUrl: photoUrl });
              }
            }}
            onDeletePhoto={() => {
              if (activeCropTarget === 'logo') {
                setFormData({ ...formData, logoUrl: '' });
              } else {
                setFormData({ ...formData, mainPhotoUrl: '' });
              }
            }}
          />
        )}

        {/* Service Login Required Popup Modal */}
        <ServiceLoginRequiredModal
          isOpen={isAuthRequiredModalOpen}
          onClose={() => setIsAuthRequiredModalOpen(false)}
          service={selectedServiceForAuth}
          onOpenLogin={() => {
            setIsAuthRequiredModalOpen(false);
            onClose();
            if (onOpenAuthModal) onOpenAuthModal();
          }}
          onOpenSignUp={() => {
            setIsAuthRequiredModalOpen(false);
            onClose();
            if (onOpenAuthModal) onOpenAuthModal();
          }}
          onOpenTrial={() => {
            setIsAuthRequiredModalOpen(false);
            onClose();
            if (onOpenTrialModal) onOpenTrialModal();
          }}
          onContinueAsGuest={() => {
            setIsAuthRequiredModalOpen(false);
            if (selectedServiceForAuth && onNavigate) {
              onNavigate(selectedServiceForAuth.tabKey as NavTab);
            }
          }}
        />
      </div>
    </div>
  );
};

export default OrgProfileModal;
