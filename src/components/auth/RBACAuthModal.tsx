import React, { useState, useEffect } from 'react';
import {
  SystemRole,
  RBACUser,
  RBACSession,
  authenticateRBACUser,
  registerRBACAccount,
  resetRBACUserPassword,
  getRoleLabelNepali,
  getActiveRBACSession,
  clearRBACSession
} from '../../db/rbacStore';
import { registerOrUpdateClientPolicy } from '../../db/menuControlStore';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';
import {
  User,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  KeyRound,
  MapPin,
  X,
  Clock,
  Sparkles,
  Calendar,
  Compass,
  Navigation,
  Loader2,
  Check
} from 'lucide-react';
import { BirthDetails, LocationData, Gender } from '../../types/astrology';
import { saveProfile, getStoredProfiles } from '../../db/profileStore';
import { convertBSToADFull, convertADToBSFull } from '../../utils/bsCalendarData';
import { toDevanagariNumerals, fromDevanagariNumerals } from '../../utils/nepaliCalendar';
import { WORLD_LOCATIONS_DATA, searchWorldLocations } from '../../data/worldLocations';
import {
  getCurrentUserGPS,
  saveUserDetectedLocation,
  getStoredUserLocation,
  NEPAL_77_DISTRICTS
} from '../../utils/geoLocationHelper';
import { getSacredLocationInfo } from '../../utils/vedicSankalpaEngine';

const POPULAR_NEPAL_CITIES: Array<{
  name: string;
  district: string;
  lat: number;
  long: number;
  tz: number;
}> = [
  { name: 'काठमाडौँ (Kathmandu)', district: 'काठमाडौँ', lat: 27.7172, long: 85.3240, tz: 5.75 },
  { name: 'ललितपुर (Patan)', district: 'ललितपुर', lat: 27.6644, long: 85.3188, tz: 5.75 },
  { name: 'भक्तपुर (Bhaktapur)', district: 'भक्तपुर', lat: 27.6710, long: 85.4298, tz: 5.75 },
  { name: 'पोखरा (Pokhara)', district: 'कास्की', lat: 28.2096, long: 83.9856, tz: 5.75 },
  { name: 'विराटनगर / मोरङ (Biratnagar)', district: 'मोरङ', lat: 26.4525, long: 87.2718, tz: 5.75 },
  { name: 'झापा / विर्तामोड (Jhapa)', district: 'झापा', lat: 26.6333, long: 87.8833, tz: 5.75 },
  { name: 'धरान / इटहरी (Sunsari)', district: 'सुनसरी', lat: 26.8125, long: 87.2833, tz: 5.75 },
  { name: 'भरतपुर / चितवन (Chitwan)', district: 'चितवन', lat: 27.6833, long: 84.4333, tz: 5.75 },
  { name: 'बुटवल / भैरहवा (Rupandehi)', district: 'रुपन्देही', lat: 27.7000, long: 83.4500, tz: 5.75 },
  { name: 'वीरगञ्ज / पर्सा (Birgunj)', district: 'पर्सा', lat: 27.0000, long: 84.8667, tz: 5.75 },
  { name: 'जनकपुर / धनुषा (Janakpur)', district: 'धनुषा', lat: 26.7271, long: 85.9231, tz: 5.75 },
  { name: 'नेपालगञ्ज / बाँके (Banke)', district: 'बाँके', lat: 28.0500, long: 81.6167, tz: 5.75 },
  { name: 'दाङ / घोराही (Dang)', district: 'दाङ', lat: 28.0333, long: 82.3000, tz: 5.75 },
  { name: 'धनगढी / कैलाली (Kailali)', district: 'कैलाली', lat: 28.6833, long: 80.6000, tz: 5.75 },
  { name: 'सुर्खेत / वीरेन्द्रनगर (Surkhet)', district: 'सुर्खेत', lat: 28.6000, long: 81.6333, tz: 5.75 },
  { name: 'नयाँ दिल्ली (New Delhi)', district: 'दिल्ली', lat: 28.6139, long: 77.2090, tz: 5.5 }
];

interface RBACAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: SystemRole;
  isSuperAdminOnly?: boolean;
  onLoginSuccess: (session: RBACSession, createdProfile?: BirthDetails) => void;
}

