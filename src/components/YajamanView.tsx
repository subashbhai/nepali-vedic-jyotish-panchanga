import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Star,
  AlertCircle,
  Bell,
  UserPlus,
  Compass,
  Building2,
  Sparkles,
  Award,
  ChevronRight,
  Filter,
  RefreshCw,
  Sliders,
  Send,
  User,
  Heart,
  FileText,
  LogOut,
  Navigation,
  Globe,
  Plus,
  MessageSquare,
  PhoneCall,
  Video,
  ShieldAlert,
  X
} from 'lucide-react';

import { CallSession } from '../types/communicationTypes';
import { initiateCallSession } from '../db/communicationStore';
import { SecureChatPanel } from './communication/SecureChatPanel';
import { InAppCallModal } from './communication/InAppCallModal';
import { ReportBlockModal } from './communication/ReportBlockModal';
import { RatingReviewModal } from './communication/RatingReviewModal';

import {
  Booking,
  BookingStatus,
  LocationCoordinates,
  ServiceCategory,
  ServiceProvider,
  ServiceRequest,
  YajamanNotification,
  YajamanUser,
  YajamanPost,
  YajamanComment,
  YajamanReport,
  YajamanAuditLog,
} from '../types/yajamanTypes';

import {
  acceptServiceRequest,
  addNotification,
  getActiveProviderSession,
  getActiveYajamanSession,
  getContactExchangeLogs,
  getStoredBookings,
  getStoredNotifications,
  getStoredServiceCategories,
  getStoredServiceProviders,
  getStoredServiceRequests,
  getStoredYajamanUsers,
  recordContactExchange,
  saveBookings,
  saveNotifications,
  saveServiceProviders,
  saveServiceRequests,
  saveYajamanUsers,
  setActiveProviderSession,
  setActiveYajamanSession,
  getStoredYajamanPosts,
  saveYajamanPosts,
  toggleYajamanPostLike,
  toggleYajamanPostSave,
  incrementYajamanPostShare,
  getStoredYajamanReports,
  getStoredYajamanAuditLogs,
} from '../db/yajamanStore';

import {
  calculateDistanceKm,
  calculateProviderMatchScore,
  DEFAULT_NEPAL_LOCATION,
  MATCHING_RADIUS_STEPS,
  maskAddress,
  maskEmail,
  maskPhoneNumber,
} from '../utils/geoUtils';

import { convertADToBS } from '../utils/nepaliCalendar';

import { YajamanLoginGateModal } from './yajaman/YajamanLoginGateModal';
import { YajamanSocialShareModal } from './yajaman/YajamanSocialShareModal';
import { YajamanReportModal } from './yajaman/YajamanReportModal';
import { YajamanPostCard } from './yajaman/YajamanPostCard';
import { YajamanPostDetailModal } from './yajaman/YajamanPostDetailModal';
import { YajamanCreatePostForm } from './yajaman/YajamanCreatePostForm';
import { YajamanHowToUseSection } from './yajaman/YajamanHowToUseSection';
import { YajamanRulesSection } from './yajaman/YajamanRulesSection';
import { YajamanAdminModerationPanel } from './yajaman/YajamanAdminModerationPanel';
import { BirthDetails, PanchangaData, PlanetPosition } from '../types/astrology';
import { calculatePanchanga } from '../utils/panchangaEngine';
import { PersonalizedRashifalDashboard } from './dashboard/PersonalizedRashifalDashboard';
import { RBACSession, getActiveRBACSession } from '../db/rbacStore';
import { getUserPersonalBirthProfile, saveUserPersonalBirthProfile } from '../db/profileStore';

interface YajamanViewProps {
  onNavigateToExpert?: () => void;
  activeProfile?: BirthDetails | null;
  rbacSession?: RBACSession | null;
  todayPanchanga?: PanchangaData;
  todayAD?: string;
  todayBS?: string;
  transitPlanets?: PlanetPosition[];
  onUpdateProfile?: (updated: BirthDetails) => void;
}

