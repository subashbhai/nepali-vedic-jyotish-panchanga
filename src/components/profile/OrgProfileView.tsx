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
  Lock
} from 'lucide-react';
import { OrganizationProfile } from '../../types/astrology';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';
import { NavTab } from '../Navigation';
import { DEFAULT_ORG_PROFILE } from '../../db/profileStore';
import { ServiceLoginRequiredModal, ServiceItemInfo } from '../common/ServiceLoginRequiredModal';

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

  useEffect(() => {
    if (!isSuperAdmin && viewMode === 'edit') {
      setViewMode('public');
    }
  }, [isSuperAdmin, viewMode]);

  useEffect(() => {
    setFormData({
      ...DEFAULT_ORG_PROFILE,
      ...orgProfile,
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

  // Core Service Mapping
  const majorServices = [
    {
      id: 'jyotish',
      title: '🔱 ज्योतिष सेवा',
      subtitle: 'कुण्डली विश्लेषण, फलादेश, ग्रहदशा, एवं परामर्श सेवा',
      icon: Compass,
      tabKey: 'kundali' as NavTab,
      badge: 'कुण्डली / फलादेश',
    },
    {
      id: 'patrika',
      title: '📜 जन्मपत्रिका निर्माण',
      subtitle: 'बृहत् जन्मपत्रिका, सानो जन्मकुण्डली, नामाकरण तथा वर्षफल',
      icon: Scroll,
      tabKey: 'patrika' as NavTab,
      badge: 'डिजिटल पत्रिका',
    },
    {
      id: 'vivah',
      title: '💑 विवाह मिलान',
      subtitle: 'अष्टकूट गुण मिलान, मङ्गल दोष विचार, नाडी दोष निवारण',
      icon: HeartHandshake,
      tabKey: 'vivah' as NavTab,
      badge: 'गुण मिलान ३६',
    },
    {
      id: 'vastu',
      title: '🏛️ वास्तु शास्त्र परामर्श',
      subtitle: 'आवासीय तथा व्यावसायिक भवन वास्तु नक्सा, दिशा सन्तुलन',
      icon: Home,
      tabKey: 'vastu' as NavTab,
      badge: '३६०° कम्पास',
    },
    {
      id: 'muhurta',
      title: '⏳ मुहूर्त तथा साइत',
      subtitle: 'विवाह, व्रतबन्ध, गृहप्रवेश, यात्रा, व्यापार शुभारम्भ साइत',
      icon: Timer,
      tabKey: 'muhurta' as NavTab,
      badge: 'शुभ साइत',
    },
    {
      id: 'sanskar',
      title: '🔥 कर्मकाण्ड तथा पूजा',
      subtitle: 'रुद्राभिषेक, महामृत्युञ्जय, वास्तु शान्ति, नवग्रह पूजा',
      icon: Flame,
      tabKey: 'sanskar' as NavTab,
      badge: 'वैदिक अनुष्ठान',
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

  const coreValuesList = formData.coreValues || DEFAULT_ORG_PROFILE.coreValues || [
    { title: 'ज्ञान', desc: 'सनातन वैदिक शास्त्र, ज्योतिष र कर्मकाण्डको सही तथा प्रमाणिक ज्ञानप्रतिको प्रतिबद्धता।' },
    { title: 'परम्परा', desc: 'प्राचीन गुरु-परम्परा र वैदिक रीतिरिवाजको मर्यादा संरक्षण।' },
    { title: 'विश्वसनीयता', desc: 'सेवाग्राहीप्रतिको पूर्ण उत्तरदायित्व, यथार्थपरक परामर्श र गोपनीयता।' },
    { title: 'पारदर्शिता', desc: 'दक्षता, शुल्क तथा सेवा प्रक्रियामा पूर्ण स्पष्टता र पारदर्शिता।' },
    { title: 'सेवा', desc: 'व्यावसायिकताभन्दा माथि उठेर धर्म, संस्कृति र समाज कल्याणको सेवाभाव।' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] dark:bg-[#141210] text-[#2D241E] dark:text-stone-100 pb-16">
      {/* Page Header / Hero Banner */}
      <div className="bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent border-b border-[#E6E0D5] dark:border-stone-800 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-2 font-medium">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('dashboard')}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              गृहपृष्ठ
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-700 dark:text-amber-400 font-bold">आधिकारिक संस्था प्रोफाइल</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400/60 shrink-0 overflow-hidden p-0.5 ring-2 ring-amber-400/20">
                <img 
                  src={getAssetUrl(formData.logoUrl || '/logo.png')} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-full" 
                  onError={(e) => {
                    handleImageFallback(e, [
                      getAssetUrl('/logo.png'),
                      getAssetUrl('/assets/logo.png'),
                      getAssetUrl('/balananda-logo.png'),
                    ]);
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-[#1A1A1A] dark:text-amber-100">
                    {formData.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-amber-500/15 text-[#D97706] dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> आधिकारिक
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#78716C] dark:text-stone-400 mt-0.5">
                  {formData.tagline || 'नेपालकै सबैभन्दा भरपर्दो वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'}
                </p>
              </div>
            </div>

            {/* If Super Admin, show Switcher */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2 self-start md:self-auto bg-stone-200/80 dark:bg-stone-800/80 p-1 rounded-xl border border-stone-300/60 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setViewMode('public')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'public'
                      ? 'bg-white dark:bg-[#2D2319] text-[#D97706] dark:text-amber-300 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>सार्वजनिक प्रोफाइल</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'edit'
                      ? 'bg-[#D97706] text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>सम्पादन (Super Admin)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {viewMode === 'public' ? (
          /* Public Profile View */
          <div className="space-y-8">
            {/* 1. Overview & Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white dark:bg-[#1E1B18] p-6 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D97706]" />
                  <span>संस्था परिचय एवं पृष्ठभूमी</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {formData.intro ||
                    'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा नेपालको ऐतिहासिक सनातन वैदिक परम्परा, प्रमाणिक कुण्डली विज्ञान, वास्तु शास्त्र तथा वैदिक अनुष्ठानहरूको आधिकारिक प्रतिष्ठान हो।'}
                </p>

                {(formData.registeredNo || formData.panNo) && (
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-4 text-xs text-stone-500">
                    {formData.registeredNo && <span>दर्ता नं: <b className="text-stone-800 dark:text-stone-200">{formData.registeredNo}</b></span>}
                    {formData.panNo && <span>पान नं: <b className="text-stone-800 dark:text-stone-200">{formData.panNo}</b></span>}
                  </div>
                )}
              </div>

              {/* Contact Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-amber-300/50 dark:border-amber-500/20 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#D97706]" />
                  <span>सम्पर्क तथा कार्यालय विवरण</span>
                </h3>

                <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span>{formData.address || 'काठमाडौँ, नेपाल'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>{formData.phone || '+९७७-९८००००००००'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>{formData.email || 'info@balanandajyotish.com'}</span>
                  </div>
                  {formData.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#D97706] shrink-0" />
                      <span>{formData.website}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Core Services Offered */}
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D97706]" />
                <span>हाम्रा प्रमुख वैदिक सेवाहरू</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {majorServices.map((srv) => {
                  const Icon = srv.icon;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleServiceClick(srv)}
                      className="p-5 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E6E0D5] dark:border-stone-800 hover:border-amber-400/60 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                    >
                      {!isLoggedIn && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9.5px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          <span>लगइन</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2.5 rounded-xl bg-amber-500/15 text-[#D97706] group-hover:bg-[#D97706] group-hover:text-white transition-colors">
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {srv.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#D97706] transition-colors">
                        {srv.title}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                        {srv.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Core Values */}
            <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#D97706]" />
                <span>हाम्रा मुख्य मान्यता तथा मूल्यहरू (Core Values)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {coreValuesList.map((val, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#25201A] border border-amber-200/50 dark:border-stone-700">
                    <h4 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-300 mb-1">{val.title}</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-normal">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Payment / QR & Bank Details */}
            {((formData as any).bankDetails || (formData as any).qrCodeUrl) && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 rounded-2xl border border-emerald-500/30 shadow-xs">
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-600" />
                  <span>आधिकारिक भुक्तानी तथा बैंक विवरण (Payment Info)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData as any).bankDetails && (
                    <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1">
                      <p><b>बैंकको नाम:</b> {(formData as any).bankDetails.bankName}</p>
                      <p><b>खातावालाको नाम:</b> {(formData as any).bankDetails.accountName}</p>
                      <p><b>खाता नम्बर:</b> {(formData as any).bankDetails.accountNumber}</p>
                      <p><b>शाखा:</b> {(formData as any).bankDetails.branch}</p>
                    </div>
                  )}
                  {(formData as any).qrCodeUrl && (
                    <div className="flex items-center gap-3">
                      <img src={(formData as any).qrCodeUrl} alt="Payment QR" className="w-24 h-24 object-contain rounded-xl border border-stone-300 p-1 bg-white" />
                      <span className="text-xs text-stone-500">आधिकारिक Fonepay / QR कोड मार्फत सिधै सेवा शुल्क भुक्तानी गर्न सकिन्छ।</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Super Admin Edit Mode */
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1E1B18] p-6 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                  संस्थाको विवरण सम्पादन (Super Admin Only)
                </h2>
                <p className="text-xs text-stone-500">यहाँ गरिएको परिवर्तन सम्पूर्ण सार्वजनिक पृष्ठहरूमा देखिनेछ</p>
              </div>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-red-200 transition-colors"
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
                  ट्यागलाइन (नारा)
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

              <div className="sm:col-span-2">
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  संस्था परिचय (Intro)
                </label>
                <textarea
                  rows={4}
                  value={formData.intro || ''}
                  onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setViewMode('public')}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold shadow-md cursor-pointer"
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
    </div>
  );
};
