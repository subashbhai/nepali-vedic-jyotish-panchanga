import React, { useState, memo } from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  FileText, 
  HeartHandshake, 
  Timer, 
  Bot, 
  Briefcase,
  Plus, 
  Search, 
  UserCheck, 
  Trash2, 
  Edit3, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Compass,
  Building2,
  Phone,
  Mail,
  Camera,
  User,
  ShieldCheck,
  Award,
  Share2,
  FileDown,
  Loader2,
  CheckCircle2,
  Clock,
  Newspaper,
  ChevronRight,
  Megaphone,
  MessageCircle,
  Copy,
  Check,
  Scroll,
  MapPin,
  Printer,
  Download,
  Globe,
  ExternalLink,
  Crown
} from 'lucide-react';
import { getStoredArticles, SamacharArticle } from '../db/samacharStore';
import { 
  BirthDetails, 
  PanchangaData, 
  LagnaInfo, 
  PlanetPosition, 
  VimshottariDashaResult,
  OrganizationProfile,
  AstrologerProfile,
  PurohitProfile,
  VastuExpertProfile
} from '../types/astrology';
import { getAssetUrl, handleImageFallback } from '../utils/assetHelper';
import { NavTab } from './Navigation';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { VedicInsightWidget } from './dashboard/VedicInsightWidget';
import { DailyVastuWidget } from './dashboard/DailyVastuWidget';
import { DailyAffirmationWidget } from './dashboard/DailyAffirmationWidget';
import { TransitPushAlertWidget } from './dashboard/TransitPushAlertWidget';
import { UpcomingTransitWidget } from './dashboard/UpcomingTransitWidget';
import { DailyMuhurtaSummaryWidget } from './dashboard/DailyMuhurtaSummaryWidget';
import { DashboardWidget } from './dashboard/DashboardWidget';
import { QuickDateConverter } from './QuickDateConverter';
import { SocialShareModal } from './SocialShareModal';
import { sanitizeCloneForCanvas } from '../utils/pdfGenerator';
import { ReportActionToolbar } from './common/ReportActionToolbar';
import { DailyWhatsAppDispatchManager } from './admin/DailyWhatsAppDispatchManager';
import { RBACSession } from '../db/rbacStore';
import { PersonalizedMemberAstrologyHub } from './dashboard/PersonalizedMemberAstrologyHub';
import { generateDailyVedicSankalpa } from '../utils/vedicSankalpaEngine';
import { MahaSankalpaModal } from './sankalpa/MahaSankalpaModal';
import { DailyPanchangaPrintModal } from './panchanga/DailyPanchangaPrintModal';
import { 
  isSoftwareFullAccessUnlocked, 
  is3DayTrialActive, 
  is7DayTrialActive 
} from '../db/subscriptionStore';
import { 
  isClientPurchaseApproved, 
  is24HourTrialActive,
  getApprovedClientLicense
} from '../db/clientLeadStore';