export const RBACAuthModal: React.FC<RBACAuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'CUSTOMER',
  isSuperAdminOnly = false,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>(
    isSuperAdminOnly ? 'signin' : 'signin'
  );

  // Sign In Form State
  const [phoneOrUsername, setPhoneOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up Mandatory Fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Date of Birth State (BS & AD)
  const [dateType, setDateType] = useState<'BS' | 'AD'>('BS');
  const [bsYear, setBsYear] = useState('2055');
  const [bsMonth, setBsMonth] = useState('5');
  const [bsDay, setBsDay] = useState('15');

  const [adYear, setAdYear] = useState('1998');
  const [adMonth, setAdMonth] = useState('08');
  const [adDay, setAdDay] = useState('31');

  // Birth Time State (12h format)
  const [birthHour, setBirthHour] = useState('06');
  const [birthMinute, setBirthMinute] = useState('30');
  const [birthAmPm, setBirthAmPm] = useState<'AM' | 'PM'>('AM');

  // Birth Place State
  const [selectedCityName, setSelectedCityName] = useState('काठमाडौँ (Kathmandu)');
  const [customCitySearch, setCustomCitySearch] = useState('');
  const [isSearchingCustomCity, setIsSearchingCustomCity] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    name: 'काठमाडौँ (Kathmandu)',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    country: 'नेपाल',
    latitude: 27.7172,
    longitude: 85.3240,
    timeZone: 5.75,
  });

  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsSuccessNote, setGpsSuccessNote] = useState<string | null>(null);
  const [activeSacredGeo, setActiveSacredGeo] = useState(() => getSacredLocationInfo({
    name: 'काठमाडौँ (Kathmandu)',
    district: 'काठमाडौँ',
    latitude: 27.7172,
    longitude: 85.3240,
    timeZone: 5.75,
    country: 'नेपाल'
  }));

  // Forgot Password State
  const [forgotPhone, setForgotPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status/Error Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Synchronize BS to AD automatically
  useEffect(() => {
    if (dateType === 'BS') {
      try {
        const y = parseInt(fromDevanagariNumerals(bsYear), 10);
        const m = parseInt(fromDevanagariNumerals(bsMonth), 10);
        const d = parseInt(fromDevanagariNumerals(bsDay), 10);
        if (y >= 1970 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 32) {
          const ad = convertBSToADFull(y, m, d);
          if (ad && typeof ad === 'string') {
            const parts = ad.split('-');
            if (parts.length === 3) {
              setAdYear(parts[0]);
              setAdMonth(parts[1]);
              setAdDay(parts[2]);
            }
          }
        }
      } catch {}
    }
  }, [bsYear, bsMonth, bsDay, dateType]);

  // Synchronize AD to BS automatically
  useEffect(() => {
    if (dateType === 'AD') {
      try {
        const y = parseInt(adYear, 10);
        const m = parseInt(adMonth, 10);
        const d = parseInt(adDay, 10);
        if (y >= 1920 && y <= 2045 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          const adStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const bs = convertADToBSFull(adStr);
          if (bs) {
            setBsYear(String(bs.year));
            setBsMonth(String(bs.month));
            setBsDay(String(bs.day));
          }
        }
      } catch {}
    }
  }, [adYear, adMonth, adDay, dateType]);

  // Sync stored user location when modal opens
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredUserLocation();
      if (stored && stored.name) {
        setSelectedLocation(stored);
        setSelectedCityName(stored.name);
        setActiveSacredGeo(getSacredLocationInfo(stored));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCitySelect = (cityName: string) => {
    setSelectedCityName(cityName);
    setGpsSuccessNote(null);
    setErrorMsg(null);

    // 1. Check popular cities
    const foundPopular = POPULAR_NEPAL_CITIES.find(c => c.name === cityName);
    if (foundPopular) {
      const loc: LocationData = {
        name: foundPopular.name,
        district: foundPopular.district,
        province: 'नेपाल',
        country: foundPopular.tz === 5.5 ? 'भारत' : 'नेपाल',
        latitude: foundPopular.lat,
        longitude: foundPopular.long,
        timeZone: foundPopular.tz,
        flag: foundPopular.tz === 5.5 ? '🇮🇳' : '🇳🇵'
      };
      setSelectedLocation(loc);
      setActiveSacredGeo(getSacredLocationInfo(loc));
      saveUserDetectedLocation(loc);
      return;
    }

    // 2. Check 77 districts
    const foundDistrict = NEPAL_77_DISTRICTS.find(d => `${d.headquarter}, ${d.district}` === cityName || d.district === cityName);
    if (foundDistrict) {
      const loc: LocationData = {
        name: `${foundDistrict.headquarter}, ${foundDistrict.district}`,
        englishName: `${foundDistrict.districtEn} District`,
        district: foundDistrict.district,
        province: foundDistrict.province,
        country: 'नेपाल',
        latitude: foundDistrict.latitude,
        longitude: foundDistrict.longitude,
        timeZone: 5.75,
        flag: '🇳🇵'
      };
      setSelectedLocation(loc);
      setActiveSacredGeo(getSacredLocationInfo(loc));
      saveUserDetectedLocation(loc);
      return;
    }

    // 3. Check world locations
    const foundWorld = WORLD_LOCATIONS_DATA.find(w => w.name === cityName);
    if (foundWorld) {
      setSelectedLocation(foundWorld);
      setActiveSacredGeo(getSacredLocationInfo(foundWorld));
      saveUserDetectedLocation(foundWorld);
      return;
    }
  };

  const handleDetectCurrentLocation = async () => {
    setIsDetectingGPS(true);
    setErrorMsg(null);
    setGpsSuccessNote(null);
    try {
      const res = await getCurrentUserGPS();
      setSelectedLocation(res.location);
      setSelectedCityName(res.location.name);
      saveUserDetectedLocation(res.location);
      const sacred = getSacredLocationInfo(res.location);
      setActiveSacredGeo(sacred);
      setGpsSuccessNote(
        `📍 स्थान पत्ता लाग्यो: ${res.location.name} (दूरी ~${res.distanceKm} कि.मी.)`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'स्थान पत्ता लगाउन सकिएन।');
    } finally {
      setIsDetectingGPS(false);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!phoneOrUsername.trim() || !password) {
      setErrorMsg('कृपया फोन नम्बर/प्रयोगकर्ता नाम र पासवर्ड भर्नुहोस्।');
      return;
    }

    const res = authenticateRBACUser(phoneOrUsername.trim(), password.trim());

    if (res.success && res.session) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onLoginSuccess(res.session!);
        onClose();
      }, 400);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Mandatory Validations
    if (!fullName.trim()) {
      setErrorMsg('कृपया आफ्नो पूरा नाम (Full Name) भर्नुहोस्।');
      return;
    }
    if (!signupPhone.trim()) {
      setErrorMsg('कृपया आफ्नो मोबाइल फोन नम्बर भर्नुहोस्।');
      return;
    }
    if (!signupPassword) {
      setErrorMsg('कृपया पासवर्ड तय गर्नुहोस्।');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMsg('पासवर्ड र पुनः प्रविष्टि मिलेन।');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।');
      return;
    }

    // 2. Format 24-hour time string
    let hour24 = parseInt(birthHour, 10);
    const minStr = birthMinute.padStart(2, '0');
    if (birthAmPm === 'PM' && hour24 < 12) hour24 += 12;
    if (birthAmPm === 'AM' && hour24 === 12) hour24 = 0;
    const formattedTime24 = `${String(hour24).padStart(2, '0')}:${minStr}`;

    // 3. Format Dates
    const finalDateAD = `${adYear}-${String(adMonth).padStart(2, '0')}-${String(adDay).padStart(2, '0')}`;
    const finalDateBS = `वि.सं. ${bsYear} ${bsMonth} महिना ${bsDay} गते`;

    // 4. Create Birth Profile
    const newProfile: BirthDetails = {
      id: `profile_member_${Date.now()}`,
      customerId: `सदस्य-${String(getStoredProfiles().length + 1).padStart(3, '०')}`,
      name: fullName.trim(),
      gender,
      dateAD: finalDateAD,
      dateBS: finalDateBS,
      time: formattedTime24,
      timeSeconds: '00',
      location: selectedLocation,
      phone: signupPhone.trim(),
      email: signupEmail.trim(),
      category: 'Member',
      notes: 'अनलाइन दर्ता सदस्य कुण्डली',
      createdAt: new Date().toISOString()
    };

    // Save profile to store
    const savedProfile = saveProfile(newProfile);
    saveUserDetectedLocation(selectedLocation);

    // 5. Register RBAC Account with birth details attached
    const regRes = registerRBACAccount({
      fullName: fullName.trim(),
      phone: signupPhone.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      role: 'CUSTOMER',
      birthProfileId: savedProfile.id,
      birthDetails: savedProfile,
      address: selectedLocation.name
    });

    if (!regRes.success) {
      setErrorMsg(regRes.message);
      return;
    }

    // Automatically register client into Super Admin Menu Access Control System
    try {
      registerOrUpdateClientPolicy({
        mobile: signupPhone.trim(),
        fullName: fullName.trim(),
        password: signupPassword,
        period: '1_year'
      });
    } catch (e) {
      console.error('Menu control policy sync failed:', e);
    }

    // 6. Automatically Authenticate the new member
    const authRes = authenticateRBACUser(signupPhone.trim(), signupPassword);
    if (authRes.success && authRes.session) {
      setSuccessMsg('सदस्यता तथा व्यक्तिगत कुण्डली सफलतापूर्वक तयार भयो!');
      setTimeout(() => {
        onLoginSuccess(authRes.session!, savedProfile);
        onClose();
      }, 500);
    } else {
      setSuccessMsg('खाता दर्ता भयो! कृपया अब लगइन गर्नुहोस्।');
      setActiveTab('signin');
      setPhoneOrUsername(signupPhone);
      setPassword(signupPassword);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotPhone.trim() || !newPassword) {
      setErrorMsg('कृपया दर्ता भएको फोन नम्बर र नयाँ पासवर्ड भर्नुहोस्।');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।');
      return;
    }

    const res = resetRBACUserPassword(forgotPhone, newPassword, true);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setActiveTab('signin');
        setPhoneOrUsername(forgotPhone);
        setPassword(newPassword);
      }, 1400);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1B18] border border-[#E6E0D5] dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 text-stone-800 dark:text-stone-100 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-white dark:bg-stone-800 p-0.5 shadow-lg border-2 border-amber-400/60 overflow-hidden ring-2 ring-amber-400/20">
            <img 
              src={getAssetUrl('/logo.png')} 
              alt="बालानन्द लोगो" 
              className="w-full h-full object-cover rounded-full select-none" 
              onError={(e) => {
                handleImageFallback(e, [
                  getAssetUrl('/logo.png'),
                  getAssetUrl('/assets/logo.png'),
                  getAssetUrl('/balananda-logo.png'),
                ]);
              }}
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/20 px-3.5 py-1 rounded-full text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSuperAdminOnly ? '👑 सुपरएडमिन गोप्य लगइन पोर्टल' : 'सुरक्षित वैदिक सदस्य लगइन तथा दर्ता'}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif">
            बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {isSuperAdminOnly
              ? 'केन्द्रीय कमान्ड कक्ष पहुँचका लागि आधिकारिक परिचय प्रविष्टि गर्नुहोस्'
              : 'व्यक्तिगत दैनिक, मासिक र वार्षिक राशिफल तथा शुभ साइतका लागि सदस्य लगइन'}
          </p>
        </div>

        {/* If Superadmin mode, do not show tabs, just superadmin sign-in form */}
        {!isSuperAdminOnly && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-[#7A1C1C] text-white shadow'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>साइन-इन (Sign In)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? 'bg-[#7A1C1C] text-white shadow'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>साइन-अप (Sign Up)</span>
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-start gap-2">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* TAB 1: SIGN IN                                               */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                {isSuperAdminOnly ? 'सुपरएडमिन प्रयोगकर्ता नाम:' : 'फोन नम्बर वा प्रयोगकर्ता नाम:'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phoneOrUsername}
                  onChange={e => setPhoneOrUsername(e.target.value)}
                  placeholder={isSuperAdminOnly ? "admin" : "उदाहरण: 9800000000"}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                पासवर्ड:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none font-mono text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#7A1C1C] hover:bg-[#8B2323] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>{isSuperAdminOnly ? 'सुपरएडमिन लगइन गर्नुहोस्' : 'लगइन गर्नुहोस्'}</span>
            </button>

            {!isSuperAdminOnly && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-stone-500 hover:text-[#7A1C1C] text-[11px] underline"
                >
                  पासवर्ड बिर्सनुभयो? यहाँ क्लिक गर्नुहोस्
                </button>
              </div>
            )}
          </form>
        )}

        {/* ------------------------------------------------------------ */}
        {/* TAB 2: SIGN UP WITH MANDATORY BIRTH DETAILS                  */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'signup' && !isSuperAdminOnly && (
          <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-3 space-y-1">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                जन्म विवरण किन अनिवार्य छ?
              </span>
              <p className="text-[10px] text-stone-600 dark:text-stone-400 leading-relaxed">
                तपाईंको जन्म मिति, समय र स्थानको आधारमा वैदिक गणित इन्जिनले तपाईंको आफ्नै दैनिक, मासिक र वार्षिक राशिफल, महादशा, साढेसाती तथा चन्द्रबल/ताराबल अनुकूल साइत स्वचालित रूपमा गणना गर्नेछ।
              </p>
            </div>

            {/* Full Name & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  पूरा नाम (Full Name): *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="जस्तै: रामप्रसाद शर्मा"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  लिङ्ग (Gender): *
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none font-bold"
                >
                  <option value="male">पुरुष (Male)</option>
                  <option value="female">महिला (Female)</option>
                  <option value="other">अन्य (Other)</option>
                </select>
              </div>
            </div>

            {/* Mobile Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  मोबाइल नम्बर (Phone): *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={e => setSignupPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  इमेल (ऐच्छिक):
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Birth Date (वि.सं. / ई.सं.) */}
            <div className="p-3 bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />
                  <span>जन्म मिति (Date of Birth): *</span>
                </label>
                <div className="inline-flex rounded-lg border border-stone-300 dark:border-stone-700 overflow-hidden text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setDateType('BS')}
                    className={`px-2 py-0.5 ${dateType === 'BS' ? 'bg-[#7A1C1C] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600'}`}
                  >
                    वि.सं. (BS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateType('AD')}
                    className={`px-2 py-0.5 ${dateType === 'AD' ? 'bg-[#7A1C1C] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600'}`}
                  >
                    ई.सं. (AD)
                  </button>
                </div>
              </div>

              {dateType === 'BS' ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">वर्ष (वि.सं.)</span>
                    <input
                      type="number"
                      value={bsYear}
                      onChange={e => setBsYear(e.target.value)}
                      min="1970"
                      max="2100"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">महिना (१-१२)</span>
                    <input
                      type="number"
                      value={bsMonth}
                      onChange={e => setBsMonth(e.target.value)}
                      min="1"
                      max="12"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">गते (१-३२)</span>
                    <input
                      type="number"
                      value={bsDay}
                      onChange={e => setBsDay(e.target.value)}
                      min="1"
                      max="32"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">Year (AD)</span>
                    <input
                      type="number"
                      value={adYear}
                      onChange={e => setAdYear(e.target.value)}
                      min="1920"
                      max="2045"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">Month (1-12)</span>
                    <input
                      type="number"
                      value={adMonth}
                      onChange={e => setAdMonth(e.target.value)}
                      min="1"
                      max="12"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">Day (1-31)</span>
                    <input
                      type="number"
                      value={adDay}
                      onChange={e => setAdDay(e.target.value)}
                      min="1"
                      max="31"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              )}
              <p className="text-[10px] text-stone-400 text-right">
                {dateType === 'BS' ? `ई.सं. समकक्ष: ${adYear}-${adMonth}-${adDay}` : `वि.सं. समकक्ष: ${bsYear}/${bsMonth}/${bsDay}`}
              </p>
            </div>

            {/* Birth Time (घन्टा, मिनेट, AM/PM) */}
            <div className="p-3 bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-2">
              <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />
                <span>जन्म समय (Birth Time): *</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-stone-500 block mb-0.5">घन्टा (१-१२)</span>
                  <select
                    value={birthHour}
                    onChange={e => setBirthHour(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono font-bold"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block mb-0.5">मिनेट (००-५९)</span>
                  <select
                    value={birthMinute}
                    onChange={e => setBirthMinute(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono font-bold"
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block mb-0.5">समय चक्र</span>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setBirthAmPm('AM')}
                      className={`py-1.5 rounded-lg font-bold ${birthAmPm === 'AM' ? 'bg-[#7A1C1C] text-white' : 'bg-stone-200 dark:bg-stone-800'}`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setBirthAmPm('PM')}
                      className={`py-1.5 rounded-lg font-bold ${birthAmPm === 'PM' ? 'bg-[#7A1C1C] text-white' : 'bg-stone-200 dark:bg-stone-800'}`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Birth Location */}
            <div className="p-3 bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />
                  <span>जन्म स्थान (Birth Place & Geolocation): *</span>
                </label>
              </div>

              {/* 1-Click GPS Detect Button */}
              <button
                type="button"
                onClick={handleDetectCurrentLocation}
                disabled={isDetectingGPS}
                className="w-full py-2 px-3 bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 dark:from-stone-800 dark:to-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
              >
                {isDetectingGPS ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
                    <span>GPS द्वारा स्थान पत्ता लगाइँदैछ...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>🛰️ मेरो हालको स्थान पत्ता लगाउनुहोस् (Auto GPS)</span>
                  </>
                )}
              </button>

              {/* GPS Success Notification */}
              {gpsSuccessNote && (
                <div className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>{gpsSuccessNote}</span>
                </div>
              )}

              {/* District & City Selection Dropdown (77 Districts + World) */}
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  value={selectedCityName}
                  onChange={e => handleCitySelect(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none text-xs font-medium"
                >
                  <optgroup label="⭐ प्रमुख शहरहरू (Popular Hubs)">
                    {POPULAR_NEPAL_CITIES.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>

                  {['कोशी प्रदेश', 'मधेश प्रदेश', 'बागमती प्रदेश', 'गण्डकी प्रदेश', 'लुम्बिनी प्रदेश', 'कर्णाली प्रदेश', 'सुदूरपश्चिम प्रदेश'].map(prov => {
                    const dists = NEPAL_77_DISTRICTS.filter(d => d.province === prov);
                    return (
                      <optgroup key={prov} label={`🇳🇵 ${prov} (${dists.length} जिल्लाहरू)`}>
                        {dists.map(d => {
                          const val = `${d.headquarter}, ${d.district}`;
                          return (
                            <option key={d.district} value={val}>
                              {d.district} — {d.headquarter} ({d.districtEn})
                            </option>
                          );
                        })}
                      </optgroup>
                    );
                  })}

                  <optgroup label="🌐 अन्तर्राष्ट्रिय प्रमुख शहरहरू">
                    {WORLD_LOCATIONS_DATA.filter(w => w.region !== 'nepal').slice(0, 15).map(w => (
                      <option key={w.name} value={w.name}>
                        {w.flag || '📍'} {w.name} ({w.country})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Dynamic Sacred Geography Card for selected place */}
              <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-stone-800/90 border border-amber-200 dark:border-stone-700 text-[11px] space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[10px]">
                  <span>स्थान: {selectedLocation.name}</span>
                  <span className="font-mono">
                    {selectedLocation.latitude.toFixed(2)}° N, {selectedLocation.longitude.toFixed(2)}° E
                  </span>
                </div>
                <div className="flex items-start gap-1 text-stone-800 dark:text-stone-200">
                  <span className="text-amber-800 dark:text-amber-400 font-bold shrink-0">📍 पवित्र नदी:</span>
                  <span className="font-semibold">{activeSacredGeo.riverNepali}</span>
                </div>
                <div className="flex items-start gap-1 text-stone-800 dark:text-stone-200">
                  <span className="text-amber-800 dark:text-amber-400 font-bold shrink-0">🛕 प्रसिद्ध देवपीठ:</span>
                  <span className="font-semibold">{activeSacredGeo.deityNepali}</span>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  पासवर्ड तय गर्नुहोस्: *
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="न्यूनतम ६ अक्षर"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  पासवर्ड पुनः प्रविष्टि: *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="पुनः टाइप गर्नुहोस्"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#7A1C1C] to-[#9B2C2C] hover:from-[#8B2323] hover:to-[#A73333] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>सदस्यता दर्ता तथा व्यक्तिगत कुण्डली तयार गर्नुहोस्</span>
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------ */}
        {/* TAB 3: FORGOT PASSWORD                                       */}
        {/* ------------------------------------------------------------ */}
        {activeTab === 'forgot' && !isSuperAdminOnly && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-stone-300">
              तपाईंको दर्ता भएको फोन नम्बर प्रविष्टि गरी नयाँ पासवर्ड तय गर्नुहोस्:
            </p>

            <div>
              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                दर्ता भएको फोन नम्बर:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={forgotPhone}
                  onChange={e => setForgotPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                नयाँ पासवर्ड:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="नयाँ पासवर्ड"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-[#7A1C1C] outline-none font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#7A1C1C] hover:bg-[#8B2323] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>पासवर्ड अपडेट गर्नुहोस्</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className="text-stone-500 hover:text-[#7A1C1C] text-[11px] underline"
              >
                साइन-इन पृष्ठमा फर्कनुहोस्
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
