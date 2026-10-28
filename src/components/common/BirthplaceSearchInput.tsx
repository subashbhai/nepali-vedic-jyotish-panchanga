import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, Loader2, Check, X, Globe, AlertCircle } from 'lucide-react';
import { LocationData } from '../../types/astrology';
import { WORLD_LOCATIONS_DATA } from '../../data/worldLocations';

interface BirthplaceSearchInputProps {
  value?: LocationData | null;
  onChange: (location: LocationData) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const BirthplaceSearchInput: React.FC<BirthplaceSearchInputProps> = ({
  value,
  onChange,
  required = true,
  className = '',
  placeholder = 'जन्म स्थान खोज्नुहोस् (उदा: काठमाडौँ, पोखरा, विराटनगर वा विश्वका कुनै पनि शहर...)'
}) => {
  const [searchTerm, setSearchTerm] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal search term when external value changes
  useEffect(() => {
    if (value && value.name && value.name !== searchTerm) {
      setSearchTerm(value.name);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search local WORLD_LOCATIONS_DATA
  const searchLocalLocations = (query: string): LocationData[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return WORLD_LOCATIONS_DATA.filter(loc => {
      return (
        (loc.name && loc.name.toLowerCase().includes(q)) ||
        (loc.englishName && loc.englishName.toLowerCase().includes(q)) ||
        (loc.district && loc.district.toLowerCase().includes(q)) ||
        (loc.province && loc.province.toLowerCase().includes(q)) ||
        (loc.country && loc.country.toLowerCase().includes(q))
      );
    }).slice(0, 5);
  };

  // Search online via Nominatim OpenStreetMap
  const searchOnlineLocations = async (query: string) => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const localMatches = searchLocalLocations(q);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=6`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'ne,hi,en'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const onlineMatches: LocationData[] = (data || []).map((item: any) => {
          const addr = item.address || {};
          const country = addr.country || 'नेपाल';
          const province = addr.state || addr.province || addr.region || '';
          const district = addr.county || addr.state_district || addr.district || '';
          const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || item.name;
          const tole = addr.road || addr.neighbourhood || addr.suburb || '';

          // Approximate timezone
          let tz = 5.75; // Default Nepal +05:45
          const lng = parseFloat(item.lon);
          const lat = parseFloat(item.lat);

          if (country.toLowerCase().includes('india') || country.includes('भारत')) {
            tz = 5.5;
          } else if (country.toLowerCase().includes('united states') || country.toLowerCase().includes('usa')) {
            tz = lng < -115 ? -8 : lng < -100 ? -7 : lng < -85 ? -6 : -5;
          } else if (country.toLowerCase().includes('united kingdom') || country.toLowerCase().includes('uk')) {
            tz = 0;
          } else if (country.toLowerCase().includes('australia')) {
            tz = lng > 140 ? 10 : lng > 125 ? 9.5 : 8;
          } else {
            // Rough longitude-based timezone calculation for other places
            tz = Math.round((lng / 15) * 4) / 4;
          }

          const labelParts = [city, district, province, country].filter(Boolean);
          const formattedName = labelParts.length > 0 ? labelParts.join(', ') : item.display_name;

          return {
            name: formattedName,
            englishName: item.display_name,
            district,
            province,
            country,
            localBody: city,
            tole,
            latitude: lat,
            longitude: lng,
            timeZone: tz,
            timezone: tz
          };
        });

        // Merge local matches and online matches, avoiding duplicates
        const combined = [...localMatches];
        onlineMatches.forEach(om => {
          if (!combined.some(c => Math.abs(c.latitude - om.latitude) < 0.05 && Math.abs(c.longitude - om.longitude) < 0.05)) {
            combined.push(om);
          }
        });

        setSuggestions(combined.slice(0, 8));
      } else {
        setSuggestions(localMatches);
      }
    } catch {
      setSuggestions(localMatches);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setGpsError(null);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Fast local match display
    const local = searchLocalLocations(val);
    if (local.length > 0) {
      setSuggestions(local);
    }

    // Debounced online search
    debounceTimerRef.current = setTimeout(() => {
      searchOnlineLocations(val);
    }, 350);
  };

  const handleSelectLocation = (loc: LocationData) => {
    setSearchTerm(loc.name);
    setIsOpen(false);
    setSuggestions([]);
    onChange(loc);
  };

  // Manual fallback selection
  const handleUseCustomLocation = () => {
    const raw = searchTerm.trim();
    if (!raw) return;
    const customLoc: LocationData = {
      name: raw,
      district: raw,
      province: 'नेपाल',
      country: 'नेपाल',
      latitude: 27.7172,
      longitude: 85.3240,
      timeZone: 5.75,
      timezone: 5.75
    };
    handleSelectLocation(customLoc);
  };

  // Explicit User GPS Location Trigger
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('यस ब्राउजरमा GPS स्थान उपलब्ध छैन। कृपया नाम टाइप गरी छान्नुहोस्।');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { 'Accept-Language': 'ne,hi,en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || 'हालको स्थान';
            const district = addr.county || addr.district || '';
            const province = addr.state || '';
            const country = addr.country || 'नेपाल';
            const name = [city, district, province, country].filter(Boolean).join(', ');

            const gpsLoc: LocationData = {
              name,
              englishName: data.display_name || name,
              district,
              province,
              country,
              localBody: city,
              latitude: lat,
              longitude: lng,
              timeZone: 5.75,
              timezone: 5.75
            };
            handleSelectLocation(gpsLoc);
          } else {
            // Direct coordinates fallback
            const coordLoc: LocationData = {
              name: `GPS स्थान (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
              latitude: lat,
              longitude: lng,
              timeZone: 5.75,
              timezone: 5.75,
              country: 'नेपाल'
            };
            handleSelectLocation(coordLoc);
          }
        } catch {
          const coordLoc: LocationData = {
            name: `GPS स्थान (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
            latitude: lat,
            longitude: lng,
            timeZone: 5.75,
            timezone: 5.75,
            country: 'नेपाल'
          };
          handleSelectLocation(coordLoc);
        } finally {
          setIsGpsLoading(false);
        }
      },
      (err) => {
        setIsGpsLoading(false);
        setGpsError('स्थान पत्ता लगाउन सकिएन। कृपया ब्राउजरलाई लोकेसन अनुमति दिनुहोस् वा हातैले नाम टाइप गर्नुहोस्।');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div ref={wrapperRef} className={`relative space-y-1.5 ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-stone-400 dark:text-stone-500 pointer-events-none">
          <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchTerm.trim().length >= 1) {
              setIsOpen(true);
              if (suggestions.length === 0) searchOnlineLocations(searchTerm);
            }
          }}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-xs"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin mr-1" />}

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSuggestions([]);
              }}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              title="हटाउनुहोस्"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleGetGpsLocation}
            disabled={isGpsLoading}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-stone-700 text-[11px] font-bold transition-colors cursor-pointer"
            title="मेरो हालको स्थान पत्ता लगाउनुहोस् (GPS)"
          >
            {isGpsLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
            ) : (
              <Navigation className="w-3 h-3 text-amber-600" />
            )}
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 px-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Selected Coordinates Tag */}
      {value && value.latitude !== undefined && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold font-sans">
            <Check className="w-3 h-3" /> स्थान प्रमाणित
          </span>
          <span>Lat: {value.latitude.toFixed(4)}°</span>
          <span>Lng: {value.longitude.toFixed(4)}°</span>
          <span>TZ: +{value.timeZone || 5.75}</span>
        </div>
      )}

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl py-1.5 divide-y divide-stone-100 dark:divide-stone-800/60">
          {suggestions.length > 0 ? (
            suggestions.map((loc, idx) => (
              <button
                key={`${loc.name}-${idx}`}
                type="button"
                onClick={() => handleSelectLocation(loc)}
                className="w-full px-3.5 py-2 text-left hover:bg-amber-50 dark:hover:bg-stone-800/80 transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <MapPin className="w-4 h-4 text-amber-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                    {loc.name}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    {[loc.localBody, loc.district, loc.province, loc.country].filter(Boolean).join(', ')} • Lat: {loc.latitude.toFixed(2)}°, Lng: {loc.longitude.toFixed(2)}°
                  </div>
                </div>
              </button>
            ))
          ) : !isLoading && searchTerm.trim().length >= 2 ? (
            <div className="p-3 text-center space-y-2">
              <div className="text-xs text-stone-500 dark:text-stone-400">
                सुझाव भेटिएन। तपाईं यो स्थानलाई सिधै प्रयोग गर्न सक्नुहुन्छ:
              </div>
              <button
                type="button"
                onClick={handleUseCustomLocation}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>'{searchTerm}' नै प्रयोग गर्नुहोस्</span>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