interface DashboardViewProps {
  todayPanchanga: PanchangaData;
  activeProfile: BirthDetails | null;
  profiles: BirthDetails[];
  orgProfile: OrganizationProfile;
  astrologers: AstrologerProfile[];
  purohits: PurohitProfile[];
  vastuExperts?: VastuExpertProfile[];
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  dasha: VimshottariDashaResult;
  onSelectProfile: (profile: BirthDetails) => void;
  onNewProfile: () => void;
  onDeleteProfile: (id: string) => void;
  onNavigate: (tab: NavTab) => void;
  onOpenOrgProfile: () => void;
  onOpenSettings?: (tab?: 'astro' | 'letterhead') => void;
  onEditCustomerPhoto?: (profile: BirthDetails) => void;
  transitPlanets?: PlanetPosition[];
  moon?: PlanetPosition;
  todayAD?: string;
  todayBS?: string;
  onOpenTransitNotifications?: () => void;
  rbacSession?: RBACSession | null;
  hasFullAccess?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = memo(({
  todayPanchanga,
  activeProfile,
  profiles,
  orgProfile,
  astrologers,
  purohits,
  vastuExperts = [],
  lagna,
  planets,
  dasha,
  onSelectProfile,
  onNewProfile,
  onDeleteProfile,
  onNavigate,
  onOpenOrgProfile,
  onOpenSettings,
  onEditCustomerPhoto,
  transitPlanets,
  moon: providedMoon,
  todayAD = new Date().toISOString().split('T')[0],
  todayBS = '',
  onOpenTransitNotifications = () => {},
  rbacSession,
  hasFullAccess = false,
}) => {
  const isSuperOrStoreAdmin =
    rbacSession?.role === 'SUPER_ADMIN' ||
    rbacSession?.role === 'STORE_ADMIN' ||
    rbacSession?.role === 'POS_STAFF';
  const isTrialActive = is24HourTrialActive() || is3DayTrialActive() || is7DayTrialActive();
  const isApprovedClient = isClientPurchaseApproved();
  const approvedLicense = getApprovedClientLicense();
  const isPurchasedOrUnlocked =
    isApprovedClient ||
    hasFullAccess ||
    isSoftwareFullAccessUnlocked() ||
    isSuperOrStoreAdmin ||
    isTrialActive;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetProfile, setShareTargetProfile] = useState<BirthDetails | null>(null);
  const [isMahaSankalpaModalOpen, setIsMahaSankalpaModalOpen] = useState(false);
  const [sankalpaCopied, setSankalpaCopied] = useState(false);
  const [isDailyPanchangaModalOpen, setIsDailyPanchangaModalOpen] = useState(false);

  // PDF Exporting State
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [isWhatsAppManagerOpen, setIsWhatsAppManagerOpen] = useState(false);

  const handleDownloadPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    setPdfStatus('generating');

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const dashboardEl = document.getElementById('dashboard-printable-area');
      if (!dashboardEl) {
        throw new Error('Dashboard printable area not found');
      }

      // Render the current dashboard view using html2canvas
      const canvas = await html2canvas(dashboardEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FDFCF8',
        windowWidth: 1280,
        onclone: (clonedDoc, clonedEl) => {
          // Convert modern CSS colors (oklch) for html2canvas compatibility
          sanitizeCloneForCanvas(clonedDoc, clonedEl);

          // Hide interactive and non-printable elements in the clone
          const noPrintEls = clonedEl.querySelectorAll('.no-print, [data-no-print="true"]');
          noPrintEls.forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
        },
      });

      // Construct A4 PDF document using jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const marginX = 8;
      const marginTop = 8;
      const marginBottom = 12;
      const printableWidth = pdfWidth - marginX * 2; // 194 mm
      const printableHeight = pdfHeight - marginTop - marginBottom; // 277 mm

      // Canvas height that corresponds to one printable A4 page
      const sliceCanvasHeight = Math.floor(canvas.width * (printableHeight / printableWidth));
      const totalPages = Math.max(1, Math.ceil(canvas.height / sliceCanvasHeight));

      for (let i = 0; i < totalPages; i++) {
        const sourceY = i * sliceCanvasHeight;
        const currentSliceHeight = Math.min(sliceCanvasHeight, canvas.height - sourceY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = currentSliceHeight;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FDFCF8';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            currentSliceHeight,
            0,
            0,
            canvas.width,
            currentSliceHeight
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage();
        }

        const renderedHeightMm = (currentSliceHeight * printableWidth) / canvas.width;
        pdf.addImage(pageImgData, 'JPEG', marginX, marginTop, printableWidth, renderedHeightMm, undefined, 'FAST');

        // Elegant official footer
        pdf.setFontSize(8);
        pdf.setTextColor(140, 130, 120);
        const footerText = `${orgProfile?.name || 'नेपाली ज्योतिष तथा वैदिक सेवा'} • ड्यासबोर्ड प्रतिवेदन • मिति: ${todayBS || todayAD} • पृष्ठ ${i + 1} / ${totalPages}`;
        pdf.text(footerText, pdfWidth / 2, pdfHeight - 5, { align: 'center' });
      }

      const cleanDate = (todayBS || todayAD || 'Report').replace(/[\s\/:]+/g, '_');
      pdf.save(`Dashboard_Report_${cleanDate}.pdf`);

