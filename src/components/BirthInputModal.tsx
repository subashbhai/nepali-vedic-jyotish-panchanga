import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Clock, 
  Settings, 
  ChevronDown, 
  FileText, 
  FolderOpen, 
  Check, 
  AlertTriangle,
  User,
  MapPin,
  Heart,
  Plus,
  Trash2,
  Users,
  Search,
  Globe,
  Navigation,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  BirthDetails, 
  LocationData, 
  Gender, 
  FamilyMemberItem 
} from '../types/astrology';
import { NEPAL_LOCATIONS, toDevanagariNumerals, fromDevanagariNumerals } from '../utils/nepaliCalendar';
import { convertBSToADFull, convertADToBSFull } from '../utils/bsCalendarData';
import { getStoredProfiles } from '../db/profileStore';
import { LocationSelectorModal } from './LocationSelectorModal';
import { 
  WORLD_LOCATIONS_DATA, 
  formatCoordinatesDevanagari, 
  formatTimeZoneString, 
  searchWorldLocations 
} from '../data/worldLocations';

interface BirthInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: BirthDetails) => void;
  initialProfile?: BirthDetails | null;
}

export const BirthInputModal: React.FC<BirthInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
}) => {
  // --- Form States based on screenshot design ---
  const [name, setName] = useState('ओम बहादुर सुब्बा');
  const [year, setYear] = useState('2064');
  const [month, setMonth] = useState('2');
  const [gate, setGate] = useState('3');
  const [era, setEra] = useState<'BS' | 'AD'>('BS'); // बि.स vs ई.स

  const [hour, setHour] = useState('5');
  const [minute, setMinute] = useState('6');
  const [second, setSecond] = useState('28');
  const [ampm, setAmPm] = useState<'AM' | 'PM'>('AM');

  const [country, setCountry] = useState('Nepal');
  const [selectedCity, setSelectedCity] = useState('मोरङ - Morang');
  const [gender, setGender] = useState<Gender>('male');
  const [siddhanta, setSiddhanta] = useState<'surya' | 'drik'>('surya');

  // Modal / Converter Popover States
  const [isGhadiPalaOpen, setIsGhadiPalaOpen] = useState(false);
  const [isGeoSettingsOpen, setIsGeoSettingsOpen] = useState(false);
  const [isExtraDetailsOpen, setIsExtraDetailsOpen] = useState(false);

  // Custom Geo Coordinates & Location States
  const [latitude, setLatitude] = useState<number>(27.7172);
  const [longitude, setLongitude] = useState<number>(85.324);
  const [timeZone, setTimeZone] = useState<number>(5.75);

  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    name: 'काठमाडौँ (Kathmandu)',
    englishName: 'Kathmandu',
    district: 'काठमाडौँ',
    province: 'बागमती',
    country: 'नेपाल',
    latitude: 27.7172,
    longitude: 85.324,
    timeZone: 5.75,
    region: 'nepal',
    flag: '🇳🇵',
  });
  const [locationQuery, setLocationQuery] = useState<string>('काठमाडौँ');
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState<boolean>(false);
  const [isFullLocationModalOpen, setIsFullLocationModalOpen] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const locationPickerRef = useRef<HTMLDivElement>(null);

  // Ghadi-Pala Converter Inputs
  const [sunriseHour, setSunriseHour] = useState('06');
  const [sunriseMinute, setSunriseMinute] = useState('00');
  const [sunriseSecond, setSunriseSecond] = useState('00');
  const [sunriseAmPm, setSunriseAmPm] = useState<'AM' | 'PM'>('AM');

  const [ghati, setGhati] = useState('12');
  const [pala, setPala] = useState('30');
  const [vipala, setVipala] = useState('0');

  // Extra Profile Fields (Father, Mother, Gotra, Phone, etc.)
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [gotra, setGotra] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberItem[]>([]);

  // Duplicate Check
  const [duplicateMatch, setDuplicateMatch] = useState<BirthDetails | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // City dropdown list options
  const cityOptions = [
    { label: 'मोरङ - Morang', name: 'मोरङ', district: 'मोरङ', lat: 26.65, long: 87.35, tz: 5.75 },
    { label: 'काठमाडौँ - Kathmandu', name: 'काठमाडौँ', district: 'काठमाडौँ', lat: 27.7172, long: 85.324, tz: 5.75 },
    { label: 'कास्की - Pokhara', name: 'पोखरा', district: 'कास्की', lat: 28.2096, long: 83.9856, tz: 5.75 },
    { label: 'ललितपुर - Lalitpur', name: 'ललितपुर', district: 'ललितपुर', lat: 27.6644, long: 85.3188, tz: 5.75 },
    { label: 'भक्तपुर - Bhaktapur', name: 'भक्तपुर', district: 'भक्तपुर', lat: 27.671, long: 85.4298, tz: 5.75 },
    { label: 'झापा - Jhapa', name: 'झापा', district: 'झापा', lat: 26.6333, long: 87.8833, tz: 5.75 },
    { label: 'सुनसरी - Dharan/Itahari', name: 'सुनसरी', district: 'सुनसरी', lat: 26.8125, long: 87.2833, tz: 5.75 },
    { label: 'चितवन - Bharatpur', name: 'चितवन', district: 'चितवन', lat: 27.6833, long: 84.4333, tz: 5.75 },
    { label: 'पर्सा - Birgunj', name: 'वीरगञ्ज', district: 'पर्सा', lat: 27.0, long: 84.8667, tz: 5.75 },
    { label: 'धनुषा - Janakpur', name: 'जनकपुर', district: 'धनुषा', lat: 26.7271, long: 85.9231, tz: 5.75 },
    { label: 'रुपन्देही - Butwal/Bhairahawa', name: 'बुटवल', district: 'रुपन्देही', lat: 27.7, long: 83.45, tz: 5.75 },
    { label: 'दाङ - Ghorahi/Tulsipur', name: 'दाङ', district: 'दाङ', lat: 28.0333, long: 82.3, tz: 5.75 },
    { label: 'कैलाली - Dhangadhi', name: 'धनगढी', district: 'कैलाली', lat: 28.6833, long: 80.6, tz: 5.75 },
    { label: 'बाँके - Nepalgunj', name: 'नेपालगञ्ज', district: 'बाँके', lat: 28.05, long: 81.6167, tz: 5.75 },
    { label: 'सुर्खेत - Birendranagar', name: 'सुर्खेत', district: 'सुर्खेत', lat: 28.6, long: 81.6333, tz: 5.75 },
    { label: 'नयाँ दिल्ली - New Delhi', name: 'नयाँ दिल्ली', district: 'दिल्ली', lat: 28.6139, long: 77.209, tz: 5.5 },
  ];

  // Initialize form when editing or opening
  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      
      // Parse BS Date if exists
      if (initialProfile.dateBS) {
        const bsMatch = initialProfile.dateBS.match(/(\d{4})[^\d]+(\d{1,2})[^\d]+(\d{1,2})/);
        if (bsMatch) {
          setYear(fromDevanagariNumerals(bsMatch[1]));
          setMonth(fromDevanagariNumerals(bsMatch[2]));
          setGate(fromDevanagariNumerals(bsMatch[3]));
          setEra('BS');
        } else if (initialProfile.dateAD) {
          const parts = initialProfile.dateAD.split('-');
          if (parts.length === 3) {
            setYear(parts[0]);
            setMonth(String(parseInt(parts[1], 10)));
            setGate(String(parseInt(parts[2], 10)));
            setEra('AD');
          }
        }
      }

      // Parse Time
      if (initialProfile.time) {
        const timeParts = initialProfile.time.split(':');
        if (timeParts.length >= 2) {
          let h = parseInt(timeParts[0], 10);
          const m = parseInt(timeParts[1], 10);
          const s = parseInt(initialProfile.timeSeconds || '0', 10);

          if (h >= 12) {
            setAmPm('PM');
            if (h > 12) h -= 12;
          } else {
            setAmPm('AM');
            if (h === 0) h = 12;
          }

          setHour(String(h));
          setMinute(String(m));
          setSecond(String(s));
        }
      }

      if (initialProfile.gender) setGender(initialProfile.gender);
      if (initialProfile.location) {
        setCountry(initialProfile.location.country || 'नेपाल');
        const locName = initialProfile.location.name || initialProfile.location.district || 'काठमाडौँ';
        setSelectedCity(locName);
        setLocationQuery(locName);
        setLatitude(initialProfile.location.latitude || 27.7172);
        setLongitude(initialProfile.location.longitude || 85.324);
        setTimeZone(initialProfile.location.timeZone || 5.75);
        setSelectedLocation({
          name: locName,
          englishName: initialProfile.location.englishName,
          district: initialProfile.location.district,
          province: initialProfile.location.province,
          country: initialProfile.location.country || 'नेपाल',
          latitude: initialProfile.location.latitude || 27.7172,
          longitude: initialProfile.location.longitude || 85.324,
          timeZone: initialProfile.location.timeZone || 5.75,
          region: initialProfile.location.region || 'nepal',
          flag: initialProfile.location.flag || '🇳🇵',
        });
      }

      if (initialProfile.phone) setPhone(initialProfile.phone);
      if (initialProfile.email) setEmail(initialProfile.email);
      if (initialProfile.notes) setNotes(initialProfile.notes);
      if (initialProfile.fatherDetails?.name) setFatherName(initialProfile.fatherDetails.name);
      if (initialProfile.fatherDetails?.gotra) setGotra(initialProfile.fatherDetails.gotra);
      if (initialProfile.motherDetails?.name) setMotherName(initialProfile.motherDetails.name);
      if (initialProfile.familyMembers) setFamilyMembers(initialProfile.familyMembers);
    } else {
      // New Kundali: Clear form and populate today's Nepali Date & current time
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayBS = convertADToBSFull(`${yyyy}-${mm}-${dd}`);

      setName('');
      setYear(String(todayBS.year));
      setMonth(String(todayBS.month));
      setGate(String(todayBS.day));
      setEra('BS');

      let nowH = now.getHours();
      const nowM = now.getMinutes();
      const nowS = now.getSeconds();
      const nowAmPm = nowH >= 12 ? 'PM' : 'AM';
      if (nowH > 12) nowH -= 12;
      if (nowH === 0) nowH = 12;

      setHour(String(nowH));
      setMinute(String(nowM));
      setSecond(String(nowS));
      setAmPm(nowAmPm);

      setGender('male');
      setSelectedCity('काठमाडौँ (Kathmandu)');
      setLocationQuery('काठमाडौँ');
      setCountry('नेपाल');
      setLatitude(27.7172);
      setLongitude(85.324);
      setTimeZone(5.75);
      setSelectedLocation({
        name: 'काठमाडौँ (Kathmandu)',
        englishName: 'Kathmandu',
        district: 'काठमाडौँ',
        province: 'बागमती',
        country: 'नेपाल',
        latitude: 27.7172,
        longitude: 85.324,
        timeZone: 5.75,
        region: 'nepal',
        flag: '🇳🇵',
      });

      setFatherName('');
      setMotherName('');
      setGotra('');
      setPhone('');
      setEmail('');
      setNotes('');
      setFamilyMembers([]);
      setDuplicateMatch(null);
      setShowDuplicateWarning(false);
    }
  }, [initialProfile, isOpen]);

  // Selected City Data
  const currentCityObj = cityOptions.find(c => c.label === selectedCity) || cityOptions[0];

  // --- Ghadi-Pala Calculation Engine ---
  const calculateConvertedTime = () => {
    const h = parseInt(fromDevanagariNumerals(sunriseHour) || '6', 10);
    const m = parseInt(fromDevanagariNumerals(sunriseMinute) || '0', 10);
    const s = parseInt(fromDevanagariNumerals(sunriseSecond) || '0', 10);

    let sunrise24H = h;
    if (sunriseAmPm === 'PM' && h < 12) sunrise24H += 12;
    if (sunriseAmPm === 'AM' && h === 12) sunrise24H = 0;

    const sunriseSec = (sunrise24H * 3600) + (m * 60) + s;

    const g = parseFloat(fromDevanagariNumerals(ghati) || '0');
    const p = parseFloat(fromDevanagariNumerals(pala) || '0');
    const v = parseFloat(fromDevanagariNumerals(vipala) || '0');

    // 1 Ghati = 24 minutes (1440 sec), 1 Pala = 24 sec, 1 Vipala = 0.4 sec
    const elapsedSec = (g * 1440) + (p * 24) + (v * 0.4);

    let totalSec = (sunriseSec + elapsedSec) % 86400; // 24 Hours cycle
    if (totalSec < 0) totalSec += 86400;

    let calcH = Math.floor(totalSec / 3600);
    const remM = totalSec % 3600;
    let calcM = Math.floor(remM / 60);
    let calcS = Math.round(remM % 60);

    let calcAmPm: 'AM' | 'PM' = 'AM';
    if (calcH >= 12) {
      calcAmPm = 'PM';
      if (calcH > 12) calcH -= 12;
    } else {
      if (calcH === 0) calcH = 12;
    }

    return {
      hour: String(calcH),
      minute: String(calcM).padStart(2, '0'),
      second: String(calcS).padStart(2, '0'),
      ampm: calcAmPm,
      formattedText: `${toDevanagariNumerals(calcH)} : ${toDevanagariNumerals(calcM)} : ${toDevanagariNumerals(calcS)} ${calcAmPm}`
    };
  };

  const convertedResult = calculateConvertedTime();

  // Apply converted Ghadi-Pala time to form inputs
  const handleApplyGhadiPalaTime = () => {
    setHour(convertedResult.hour);
    setMinute(convertedResult.minute);
    setSecond(convertedResult.second);
    setAmPm(convertedResult.ampm);
    setIsGhadiPalaOpen(false);
  };

  // Submit Handler
  const handleSaveProfile = (e?: React.FormEvent, forceNew: boolean = false) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    const numYear = parseInt(fromDevanagariNumerals(year) || '2064', 10);
    const numMonth = parseInt(fromDevanagariNumerals(month) || '1', 10);
    const numGate = parseInt(fromDevanagariNumerals(gate) || '1', 10);

    let finalDateAD = '2007-05-17';
    let finalDateBS = `वि.सं. ${toDevanagariNumerals(numYear)} ${toDevanagariNumerals(numMonth)} महिना ${toDevanagariNumerals(numGate)} गते`;

    if (era === 'BS') {
      finalDateAD = convertBSToADFull(numYear, numMonth, numGate);
      finalDateBS = `वि.सं. ${toDevanagariNumerals(numYear)}/${toDevanagariNumerals(numMonth)}/${toDevanagariNumerals(numGate)}`;
    } else {
      finalDateAD = `${numYear}-${String(numMonth).padStart(2, '0')}-${String(numGate).padStart(2, '0')}`;
      const conv = convertADToBSFull(finalDateAD);
      finalDateBS = conv.formattedBS;
    }

    // Process Time
    let numH = parseInt(fromDevanagariNumerals(hour) || '5', 10);
    const numM = parseInt(fromDevanagariNumerals(minute) || '0', 10);
    const numS = parseInt(fromDevanagariNumerals(second) || '0', 10);

    let h24 = numH;
    if (ampm === 'PM' && numH < 12) h24 += 12;
    if (ampm === 'AM' && numH === 12) h24 = 0;

    const formattedTimeStr = `${String(h24).padStart(2, '0')}:${String(numM).padStart(2, '0')}`;
    const formattedSecStr = String(numS).padStart(2, '0');

    // Duplicate check
    if (!initialProfile && !forceNew) {
      const allProfiles = getStoredProfiles();
      const existing = allProfiles.find(
        (p) =>
          p.name.trim().toLowerCase() === name.trim().toLowerCase() &&
          p.dateAD === finalDateAD
      );
      if (existing) {
        setDuplicateMatch(existing);
        setShowDuplicateWarning(true);
        return;
      }
    }

    const existingCount = getStoredProfiles().length;
    const jatakSerialNo =
      initialProfile?.jatakSerialNo || `जातक-${String(existingCount + 1).padStart(3, '०')}`;

    const locationData: LocationData = {
      name: selectedLocation.name || selectedCity || 'काठमाडौँ',
      englishName: selectedLocation.englishName,
      district: selectedLocation.district || currentCityObj.district || selectedCity,
      province: selectedLocation.province,
      country: country.trim() || selectedLocation.country || 'नेपाल',
      latitude,
      longitude,
      timeZone,
      altitude: selectedLocation.altitude || 1400,
      region: selectedLocation.region || 'nepal',
      flag: selectedLocation.flag || '🇳🇵',
    };

    const newProfile: BirthDetails = {
      id: initialProfile?.id || `profile_${Date.now()}`,
      customerId: initialProfile?.customerId || `ग्राह-${String(existingCount + 1).padStart(3, '०')}`,
      jatakSerialNo,
      name: name.trim(),
      gender,
      dateAD: finalDateAD,
      dateBS: finalDateBS,
      time: formattedTimeStr,
      timeSeconds: formattedSecStr,
      location: locationData,
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      category: 'Client',
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      fatherDetails: {
        name: fatherName.trim(),
        gotra: gotra.trim(),
      },
      motherDetails: {
        name: motherName.trim(),
      },
      familyMembers,
    };

    onSave(newProfile);
    onClose();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isLocationPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (locationPickerRef.current && !locationPickerRef.current.contains(e.target as Node)) {
        setIsLocationPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLocationPickerOpen]);

  // Filter autocomplete locations
  const suggestedLocations = useMemo(() => {
    const q = locationQuery.trim();
    if (!q) {
      return WORLD_LOCATIONS_DATA.slice(0, 10);
    }
    return searchWorldLocations(q).slice(0, 18);
  }, [locationQuery]);

  const handleSelectLocation = (loc: LocationData) => {
    setSelectedLocation(loc);
    setCountry(loc.country);
    setSelectedCity(loc.name);
    setLocationQuery(loc.name);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setTimeZone(loc.timeZone);
    setIsLocationPickerOpen(false);
    setLocationFeedback(`${loc.flag || '📍'} ${loc.name} चयन गरियो (${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°)`);
    setTimeout(() => setLocationFeedback(null), 3000);
  };

  const handleDetectCurrentGPS = () => {
    if (!navigator.geolocation) {
      setLocationFeedback('ब्राउजरमा GPS उपलब्ध छैन');
      setTimeout(() => setLocationFeedback(null), 3000);
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const offsetMin = -new Date().getTimezoneOffset();
        const tz = Math.round((offsetMin / 60) * 100) / 100;
        const gpsLoc: LocationData = {
          name: `मेरो GPS स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          englishName: 'Current GPS Coordinates',
          country: country || 'नेपाल',
          latitude: lat,
          longitude: lon,
          timeZone: tz,
          region: 'all',
          flag: '📍',
        };
        handleSelectLocation(gpsLoc);
      },
      (err) => {
        setIsLocatingGPS(false);
        setLocationFeedback('GPS स्थान प्राप्त हुन सकेन');
        setTimeout(() => setLocationFeedback(null), 3000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLocationPickerOpen) {
          setIsLocationPickerOpen(false);
        } else if (isGeoSettingsOpen) {
          setIsGeoSettingsOpen(false);
        } else if (isGhadiPalaOpen) {
          setIsGhadiPalaOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLocationPickerOpen, isGeoSettingsOpen, isGhadiPalaOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 rounded-lg border border-stone-200 dark:border-stone-800 w-full max-w-md shadow-2xl overflow-hidden my-4 transition-all">
        
        {/* Header Bar */}
        <div className="bg-stone-50 dark:bg-stone-800 px-4 py-3 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
              {initialProfile ? 'जातक विवरण परिमार्जन' : 'नयाँ कुण्डली प्रविष्टि'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 rounded-md transition-all cursor-pointer shadow-xs"
            title="बन्द गर्नुहोस् (Close / Esc)"
            aria-label="बन्द गर्नुहोस्"
          >
            <span>बन्द</span>
            <X className="w-4 h-4 text-stone-600 dark:text-stone-300" />
          </button>
        </div>

        {/* Duplicate Warning banner */}
        {showDuplicateWarning && duplicateMatch && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
            <div>
              <strong>{duplicateMatch.name}</strong> को पहिले नै अभिलेख छ।
            </div>
            <button
              type="button"
              onClick={(e) => handleSaveProfile(e, true)}
              className="px-2.5 py-1 bg-[#2563EB] text-white rounded text-[11px] font-medium"
            >
              नयाँ बनाउने
            </button>
          </div>
        )}

        {/* Main Form matching exact screenshot layout */}
        <form onSubmit={(e) => handleSaveProfile(e, false)} className="p-4 space-y-3.5 text-xs">
          
          {/* 1. पुरा नाम */}
          <div className="space-y-1">
            <label className="block text-stone-600 dark:text-stone-300 font-normal">
              पुरा नाम
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ओम बहादुर सुब्बा"
              className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-3 py-2 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 2. साल | महिना | गते */}
          <div className="space-y-1">
            <div className="flex items-center gap-6 text-stone-600 dark:text-stone-300 text-xs">
              <span className="w-20">साल</span>
              <span className="w-20">महिना</span>
              <span className="w-20">गते</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-20 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2.5 py-1.5 text-center text-sm text-stone-800 dark:text-stone-100 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-20 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2.5 py-1.5 text-center text-sm text-stone-800 dark:text-stone-100 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                className="w-20 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2.5 py-1.5 text-center text-sm text-stone-800 dark:text-stone-100 focus:ring-1 focus:ring-blue-500"
              />

              {/* Toggle [बि.स | ई.स] */}
              <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded overflow-hidden shadow-2xs ml-auto">
                <button
                  type="button"
                  onClick={() => setEra('BS')}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    era === 'BS'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  बि.स
                </button>
                <button
                  type="button"
                  onClick={() => setEra('AD')}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    era === 'AD'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  ई.स
                </button>
              </div>
            </div>
          </div>

          {/* 3. घण्टा | मिनेट | सेकन्ड */}
          <div className="space-y-1">
            <div className="flex items-center gap-6 text-stone-600 dark:text-stone-300 text-xs">
              <span className="w-20">घण्टा</span>
              <span className="w-20">मिनेट</span>
              <span className="w-20">सेकन्ड</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-20 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2.5 py-1.5 text-center text-sm text-stone-800 dark:text-stone-100 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-20 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2.5 py-1.5 text-center text-sm text-stone-800 dark:text-stone-100 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                value={second}
                onChange={(e) => setSecond(e.target.value)}
                className="w-20 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2.5 py-1.5 text-center text-sm text-stone-800 dark:text-stone-100 focus:ring-1 focus:ring-blue-500"
              />

              {/* Toggle [AM | PM] */}
              <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setAmPm('AM')}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    ampm === 'AM'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setAmPm('PM')}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    ampm === 'PM'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  PM
                </button>
              </div>

              {/* Clock button 🕒 for Ghadi-Pala converter */}
              <button
                type="button"
                onClick={() => setIsGhadiPalaOpen(!isGhadiPalaOpen)}
                className={`p-2 rounded border transition-colors ${
                  isGhadiPalaOpen
                    ? 'bg-blue-100 border-blue-400 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title="घडी-पला देखि समय रूपान्तरक खोल्नुहोस्"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* --- GHADI-PALA CONVERTER POPOVER / MODAL --- */}
          {isGhadiPalaOpen && (
            <div className="p-3.5 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 rounded-lg space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200 text-xs">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>घडी-पला देखि समय रूपान्तरक (Ghati-Pala to Time)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGhadiPalaOpen(false)}
                  className="text-stone-500 hover:text-stone-800 dark:text-stone-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sunrise Time Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-blue-900 dark:text-blue-200">
                  सूर्योदय समय (Sunrise Time):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={sunriseHour}
                    onChange={(e) => setSunriseHour(e.target.value)}
                    placeholder="06"
                    className="w-12 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 text-center font-mono"
                  />
                  <span>:</span>
                  <input
                    type="text"
                    value={sunriseMinute}
                    onChange={(e) => setSunriseMinute(e.target.value)}
                    placeholder="00"
                    className="w-12 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 text-center font-mono"
                  />
                  <span>:</span>
                  <input
                    type="text"
                    value={sunriseSecond}
                    onChange={(e) => setSunriseSecond(e.target.value)}
                    placeholder="00"
                    className="w-12 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 text-center font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setSunriseAmPm(sunriseAmPm === 'AM' ? 'PM' : 'AM')}
                    className="px-2.5 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded font-bold text-blue-700 dark:text-blue-300"
                  >
                    {sunriseAmPm}
                  </button>
                </div>
              </div>

              {/* Ghati, Pala, Vipala Inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-stone-700 dark:text-stone-300">घडी (Ghati):</label>
                  <input
                    type="number"
                    value={ghati}
                    onChange={(e) => setGhati(e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-700 dark:text-stone-300">पला (Pala):</label>
                  <input
                    type="number"
                    value={pala}
                    onChange={(e) => setPala(e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-700 dark:text-stone-300">विपला (Vipala):</label>
                  <input
                    type="number"
                    value={vipala}
                    onChange={(e) => setVipala(e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 font-mono text-center"
                  />
                </div>
              </div>

              {/* Output Display & Action */}
              <div className="p-2.5 bg-white dark:bg-stone-900 border border-blue-200 dark:border-blue-800 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 block">रूपान्तरित मानक समय:</span>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {convertedResult.formattedText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyGhadiPalaTime}
                  className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium rounded shadow-2xs text-xs"
                >
                  यो समय भर्नुहोस्
                </button>
              </div>
            </div>
          )}

          {/* 4. जन्म स्थान (Birth Location & Coordinates) Auto-complete Picker */}
          <div className="space-y-1.5" ref={locationPickerRef}>
            <div className="flex items-center justify-between">
              <label className="block text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>जन्म स्थान (Birth Location / City):</span>
              </label>
              <div className="flex items-center gap-1">
                {/* GPS Auto Detect */}
                <button
                  type="button"
                  onClick={handleDetectCurrentGPS}
                  disabled={isLocatingGPS}
                  className="px-2 py-0.5 rounded text-[11px] bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="मेरो वर्तमान स्थान (GPS) स्वतः भर्नुहोस्"
                >
                  {isLocatingGPS ? (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  ) : (
                    <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  )}
                  <span>GPS</span>
                </button>

                {/* World Browser Modal Trigger */}
                <button
                  type="button"
                  onClick={() => setIsFullLocationModalOpen(true)}
                  className="px-2 py-0.5 rounded text-[11px] bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600 flex items-center gap-1 transition-colors cursor-pointer"
                  title="विश्वका सबै शहर तथा क्षेत्रहरू ब्राउज गर्नुहोस्"
                >
                  <Globe className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>विश्व शहरहरू</span>
                </button>

                {/* Manual Lat/Long Settings Trigger */}
                <button
                  type="button"
                  onClick={() => setIsGeoSettingsOpen(!isGeoSettingsOpen)}
                  className={`p-1 rounded border transition-colors cursor-pointer ${
                    isGeoSettingsOpen
                      ? 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'border-stone-300 dark:border-stone-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                  title="म्यानुअल अक्षांश तथा देशान्तर प्रविष्टि"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Location Autocomplete Input */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-stone-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setIsLocationPickerOpen(true);
                  }}
                  onFocus={() => setIsLocationPickerOpen(true)}
                  placeholder="शहर वा जिल्ला खोज्नुहोस् (उदा. काठमाडौँ, पोखरा, धरान, झापा, Delhi, London...)"
                  className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg pl-8.5 pr-8 py-2 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                />
                {locationQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocationQuery('');
                      setIsLocationPickerOpen(true);
                    }}
                    className="absolute right-2.5 text-stone-400 hover:text-stone-600 p-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              {isLocationPickerOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800/90 text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center justify-between sticky top-0 z-10">
                    <span>सुझाव गरिएका स्थानहरू ({suggestedLocations.length})</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">क्लिक गरी छान्नुहोस्</span>
                  </div>

                  {suggestedLocations.length === 0 ? (
                    <div className="p-4 text-center space-y-2 text-xs text-stone-500">
                      <p>कुनै स्थान फेला परेन।</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLocationPickerOpen(false);
                          setIsGeoSettingsOpen(true);
                        }}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        म्यानुअल रूपमा अक्षांश/देशान्तर भर्नुहोस्
                      </button>
                    </div>
                  ) : (
                    suggestedLocations.map((loc, idx) => {
                      const isSelected = selectedLocation.name === loc.name && Math.abs(selectedLocation.latitude - loc.latitude) < 0.01;
                      return (
                        <button
                          key={`${loc.name}-${loc.latitude}-${idx}`}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer group ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                              : 'hover:bg-stone-50 dark:hover:bg-stone-800/80 text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="text-base shrink-0">{loc.flag || '📍'}</span>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {loc.name}
                              </div>
                              <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                                {[loc.district, loc.province || loc.state, loc.country].filter(Boolean).join(' • ')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] font-mono text-stone-600 dark:text-stone-300">
                              {formatCoordinatesDevanagari(loc.latitude, loc.longitude)}
                            </div>
                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 mt-0.5">
                              {formatTimeZoneString(loc.timeZone)}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}

                  <div className="p-2 bg-stone-50 dark:bg-stone-800/80 text-center border-t border-stone-200 dark:border-stone-700">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLocationPickerOpen(false);
                        setIsFullLocationModalOpen(true);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>विश्वका अन्य सबै शहरहरू खोज्नुहोस्...</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback notification if location selected or GPS */}
            {locationFeedback && (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-in fade-in duration-150">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{locationFeedback}</span>
              </div>
            )}

            {/* Selected Location Verification Pill / Astrological Coordinates Card */}
            <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-lg flex items-center justify-between text-xs">
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-stone-900 dark:text-stone-100 font-semibold truncate">
                  <span>{selectedLocation.flag || '📍'}</span>
                  <span className="truncate">{selectedLocation.name}</span>
                  {selectedLocation.country && (
                    <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400">
                      ({country || selectedLocation.country})
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-stone-600 dark:text-stone-400 font-mono flex items-center gap-2">
                  <span>अक्षांश: {formatCoordinatesDevanagari(latitude, longitude)}</span>
                  <span>•</span>
                  <span>समय: {formatTimeZoneString(timeZone)}</span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-1 rounded-md border border-emerald-300 dark:border-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>शुद्ध निर्देशाङ्क</span>
              </div>
            </div>

            {/* Custom Geo Coordinates Collapsible Panel */}
            {isGeoSettingsOpen && (
              <div className="p-3 bg-stone-100 dark:bg-stone-800/90 border border-stone-300 dark:border-stone-700 rounded-lg space-y-2 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-1.5">
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    भौगोलिक निर्देशाङ्क विवरण (Custom Geo Coordinates):
                  </span>
                  <span className="text-[10px] text-stone-500">लग्न तथा भाव साधनका लागि</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">देश (Country):</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 text-xs"
                      placeholder="नेपाल"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">सहर / स्थान (City):</label>
                    <input
                      type="text"
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setLocationQuery(e.target.value);
                      }}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 text-xs"
                      placeholder="काठमाडौँ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">अक्षांश (Latitude):</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value) || 27.7172)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">देशान्तर (Longitude):</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value) || 85.324)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-0.5">समय क्षेत्र (UTC):</label>
                    <input
                      type="number"
                      step="any"
                      value={timeZone}
                      onChange={(e) => setTimeZone(parseFloat(e.target.value) || 5.75)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. लिङ्ग & 7. सिद्धान्त */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            {/* लिङ्ग */}
            <div className="space-y-1">
              <label className="block text-stone-600 dark:text-stone-300">
                लिङ्ग
              </label>
              <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-1.5 font-medium transition-colors ${
                    gender === 'male'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  पुरुष
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-1.5 font-medium transition-colors ${
                    gender === 'female'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  महिला
                </button>
              </div>
            </div>

            {/* सिद्धान्त */}
            <div className="space-y-1">
              <label className="block text-stone-600 dark:text-stone-300">
                सिद्धान्त
              </label>
              <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSiddhanta('surya')}
                  className={`flex-1 py-1.5 font-medium transition-colors ${
                    siddhanta === 'surya'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  सूर्य
                </button>
                <button
                  type="button"
                  onClick={() => setSiddhanta('drik')}
                  className={`flex-1 py-1.5 font-medium transition-colors ${
                    siddhanta === 'drik'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  दृक
                </button>
              </div>
            </div>
          </div>

          {/* Main Action Button: कुण्डली बनाउनुहोस् */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#3B82F6] hover:bg-blue-600 text-white font-medium py-2.5 rounded flex items-center justify-center gap-2 shadow-sm transition-colors text-sm cursor-pointer"
            >
              <span>{initialProfile ? 'विवरण अद्यावधिक गर्नुहोस्' : 'कुण्डली बनाउनुहोस्'}</span>
              <Check className="w-4 h-4" />
            </button>
          </div>

          {/* Action Row Buttons: [ Update/Save | बन्द गर्नुहोस् (Close) ] */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <FileText className="w-4 h-4" />
              <span>{initialProfile ? 'अद्यावधिक (Update)' : 'सुरक्षित (Save)'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 dark:bg-stone-800 dark:hover:bg-red-950/40 dark:text-stone-300 dark:hover:text-red-300 border border-stone-300 dark:border-stone-700 font-medium py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
              title="यो विन्डो बन्द गर्नुहोस् (Close / Cancel)"
            >
              <X className="w-4 h-4 text-red-500" />
              <span>बन्द गर्नुहोस् (Close)</span>
            </button>
          </div>

          {/* Expandable Extra Details Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsExtraDetailsOpen(!isExtraDetailsOpen)}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              <span>{isExtraDetailsOpen ? '- थप विवरण लुकाउनुहोस्' : '+ थप विवरण (बाबु/आमा, गोत्र, ठेगाना)'}</span>
            </button>

            {isExtraDetailsOpen && (
              <div className="mt-2.5 p-3 bg-stone-50 dark:bg-stone-800/50 rounded border border-stone-200 dark:border-stone-700 space-y-2 text-xs animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-600 dark:text-stone-300">बाबुको नाम:</label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 dark:text-stone-300">आमाको नाम:</label>
                    <input
                      type="text"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border rounded px-2 py-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-600 dark:text-stone-300">गोत्र:</label>
                    <input
                      type="text"
                      value={gotra}
                      onChange={(e) => setGotra(e.target.value)}
                      placeholder="उदा. कश्यप"
                      className="w-full bg-white dark:bg-stone-900 border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 dark:text-stone-300">सम्पर्क फोन:</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+९७७-९८..."
                      className="w-full bg-white dark:bg-stone-900 border rounded px-2 py-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </form>
      </div>

      {/* World Region Full Location Selector Modal */}
      {isFullLocationModalOpen && (
        <LocationSelectorModal
          isOpen={isFullLocationModalOpen}
          onClose={() => setIsFullLocationModalOpen(false)}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => {
            handleSelectLocation(loc);
            setIsFullLocationModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default BirthInputModal;
