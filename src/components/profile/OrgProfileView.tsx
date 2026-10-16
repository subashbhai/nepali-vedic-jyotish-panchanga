import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Award,
  Sparkles,
  ShieldCheck,
  Check,
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
  ExternalLink,
  Lock,
  Camera,
  Sun,
  Shield,
  Heart,
  Scale
} from 'lucide-react';
import { OrganizationProfile } from '../../types/astrology';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';
import { NavTab } from '../Navigation';
import { DEFAULT_ORG_PROFILE } from '../../db/profileStore';
import { ServiceLoginRequiredModal, ServiceItemInfo } from '../common/ServiceLoginRequiredModal';
import { LogoUploadModal } from '../common/LogoUploadModal';

interface OrgProfileViewProps {
  orgProfile: OrganizationProfile;
  onSaveOrgProfile: (updated: OrganizationProfile) => void;
  isSuperAdmin?: boolean;
  isLoggedIn?: boolean;
  onNavigateTab?: (tab: NavTab) => void;
  onOpenAuthModal?: () => void;
  onOpenTrialModal?: () => void;
}

export const OrgProfileView: React.FC<OrgProfileViewProps> = ({
  orgProfile,
  onSaveOrgProfile,
  isSuperAdmin = false,
  isLoggedIn = false,
  onNavigateTab,
  onOpenAuthModal,
  onOpenTrialModal
}) => {
  const [viewMode, setViewMode] = useState<'public' | 'edit'>('public');
  const [formData, setFormData] = useState<OrganizationProfile>(orgProfile);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [selectedServiceForAuth, setSelectedServiceForAuth] = useState<ServiceItemInfo | null>(null);
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin && viewMode === 'edit') {
      setViewMode('public');
    }
  }, [isSuperAdmin, viewMode]);

  useEffect(() => {
    setFormData({
      ...DEFAULT_ORG_PROFILE,
      ...orgProfile,
      intro: orgProfile?.intro || DEFAULT_ORG_PROFILE.intro,
      missionText: orgProfile?.missionText || DEFAULT_ORG_PROFILE.missionText,
      visionText: orgProfile?.visionText || DEFAULT_ORG_PROFILE.visionText,
      sankalpaText: orgProfile?.sankalpaText || DEFAULT_ORG_PROFILE.sankalpaText,
      mottoText: orgProfile?.mottoText || DEFAULT_ORG_PROFILE.mottoText,
      shlokaText: orgProfile?.shlokaText || DEFAULT_ORG_PROFILE.shlokaText,
      shlokaSource: orgProfile?.shlokaSource || DEFAULT_ORG_PROFILE.shlokaSource,
      shlokaMeaning: orgProfile?.shlokaMeaning || DEFAULT_ORG_PROFILE.shlokaMeaning,
    });
  }, [orgProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOrgProfile(formData);
    setSuccessMsg('संस्थाको प्रोफाइल विवरण सफलतापूर्वक सुरक्षित गरियो।');
    setTimeout(() => {
      setSuccessMsg('');
      setViewMode('public');
    }, 1500);
  };

  const handleResetDefaults = () => {
    if (confirm('के तपाईं पूर्वनिर्धारित आधिकारिक संस्था प्रोफाइलमा फर्किन चाहनुहुन्छ?')) {
      setFormData(DEFAULT_ORG_PROFILE);
      onSaveOrgProfile(DEFAULT_ORG_PROFILE);
      setSuccessMsg('पूर्वनिर्धारित प्रोफाइल पुनर्स्थापित गरियो।');
      setTimeout(() => setSuccessMsg(''), 1500);
    }
  };

  // 6 Core Major Vedic Services with spiritual, balanced, non-superstitious descriptions
  const majorServices = [
    {
      id: 'jyotish',
      title: '🔱 ज्योतिष सेवा',
      subtitle: 'जन्मकुण्डली, ग्रहस्थिति, दशा–अन्तर्दशा तथा गोचरको शास्त्रीय अध्ययनका आधारमा जीवनका सम्भावना, चुनौती र कर्तव्यबारे विवेकपूर्ण परामर्श प्रदान गर्ने।',
      icon: Compass,
      tabKey: 'kundali' as NavTab,
      badge: 'शास्त्रीय फलादेश',
      tone: 'border-amber-300/60 dark:border-amber-700/50 bg-amber-500/5'
    },
    {
      id: 'patrika',
      title: '📜 जन्मपत्रिका तथा कुण्डली निर्माण',
      subtitle: 'जन्मसमय र स्थानका आधारमा जन्मपत्रिका, कुण्डली, नामकरणका लागि शुभाक्षर तथा वर्षफलसम्बन्धी शास्त्रीय विवरण व्यवस्थित रूपमा तयार गर्ने।',
      icon: Scroll,
      tabKey: 'patrika' as NavTab,
      badge: 'डिजिटल पत्रिका',
      tone: 'border-orange-300/60 dark:border-orange-700/50 bg-orange-500/5'
    },
    {
      id: 'vivah',
      title: '💑 विवाह मिलान',
      subtitle: 'अष्टकूट गुण मिलान, मङ्गल विचार तथा सम्बन्धित ज्योतिषीय पक्षहरूको अध्ययन गरी वैवाहिक निर्णयमा सहयोग पुग्ने सन्तुलित परामर्श प्रदान गर्ने। कुनै एक दोषका आधारमा निरपेक्ष भय सिर्जना नगर्ने।',
      icon: HeartHandshake,
      tabKey: 'vivah' as NavTab,
      badge: 'सन्तुलित परामर्श',
      tone: 'border-rose-300/60 dark:border-rose-700/50 bg-rose-500/5'
    },
    {
      id: 'vastu',
      title: '🏛️ वास्तुशास्त्र परामर्श',
      subtitle: 'परम्परागत वास्तुशास्त्रका सिद्धान्त, दिशागत विचार, भवनको उपयोग तथा उपलब्ध संरचनालाई ध्यानमा राखी आवासीय र व्यावसायिक स्थानसम्बन्धी सन्तुलित परामर्श प्रदान गर्ने।',
      icon: Home,
      tabKey: 'vastu' as NavTab,
      badge: 'दिशा सन्तुलन',
      tone: 'border-emerald-300/60 dark:border-emerald-700/50 bg-emerald-500/5'
    },
    {
      id: 'muhurta',
      title: '⏳ मुहूर्त तथा शुभ साइत',
      subtitle: 'विवाह, व्रतबन्ध, गृहप्रवेश, यात्रा, व्यापार शुभारम्भ तथा अन्य संस्कारका लागि पात्रो, तिथि, नक्षत्र र सम्बन्धित शास्त्रीय आधारमा मुहूर्तसम्बन्धी परामर्श प्रदान गर्ने।',
      icon: Timer,
      tabKey: 'muhurta' as NavTab,
      badge: 'कालशुद्धि विचार',
      tone: 'border-indigo-300/60 dark:border-indigo-700/50 bg-indigo-500/5'
    },
    {
      id: 'sanskar',
      title: '🔥 कर्मकाण्ड तथा वैदिक अनुष्ठान',
      subtitle: 'पूजा, सङ्कल्प, रुद्राभिषेक, महामृत्युञ्जय जप, नवग्रह पूजा, वास्तुशान्ति तथा अन्य वैदिक संस्कारलाई सम्बन्धित विधि, मन्त्र र परम्पराको मर्यादाअनुसार सम्पन्न गर्न सहयोग गर्ने।',
      icon: Flame,
      tabKey: 'sanskar' as NavTab,
      badge: 'मन्त्र–संस्कार',
      tone: 'border-red-300/60 dark:border-red-700/50 bg-red-500/5'
    },
  ];

  const handleServiceClick = (srv: typeof majorServices[0]) => {
    if (!isLoggedIn) {
      setSelectedServiceForAuth(srv);
      setIsAuthRequiredModalOpen(true);
    } else {
      if (onNavigateTab) {
        onNavigateTab(srv.tabKey);
      }
    }
  };

  const coreValuesList = formData.coreValues || DEFAULT_ORG_PROFILE.coreValues || [];

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] dark:bg-[#13110E] text-[#2C241E] dark:text-stone-100 pb-20">
      {/* 1. Mangal Shloka Divine Top Strip */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-50 text-[11px] sm:text-xs py-1.5 px-4 text-center font-serif tracking-wide border-b border-amber-800 shadow-xs flex items-center justify-center gap-2">
        <Sun className="w-3.5 h-3.5 text-amber-200 shrink-0" />
        <span className="font-semibold">
          {formData.mangalShloka || '॥ श्रीगणेशाय नमः ॥ ॥ श्रीवास्तुपुरुषाय नमः ॥ ॥ श्रीकुलदेवतायै नमः ॥'}
        </span>
        <Sun className="w-3.5 h-3.5 text-amber-200 shrink-0" />
      </div>

      {/* 2. Hero Banner / Institution Identity */}
      <div className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-[#E8E1D5] dark:border-stone-800/80 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-3 font-medium">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('dashboard')}
              className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              गृहपृष्ठ
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-800 dark:text-amber-400 font-bold">आधिकारिक संस्था परिचय</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Institution Logo */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center shadow-md border-2 border-amber-400/80 shrink-0 overflow-hidden p-1 ring-4 ring-amber-400/15">
                  <img 
                    src={getAssetUrl(formData.logoUrl || '/logo.png')} 
                    alt="Logo" 
                    className="w-full h-full object-contain rounded-xl" 
                    onError={(e) => {
                      handleImageFallback(e);
                    }}
                  />
                </div>
                {/* Camera upload button */}
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-stone-900 cursor-pointer hover:scale-110 transition-transform"
                  title="संस्थाको लोगो फेर्नुहोस् / अपलोड गर्नुहोस्"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              {/* Title & Tagline */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-serif text-[#1C1814] dark:text-amber-100 tracking-tight">
                    {formData.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> आधिकारिक वैदिक सेवा
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium mt-1 leading-snug">
                  {formData.tagline || 'सनातन वैदिक ज्ञान, शास्त्रीय मर्यादा एवं प्रामाणिक सेवाको पावन संगम'}
                </p>
              </div>
            </div>

            {/* Admin View Switcher */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2 self-start md:self-auto bg-stone-200/80 dark:bg-stone-800/80 p-1.5 rounded-xl border border-stone-300/70 dark:border-stone-700 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('public')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'public'
                      ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-300 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>सार्वजनिक परिचय</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'edit'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>सम्पादन (Super Admin)</span>
                </button>
              </div>
            )}
          </div>

          {/* Official Motto Banner */}
          <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border border-amber-400/40 text-stone-800 dark:text-amber-100 flex items-center justify-center text-center">
            <span className="text-xs sm:text-sm font-serif font-bold tracking-wide text-amber-900 dark:text-amber-200">
              “{formData.mottoText || 'ज्ञानमा शास्त्रीय आधार, आचरणमा सत्यनिष्ठा, सेवामा श्रद्धा र प्रविधिमा आधुनिकता'}”
            </span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {successMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {viewMode === 'public' ? (
          <div className="space-y-8">
            {/* 3. संस्था परिचय एवं पृष्ठभूमि र सम्पर्क कार्ड */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* संस्था परिचय अनुच्छेद */}
              <div className="lg:col-span-2 bg-white dark:bg-[#1A1714] p-6 sm:p-7 rounded-2xl border border-[#E8E1D5] dark:border-stone-800 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span>संस्था परिचय एवं पृष्ठभूमि</span>
                  </h2>
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full">
                    वैदिक सेवा प्रतिष्ठान
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed space-y-3.5 whitespace-pre-line text-justify font-sans">
                  {formData.intro || DEFAULT_ORG_PROFILE.intro}
                </div>

                {/* Official Registration & PAN Details */}
                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center gap-4 text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800/60 px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>दर्ता स्थिति: <b className="text-stone-900 dark:text-stone-200">{formData.registeredNo || 'दर्ता नं. '}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800/60 px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>स्थायी लेखा नम्बर: <b className="text-stone-900 dark:text-stone-200">{formData.panNo || 'PAN: '}</b></span>
                  </div>
                </div>
              </div>

              {/* आधिकारिक सम्पर्क तथा कार्यालय कार्ड */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-amber-300/60 dark:border-amber-700/30 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-300/40 dark:border-amber-700/30">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                      आधिकारिक सम्पर्क विवरण
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400">कार्यालय ठेगाना</span>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">{formData.address || 'काठमाडौँ, नेपाल'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400">सम्पर्क नम्बर</span>
                        <a 
                          href={`tel:${formData.phone || '+९७७-९७६४४००५३३'}`}
                          className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          {formData.phone || '+९७७-९७६४४००५३३'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400">आधिकारिक इमेल</span>
                        <a 
                          href={`mailto:${formData.email || 'suwashdmk@gmail.com'}`}
                          className="font-medium text-stone-800 dark:text-stone-200 hover:text-amber-600 break-all"
                        >
                          {formData.email || 'suwashdmk@gmail.com'}
                        </a>
                      </div>
                    </div>

                    {formData.website && (
                      <div className="flex items-start gap-2.5">
                        <Globe className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400">वेबसाइट</span>
                          <span className="font-medium text-stone-800 dark:text-stone-200">
                            {formData.website}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-amber-300/40 dark:border-amber-700/30 text-[11.5px] text-stone-600 dark:text-stone-400 leading-relaxed font-serif text-center italic">
                  “सेवाग्राहीप्रति पूर्ण श्रद्धा, गोपनीयता तथा धर्मसम्मत परामर्श।”
                </div>
              </div>
            </div>

            {/* 4. आध्यात्मिक ध्येय, दृष्टि र सङ्कल्प (The 3 Sacred Pillars) */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-5">
                <h2 className="text-base sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center justify-center gap-2">
                  <Sun className="w-5 h-5 text-amber-600" />
                  <span>आध्यात्मिक ध्येय, दृष्टि र सङ्कल्प</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  सनातन वैदिक मर्यादा, प्रामाणिक अध्ययन र लोकमङ्गलका पवित्र आधारहरू
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* कार्ड १: हाम्रो ध्येय */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1714] border border-amber-200/80 dark:border-amber-900/40 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold font-serif text-stone-900 dark:text-amber-200">
                        हाम्रो ध्येय
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
                      {formData.missionText || DEFAULT_ORG_PROFILE.missionText}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    शास्त्रसम्मत सेवा व्यवस्थापन
                  </div>
                </div>

                {/* कार्ड २: हाम्रो दृष्टि */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1714] border border-amber-200/80 dark:border-amber-900/40 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-700 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold font-serif text-stone-900 dark:text-amber-200">
                        हाम्रो दृष्टि
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
                      {formData.visionText || DEFAULT_ORG_PROFILE.visionText}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-orange-700 dark:text-orange-400">
                    पारदर्शिता, प्रामाणिकता र विश्वसनीयता
                  </div>
                </div>

                {/* कार्ड ३: हाम्रो आध्यात्मिक सङ्कल्प */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1714] border border-rose-200/80 dark:border-rose-900/40 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold font-serif text-stone-900 dark:text-rose-200">
                        हाम्रो आध्यात्मिक सङ्कल्प
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
                      {formData.sankalpaText || DEFAULT_ORG_PROFILE.sankalpaText}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                    लोकमङ्गल एवं निष्कपट सेवाभाव
                  </div>
                </div>
              </div>
            </div>

            {/* 5. हाम्रा प्रमुख वैदिक सेवाहरू */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <span>हाम्रा प्रमुख वैदिक सेवाहरू</span>
                </h2>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  शास्त्रीय मर्यादा र प्रविधिको समन्वय
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {majorServices.map((srv) => {
                  const Icon = srv.icon;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleServiceClick(srv)}
                      className="p-5 rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E8E1D5] dark:border-stone-800 hover:border-amber-400/80 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                    >
                      {!isLoggedIn && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 text-[9.5px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          <span>सेवा पहुँच</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <Icon className="w-5 h-5" />
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                            {srv.badge}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold font-serif text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                          {srv.title}
                        </h3>
                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed text-justify">
                          {srv.subtitle}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                        <span>सेवा विवरण हेर्नुहोस्</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. आध्यात्मिक सुभाषित तथा प्रामाणिक संस्कृत श्लोक */}
            <div className="bg-gradient-to-r from-amber-900/90 via-amber-800/95 to-amber-900/90 text-amber-50 p-6 sm:p-8 rounded-2xl shadow-md border border-amber-700/60 relative overflow-hidden">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-amber-700/60 px-3 py-1 rounded-full text-[11px] font-bold text-amber-200 border border-amber-500/40">
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>आध्यात्मिक सुभाषित एवं वैदिक शान्तिमन्त्र</span>
                </div>

                <div className="font-serif text-base sm:text-xl font-bold tracking-wide text-amber-100 leading-relaxed whitespace-pre-line py-1">
                  {formData.shlokaText || DEFAULT_ORG_PROFILE.shlokaText}
                </div>

                <div className="text-xs text-amber-300/90 font-medium">
                  — {formData.shlokaSource || 'कृष्ण यजुर्वेदीय तैत्तिरीयोपनिषद् (ब्रह्मानन्दवल्ली)'}
                </div>

                <div className="mt-3 pt-3 border-t border-amber-700/60 text-xs sm:text-[13px] text-amber-100/90 leading-relaxed italic max-w-2xl mx-auto">
                  <span className="font-bold text-amber-300 not-italic">नेपाली भावार्थ: </span>
                  {formData.shlokaMeaning || DEFAULT_ORG_PROFILE.shlokaMeaning}
                </div>

                {/* Loakmangal Vedic Prayer */}
                <div className="pt-2 text-[12px] font-serif text-amber-200/80 border-t border-amber-700/30">
                  ॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥
                </div>
              </div>
            </div>

            {/* 7. हाम्रा मुख्य मान्यता तथा मूल्यहरू (Core Values) */}
            <div className="bg-white dark:bg-[#1A1714] p-6 sm:p-7 rounded-2xl border border-[#E8E1D5] dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-stone-100 dark:border-stone-800">
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>हाम्रा मुख्य मान्यता तथा मूल्यहरू (Core Values)</span>
                </h2>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  सदाचार एवं शास्त्रीय अनुशासन
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {coreValuesList.map((val, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#221E19] border border-amber-200/60 dark:border-stone-700/60 flex flex-col justify-between hover:border-amber-400 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold font-serif text-amber-900 dark:text-amber-300 mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>{val.title}</span>
                      </h4>
                      <p className="text-[11.5px] text-stone-600 dark:text-stone-300 leading-relaxed text-justify">
                        {val.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. आधिकारिक भुक्तानी तथा बैंक विवरण (यदि उपलब्ध भएमा) */}
            {((formData as any).bankDetails || (formData as any).qrCodeUrl) && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 rounded-2xl border border-emerald-500/30 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-600" />
                  <span>आधिकारिक भुक्तानी तथा बैंक विवरण</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData as any).bankDetails && (
                    <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1 bg-white/60 dark:bg-stone-900/60 p-4 rounded-xl border border-emerald-500/20">
                      <p><b>बैंकको नाम:</b> {(formData as any).bankDetails.bankName}</p>
                      <p><b>खातावालाको नाम:</b> {(formData as any).bankDetails.accountName}</p>
                      <p><b>खाता नम्बर:</b> {(formData as any).bankDetails.accountNumber}</p>
                      <p><b>शाखा:</b> {(formData as any).bankDetails.branch}</p>
                    </div>
                  )}
                  {(formData as any).qrCodeUrl && (
                    <div className="flex items-center gap-4 bg-white/60 dark:bg-stone-900/60 p-4 rounded-xl border border-emerald-500/20">
                      <img 
                        src={(formData as any).qrCodeUrl} 
                        alt="Payment QR" 
                        className="w-24 h-24 object-contain rounded-xl border border-stone-300 p-1 bg-white" 
                      />
                      <span className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        आधिकारिक Fonepay / QR कोड मार्फत सिधै सुरक्षित रूपमा सेवा शुल्क भुक्तानी गर्न सकिन्छ।
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Super Admin Edit Mode */
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1A1714] p-6 sm:p-8 rounded-2xl border border-[#E8E1D5] dark:border-stone-800 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                  संस्था परिचय सम्पादन (Super Admin)
                </h2>
                <p className="text-xs text-stone-500">यहाँ गरिएको परिवर्तन सम्पूर्ण सार्वजनिक पृष्ठहरूमा तत्काल लागू हुनेछ</p>
              </div>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 transition-colors"
              >
                पूर्वनिर्धारितमा फर्काउनुहोस्
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  संस्थाको पूरा नाम *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ट्यागलाइन (संस्थाको आदर्श वाक्य)
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  आधिकारिक मूलमन्त्र (Motto)
                </label>
                <input
                  type="text"
                  value={formData.mottoText || ''}
                  onChange={(e) => setFormData({ ...formData, mottoText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                  placeholder="ज्ञानमा शास्त्रीय आधार, आचरणमा सत्यनिष्ठा, सेवामा श्रद्धा र प्रविधिमा आधुनिकता"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  मङ्गल श्लोक (Top Strip)
                </label>
                <input
                  type="text"
                  value={formData.mangalShloka || ''}
                  onChange={(e) => setFormData({ ...formData, mangalShloka: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  सम्पर्क फोन *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  इमेल ठेगाना *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  कार्यालय ठेगाना
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  आधिकारिक वेबसाइट
                </label>
                <input
                  type="text"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  दर्ता नम्बर (Registration No)
                </label>
                <input
                  type="text"
                  value={formData.registeredNo || ''}
                  onChange={(e) => setFormData({ ...formData, registeredNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                  placeholder="दर्ता नं. "
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  PAN नम्बर
                </label>
                <input
                  type="text"
                  value={formData.panNo || ''}
                  onChange={(e) => setFormData({ ...formData, panNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                  placeholder="PAN: "
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  संस्था परिचय एवं पृष्ठभूमि (Intro)
                </label>
                <textarea
                  rows={5}
                  value={formData.intro || ''}
                  onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Mission, Vision, Sankalpa */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  हाम्रो ध्येय (Mission)
                </label>
                <textarea
                  rows={2}
                  value={formData.missionText || ''}
                  onChange={(e) => setFormData({ ...formData, missionText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  हाम्रो दृष्टि (Vision)
                </label>
                <textarea
                  rows={2}
                  value={formData.visionText || ''}
                  onChange={(e) => setFormData({ ...formData, visionText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  हाम्रो आध्यात्मिक सङ्कल्प (Sankalpa)
                </label>
                <textarea
                  rows={2}
                  value={formData.sankalpaText || ''}
                  onChange={(e) => setFormData({ ...formData, sankalpaText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Shloka and Meaning */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  संस्कृत श्लोक (Shloka)
                </label>
                <textarea
                  rows={3}
                  value={formData.shlokaText || ''}
                  onChange={(e) => setFormData({ ...formData, shlokaText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  श्लोक स्रोत एवं भावार्थ
                </label>
                <input
                  type="text"
                  value={formData.shlokaSource || ''}
                  onChange={(e) => setFormData({ ...formData, shlokaSource: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs mb-2"
                  placeholder="ग्रन्थ स्रोत..."
                />
                <textarea
                  rows={2}
                  value={formData.shlokaMeaning || ''}
                  onChange={(e) => setFormData({ ...formData, shlokaMeaning: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs focus:ring-2 focus:ring-amber-500"
                  placeholder="नेपाली भावार्थ..."
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setViewMode('public')}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Service Login Required Popup Modal */}
      <ServiceLoginRequiredModal
        isOpen={isAuthRequiredModalOpen}
        onClose={() => setIsAuthRequiredModalOpen(false)}
        service={selectedServiceForAuth}
        onOpenLogin={() => {
          setIsAuthRequiredModalOpen(false);
          if (onOpenAuthModal) onOpenAuthModal();
        }}
        onOpenSignUp={() => {
          setIsAuthRequiredModalOpen(false);
          if (onOpenAuthModal) onOpenAuthModal();
        }}
        onOpenTrial={() => {
          setIsAuthRequiredModalOpen(false);
          if (onOpenTrialModal) onOpenTrialModal();
        }}
        onContinueAsGuest={() => {
          setIsAuthRequiredModalOpen(false);
          if (selectedServiceForAuth && onNavigateTab) {
            onNavigateTab(selectedServiceForAuth.tabKey as NavTab);
          }
        }}
      />

      {/* Custom Logo Upload Modal */}
      <LogoUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onLogoUpdated={(newLogoUrl) => {
          setFormData((prev) => ({ ...prev, logoUrl: newLogoUrl || '/logo.png' }));
          onSaveOrgProfile({ ...formData, logoUrl: newLogoUrl || '/logo.png' });
        }}
      />
    </div>
  );
};