      setPdfStatus('success');
      setTimeout(() => setPdfStatus('idle'), 4000);
    } catch (err) {
      console.error('Failed to export dashboard as PDF:', err);
      setPdfStatus('error');
      setTimeout(() => setPdfStatus('idle'), 5000);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const isMemberCustomer = rbacSession?.role === 'CUSTOMER';

  const accessibleProfiles = React.useMemo(() => {
    if (isMemberCustomer && activeProfile) {
      return [activeProfile];
    }
    return profiles;
  }, [isMemberCustomer, activeProfile, profiles]);

  const filteredProfiles = accessibleProfiles.filter((p) => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.dateBS && p.dateBS.includes(searchQuery)) ||
      (p.location?.name && p.location.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.phone && p.phone.includes(searchQuery));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const moon = planets.find((p) => p.name === 'चन्द्र')!;

  const currentTransitOrNatalPlanets = React.useMemo(() => {
    return transitPlanets && transitPlanets.length > 0 ? transitPlanets : planets;
  }, [transitPlanets, planets]);

  const dailySankalpa = React.useMemo(() => {
    return generateDailyVedicSankalpa(
      todayPanchanga,
      activeProfile,
      currentTransitOrNatalPlanets
    );
  }, [todayPanchanga, activeProfile, currentTransitOrNatalPlanets]);

  const handleCopyDailySankalpa = () => {
    if (!dailySankalpa) return;
    const fullTextToCopy = `॥ दैनिक वैदिक सङ्कल्प ॥\n${dailySankalpa.sanskritText}\n\n📍 तीर्थ/देवपीठ: ${dailySankalpa.geoInfo.sacredRiverSanskrit} | ${dailySankalpa.geoInfo.prominentDeitySanskrit}\n— नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullTextToCopy).then(() => {
        setSankalpaCopied(true);
        setTimeout(() => setSankalpaCopied(false), 2500);
      }).catch(() => {
        setSankalpaCopied(true);
        setTimeout(() => setSankalpaCopied(false), 2500);
      });
    } else {
      setSankalpaCopied(true);
      setTimeout(() => setSankalpaCopied(false), 2500);
    }
  };

  const handleShareDailySankalpa = () => {
    if (!dailySankalpa) return;
    const shareText = `॥ दैनिक वैदिक सङ्कल्प (${dailySankalpa.panchangaSummary}) ॥\n\n${dailySankalpa.sanskritText}\n\n📍 ${dailySankalpa.geoInfo.localitySanskrit} (${dailySankalpa.geoInfo.riverNepali})\n🛕 ${dailySankalpa.geoInfo.deityNepali}\n\n— नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग`;

    if (navigator.share) {
      navigator.share({
        title: 'दैनिक वैदिक सङ्कल्प',
        text: shareText,
      }).catch(() => {});
    } else {
      const encoded = encodeURIComponent(shareText);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
  };

  const [latestSamachar, setLatestSamachar] = React.useState<SamacharArticle[]>(() => {
    try {
      return getStoredArticles().filter(a => a.isPublished).slice(0, 3);
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      try {
        setLatestSamachar(getStoredArticles().filter(a => a.isPublished).slice(0, 3));
      } catch {}
    };
    window.addEventListener('balananda_samachar_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('balananda_samachar_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <div id="dashboard-printable-area" className="space-y-5 flex flex-col flex-1 w-full min-h-0">
      {/* Top Dashboard Utility & PDF Export Bar - Only visible after software purchase */}
      {isPurchasedOrUnlocked && (
        <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 px-5 sm:px-6 py-4 sm:py-4.5 rounded-2xl border-2 border-amber-500/30 dark:border-amber-500/25 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#1A1A1A] dark:text-stone-100 font-serif tracking-wide">
                  ज्योतिष तथा पञ्चाङ्ग
                </h2>
                {approvedLicense?.isApproved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/25 to-orange-500/20 text-amber-900 dark:text-amber-200 border-2 border-amber-500/50 shadow-xs animate-in fade-in">
                    <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{approvedLicense.clientName} • {approvedLicense.planId?.startsWith('lifetime') ? 'Life Time' : 'One Year'}</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                दैनिक पञ्चाङ्ग, ग्रह गोचर, कुण्डली चक्र तथा आधिकारिक वैदिक सेवाहरूको प्रत्यक्ष विवरण
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Daily 7:00 AM WhatsApp Automated Dispatch Manager Button */}
            <button
              onClick={() => setIsWhatsAppManagerOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs sm:text-sm font-black px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              title="दैनिक बिहान ७:०० बजे ग्राहकहरूलाई स्वचालित राशिफल तथा पञ्चाङ्ग WhatsApp मा पठाउने सुपर एडमिन प्रणाली"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>दैनिक ७ बजे WhatsApp सेवा</span>
            </button>

            {/* Official Balananda Panchanga Actions (Print, Download, WhatsApp) */}
            <button
              type="button"
              onClick={() => setIsDailyPanchangaModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700"
              title="ॐ को भव्य बोर्डर र बालानन्द लेटरहेडमा बार स्वामी भगवान्‌को तस्बिर सहितको पञ्चाङ्ग प्रिन्ट गर्नुहोस्"
            >
              <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>प्रिन्ट</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDailyPanchangaModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95 bg-[#D97706] hover:bg-[#b45309] text-white"
              title="उच्च गुणस्तरको आधिकारिक A4 PDF वा PNG डाउनलोड गर्नुहोस्"
            >
              <Download className="w-4 h-4 text-white" />
              <span>डाउनलोड</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDailyPanchangaModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95 text-white bg-emerald-600 hover:bg-emerald-500"
              title="WhatsApp मा पञ्चाङ्ग सेयर गर्नुहोस्"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>WhatsApp सेयर</span>
            </button>
          </div>
        </div>
      )}

      {/* 🌟 PERSONALIZED MEMBER ASTROLOGICAL HUB (जब सदस्य लगइन भएको हुन्छ) */}
      {rbacSession && activeProfile && (
        <PersonalizedMemberAstrologyHub
          profile={activeProfile}
          todayPanchanga={todayPanchanga}
          todayAD={todayAD}
          todayBS={todayBS}
          transitPlanets={transitPlanets || planets}
        />
      )}

      {/* Today's Vedic Insight Widget - Automated Daily Auspicious Suggestions & Rahukaal/Choghadiya Alerts */}
      <VedicInsightWidget panchanga={todayPanchanga} onNavigate={onNavigate} />

      {/* Official Commercial Advertisement & Promotion Hero Banner */}
      <div className="bg-gradient-to-r from-[#1E140E] via-[#2F1D0F] to-[#120A05] text-white rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden border-2 border-amber-500/50 shrink-0">
        {/* Subtle background ornamentation */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-72 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-28 bg-orange-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center lg:text-left flex-1 min-w-0">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/25 to-amber-600/20 border border-amber-400/50 px-3 py-1 rounded-full text-amber-300 text-xs font-extrabold tracking-wide shadow-sm">
                <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>व्यावसायिक विज्ञापन तथा प्रायोजन स्थान</span>
              </div>
              <span className="inline-flex items-center gap-1 bg-stone-800/80 border border-stone-700/80 px-2.5 py-1 rounded-full text-[11px] text-amber-200/80 font-medium">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>नेपालकै आधिकारिक वैदिक तथा पञ्चाङ्ग प्लेटफर्म</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-amber-100 tracking-wide leading-tight">
              विज्ञापनको लागि सम्पर्क :{' '}
              <a
                href="tel:9764400533"
                className="text-amber-300 hover:text-amber-200 underline decoration-amber-400/60 font-black tracking-wider transition-colors inline-block"
              >
                ९७६४४००५३३
              </a>
            </h1>

            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
              यस लोकप्रिय नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग पोर्टलमा तपाईंको व्यवसाय, ब्राण्ड, धार्मिक संघसंस्था वा सेवाको आधिकारिक विज्ञापन तथा प्रवर्द्धन गरी लाखौँ श्रद्धालु तथा पञ्चाङ्ग प्रेमीहरूमाझ सहजै पुग्नुहोस्।
            </p>

            {/* Contact Actions & CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1 text-xs">
              <a
                href="tel:9764400533"
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 px-4 py-2 rounded-xl font-black shadow-md transition-all active:scale-95 cursor-pointer"
                title="सिधै फोन कल गर्नुहोस्"
              >
                <Phone className="w-3.5 h-3.5 text-stone-950" />
                <span>कल गर्नुहोस् : ९७६४४००५३३</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?phone=9779764400533&text=${encodeURIComponent('नमस्ते, म बालानन्द पञ्चाङ्ग पोर्टलमा विज्ञापन प्रकाशन तथा प्रायोजन सम्बन्धी जानकारी लिन चाहन्छु।')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/30 px-3.5 py-2 rounded-xl font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                title="WhatsApp मा कुराकानी गर्नुहोस्"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                <span>WhatsApp च्याट</span>
              </a>

              <a
                href={`mailto:${orgProfile.email || 'suwashdmk@gmail.com'}?subject=${encodeURIComponent('विज्ञापन प्रकाशन सम्बन्धी सोधपुछ')}&body=${encodeURIComponent('नमस्ते, म बालानन्द पञ्चाङ्ग पोर्टलमा विज्ञापन प्रकाशन सम्बन्धी सोधपुछ गर्न चाहन्छु।')}`}
                className="flex items-center gap-1.5 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-amber-200 px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer"
                title="ईमेल पठाउनुहोस्"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{orgProfile.email || 'suwashdmk@gmail.com'}</span>
              </a>
            </div>
          </div>

          {/* Right Section: Main Ad Banner / Visiting Card Creative Box */}
          <div className="w-full lg:w-72 h-40 bg-stone-900/90 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-xl shrink-0 relative group">
            {orgProfile.mainPhotoUrl ? (
              <>
                <img
                  src={getAssetUrl(orgProfile.mainPhotoUrl)}
                  alt="विज्ञापन ब्यानर"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <Megaphone className="w-2.5 h-2.5" />
                  <span>विज्ञापन स्थान (Ad Space)</span>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  <button
                    onClick={onOpenOrgProfile}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black rounded-lg shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    विज्ञापन ब्यानर सम्पादन
                  </button>
                  <span className="text-[10px] text-stone-300">क्लिक गरी नयाँ ब्यानर राख्नुहोस्</span>
                </div>
              </>
            ) : (
              <div 
                onClick={onOpenOrgProfile}
                className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer bg-gradient-to-br from-stone-900 to-stone-950 hover:bg-stone-850 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-1.5">
                  <Megaphone className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-amber-200">यहाँ तपाईंको विज्ञापन ब्यानर रहनेछ</span>
                <span className="text-[10px] text-stone-400 mt-0.5">साइज: 1200x600 वा भिजिटिङ कार्ड</span>
                <span className="mt-2 px-2.5 py-0.5 bg-amber-500/20 group-hover:bg-amber-500/40 text-amber-300 text-[11px] font-semibold rounded-md border border-amber-400/30 transition-all">
                  ब्यानर अपलोड गर्नुहोस्
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Panchanga Grid & Active Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Today's Panchanga Quick-Glance Widget (Tithi, Vara, Nakshatra, Yoga, Karana) */}
        <DashboardWidget
          panchanga={todayPanchanga}
          onNavigate={onNavigate}
          className="lg:col-span-2"
        />

        {/* Shastric Daily Vedic Sankalpa Card (दैनिक शास्त्रोक्त वैदिक सङ्कल्प) */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-200/70 dark:border-stone-800 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-xl shadow-xs text-base">🪔</span>
                <div>
                  <h3 className="text-base font-bold text-[#1A1A1A] dark:text-stone-100 font-serif">
                    दैनिक वैदिक सङ्कल्प
                  </h3>
                  <span className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                    शास्त्रोक्त नित्य सङ्कल्प वाक्य
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {activeProfile && (
                  <span className="text-[10.5px] bg-amber-50 dark:bg-stone-800 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-lg font-bold border border-amber-200 dark:border-amber-800/60 max-w-[130px] truncate" title={`यजमान: ${activeProfile.name} (${activeProfile.gotra || activeProfile.fatherDetails?.gotra || 'कश्यप'} गोत्र)`}>
                    यजमान: {activeProfile.name}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300/60 dark:border-amber-800/60">
                  दैनिक स्वतः अद्यावधिक
                </span>
              </div>
            </div>

            {/* Sacred Geography & Pilgrimage Badges */}
            <div className="grid grid-cols-2 gap-2 mb-2.5 text-[11px]">
              <div className="bg-amber-50/70 dark:bg-stone-800/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-stone-700/60 flex flex-col justify-between">
                <span className="text-stone-500 dark:text-stone-400 text-[10px] font-medium flex items-center gap-1">
                  📍 पवित्र नदी व तीर्थ:
                </span>
                <span className="font-bold text-stone-800 dark:text-stone-200 truncate mt-0.5" title={`${dailySankalpa.geoInfo.localitySanskrit} • ${dailySankalpa.geoInfo.riverNepali}`}>
                  {dailySankalpa.geoInfo.riverNepali}
                </span>
              </div>

              <div className="bg-amber-50/70 dark:bg-stone-800/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-stone-700/60 flex flex-col justify-between">
                <span className="text-stone-500 dark:text-stone-400 text-[10px] font-medium flex items-center gap-1">
                  🛕 प्रसिद्ध देवपीठ:
                </span>
                <span className="font-bold text-stone-800 dark:text-stone-200 truncate mt-0.5" title={dailySankalpa.geoInfo.deityNepali}>
                  {dailySankalpa.geoInfo.deityNepali}
                </span>
              </div>
            </div>

            {/* Live Transit status bar */}
            <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/60 dark:border-stone-700/50 mb-3">
              <span className="text-stone-500 dark:text-stone-400 font-medium">🪐 आजको गोचर:</span>
              <span className="font-semibold text-amber-800 dark:text-amber-300">
                {dailySankalpa.grahaStatusSummary}
              </span>
            </div>

            {/* Sanskrit Shastric Sankalpa Text Box */}
            <div className="relative p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-amber-100/40 dark:from-stone-800/90 dark:via-stone-900/80 dark:to-stone-800/60 border border-amber-300/70 dark:border-amber-900/50 shadow-inner flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/70 dark:border-stone-700">
                  <span className="font-bold text-amber-900 dark:text-amber-300 text-[12px] font-serif flex items-center gap-1.5">
                    <span>॥ आजको शास्त्रोक्त सङ्कल्प वाक्यम् ॥</span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-stone-800 px-2 py-0.5 rounded font-mono">
                    {dailySankalpa.panchangaSummary.split('•')[2]}
                  </span>
                </div>
                <div className="text-[12px] sm:text-[12.5px] leading-relaxed font-serif text-stone-800 dark:text-stone-200 select-text">
                  <p className="text-justify whitespace-normal font-serif">
                    {dailySankalpa.sanskritText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row: Copy, Share, Maha Sankalpa Popup */}
          <div className="mt-4 pt-3 border-t border-[#E6E0D5] dark:border-stone-800 flex items-center gap-2">
            <button
              onClick={handleCopyDailySankalpa}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold transition-all border border-stone-200 dark:border-stone-700 active:scale-95 cursor-pointer shadow-2xs"
              title="दैनिक सङ्कल्प प्रतिलिपि (Copy) गर्नुहोस्"
            >
              {sankalpaCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">प्रतिलिपि भयो</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                  <span>प्रतिलिपि</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareDailySankalpa}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800 active:scale-95 cursor-pointer shadow-2xs"
              title="दैनिक सङ्कल्प सेयर गर्नुहोस्"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>सेयर</span>
            </button>

            <button
              onClick={() => setIsMahaSankalpaModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="विस्तृत शास्त्रोक्त महासङ्कल्प (पूजा, रुद्री, हवन, गोत्र सहित) खोल्नुहोस्"
            >
              <Scroll className="w-4 h-4 text-amber-100" />
              <span>महासङ्कल्प</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Auspicious Times (Muhurta) Summary Card: Subha-Muhurta, Rahukaal, Yamagandakaal */}
      <DailyMuhurtaSummaryWidget
        panchanga={todayPanchanga}
        onNavigateToMuhurta={() => onNavigate('muhurta')}
      />

      {/* Dynamic Daily Vedic Affirmation & Positive Sankalpa Component */}
      <DailyAffirmationWidget 
        dasha={dasha}
        panchanga={todayPanchanga}
        activeProfile={activeProfile}
        planets={planets}
      />

      {/* Major Planetary Movement & Transit Push Alert System */}
      <TransitPushAlertWidget
        activeProfile={activeProfile}
        birthMoon={providedMoon || moon}
        birthLagna={lagna}
        transitPlanets={transitPlanets || planets}
        todayAD={todayAD}
        todayBS={todayBS}
        onOpenNotificationCenter={onOpenTransitNotifications}
        onNavigateToGochar={() => onNavigate('gochar')}
      />

      {/* Interactive 30-Day Planetary Transits Dashboard Widget */}
      <UpcomingTransitWidget
        activeProfile={activeProfile}
        birthMoon={providedMoon || moon}
        birthLagna={lagna}
        startDateAD={todayAD}
        onNavigate={onNavigate}
      />

      {/* Dynamic Daily Vastu Suggestion Section */}
      <DailyVastuWidget 
        panchanga={todayPanchanga}
        activeProfile={activeProfile}
        lagna={lagna}
        planets={planets}
        onNavigateToVastu={() => onNavigate('vastu')}
      />

      {/* Quick Access Modules Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 shrink-0">
        <button
          onClick={() => onNavigate('rashifal')}
          className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all shadow-xs group cursor-pointer min-h-[96px]"
        >
          <div className="p-2.5 bg-amber-500/20 text-[#D97706] dark:text-amber-300 rounded-xl group-hover:scale-110 transition-transform">
            <Sun className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#7A1C1C] dark:text-amber-300">दैनिक राशिफल</span>
        </button>

        <button
          onClick={() => onNavigate('kundali')}
          className="bg-white hover:bg-[#FAF8F5] dark:bg-stone-900 dark:hover:bg-stone-800 border border-[#E6E0D5] dark:border-stone-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all shadow-xs group cursor-pointer min-h-[96px]"
        >
          <div className="p-2.5 bg-[#F59E0B]/10 text-[#D97706] rounded-xl group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2D241E] dark:text-stone-100">जन्मकुण्डली</span>
        </button>

        <button
          onClick={() => onNavigate('dynamic_patrika' as any)}
          className="bg-white hover:bg-[#FAF8F5] dark:bg-stone-900 dark:hover:bg-stone-800 border border-[#E6E0D5] dark:border-stone-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all shadow-xs group cursor-pointer min-h-[96px]"
        >
          <div className="p-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2D241E] dark:text-stone-100">नेपाली टिपन</span>
        </button>

        <button
          onClick={() => onNavigate('faladesh')}
          className="bg-white hover:bg-[#FAF8F5] dark:bg-stone-900 dark:hover:bg-stone-800 border border-[#E6E0D5] dark:border-stone-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all shadow-xs group cursor-pointer min-h-[96px]"
        >
          <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2D241E] dark:text-stone-100">विस्तृत फलादेश</span>
        </button>

        <button
          onClick={() => onNavigate('vivah')}
          className="bg-white hover:bg-[#FAF8F5] dark:bg-stone-900 dark:hover:bg-stone-800 border border-[#E6E0D5] dark:border-stone-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all shadow-xs group cursor-pointer min-h-[96px]"
        >
          <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl group-hover:scale-110 transition-transform">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2D241E] dark:text-stone-100">विवाह मिलान</span>
        </button>

        <button
          onClick={() => onNavigate('muhurta')}
          className="bg-white hover:bg-[#FAF8F5] dark:bg-stone-900 dark:hover:bg-stone-800 border border-[#E6E0D5] dark:border-stone-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all shadow-xs group cursor-pointer min-h-[96px]"
        >
          <div className="p-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl group-hover:scale-110 transition-transform">
            <Timer className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2D241E] dark:text-stone-100">शुभ मुहूर्त</span>
        </button>

        <button
          onClick={() => onNavigate('jyotishi')}
          className="bg-white hover:bg-[#FAF8F5] dark:bg-stone-900 dark:hover:bg-stone-800 border border-[#E6E0D5] dark:border-stone-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all shadow-xs group cursor-pointer min-h-[96px]"
        >
          <div className="p-2.5 bg-[#F59E0B]/10 text-[#D97706] rounded-xl group-hover:scale-110 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2D241E] dark:text-stone-100">ज्योतिषी कार्यक्षेत्र</span>
        </button>
      </div>

      {/* Quick Date Converter Utility Section */}
      <QuickDateConverter 
        mode="card"
        onNavigateToPanchanga={() => onNavigate('panchanga')}
      />



      {/* Latest Vedic & Planetary Transit News Feed Section */}
      {latestSamachar.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>ताजा प्रत्यक्ष ग्रह गोचर तथा वैदिक समाचार</span>
                  <span className="text-[11px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full animate-pulse">लाइभ</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  नवग्रहहरूको वर्तमान गोचर गति, नक्षत्र सञ्चार तथा १२ वटै राशिमा पर्ने शास्त्रीय प्रभाव
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('samachar')}
              className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer shrink-0"
            >
              <span>सबै ९ ग्रह समाचार</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestSamachar.map((art) => (
              <div
                key={art.id}
                onClick={() => onNavigate('samachar')}
                className="group flex flex-col justify-between bg-stone-50 hover:bg-amber-50/50 dark:bg-stone-800/60 dark:hover:bg-amber-950/20 border border-stone-200/80 hover:border-amber-400 dark:border-stone-700/80 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md">
                      {art.tags?.[0] ? `${art.tags[0]} गोचर` : 'ज्योतिष समाचार'}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {art.publishedAtBS}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold">
                  <span>पूर्ण फलादेश पढ्नुहोस्</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Software Developer & Organization Footer Block */}
      <div className="no-print mt-8 rounded-2xl bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 border-2 border-amber-500/40 text-stone-100 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Background ambient glowing orbs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Organization Seal/Logo & Developer Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-900/90 border-2 border-amber-400/60 p-1.5 shadow-lg flex items-center justify-center shrink-0 group hover:border-amber-400 transition-all duration-300">
              <img 
                src={getAssetUrl('/logo.png')} 
                alt="बालानन्द वैदिक सेवा" 
                className="w-full h-full object-contain drop-shadow"
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
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-semibold mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>आधिकारिक विकास तथा प्रविधि व्यवस्थापन</span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-amber-100 font-serif leading-snug">
                Software devloped by : Sukadew Saran, बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 font-medium">
                नेपाली वैदिक ज्योतिष, बृहत् जन्मपत्रिका, वास्तुशास्त्र परामर्श तथा सनातन कर्मकाण्ड सेवा
              </p>
              <p className="text-[11px] text-amber-300/70 mt-0.5">
                ॥ शुभं भवतु • सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥
              </p>
            </div>
          </div>

          {/* Right: Contact Information Cards */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 w-full lg:w-auto shrink-0">
            {/* Phone */}
            <a
              href="tel:+9779764400533"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-amber-500/30 hover:border-amber-400 text-stone-200 hover:text-white transition-all duration-200 group shadow-sm text-left flex-1 sm:flex-none min-w-[170px]"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300/90">Phone NO</div>
                <div className="text-xs sm:text-sm font-semibold text-stone-100 truncate">+९७७-९७६४४००५३३</div>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:suwashdmk@gmail.com"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-amber-500/30 hover:border-amber-400 text-stone-200 hover:text-white transition-all duration-200 group shadow-sm text-left flex-1 sm:flex-none min-w-[170px]"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300/90">Email</div>
                <div className="text-xs sm:text-sm font-semibold text-stone-100 truncate">suwashdmk@gmail.com</div>
              </div>
            </a>

            {/* Website */}
            <a
              href="https://www.balanandavaidiksewa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/40 hover:to-amber-700/40 border border-amber-400/50 hover:border-amber-300 text-stone-100 hover:text-white transition-all duration-200 group shadow-sm text-left flex-1 sm:flex-none min-w-[210px]"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300/90 flex items-center gap-1">
                  <span>website</span>
                  <ExternalLink className="w-2.5 h-2.5 text-amber-400" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-200 underline decoration-amber-400/60 underline-offset-2 truncate">
                  www.balanandavaidiksewa.com
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Subtle bottom copyright bar */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400">
          <div>
            © {new Date().getFullYear()} बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा। सर्वाधिकार सुरक्षित।
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <span className="hover:text-amber-300 transition-colors">काठमाडौँ, नेपाल</span>
            <span>•</span>
            <a href="https://wa.me/9779764400533" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp सहयोग</span>
            </a>
          </div>
        </div>
      </div>

      {/* Social Sharing Modal for Kundali & Planetary Positions */}
      {(shareTargetProfile || activeProfile) && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareTargetProfile(null);
          }}
          profile={shareTargetProfile || activeProfile!}
          lagna={lagna}
          planets={planets}
          dasha={dasha}
          orgProfile={orgProfile}
        />
      )}

      {/* Super Admin Daily 7:00 AM WhatsApp Automated Dispatch Modal */}
      {isWhatsAppManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="max-w-5xl w-full my-auto">
            <DailyWhatsAppDispatchManager
              profiles={profiles}
              todayPanchanga={todayPanchanga}
              orgProfile={orgProfile}
              transitPlanets={transitPlanets}
              onClose={() => setIsWhatsAppManagerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Full-Page Shastric Maha Sankalpa Modal */}
      <MahaSankalpaModal
        isOpen={isMahaSankalpaModalOpen}
        onClose={() => setIsMahaSankalpaModalOpen(false)}
        panchanga={todayPanchanga}
        activeProfile={activeProfile}
        planets={currentTransitOrNatalPlanets}
      />

      {/* 🌟 1-Page Balananda Daily Panchanga Print / PDF / WhatsApp PNG Modal */}
      {isDailyPanchangaModalOpen && (
        <DailyPanchangaPrintModal
          isOpen={isDailyPanchangaModalOpen}
          onClose={() => setIsDailyPanchangaModalOpen(false)}
          panchanga={todayPanchanga}
          orgProfile={orgProfile}
          todayBS={todayBS}
          todayAD={todayAD}
          locationName={activeProfile?.location?.name || 'काठमाडौँ, नेपाल'}
          astrologerName={astrologers?.[0]?.name || 'ज्योतिषाचार्य सुकदेव शर्मा'}
        />
      )}
    </div>
  );
});

