import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  Compass, 
  Globe, 
  Navigation, 
  Check, 
  Clock, 
  Plus,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { LocationData } from '../types/astrology';
import { 
  WORLD_REGIONS, 
  WORLD_LOCATIONS_DATA, 
  formatTimeDifferenceFromNepal, 
  formatTimeZoneString, 
  formatCoordinatesDevanagari,
  searchWorldLocations
} from '../data/worldLocations';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: LocationData;
  onSelectLocation: (location: LocationData) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
}) => {
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Custom coordinate input states
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customCountry, setCustomCountry] = useState<string>('नेपाल');
  const [customLat, setCustomLat] = useState<string>('27.7172');
  const [customLon, setCustomLon] = useState<string>('85.3240');
  const [customTz, setCustomTz] = useState<string>('5.75');

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return searchWorldLocations(searchQuery, activeRegion);
  }, [searchQuery, activeRegion]);

  if (!isOpen) return null;

  // Handle GPS detection
  const handleDetectGPS = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('तपाईंको ब्राउजरमा GPS / Geolocation सुविधा उपलब्ध छैन।');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // Estimate local timezone offset in hours from browser
        const offsetMinutes = -new Date().getTimezoneOffset();
        const tz = Math.round((offsetMinutes / 60) * 100) / 100;

        const detectedLocation: LocationData = {
          name: `मेरो वर्तमान स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          englishName: 'My Current Location (GPS)',
          country: 'वर्तमान स्थान (Current Location)',
          latitude: lat,
          longitude: lon,
          timeZone: tz,
          region: 'all',
          flag: '📍',
        };

        onSelectLocation(detectedLocation);
        onClose();
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('स्थान (Location) अनुमति अस्वीकृत भयो। कृपया ब्राउजर सेटिङमा अनुमति दिनुहोस्।');
        } else {
          setGpsError('स्थान पत्ता लगाउन सकिएन। कृपया म्यानुअल रूपमा स्थान चयन गर्नुहोस्।');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle custom location save
  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    const tz = parseFloat(customTz);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('कृपया मान्य अक्षांश (Latitude: -90 देखि +90 सम्म) प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      alert('कृपया मान्य देशान्तर (Longitude: -180 देखि +180 सम्म) प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (isNaN(tz) || tz < -12 || tz > 14) {
      alert('कृपया मान्य समय क्षेत्र (Time Zone: -12 देखि +14 घण्टा सम्म) प्रविष्ट गर्नुहोस्।');
      return;
    }

    const locName = customName.trim() || `कस्टम स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
    const newLoc: LocationData = {
      name: locName,
      englishName: locName,
      country: customCountry.trim() || 'स्थान',
      latitude: lat,
      longitude: lon,
      timeZone: tz,
      region: 'custom',
      flag: '📍',
    };

    onSelectLocation(newLoc);
    onClose();
  };

  const isSelected = (loc: LocationData) => {
    return (
      Math.abs(loc.latitude - selectedLocation.latitude) < 0.001 &&
      Math.abs(loc.longitude - selectedLocation.longitude) < 0.001
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-stone-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-200/80 dark:border-stone-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-100 dark:border-stone-800 flex items-center justify-between bg-amber-50/50 dark:bg-stone-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-lg font-bold text-stone-900 dark:text-amber-50 flex items-center gap-2">
                <span>भौगोलिक स्थान चयन (Location Settings)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-medium">
                  विश्वव्यापी पञ्चाङ्ग
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                चयन गरिएको देशान्तर र अक्षांश अनुसार सूर्योदय, सूर्यास्त तथा ग्रह-लग्न स्वतः गणना हुन्छ।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Location Banner */}
        <div className="bg-amber-500/10 dark:bg-amber-500/5 px-5 py-2.5 border-b border-amber-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>हाल सक्रिय स्थान:</span>
            <strong className="text-stone-900 dark:text-white font-semibold flex items-center gap-1">
              <span>{selectedLocation.flag || '📍'}</span>
              <span>{selectedLocation.name}</span>
            </strong>
            <span className="text-stone-400">|</span>
            <span className="font-mono text-stone-600 dark:text-stone-400">
              {formatTimeZoneString(selectedLocation.timeZone)}
            </span>
          </div>
          <div className="text-amber-800 dark:text-amber-300 font-medium bg-amber-100/70 dark:bg-amber-950/50 px-2.5 py-1 rounded-md">
            {formatTimeDifferenceFromNepal(selectedLocation.timeZone)}
          </div>
        </div>

        {/* Top Controls: Search, GPS Detect, Custom Mode toggle */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 space-y-3 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="शहर, राज्य वा देश खोज्नुहोस् (उदा: New York, Sydney, London, पोखरा, दाङ)..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* GPS Detect Button */}
            <button
              onClick={handleDetectGPS}
              disabled={gpsLoading}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50 shrink-0"
              title="ब्राउजरबाट सिधै वर्तमान स्थान पत्ता लगाउनुहोस्"
            >
              <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'स्थान खोज्दै...' : 'मेरो GPS स्थान'}</span>
            </button>

            {/* Custom Coordinate Mode Toggle */}
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors shrink-0 ${
                isCustomMode 
                  ? 'bg-amber-600 text-white border-amber-600' 
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-amber-500'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isCustomMode ? 'सूचीमा फर्कनुहोस्' : 'आफ्नै कोर्डिनेट्स'}</span>
            </button>
          </div>

          {/* GPS Error Alert */}
          {gpsError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs border border-red-200 dark:border-red-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Region Tabs (Only when not in custom mode) */}
          {!isCustomMode && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {WORLD_REGIONS.map((region) => {
                const isActive = activeRegion === region.id;
                return (
                  <button
                    key={region.id}
                    onClick={() => setActiveRegion(region.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-amber-100/60 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>{region.flag}</span>
                    <span>{region.nameNepali}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {isCustomMode ? (
            /* Custom Coordinates Form */
            <form onSubmit={handleSaveCustom} className="max-w-xl mx-auto space-y-4 py-2">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>आफ्नो इच्छा अनुसारको स्थान प्रविष्ट गर्नुहोस्</span>
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/70">
                  विश्वको जुनसुकै स्थानको सही देशान्तर, अक्षांश र UTC समय प्रविष्ट गरी वैदिक पञ्चाङ्ग गणना गर्न सक्नुहुन्छ।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    स्थान / शहरको नाम (City Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="उदा: पर्थ, ब्रुकलिन, आदि"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    देशको नाम (Country)
                  </label>
                  <input
                    type="text"
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    placeholder="उदा: नेपाल, अमेरिका, बेलायत..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    अक्षांश (Latitude: -90° to 90°) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="27.7172"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-stone-500">उत्तर: धनात्मक (+), दक्षिण: ऋणात्मक (-)</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    देशान्तर (Longitude: -180° to 180°) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    placeholder="85.3240"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-stone-500">पूर्व: धनात्मक (+), पश्चिम: ऋणात्मक (-)</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    समय क्षेत्र (UTC Hours: -12 to +14) *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={customTz}
                    onChange={(e) => setCustomTz(e.target.value)}
                    placeholder="5.75"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-stone-500">नेपाल: 5.75 (+5:45), NY: -5</span>
                </div>
              </div>

              {/* Quick TZ Presets */}
              <div className="pt-2">
                <span className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5">द्रुत समय क्षेत्र चयन (Quick Presets):</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🇳🇵 नेपाल (+5:45)', tz: '5.75' },
                    { label: '🇮🇳 भारत (+5:30)', tz: '5.5' },
                    { label: '🇺🇸 US East (-5:00)', tz: '-5' },
                    { label: '🇺🇸 US Central (-6:00)', tz: '-6' },
                    { label: '🇺🇸 US West (-8:00)', tz: '-8' },
                    { label: '🇬🇧 UK GMT (+0:00)', tz: '0' },
                    { label: '🇦🇺 Sydney (+10:00)', tz: '10' },
                    { label: '🇦🇪 Dubai (+4:00)', tz: '4' },
                    { label: '🇯🇵 Japan (+9:00)', tz: '9' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCustomTz(preset.tz)}
                      className="px-2 py-1 text-xs rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  स्थान लागू गर्नुहोस्
                </button>
              </div>
            </form>
          ) : (
            /* Locations Grid */
            <div>
              {filteredLocations.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-stone-400" />
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    "{searchQuery}" सँग मिल्ने कुनै स्थान फेला परेन।
                  </p>
                  <button
                    onClick={() => setIsCustomMode(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>आफ्नै कोर्डिनेट्स (Custom Coordinates) प्रविष्ट गर्नुहोस्</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredLocations.map((loc, idx) => {
                    const active = isSelected(loc);
                    return (
                      <div
                        key={`${loc.name}-${idx}`}
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                          active
                            ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                            : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-800 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-stone-800 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl shrink-0" role="img" aria-label="Country Flag">
                              {loc.flag || '📍'}
                            </span>
                            <div>
                              <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 leading-tight">
                                {loc.name}
                              </h4>
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                {loc.province || loc.state ? `${loc.state || loc.province}, ` : ''}{loc.country}
                              </p>
                            </div>
                          </div>
                          {active && (
                            <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Coordinates & TZ */}
                        <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
                          <span className="font-mono">
                            {formatCoordinatesDevanagari(loc.latitude, loc.longitude)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700/70 font-mono font-medium text-stone-700 dark:text-stone-300">
                            {formatTimeZoneString(loc.timeZone)}
                          </span>
                        </div>

                        {/* Difference from Nepal Time */}
                        <div className="mt-1 text-[11px] text-amber-700/90 dark:text-amber-400/90 flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">{formatTimeDifferenceFromNepal(loc.timeZone)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/90 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>नेपाल, अमेरिका, बेलायत, अस्ट्रेलियालगायत विश्वका सबै प्रमुख शहरहरू उपलब्ध</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