export const YajamanView: React.FC<YajamanViewProps> = ({
  onNavigateToExpert,
  activeProfile,
  rbacSession,
  todayPanchanga,
  todayAD = new Date().toISOString().split('T')[0],
  todayBS: propTodayBS,
  transitPlanets = [],
  onUpdateProfile
}) => {
  // Portal Role Switch: 'YAJAMAN' vs 'PROVIDER'
  const [portalMode, setPortalMode] = useState<'YAJAMAN' | 'PROVIDER'>('YAJAMAN');

  // Active Sessions
  const [activeYajaman, setActiveYajaman] = useState<YajamanUser | null>(getActiveYajamanSession());
  const [activeProvider, setActiveProvider] = useState<ServiceProvider | null>(getActiveProviderSession());

  // Locally customized profile state
  const [customizedProfile, setCustomizedProfile] = useState<BirthDetails | null>(null);

  // Memoized user profile for personalized rashifal dashboard
  const userProfileForRashifal: BirthDetails = useMemo(() => {
    // 0. Locally edited profile takes top priority
    if (customizedProfile) return customizedProfile;

    // 1. If explicit real user profile is passed (not a live transit dummy)
    if (activeProfile && activeProfile.id !== 'live_current_moment' && !activeProfile.name?.includes('तात्कालिक')) {
      return activeProfile;
    }

    // 2. Resolve logged in user (RBAC or Yajaman session)
    const currentRbac = rbacSession || getActiveRBACSession();
    const currentUserId = currentRbac?.userId || activeYajaman?.id || 'client_subash_khanal';
    const currentUserName = currentRbac?.fullName || activeYajaman?.fullName || 'subash khanal';

    const personalProf = getUserPersonalBirthProfile(currentUserId, currentUserName);
    if (personalProf) return personalProf;

    // 3. Fallback
    return {
      id: `user_profile_${currentUserId}`,
      name: currentUserName,
      gender: 'पुरुष',
      dateBS: '२०४६-०५-१५',
      dateAD: '1989-08-30',
      time: '06:30',
      location: {
        name: activeYajaman?.district ? `${activeYajaman.district}, नेपाल` : 'काठमाडौँ, नेपाल',
        latitude: 27.7172,
        longitude: 85.3240,
        timeZone: 5.75
      },
      moonRashi: 'कन्या'
    };
  }, [customizedProfile, activeProfile, rbacSession, activeYajaman]);

  const computedPanchanga = useMemo(() => {
    if (todayPanchanga) return todayPanchanga;
    const now = new Date();
    return calculatePanchanga(now, 27.7172, 85.3240, 5.75);
  }, [todayPanchanga]);

  // Navigation Tabs for Yajaman: defaults to community 'feed'
  const [yajamanTab, setYajamanTab] = useState<
    | 'feed'
    | 'rashifal'
    | 'dashboard'
    | 'book_service'
    | 'create_post'
    | 'my_bookings'
    | 'providers'
    | 'how_to_use'
    | 'rules'
    | 'admin_moderation'
    | 'notifications'
    | 'profile'
  >('feed');

  // Navigation Tabs for Provider
  const [providerTab, setProviderTab] = useState<'incoming_requests' | 'accepted_bookings' | 'my_profile' | 'history'>('incoming_requests');

  // Auth Modal/Tab mode: 'signin' | 'signup'
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Social / Community Posts & Modals State
  const [posts, setPosts] = useState<YajamanPost[]>(() => getStoredYajamanPosts());
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<YajamanPost | null>(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState<YajamanPost | null>(null);
  const [isLoginGateOpen, setIsLoginGateOpen] = useState(false);
  const [loginGateActionMessage, setLoginGateActionMessage] = useState('यो सुविधा प्रयोग गर्न पहिले लगइन गर्नुहोस्।');
  const [loginGateFeatureName, setLoginGateFeatureName] = useState('यजमान सेवा');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetInfo, setReportTargetInfo] = useState<{
    type: 'POST' | 'COMMENT' | 'USER';
    id: string;
    nameOrTitle: string;
  } | null>(null);

  // Feed Filter & Sort State
  const [feedSearch, setFeedSearch] = useState('');
  const [feedCategory, setFeedCategory] = useState('all');
  const [feedDistrict, setFeedDistrict] = useState('all');
  const [feedSort, setFeedSort] = useState<'latest' | 'popular' | 'shares' | 'verified'>('latest');

  // Data Collections
  const [categories, setCategories] = useState<ServiceCategory[]>(getStoredServiceCategories());
  const [providers, setProviders] = useState<ServiceProvider[]>(getStoredServiceProviders());
  const [requests, setRequests] = useState<ServiceRequest[]>(getStoredServiceRequests());
  const [bookings, setBookings] = useState<Booking[]>(getStoredBookings());
  const [notifications, setNotifications] = useState<YajamanNotification[]>(getStoredNotifications());

  // Communication Modals State
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);
  const [activeCallSession, setActiveCallSession] = useState<CallSession | null>(null);
  const [reportTarget, setReportTarget] = useState<{ targetUserId: string; targetUserName: string; bookingId?: string } | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // Form State for Yajaman Sign Up
  const [ySignUpForm, setYSignUpForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    district: 'काठमाडौँ',
    localLevel: 'काठमाडौँ महानगरपालिका',
    ward: '१०',
    address: 'काठमाडौँ',
    profilePhoto: '',
  });

  // Form State for Yajaman Sign In
  const [ySignInForm, setYSignInForm] = useState({ mobile: '', password: '' });

  // Form State for Provider Sign In
  const [pSignInForm, setPSignInForm] = useState({ mobile: '' });

  // Location detection status
  const [isLocating, setIsLocating] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<LocationCoordinates>(DEFAULT_NEPAL_LOCATION);
  const [locationError, setLocationError] = useState<string | null>(null);

  // New Service Request Wizard State
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(categories[0] || null);
  const [customServiceType, setCustomServiceType] = useState('गृहप्रवेश वास्तुशान्ति पूजा');
  const [prefDateBS, setPrefDateBS] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const bs = convertADToBS(today);
    return `${bs.year}-${bs.month.toString().padStart(2, '0')}-${bs.day.toString().padStart(2, '0')}`;
  });
  const [prefTime, setPrefTime] = useState('बिहान ०८:०० बजे');
  const [serviceLocationText, setServiceLocationText] = useState('काठमाडौँ महानगरपालिका, वडा नं. २२');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [activeMatchingRequestId, setActiveMatchingRequestId] = useState<string | null>(null);

  // Filters for Exploring Providers
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCatId, setFilterCatId] = useState<string>('all');
  const [filterRadiusKm, setFilterRadiusKm] = useState<number>(30);

  // Rating Modal state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Notification / Alert Message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync Data Periodically
  const refreshData = () => {
    setPosts(getStoredYajamanPosts());
    setCategories(getStoredServiceCategories());
    setProviders(getStoredServiceProviders());
    setRequests(getStoredServiceRequests());
    setBookings(getStoredBookings());
    setNotifications(getStoredNotifications());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const currentUserId = activeYajaman?.id || activeProvider?.id || '';
  const currentUserName = activeYajaman?.fullName || activeProvider?.fullName || '';
  const isAuthenticated = Boolean(activeYajaman || activeProvider);

  const triggerLoginGate = (actionMessage: string, featureName: string) => {
    setLoginGateActionMessage(actionMessage);
    setLoginGateFeatureName(featureName);
    setIsLoginGateOpen(true);
  };

  const handleLikePost = (postOrId: YajamanPost | string) => {
    const postId = typeof postOrId === 'string' ? postOrId : postOrId.id;
    if (!isAuthenticated) {
      triggerLoginGate('यो पोस्ट मन पराउन (Like) गर्न पहिले लगइन गर्नुहोस्।', 'पोस्ट लाइक');
      return;
    }
    toggleYajamanPostLike(postId, currentUserId);
    const updated = getStoredYajamanPosts();
    setPosts(updated);
    if (selectedPostForDetail && selectedPostForDetail.id === postId) {
      const found = updated.find((p) => p.id === postId);
      if (found) setSelectedPostForDetail(found);
    }
  };

  const handleSavePost = (postOrId: YajamanPost | string) => {
    const postId = typeof postOrId === 'string' ? postOrId : postOrId.id;
    if (!isAuthenticated) {
      triggerLoginGate('यो पोस्ट सुरक्षित (Save/Bookmark) गर्न पहिले लगइन गर्नुहोस्।', 'पोस्ट सुरक्षित');
      return;
    }
    toggleYajamanPostSave(postId, currentUserId);
    const updated = getStoredYajamanPosts();
    setPosts(updated);
    showToast('पोस्ट सुरक्षित सूचीमा राखियो!', 'info');
  };

  const handleSharePost = (post: YajamanPost) => {
    setSelectedPostForShare(post);
    incrementYajamanPostShare(post.id);
  };

  const handleOpenPostDetail = (post: YajamanPost) => {
    if (!isAuthenticated) {
      triggerLoginGate('यो पोस्टको पूर्ण विवरण, आवश्यक पूजा सामग्री र सम्पर्क जानकारी हेर्न पहिले लगइन गर्नुहोस्।', 'पूर्ण पोस्ट विवरण');
      return;
    }
    setSelectedPostForDetail(post);
  };

  const handleRequestServiceFromPost = (post: YajamanPost) => {
    if (!isAuthenticated) {
      triggerLoginGate('यो सेवाको लागि सिधै पण्डित वा ज्योतिषीसँग अनुरोध पठाउन पहिले लगइन गर्नुहोस्।', 'सेवा अनुरोध');
      return;
    }
    const cat = categories.find((c) => c.code === post.categoryCode || c.nameNepali === post.categoryNameNepali);
    if (cat) setSelectedCategory(cat);
    setCustomServiceType(post.serviceType || post.title);
    setYajamanTab('book_service');
    setSelectedPostForDetail(null);
  };

  const handleOpenReportModal = (target: { type: 'POST' | 'COMMENT' | 'USER'; id: string; nameOrTitle: string }) => {
    setReportTargetInfo(target);
    setIsReportModalOpen(true);
  };

  const handleOpenCreatePost = () => {
    if (!isAuthenticated) {
      triggerLoginGate('सामुदायिक पोस्ट वा धार्मिक सेवा विवरण प्रकाशित गर्न पहिले लगइन गर्नुहोस्।', 'नयाँ पोस्ट सिर्जना');
      return;
    }
    setYajamanTab('create_post');
  };

  // Filtered & Sorted Feed Posts
  const filteredFeedPosts = posts
    .filter((post) => {
      if (post.status === 'REJECTED') return false;

      if (feedCategory !== 'all' && post.categoryCode !== feedCategory && post.categoryNameNepali !== feedCategory) {
        return false;
      }

      if (feedDistrict !== 'all' && post.district !== feedDistrict) {
        return false;
      }

      if (feedSearch.trim()) {
        const q = feedSearch.toLowerCase();
        const mTitle = post.title.toLowerCase().includes(q);
        const mDesc = post.description.toLowerCase().includes(q);
        const mAuthor = post.authorName.toLowerCase().includes(q);
        const mCat = post.categoryNameNepali.toLowerCase().includes(q);
        const mDistrict = post.district.toLowerCase().includes(q);
        if (!mTitle && !mDesc && !mAuthor && !mCat && !mDistrict) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (feedSort === 'popular') return b.likesCount - a.likesCount;
      if (feedSort === 'shares') return b.sharesCount - a.sharesCount;
      if (feedSort === 'verified') return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
      return b.createdAtTimestamp - a.createdAtTimestamp; // 'latest'
    });

  // Detect GPS Location
  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('तपाईंको ब्राउजरमा GPS Location सुविधा उपलब्ध छैन।');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: LocationCoordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
          addressName: 'वर्तमान GPS स्थान',
          district: ySignUpForm.district || 'काठमाडौँ',
          localLevel: ySignUpForm.localLevel || 'महानगरपालिका',
          ward: ySignUpForm.ward || '१',
        };
        setDetectedLocation(coords);
        setIsLocating(false);
        showToast('सफलतापूर्वक तपाईंको वर्तमान लोकेशन प्राप्त भयो!', 'success');
      },
      (err) => {
        setIsLocating(false);
        setLocationError(`लोकेशन प्राप्त गर्न सकिएन: ${err.message}. Default काठमाडौँ प्रयोग गरिएको छ।`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Yajaman Sign Up Handler
  const handleYajamanSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ySignUpForm.fullName.trim() || !ySignUpForm.mobile.trim()) {
      showToast('कृपया पुरा नाम र मोबाइल नम्बर भर्नुहोस्।', 'error');
      return;
    }
    if (ySignUpForm.password && ySignUpForm.password !== ySignUpForm.confirmPassword) {
      showToast('पासवर्ड र पुनः पासवर्ड मिलेन।', 'error');
      return;
    }

    const users = getStoredYajamanUsers();
    if (users.some((u) => u.mobile === ySignUpForm.mobile.trim())) {
      showToast('यो मोबाइल नम्बरबाट पहिल्यै एकाउन्ट बनेको छ। कृपया लगइन गर्नुहोस्।', 'error');
      setAuthTab('signin');
      return;
    }

    const newUser: YajamanUser = {
      id: `yjm_${Date.now()}`,
      fullName: ySignUpForm.fullName.trim(),
      mobile: ySignUpForm.mobile.trim(),
      email: ySignUpForm.email.trim() || undefined,
      password: ySignUpForm.password,
      district: ySignUpForm.district,
      localLevel: ySignUpForm.localLevel,
      ward: ySignUpForm.ward,
      address: ySignUpForm.address,
      location: detectedLocation,
      createdAtBS: convertADToBS(new Date().toISOString().split('T')[0]).year.toString(),
      isActive: true,
    };

    saveYajamanUsers([newUser, ...users]);
    setActiveYajaman(newUser);
    setActiveYajamanSession(newUser);
    showToast(`स्वागत छ ${newUser.fullName}! तपाईंको यजमान एकाउन्ट सफलतापूर्वक तयार भयो।`, 'success');
    setYajamanTab('dashboard');
  };

  // Yajaman Sign In Handler
  const handleYajamanSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ySignInForm.mobile.trim()) {
      showToast('कृपया मोबाइल नम्बर प्रविष्ट गर्नुहोस्।', 'error');
      return;
    }
    const users = getStoredYajamanUsers();
    const user = users.find((u) => u.mobile.trim() === ySignInForm.mobile.trim());
    if (!user) {
      // Demo fallback auto-login creation
      const demoUser: YajamanUser = {
        id: `yjm_${Date.now()}`,
        fullName: 'यजमान सुशान्त शर्मा',
        mobile: ySignInForm.mobile.trim(),
        district: 'काठमाडौँ',
        localLevel: 'काठमाडौँ महानगरपालिका',
        ward: '२२',
        address: 'काठमाडौँ, नेपाल',
        location: DEFAULT_NEPAL_LOCATION,
        createdAtBS: '२०८१',
        isActive: true,
      };
      saveYajamanUsers([demoUser, ...users]);
      setActiveYajaman(demoUser);
      setActiveYajamanSession(demoUser);
      showToast('यजमान पोर्टलमा स्वागत छ!', 'success');
      setYajamanTab('dashboard');
      return;
    }

    setActiveYajaman(user);
    setActiveYajamanSession(user);
    showToast(`पुनः स्वागत छ ${user.fullName}!`, 'success');
    setYajamanTab('dashboard');
  };

  // Provider Login Handler
  const handleProviderSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const allProv = getStoredServiceProviders();
    const found = allProv.find((p) => p.mobile.includes(pSignInForm.mobile.trim()) || p.fullName.includes(pSignInForm.mobile.trim()));
    if (found) {
      setActiveProvider(found);
      setActiveProviderSession(found);
      showToast(`स्वागत छ ${found.fullName} (सेवा प्रदायक)!`, 'success');
    } else if (allProv.length > 0) {
      // Auto login first provider for demo smooth experience
      const demoP = allProv[0];
      setActiveProvider(demoP);
      setActiveProviderSession(demoP);
      showToast(`सेवा प्रदायक पोर्टलमा स्वागत छ (${demoP.fullName})!`, 'success');
    }
  };

  // Submit New Service Request (Yajaman)
  const handleSubmitServiceRequest = () => {
    if (!activeYajaman) {
      showToast('कृपया सेवा Book गर्न पहिले लगइन वा Sign Up गर्नुहोस्।', 'error');
      return;
    }
    if (!selectedCategory) {
      showToast('कृपया सेवा वर्ग (Category) छान्नुहोस्।', 'error');
      return;
    }

    const todayBS = convertADToBS(new Date().toISOString().split('T')[0]);
    const todayBSStr = `${todayBS.year}-${todayBS.month.toString().padStart(2, '0')}-${todayBS.day.toString().padStart(2, '0')}`;

    const newReq: ServiceRequest = {
      id: `req_${Date.now()}`,
      bookingCode: `YJM-${todayBS.year}-${Math.floor(1000 + Math.random() * 9000)}`,
      yajamanId: activeYajaman.id,
      yajamanName: activeYajaman.fullName,
      yajamanMobile: activeYajaman.mobile,
      yajamanEmail: activeYajaman.email,
      categoryId: selectedCategory.id,
      categoryNameNepali: selectedCategory.nameNepali,
      serviceType: customServiceType,
      preferredDateBS: prefDateBS || todayBSStr,
      preferredTime: prefTime,
      location: activeYajaman.location || detectedLocation,
      additionalNotes: additionalNotes,
      status: 'MATCHING',
      currentRadiusKm: 3, // Start at 3 KM
      offeredProviderIds: [],
      rejectedProviderIds: [],
      createdAtBS: todayBS.formattedBS,
      createdTimestamp: Date.now(),
      updatedTimestamp: Date.now(),
    };

    const allRequests = getStoredServiceRequests();
    saveServiceRequests([newReq, ...allRequests]);
    setRequests([newReq, ...allRequests]);
    setActiveMatchingRequestId(newReq.id);

    // Create Notification
    addNotification(
      activeYajaman.id,
      'YAJAMAN',
      'सेवा अनुरोध दर्ता भयो',
      `तपाईंको '${customServiceType}' सेवा अनुरोध ३ KM परिधि भित्रका योग्य विशेषज्ञहरूसँग मिलाइँदैछ।`,
      undefined,
      newReq.id
    );

    showToast('तपाईंको सेवा अनुरोध ३ KM परिधिमा सफलताका साथ पठाइयो!', 'success');
    setYajamanTab('my_bookings');
    setWizardStep(1);
  };

  // Expand Radius for Active Request (Pathao style 3 -> 5 -> 10 -> 15 -> 20 -> 30)
  const handleExpandRadius = (requestId: string) => {
    const allReqs = getStoredServiceRequests();
    const idx = allReqs.findIndex((r) => r.id === requestId);
    if (idx === -1) return;

    const req = allReqs[idx];
    const currentR = req.currentRadiusKm || 3;
    const nextRIndex = MATCHING_RADIUS_STEPS.indexOf(currentR);
    if (nextRIndex >= 0 && nextRIndex < MATCHING_RADIUS_STEPS.length - 1) {
      const newRadius = MATCHING_RADIUS_STEPS[nextRIndex + 1];
      req.currentRadiusKm = newRadius;
      req.updatedTimestamp = Date.now();
      allReqs[idx] = req;
      saveServiceRequests(allReqs);
      setRequests(allReqs);
      showToast(`खोज परिधि बढाएर ${newRadius} KM बनाइयो!`, 'info');
    } else {
      showToast('अधिकतम ३० KM परिधिसम्म खोज कार्य भइसकेको छ।', 'info');
    }
  };

  // Accept Request (Provider Side)
  const handleAcceptRequestByProvider = (requestId: string) => {
    if (!activeProvider) {
      showToast('कृपया पहिले सेवा प्रदायकको रूपमा लगइन गर्नुहोस्।', 'error');
      return;
    }

    const res = acceptServiceRequest(requestId, activeProvider.id);
    if (res.success) {
      showToast(`तपाईंले बुकिङ ${res.booking?.bookingCode} सफलताका साथ स्वीकार गर्नुभयो! यजमानको सम्पर्क विवरण प्राप्त भयो।`, 'success');
      refreshData();
    } else {
      showToast(res.error || 'सेवा अनुरोध स्वीकार गर्दा त्रुटि भयो।', 'error');
    }
  };

  // Filtered Providers for Explore View
  const filteredProvidersList = providers.filter((p) => {
    if (filterCatId !== 'all' && !p.categories.includes(filterCatId)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.fullName.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchExpertise = p.expertise.some((e) => e.toLowerCase().includes(q));
      if (!matchName && !matchTitle && !matchExpertise) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1A1816] text-[#2D241E] dark:text-stone-100 pb-16 font-sans">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-emerald-100 border-emerald-600'
              : toastMessage.type === 'error'
              ? 'bg-rose-900/90 text-rose-100 border-rose-600'
              : 'bg-amber-900/90 text-amber-100 border-amber-600'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <p className="text-xs sm:text-sm font-semibold">{toastMessage.text}</p>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {portalMode === 'YAJAMAN' ? (
          /* =================================================== */
          /* YAJAMAN COMMUNITY & SERVICE PORTAL VIEW             */
          /* =================================================== */
          <div className="space-y-6">
            {/* Top User Status / Guest Welcome Bar */}
            {activeYajaman ? (
              <div className="bg-white dark:bg-[#262320] rounded-2xl p-4 sm:p-5 border border-amber-200/60 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-amber-200">
                    {activeYajaman.fullName.substring(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                        {activeYajaman.fullName}
                      </h2>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-[#D97706] rounded-md border border-amber-300">
                        यजमान
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                      <span>📞 {activeYajaman.mobile}</span>
                      <span>•</span>
                      <span>📍 {activeYajaman.district}, {activeYajaman.localLevel}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setYajamanTab('create_post')}
                    className="px-3.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-xl border border-stone-300 dark:border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#D97706]" />
                    <span>+ नयाँ पोस्ट</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setYajamanTab('book_service')}
                    className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>सेवा Book गर्नुहोस्</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveYajaman(null);
                      setActiveYajamanSession(null);
                      showToast('सफलतापूर्वक लगआउट भयो।', 'info');
                    }}
                    className="p-2 text-stone-400 hover:text-rose-600 bg-stone-100 dark:bg-stone-800 rounded-xl transition-all cursor-pointer"
                    title="लगआउट"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-900/90 rounded-2xl p-3.5 sm:p-4 border border-amber-200/80 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-[#7A1C1C] dark:text-amber-400 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                        सामुदायिक वैदिक सेवा पोर्टल
                      </h3>
                      <span className="text-[10px] bg-amber-200/70 text-amber-900 dark:bg-amber-950 px-2 py-0.5 rounded-full font-bold">
                        सार्वजनिक मञ्च
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                      धार्मिक पोस्टहरू, विधि तथा विशेषज्ञ सेवा विवरणहरू खुला रूपमा अवलोकन गर्नुहोस्।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Yajaman Navigation Sub-menu Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200 dark:border-stone-800">
              {[
                { id: 'feed', label: 'सामुदायिक फिड', icon: MessageSquare, highlight: true },
                { id: 'rashifal', label: 'मेरो व्यक्तिगत राशिफल', icon: Sparkles, highlight: true },
                { id: 'create_post', label: '+ नयाँ पोस्ट', icon: Plus },
                { id: 'dashboard', label: 'सेवा वर्गहरू', icon: Compass },
                { id: 'book_service', label: 'सेवा Book गर्नुहोस्', icon: Sparkles },
                { id: 'my_bookings', label: 'मेरो Bookings', icon: Calendar },
                { id: 'providers', label: 'विशेषज्ञ सूची', icon: Users },
                { id: 'how_to_use', label: 'प्रयोग विधि', icon: FileText },
                { id: 'rules', label: 'सामुदायिक नियम', icon: ShieldCheck },
                { id: 'admin_moderation', label: 'नियन्त्रण केन्द्र', icon: ShieldAlert },
                { id: 'notifications', label: 'सूचनाहरू', icon: Bell },
                { id: 'profile', label: 'मेरो प्रोफाइल', icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = yajamanTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === 'create_post' && !isAuthenticated) {
                        triggerLoginGate('सामुदायिक पोस्ट वा सेवा विवरण प्रकाशित गर्न पहिले लगइन वा दर्ता गर्नुहोस्।', 'नयाँ पोस्ट सिर्जना');
                        return;
                      }
                      if (tab.id === 'book_service' && !isAuthenticated) {
                        triggerLoginGate('वैदिक सेवा Book गर्न र पुरोहित/ज्योतिषीसँग जोडिन पहिले लगइन वा दर्ता गर्नुहोस्।', 'सेवा बुकिङ');
                        return;
                      }
                      if (tab.id === 'my_bookings' && !isAuthenticated) {
                        triggerLoginGate('तपाईंको बुकिङ र अर्डर स्थिति हेर्न पहिले लगइन गर्नुहोस्।', 'मेरो बुकिङहरू');
                        return;
                      }
                      if (tab.id === 'notifications' && !isAuthenticated) {
                        triggerLoginGate('तपाईंको सूचनाहरू हेर्न पहिले लगइन गर्नुहोस्।', 'सूचनाहरू');
                        return;
                      }
                      if (tab.id === 'profile' && !isAuthenticated) {
                        triggerLoginGate('तपाईंको प्रोफाइल हेर्न पहिले लगइन गर्नुहोस्।', 'मेरो प्रोफाइल');
                        return;
                      }
                      setYajamanTab(tab.id as any);
                    }}
                    className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                      isActive
                        ? 'bg-[#7A1C1C] text-white border-[#5A1212] shadow-sm'
                        : tab.highlight
                        ? 'bg-amber-100/80 dark:bg-amber-950/60 text-[#7A1C1C] dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200'
                        : 'bg-white dark:bg-[#262320] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPortalMode('PROVIDER')}
                className="ml-auto px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 cursor-pointer shrink-0"
                title="सेवा प्रदायक पोर्टलमा जानुहोस्"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>सेवा प्रदायक</span>
              </button>
            </div>

            {/* TAB 0: COMMUNITY FEED (PUBLIC & SOCIAL) */}
            {yajamanTab === 'feed' && (
              <div className="space-y-6">
                {/* Feed Header Banner */}
                <div className="bg-gradient-to-r from-[#7A1C1C] via-[#92400E] to-[#B45309] text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-xl">
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-bold text-amber-200">
                        सामुदायिक वैदिक सेवा मञ्च (Community Portal)
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
                        वैदिक सेवा, पूजा-पाठ, विवाह तथा कर्मकाण्ड फिड
                      </h2>
                      <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                        विभिन्न क्षेत्रका प्रमाणित पुरोहित, ज्योतिषी र यजमानहरूले साझा गरेका धार्मिक सेवा, सामग्री, साइत तथा अनुभवहरू हेर्नुहोस्।
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenCreatePost}
                        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ नयाँ पोस्ट राख्नुहोस्</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setYajamanTab('how_to_use')}
                        className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>प्रयोग विधि हेर्नुहोस्</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feed Search & Filter Bar */}
                <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-amber-200/70 dark:border-stone-800 shadow-sm space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Search input */}
                    <div className="sm:col-span-6 relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                      <input
                        type="text"
                        value={feedSearch}
                        onChange={(e) => setFeedSearch(e.target.value)}
                        placeholder="पूजाको नाम, स्थान वा पण्डितको नाम खोज्नुहोस्..."
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                      />
                    </div>

                    {/* District filter */}
                    <div className="sm:col-span-3">
                      <select
                        value={feedDistrict}
                        onChange={(e) => setFeedDistrict(e.target.value)}
                        className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                      >
                        <option value="all">सबै जिल्ला / क्षेत्र</option>
                        <option value="काठमाडौँ">काठमाडौँ</option>
                        <option value="ललितपुर">ललितपुर</option>
                        <option value="भक्तपुर">भक्तपुर</option>
                        <option value="कास्की">कास्की (पोखरा)</option>
                        <option value="चितवन">चितवन</option>
                        <option value="झापा">झापा</option>
                        <option value="मोरङ">मोरङ (विराटनगर)</option>
                        <option value="रुपन्देही">रुपन्देही (बुटवल)</option>
                      </select>
                    </div>

                    {/* Sort option */}
                    <div className="sm:col-span-3">
                      <select
                        value={feedSort}
                        onChange={(e) => setFeedSort(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                      >
                        <option value="latest">नवीनतम (Latest)</option>
                        <option value="popular">धेरै मन पराइएका (Popular)</option>
                        <option value="shares">धेरै सेयर भएका (Shares)</option>
                        <option value="verified">प्रमाणित विशेषज्ञ मात्र (Verified)</option>
                      </select>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                    <button
                      type="button"
                      onClick={() => setFeedCategory('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        feedCategory === 'all'
                          ? 'bg-[#7A1C1C] text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      सबै वर्ग ({posts.length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFeedCategory(cat.nameNepali)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          feedCategory === cat.nameNepali || feedCategory === cat.id
                            ? 'bg-[#7A1C1C] text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        {cat.nameNepali}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posts Feed Grid */}
                {filteredFeedPosts.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#1E1B18] rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mx-auto text-[#7A1C1C]">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      कुनै पनि पोस्ट फेला परेन
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      तपाईंको खोज अनुसार पोस्ट उपलब्ध छैन। कृपया फिल्टर परिवर्तन गर्नुहोस् वा पहिलो पोस्ट सिर्जना गर्नुहोस्।
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenCreatePost}
                      className="px-4 py-2 bg-[#7A1C1C] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      + नयाँ पोस्ट राख्नुहोस्
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredFeedPosts.map((post) => (
                      <YajamanPostCard
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId}
                        isLoggedIn={isAuthenticated}
                        onLikeClick={handleLikePost}
                        onShareClick={handleSharePost}
                        onCardClick={handleOpenPostDetail}
                        onSaveClick={handleSavePost}
                        onRequestServiceClick={handleRequestServiceFromPost}
                        onReportClick={(p) => handleOpenReportModal({ type: 'POST', id: p.id, nameOrTitle: p.title })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PERSONALIZED RASHIFAL DASHBOARD */}
            {yajamanTab === 'rashifal' && (
              <div className="space-y-6">
                <PersonalizedRashifalDashboard
                  profile={userProfileForRashifal}
                  todayPanchanga={computedPanchanga}
                  todayAD={todayAD}
                  todayBS={propTodayBS}
                  transitPlanets={transitPlanets}
                  onUpdateProfile={(updated) => {
                    setCustomizedProfile(updated);
                    const currentRbac = rbacSession || getActiveRBACSession();
                    const currentUserId = currentRbac?.userId || activeYajaman?.id || 'client_subash_khanal';
                    saveUserPersonalBirthProfile(currentUserId, updated);
                    if (onUpdateProfile) onUpdateProfile(updated);
                  }}
                />
              </div>
            )}

            {/* TAB: CREATE POST */}
            {yajamanTab === 'create_post' && (
              <YajamanCreatePostForm
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserRole={activeProvider ? 'PANDIT' : 'YAJAMAN'}
                currentUserPhone={activeYajaman?.mobile || activeProvider?.mobile}
                currentUserEmail={activeYajaman?.email || activeProvider?.email}
                currentUserDistrict={activeYajaman?.district || activeProvider?.district}
                currentUserLocalLevel={activeYajaman?.localLevel || activeProvider?.localLevel}
                isVerified={activeProvider?.isVerified || false}
                onPostCreated={(newPost) => {
                  setPosts(getStoredYajamanPosts());
                  showToast('तपाईंको पोस्ट सफलतापूर्वक प्रकाशित भयो!', 'success');
                  setYajamanTab('feed');
                }}
                onCancel={() => setYajamanTab('feed')}
              />
            )}

            {/* TAB: HOW TO USE (7 STEPS) */}
            {yajamanTab === 'how_to_use' && (
              <YajamanHowToUseSection />
            )}

            {/* TAB: COMMUNITY RULES & TERMS (10 RULES) */}
            {yajamanTab === 'rules' && (
              <YajamanRulesSection />
            )}

            {/* TAB: ADMIN MODERATION PANEL */}
            {yajamanTab === 'admin_moderation' && (
              <YajamanAdminModerationPanel
                currentUserId={currentUserId || 'admin_1'}
                currentUserName={currentUserName || 'व्यवस्थापक'}
                onRefreshData={refreshData}
              />
            )}

              {/* Tab 1: Dashboard Overview */}
              {yajamanTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Banner CTA Box */}
                  <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-3xl p-6 shadow-xl border border-amber-500/30 relative overflow-hidden">
                    <div className="relative z-10 space-y-3 max-w-xl">
                      <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-bold text-amber-300">
                        स्थान-आधारित तत्काल म्याचिङ (GPS Match)
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-amber-100 leading-tight">
                        तपाईंको क्षेत्रका ३ KM देखि ३० KM भित्रका भरपर्दा ज्योतिषी र पुरोहित सेवा बुक गर्नुहोस्
                      </h3>
                      <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                        विवाह, गृहप्रवेश, कुण्डली, व्रतबन्ध, सत्यनारायण पुजा, वास्तु तथा कर्मकाण्डका लागि प्रमाणित विशेषज्ञहरूसँग तत्काल जोडिनुहोस्।
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAuthenticated) {
                            triggerLoginGate('वैदिक सेवा Book गर्न र विशेषज्ञसँग जोडिन पहिले लगइन वा दर्ता गर्नुहोस्।', 'सेवा बुकिङ');
                            return;
                          }
                          setYajamanTab('book_service');
                        }}
                        className="mt-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>सेवा Book सुरु गर्नुहोस्</span>
                      </button>
                    </div>
                  </div>

                  {/* Personalized Rashifal Promo Banner */}
                  <div
                    onClick={() => setYajamanTab('rashifal')}
                    className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-400/40 hover:border-amber-500/80 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform">
                        ✨
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                            बृहत् वैदिक व्यक्तिगत राशिफल
                          </h4>
                          <span className="text-[10px] bg-rose-500/20 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">
                            तपाईंको आफ्नै राशिफल
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                          दैनिक, मासिक तथा वार्षिक व्यक्तिगत गोचर, अष्टकवर्ग, ताराबल र शुभ-अशुभ प्रभाव अवलोकन गर्नुहोस्।
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-[#7A1C1C] hover:bg-[#92400E] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <span>राशिफल हेर्नुहोस्</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#262320] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                      <p className="text-xs text-stone-500 font-semibold">सक्रिय Request</p>
                      <p className="text-2xl font-black text-[#D97706]">
                        {activeYajaman ? requests.filter((r) => r.yajamanId === activeYajaman.id && r.status === 'MATCHING').length : 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#262320] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                      <p className="text-xs text-stone-500 font-semibold">स्वीकृत बुकिङ (Accepted)</p>
                      <p className="text-2xl font-black text-emerald-600">
                        {activeYajaman ? bookings.filter((b) => b.yajamanId === activeYajaman.id && b.status === 'ACCEPTED').length : 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#262320] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                      <p className="text-xs text-stone-500 font-semibold">सम्पन्न सेवाहरू (Completed)</p>
                      <p className="text-2xl font-black text-blue-600">
                        {activeYajaman ? bookings.filter((b) => b.yajamanId === activeYajaman.id && b.status === 'COMPLETED').length : 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#262320] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
                      <p className="text-xs text-stone-500 font-semibold">उपलब्ध विशेषज्ञहरू</p>
                      <p className="text-2xl font-black text-stone-800 dark:text-stone-200">
                        {providers.filter((p) => p.isAvailable).length}
                      </p>
                    </div>
                  </div>

                  {/* Service Categories Grid */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#D97706]" />
                      <span>उपलब्ध वैदिक सेवा वर्गहरू (Service Categories)</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            if (!isAuthenticated) {
                              triggerLoginGate(`'${cat.nameNepali}' सेवा Book गर्न र विशेषज्ञसँग जोडिन पहिले लगइन वा दर्ता गर्नुहोस्।`, 'सेवा बुकिङ');
                              return;
                            }
                            setSelectedCategory(cat);
                            setCustomServiceType(cat.nameNepali);
                            setYajamanTab('book_service');
                          }}
                          className="bg-white dark:bg-[#262320] p-4 rounded-2xl border border-amber-200/50 dark:border-stone-800 hover:border-[#D97706] hover:shadow-md transition-all cursor-pointer group space-y-2"
                        >
                          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#D97706] flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                            ✨
                          </div>
                          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#D97706] transition-colors">
                            {cat.nameNepali}
                          </h4>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                            {cat.descriptionNepali}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Book Service Wizard */}
              {yajamanTab === 'book_service' && (
                <div className="max-w-3xl mx-auto bg-white dark:bg-[#262320] rounded-3xl p-6 sm:p-8 border border-amber-200/60 dark:border-stone-800 shadow-lg space-y-6">
                  <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                    <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">नयाँ सेवा अनुरोध</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                      वैदिक सेवा Book गर्नुहोस्
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      ३ KM बाट सुरु भई आवश्यकता अनुसार ३० KM सम्मका नजिकका प्रमाणित विशेषज्ञसँग जोडिनुहोस्।
                    </p>
                  </div>

                  {/* Steps Progress */}
                  <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
                    {[
                      { step: 1, title: '१. वर्ग' },
                      { step: 2, title: '२. मिति/समय' },
                      { step: 3, title: '३. स्थान (GPS)' },
                      { step: 4, title: '४. म्याचिङ (3KM+)' },
                    ].map((s) => (
                      <div
                        key={s.step}
                        onClick={() => setWizardStep(s.step as any)}
                        className={`flex-1 text-center py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          wizardStep === s.step
                            ? 'bg-[#D97706] text-white shadow-sm'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {s.title}
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Category Selection */}
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                        सेवा वर्ग (Category) छान्नुहोस्:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setCustomServiceType(cat.nameNepali);
                            }}
                            className={`p-3.5 rounded-2xl text-left border text-xs sm:text-sm font-bold transition-all ${
                              selectedCategory?.id === cat.id
                                ? 'bg-amber-100 dark:bg-amber-950/80 border-[#D97706] text-[#D97706] dark:text-amber-300 shadow-md ring-2 ring-[#D97706]/30'
                                : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-300'
                            }`}
                          >
                            <p className="font-bold">{cat.nameNepali}</p>
                            <p className="text-[10px] text-stone-500 font-normal mt-0.5">{cat.nameEnglish}</p>
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          विशिष्ट सेवा / पूजाको नाम
                        </label>
                        <input
                          type="text"
                          value={customServiceType}
                          onChange={(e) => setCustomServiceType(e.target.value)}
                          placeholder="उदा: गृहप्रवेश वास्तुशान्ति पूजा, विवाह मण्डप पूजा..."
                          className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-[#D97706] outline-none"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-6 py-2.5 bg-[#D97706] text-white text-xs font-bold rounded-xl hover:bg-[#B45309] transition-all flex items-center gap-1.5"
                        >
                          <span>अगाडि बढ्नुहोस् (मिति र समय)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Date and Time */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                            इच्छित सेवा मिति (वि.सं.) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={prefDateBS}
                            onChange={(e) => setPrefDateBS(e.target.value)}
                            placeholder="२०८१-०५-२०"
                            className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-[#D97706] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                            इच्छित समय <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={prefTime}
                            onChange={(e) => setPrefTime(e.target.value)}
                            className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-[#D97706] outline-none"
                          >
                            <option value="बिहान ०७:०० बजे">बिहान ०७:०० बजे</option>
                            <option value="बिहान ०८:०० बजे">बिहान ०८:०० बजे</option>
                            <option value="बिहान ०९:०० बजे">बिहान ०९:०० बजे</option>
                            <option value="बिहान १०:०० बजे (शुभ मुहूर्तम)">बिहान १०:०० बजे (शुभ मुहूर्तम)</option>
                            <option value="दिउँसो ०१:०० बजे">दिउँसो ०१:०० बजे</option>
                            <option value="बेलुका ०५:०० बजे">बेलुका ०५:०० बजे</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          विशेष आवश्यकता / सामग्री सम्बन्धी जानकारी
                        </label>
                        <textarea
                          rows={3}
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="उदा: हवन कुण्ड र पूजा सामग्री पुरोहित ज्युले ल्याउनुपर्ने वा हवन सामग्री घरमै तयारी रहनेछ..."
                          className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#D97706] outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-xl"
                        >
                          पछाडि
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-6 py-2.5 bg-[#D97706] text-white text-xs font-bold rounded-xl hover:bg-[#B45309] transition-all flex items-center gap-1.5"
                        >
                          <span>अगाडि बढ्नुहोस् (स्थान)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Service Location */}
                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          अनुष्ठान / सेवा हुने स्थान विवरण
                        </label>
                        <input
                          type="text"
                          value={serviceLocationText}
                          onChange={(e) => setServiceLocationText(e.target.value)}
                          placeholder="उदा: काठमाडौँ महानगरपालिका वडा नं. २२, न्युरोड"
                          className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-[#D97706] outline-none"
                        />
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-300/60 dark:border-amber-800/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                            स्थान आधारित म्याचिङको लागि GPS Coordinates:
                          </span>
                          <button
                            type="button"
                            onClick={requestGpsLocation}
                            className="px-3 py-1 bg-[#D97706] text-white text-[11px] font-bold rounded-lg hover:bg-[#B45309]"
                          >
                            पुनः स्थान अपडेट गर्नुहोस्
                          </button>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-mono">
                          Latitude: {detectedLocation.latitude.toFixed(5)}, Longitude: {detectedLocation.longitude.toFixed(5)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-xl"
                        >
                          पछाडि
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(4)}
                          className="px-6 py-2.5 bg-[#D97706] text-white text-xs font-bold rounded-xl hover:bg-[#B45309] transition-all flex items-center gap-1.5"
                        >
                          <span>अन्तिम समीक्षा र म्याचिङ सुरु</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Summary & Submit Matching */}
                  {wizardStep === 4 && (
                    <div className="space-y-5">
                      <div className="bg-stone-50 dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                        <p className="font-bold text-sm text-stone-900 dark:text-stone-100 border-b border-stone-200 pb-2">
                          अनुरोध विवरण समीक्षा (Review Request):
                        </p>
                        <p><strong>सेवा वर्ग:</strong> {selectedCategory?.nameNepali}</p>
                        <p><strong>सेवाको नाम:</strong> {customServiceType}</p>
                        <p><strong>इच्छित मिति/समय:</strong> {prefDateBS} | {prefTime}</p>
                        <p><strong>स्थान:</strong> {serviceLocationText}</p>
                        {additionalNotes && <p><strong>विशेष टिप्पणी:</strong> {additionalNotes}</p>}
                      </div>

                      {/* Privacy Disclaimer */}
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800/40 text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
                        <p className="font-bold flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>गोपनीयता र सुरक्षा ग्यारेन्टी (Privacy Protection)</span>
                        </p>
                        <p className="text-[11px] opacity-90">
                          विशेषज्ञले बुकिङ स्वीकार (Accept) नगरेसम्म तपाईंको व्यक्तिगत फोन नम्बर, इमेल र exact घरको ठेगाना पूर्णरूपमा गोप्य (Hidden) रहनेछ।
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-xl"
                        >
                          सच्याउनुहोस्
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitServiceRequest}
                          className="px-8 py-3 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] text-white text-sm font-black rounded-xl shadow-lg transition-all flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>३ KM परिधिमा विशेषज्ञ खोज्नुहोस्</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: My Bookings & Request Status */}
              {yajamanTab === 'my_bookings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#D97706]" />
                      <span>तपाईंका बुकिङ तथा सेवा अनुरोध सूची</span>
                    </h3>
                    <button
                      type="button"
                      onClick={refreshData}
                      className="p-2 text-stone-500 hover:text-[#D97706] transition-colors"
                      title="रिफ्रेस गर्नुहोस्"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active Requests Matching Box */}
                  {requests.filter((r) => activeYajaman && r.yajamanId === activeYajaman.id).map((req) => {
                    const matchedProviders = getStoredServiceProviders().filter((p) =>
                      calculateProviderMatchScore(p, req, req.currentRadiusKm).isEligible
                    );

                    return (
                      <div
                        key={req.id}
                        className="bg-white dark:bg-[#262320] rounded-3xl p-5 border-2 border-amber-300 dark:border-amber-800/60 shadow-md space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-[#D97706]">
                                कोड: {req.bookingCode}
                              </span>
                              <span className="text-xs font-bold text-stone-500">
                                {req.createdAtBS}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                              {req.serviceType} ({req.categoryNameNepali})
                            </h4>
                          </div>

                          {/* Geolocation Radius Badge */}
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-300">
                            <Navigation className="w-4 h-4 text-[#D97706] animate-spin" />
                            <span className="text-xs font-extrabold text-[#D97706]">
                              खोज परिधि: {req.currentRadiusKm} KM भित्र
                            </span>
                          </div>
                        </div>

                        {/* Pathao Style Radius Progressive Controls */}
                        <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-2xl space-y-3">
                          <p className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#D97706]" />
                            <span>प्रोग्रेसिभ लोकेसन म्याचिङ (३ KM ➔ ३० KM):</span>
                          </p>

                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {MATCHING_RADIUS_STEPS.map((r) => (
                              <span
                                key={r}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                  req.currentRadiusKm === r
                                    ? 'bg-[#D97706] text-white shadow-sm'
                                    : req.currentRadiusKm > r
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                                }`}
                              >
                                {r} KM
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <p className="text-xs text-stone-600 dark:text-stone-400">
                              {req.currentRadiusKm} KM भित्र भेटिएका विशेषज्ञ: <strong>{matchedProviders.length} जना</strong>
                            </p>
                            {req.currentRadiusKm < 30 && (
                              <button
                                type="button"
                                onClick={() => handleExpandRadius(req.id)}
                                className="px-3 py-1.5 bg-[#D97706] text-white text-xs font-bold rounded-xl hover:bg-[#B45309] transition-all flex items-center gap-1"
                              >
                                <span>अगिल्लो परिधिमा खोज्नुहोस्</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* List of Matched Providers for this request */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                            {req.currentRadiusKm} KM परिधि भित्रका विशेषज्ञ कार्डहरू:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {matchedProviders.map((p) => {
                              const dist = calculateDistanceKm(
                                req.location.latitude,
                                req.location.longitude,
                                p.location.latitude,
                                p.location.longitude
                              );

                              return (
                                <div
                                  key={p.id}
                                  className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2"
                                >
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={p.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
                                      alt={p.fullName}
                                      className="w-10 h-10 rounded-full object-cover border border-amber-300"
                                    />
                                    <div>
                                      <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                        {p.fullName}
                                      </h5>
                                      <p className="text-[10px] text-stone-500">{p.title}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-2">
                                    <span className="font-bold text-[#D97706]">📍 {dist} km टाढा</span>
                                    <span className="text-amber-500 font-bold">★ {p.rating}</span>
                                    <span className="flex items-center gap-1 text-stone-400">
                                      <Lock className="w-3 h-3" />
                                      <span>सम्पर्क गोप्य</span>
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Accepted Bookings List with Unlocked Contacts */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                      स्वीकृत बुकिङहरू (Accepted & Confirmed Bookings)
                    </h4>

                    {bookings.filter((b) => activeYajaman && b.yajamanId === activeYajaman.id).length === 0 ? (
                      <div className="p-8 text-center bg-white dark:bg-[#262320] rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-400 text-xs">
                        हाल स्वीकृत भएको कुनै बुकिङ छैन।
                      </div>
                    ) : (
                      bookings.filter((b) => activeYajaman && b.yajamanId === activeYajaman.id).map((b) => (
                        <div
                          key={b.id}
                          className="bg-white dark:bg-[#262320] p-5 rounded-3xl border border-amber-200 dark:border-stone-800 shadow-sm space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                            <div>
                              <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-md">
                                {b.status === 'ACCEPTED' ? 'स्वीकृत (ACCEPTED)' : b.status}
                              </span>
                              <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                                {b.serviceType}
                              </h4>
                            </div>

                            <p className="text-xs font-bold text-[#D97706]">
                              बुकिङ कोड: {b.bookingCode}
                            </p>
                          </div>

                          {/* Unlocked Contact Details Box */}
                          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800/40 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                              <Unlock className="w-4 h-4 text-emerald-600" />
                              <span>सम्पर्क विवरण आदान-प्रदान भयो (Contact Unlocked):</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-800 dark:text-stone-200">
                              <div>
                                <p className="text-stone-500 text-[11px]">सेवा प्रदायकको नाम:</p>
                                <p className="font-bold text-stone-900 dark:text-stone-100">{b.providerName}</p>
                              </div>
                              <div>
                                <p className="text-stone-500 text-[11px]">मोबाइल नम्बर:</p>
                                <a href={`tel:${b.providerPhone}`} className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{b.providerPhone}</span>
                                </a>
                              </div>
                              <div>
                                <p className="text-stone-500 text-[11px]">अनुष्ठान मिति:</p>
                                <p className="font-bold">{b.appointmentDateBS} ({b.appointmentTime})</p>
                              </div>
                              <div>
                                <p className="text-stone-500 text-[11px]">दूरी (Calculated Distance):</p>
                                <p className="font-bold text-[#D97706]">{b.calculatedDistanceKm} KM टाढा</p>
                              </div>
                            </div>

                            {/* Secure Communication Action Bar */}
                            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/40 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveChatBooking(b)}
                                className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>सुरक्षित च्याट (Chat)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const session = initiateCallSession(
                                    b.id,
                                    b.yajamanId,
                                    activeYajaman?.fullName || 'यजमान',
                                    'YAJAMAN',
                                    activeYajaman?.profilePhoto,
                                    b.providerId,
                                    b.providerName,
                                    'PROVIDER',
                                    undefined
                                  );
                                  setActiveCallSession(session);
                                }}
                                className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>अडियो कल</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const session = initiateCallSession(
                                    b.id,
                                    b.yajamanId,
                                    activeYajaman?.fullName || 'यजमान',
                                    'YAJAMAN',
                                    activeYajaman?.profilePhoto,
                                    b.providerId,
                                    b.providerName,
                                    'PROVIDER',
                                    undefined
                                  );
                                  setActiveCallSession(session);
                                }}
                                className="py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>भिडियो कल</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setReviewBooking(b)}
                                className="py-2 px-3 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Star className="w-3.5 h-3.5 text-amber-400" />
                                <span>मूल्याङ्कन</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setReportTarget({ targetUserId: b.providerId, targetUserName: b.providerName, bookingId: b.id })}
                                className="py-2 px-2.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 rounded-xl text-xs font-bold flex items-center justify-center"
                                title="रिपोर्ट वा ब्लक गर्नुहोस्"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Explore Providers */}
              {yajamanTab === 'providers' && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="bg-white dark:bg-[#262320] p-4 rounded-2xl border border-amber-200/60 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="नाम, पद वा विशेषज्ञता खोज्नुहोस्..."
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#D97706] outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                      <select
                        value={filterCatId}
                        onChange={(e) => setFilterCatId(e.target.value)}
                        className="px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold outline-none"
                      >
                        <option value="all">सबै सेवा वर्ग</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.nameNepali}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Provider Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProvidersList.map((p) => {
                      const dist = calculateDistanceKm(
                        activeYajaman?.location?.latitude || DEFAULT_NEPAL_LOCATION.latitude,
                        activeYajaman?.location?.longitude || DEFAULT_NEPAL_LOCATION.longitude,
                        p.location.latitude,
                        p.location.longitude
                      );

                      return (
                        <div
                          key={p.id}
                          className="bg-white dark:bg-[#262320] rounded-3xl p-5 border border-amber-200/60 dark:border-stone-800 shadow-sm hover:shadow-md transition-all space-y-4"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={p.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
                              alt={p.fullName}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                  {p.fullName}
                                </h4>
                                {p.isVerified && (
                                  <span title="प्रमाणित विशेषज्ञ">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{p.title}</p>
                              <p className="text-[11px] text-[#D97706] font-bold mt-1">
                                📍 {dist} km टाढा | अनुभव {p.experienceYears} वर्ष
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <p className="text-stone-500 font-semibold text-[11px]">विशेषज्ञता (Expertise):</p>
                            <div className="flex flex-wrap gap-1">
                              {p.expertise.map((exp, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 rounded-md text-[10px] font-bold border border-amber-200/50"
                                >
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Masked Contact Details Note */}
                          <div className="bg-stone-50 dark:bg-stone-900 p-2.5 rounded-xl text-[11px] text-stone-500 flex items-center justify-between border border-stone-200 dark:border-stone-800">
                            <span className="flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-stone-400" />
                              <span>सम्पर्क: {maskPhoneNumber(p.mobile)}</span>
                            </span>
                            <span className="text-amber-500 font-bold">★ {p.rating} ({p.completedServicesCount}+)</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!isAuthenticated) {
                                triggerLoginGate(`${p.fullName} सँग सेवा अनुरोध पठाउन पहिले लगइन वा दर्ता गर्नुहोस्।`, 'सेवा अनुरोध');
                                return;
                              }
                              setSelectedCategory(categories[0]);
                              setCustomServiceType(`${p.fullName} को लागि सेवा Book`);
                              setYajamanTab('book_service');
                            }}
                            className="w-full py-2 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white rounded-xl text-xs font-bold shadow-sm hover:brightness-110 cursor-pointer"
                          >
                            सेवा अनुरोध पठाउनुहोस्
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 5: Notifications */}
              {yajamanTab === 'notifications' && (
                <div className="bg-white dark:bg-[#262320] rounded-3xl p-6 border border-amber-200/60 dark:border-stone-800 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#D97706]" />
                    <span>सूचना तथा अपडेटहरू (Notifications)</span>
                  </h3>

                  <div className="space-y-2">
                    {notifications.filter((n) => activeYajaman && n.recipientId === activeYajaman.id).length === 0 ? (
                      <p className="text-xs text-stone-400 py-6 text-center">हाल कुनै सूचना छैन।</p>
                    ) : (
                      notifications.filter((n) => activeYajaman && n.recipientId === activeYajaman.id).map((notif) => (
                        <div
                          key={notif.id}
                          className="p-3.5 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-stone-900 dark:text-stone-100">{notif.title}</p>
                            <span className="text-[10px] text-stone-400">{notif.timestampBS}</span>
                          </div>
                          <p className="text-stone-600 dark:text-stone-300">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 6: Profile */}
              {yajamanTab === 'profile' && activeYajaman && (
                <div className="bg-white dark:bg-[#262320] rounded-3xl p-6 border border-amber-200/60 dark:border-stone-800 shadow-sm space-y-4 max-w-xl mx-auto">
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 border-b pb-3">
                    मेरो प्रोफाइल (Yajaman Profile)
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="text-stone-500">पूरा नाम:</p>
                      <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{activeYajaman.fullName}</p>
                    </div>
                    <div>
                      <p className="text-stone-500">मोबाइल नम्बर:</p>
                      <p className="font-bold text-stone-900 dark:text-stone-100">{activeYajaman.mobile}</p>
                    </div>
                    <div>
                      <p className="text-stone-500">स्थान / ठेगाना:</p>
                      <p className="font-bold text-stone-900 dark:text-stone-100">
                        {activeYajaman.address}, {activeYajaman.localLevel}, {activeYajaman.district}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
        ) : (
          /* =================================================== */
          /* SERVICE PROVIDER PORTAL VIEW                        */
          /* =================================================== */
          !activeProvider ? (
            /* Unauthenticated Provider Login */
            <div className="max-w-md mx-auto bg-white dark:bg-[#262320] rounded-3xl p-6 sm:p-8 border border-amber-200/60 dark:border-stone-800 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/50 rounded-2xl flex items-center justify-center mx-auto text-[#D97706] stroke-2 border border-amber-300">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  सेवा प्रदायक लगइन (Provider Portal)
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  ज्योतिषी, पुरोहित, पण्डित तथा वास्तु विशेषज्ञहरूका लागि यजमानबाट प्राप्त अनुरोध व्यवस्थापन गर्ने प्रवेशद्वार
                </p>
              </div>

              <form onSubmit={handleProviderSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    दर्ता गरिएको मोबाइल नम्बर वा नाम
                  </label>
                  <input
                    type="text"
                    required
                    value={pSignInForm.mobile}
                    onChange={(e) => setPSignInForm({ mobile: e.target.value })}
                    placeholder="उदा: ९८५१०१२३४५"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold text-sm rounded-xl shadow-md"
                >
                  प्रदायक पोर्टलमा लगइन गर्नुहोस्
                </button>
              </form>
            </div>
          ) : (
            /* Logged-in Provider View */
            <div className="space-y-6">
              {/* Provider Header Bar */}
              <div className="bg-white dark:bg-[#262320] rounded-2xl p-4 sm:p-5 border border-amber-200/60 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={activeProvider.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'}
                    alt={activeProvider.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                        {activeProvider.fullName}
                      </h2>
                      <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-md">
                        प्रमाणित विशेषज्ञ
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {activeProvider.title} | 📍 {activeProvider.district}
                    </p>
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...activeProvider, isAvailable: !activeProvider.isAvailable };
                      setActiveProvider(updated);
                      setActiveProviderSession(updated);
                      const all = getStoredServiceProviders();
                      const idx = all.findIndex((p) => p.id === updated.id);
                      if (idx !== -1) {
                        all[idx] = updated;
                        saveServiceProviders(all);
                      }
                      showToast(`स्थिति परिवर्तन भयो: ${updated.isAvailable ? 'सक्रिय / उपलब्ध' : 'निस्क्रिय'}`, 'info');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      activeProvider.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${activeProvider.isAvailable ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
                    <span>{activeProvider.isAvailable ? 'सक्रिय / उपलब्ध (Available)' : 'निस्क्रिय (Offline)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveProvider(null);
                      setActiveProviderSession(null);
                    }}
                    className="p-2 text-stone-400 hover:text-rose-600 bg-stone-100 dark:bg-stone-800 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Provider Request Feed */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#D97706]" />
                  <span>प्राप्त सेवा अनुरोधहरू (Incoming Requests)</span>
                </h3>

                {requests.filter((r) => r.status === 'MATCHING').length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-[#262320] rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-400">
                    हाल कुनै नयाँ सेवा अनुरोध प्राप्त भएको छैन।
                  </div>
                ) : (
                  requests.filter((r) => r.status === 'MATCHING').map((req) => {
                    const dist = calculateDistanceKm(
                      activeProvider.location.latitude,
                      activeProvider.location.longitude,
                      req.location.latitude,
                      req.location.longitude
                    );

                    return (
                      <div
                        key={req.id}
                        className="bg-white dark:bg-[#262320] rounded-3xl p-5 border-2 border-amber-300 dark:border-amber-800 shadow-md space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                          <div>
                            <span className="px-2 py-0.5 text-[10px] font-black bg-amber-100 text-[#D97706] rounded-md">
                              कोड: {req.bookingCode}
                            </span>
                            <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                              {req.serviceType} ({req.categoryNameNepali})
                            </h4>
                          </div>

                          <span className="text-xs font-black text-[#D97706] bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-xl border border-amber-300">
                            📍 {dist} KM टाढा
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300">
                          <p><strong>इच्छित मिति/समय:</strong> {req.preferredDateBS} ({req.preferredTime})</p>
                          <p><strong>अनुमानित स्थान:</strong> {maskAddress(req.location.addressName)}</p>
                        </div>

                        {/* Masked Contact Info Disclaimer */}
                        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-300/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Lock className="w-4 h-4 text-[#D97706]" />
                            <span>यजमान फोन: {maskPhoneNumber(req.yajamanMobile)}</span>
                          </span>
                          <span className="text-[11px] font-medium opacity-80">
                            (स्वीकार गरेपछि मात्र यजमानको नाम र फोन खुल्नेछ)
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptRequestByProvider(req.id)}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Accept Request (स्वीकार गर्नुहोस्)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )
        )}
      </main>

      {/* Communication Modals */}
      {activeChatBooking && (
        <SecureChatPanel
          bookingId={activeChatBooking.id}
          bookingCode={activeChatBooking.bookingCode}
          currentUserId={activeYajaman?.id || activeProvider?.id || 'guest'}
          currentUserName={activeYajaman?.fullName || activeProvider?.fullName || 'प्रयोगकर्ता'}
          currentUserType={portalMode === 'YAJAMAN' ? 'YAJAMAN' : 'PROVIDER'}
          peerUserId={portalMode === 'YAJAMAN' ? activeChatBooking.providerId : activeChatBooking.yajamanId}
          peerUserName={portalMode === 'YAJAMAN' ? activeChatBooking.providerName : activeChatBooking.yajamanName}
          peerUserPhone={portalMode === 'YAJAMAN' ? activeChatBooking.providerPhone : ((activeChatBooking as any).yajamanMobile || activeChatBooking.yajamanPhone)}
          onClose={() => setActiveChatBooking(null)}
          onInitiateCall={(session) => {
            setActiveChatBooking(null);
            setActiveCallSession(session);
          }}
          onReportUser={() => {
            const peerId = portalMode === 'YAJAMAN' ? activeChatBooking.providerId : activeChatBooking.yajamanId;
            const peerName = portalMode === 'YAJAMAN' ? activeChatBooking.providerName : activeChatBooking.yajamanName;
            setActiveChatBooking(null);
            setReportTarget({ targetUserId: peerId, targetUserName: peerName, bookingId: activeChatBooking.id });
          }}
        />
      )}

      {activeCallSession && (
        <InAppCallModal
          session={activeCallSession}
          currentUserId={activeYajaman?.id || activeProvider?.id || 'guest'}
          onClose={() => setActiveCallSession(null)}
        />
      )}

      {reportTarget && (
        <ReportBlockModal
          reporterId={activeYajaman?.id || activeProvider?.id || 'guest'}
          reporterName={activeYajaman?.fullName || activeProvider?.fullName || 'प्रयोगकर्ता'}
          reporterType={portalMode === 'YAJAMAN' ? 'YAJAMAN' : 'PROVIDER'}
          reportedUserId={reportTarget.targetUserId}
          reportedUserName={reportTarget.targetUserName}
          reportedUserType={portalMode === 'YAJAMAN' ? 'PROVIDER' : 'YAJAMAN'}
          bookingId={reportTarget.bookingId}
          onClose={() => setReportTarget(null)}
          onSuccess={(msg) => alert(msg)}
        />
      )}

      {reviewBooking && (
        <RatingReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmitSuccess={(rating, reviewText) => {
            setReviewBooking(null);
            setBookings(getStoredBookings());
            setProviders(getStoredServiceProviders());
          }}
        />
      )}

      {/* Community Social Modals */}
      {isLoginGateOpen && (
        <YajamanLoginGateModal
          isOpen={true}
          onClose={() => setIsLoginGateOpen(false)}
          onOpenLogin={() => {
            setIsLoginGateOpen(false);
            setAuthTab('signin');
            setIsAuthModalOpen(true);
          }}
          onOpenRegister={() => {
            setIsLoginGateOpen(false);
            setAuthTab('signup');
            setIsAuthModalOpen(true);
          }}
          featureName={loginGateFeatureName}
          actionMessage={loginGateActionMessage}
        />
      )}

      {selectedPostForShare && (
        <YajamanSocialShareModal
          isOpen={true}
          onClose={() => setSelectedPostForShare(null)}
          post={selectedPostForShare}
        />
      )}

      {isReportModalOpen && reportTargetInfo && (
        <YajamanReportModal
          isOpen={true}
          onClose={() => {
            setIsReportModalOpen(false);
            setReportTargetInfo(null);
          }}
          targetType={reportTargetInfo.type === 'USER' ? 'USER' : reportTargetInfo.type === 'COMMENT' ? 'COMMENT' : 'POST'}
          targetId={reportTargetInfo.id}
          targetTitleOrName={reportTargetInfo.nameOrTitle}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onReportSubmitted={() => {
            setIsReportModalOpen(false);
            setReportTargetInfo(null);
            showToast('तपाईंको रिपोर्ट व्यवस्थापकलाई पठाइयो। धन्यवाद!', 'success');
          }}
        />
      )}

      {selectedPostForDetail && (
        <YajamanPostDetailModal
          isOpen={true}
          onClose={() => setSelectedPostForDetail(null)}
          post={selectedPostForDetail}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserPhoto={activeYajaman?.profilePhoto || activeProvider?.photoUrl}
          isLoggedIn={isAuthenticated}
          onLikeClick={handleLikePost}
          onShareClick={handleSharePost}
          onSaveClick={handleSavePost}
          onRequestServiceClick={handleRequestServiceFromPost}
          onReportClick={(targetType, id, nameOrTitle) => {
            handleOpenReportModal({ type: targetType, id, nameOrTitle });
          }}
          onCommentsUpdated={() => {
            setPosts(getStoredYajamanPosts());
            const refreshed = getStoredYajamanPosts().find((p) => p.id === selectedPostForDetail.id);
            if (refreshed) setSelectedPostForDetail(refreshed);
          }}
        />
      )}

      {/* Guest Authentication Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#262320] w-full max-w-xl rounded-3xl shadow-2xl border border-amber-200 dark:border-stone-800 p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-xl text-[#7A1C1C] dark:text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                    यजमान तथा सेवा पोर्टल प्रवेश
                  </h3>
                  <p className="text-xs text-stone-500">साइन इन वा नयाँ एकाउन्ट दर्ता</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setAuthTab('signin')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  authTab === 'signin'
                    ? 'border-[#7A1C1C] text-[#7A1C1C] dark:text-amber-400'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                साइन इन (Sign In)
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('signup')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  authTab === 'signup'
                    ? 'border-[#7A1C1C] text-[#7A1C1C] dark:text-amber-400'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                नयाँ एकाउन्ट दर्ता (Sign Up)
              </button>
            </div>

            {authTab === 'signin' ? (
              <form
                onSubmit={(e) => {
                  handleYajamanSignIn(e);
                  setIsAuthModalOpen(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    मोबाइल नम्बर <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={ySignInForm.mobile}
                      onChange={(e) => setYSignInForm({ ...ySignInForm, mobile: e.target.value })}
                      placeholder="उदा: ९८४१२३४५६७"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    पासवर्ड (वैकल्पिक)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      type="password"
                      value={ySignInForm.password}
                      onChange={(e) => setYSignInForm({ ...ySignInForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#7A1C1C] to-[#92400E] hover:brightness-110 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>साइन इन गर्नुहोस्</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  handleYajamanSignUp(e);
                  setIsAuthModalOpen(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      पूरा नाम <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ySignUpForm.fullName}
                      onChange={(e) => setYSignUpForm({ ...ySignUpForm, fullName: e.target.value })}
                      placeholder="उदा: रमेश शर्मा"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      मोबाइल नम्बर <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ySignUpForm.mobile}
                      onChange={(e) => setYSignUpForm({ ...ySignUpForm, mobile: e.target.value })}
                      placeholder="उदा: ९८४१२३४५६७"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      जिल्ला <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ySignUpForm.district}
                      onChange={(e) => setYSignUpForm({ ...ySignUpForm, district: e.target.value })}
                      placeholder="उदा: काठमाडौँ"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      स्थानीय तह
                    </label>
                    <input
                      type="text"
                      value={ySignUpForm.localLevel}
                      onChange={(e) => setYSignUpForm({ ...ySignUpForm, localLevel: e.target.value })}
                      placeholder="काठमाडौँ म.न.पा."
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      टोल / ठेगाना
                    </label>
                    <input
                      type="text"
                      value={ySignUpForm.address}
                      onChange={(e) => setYSignUpForm({ ...ySignUpForm, address: e.target.value })}
                      placeholder="न्युरोड"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      पासवर्ड
                    </label>
                    <input
                      type="password"
                      value={ySignUpForm.password}
                      onChange={(e) => setYSignUpForm({ ...ySignUpForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      पासवर्ड पुनः पुष्टि
                    </label>
                    <input
                      type="password"
                      value={ySignUpForm.confirmPassword}
                      onChange={(e) => setYSignUpForm({ ...ySignUpForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#7A1C1C] to-[#92400E] hover:brightness-110 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>नयाँ एकाउन्ट सिर्जना गर्नुहोस्</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
