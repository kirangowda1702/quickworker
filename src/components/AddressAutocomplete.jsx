import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, Search } from "lucide-react";

export default function AddressAutocomplete({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // OpenStreetMap Nominatim Autocomplete API (Bounded to Hassan, Karnataka)
  const fetchSuggestions = async (queryText) => {
    if (!queryText.trim() || queryText.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Hassan bounding box: viewbox=76.0,13.1,76.2,12.9 (bounded=1 forces results to Hassan area)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        queryText + ", Hassan, Karnataka"
      )}&limit=5&viewbox=76.0,13.1,76.2,12.9&bounded=1&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "QuickWorker-Hassan-HomeServices-App"
        }
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        const formatted = data.map((item) => ({
          id: item.place_id,
          display_name: item.display_name.replace(", Hassan District, Karnataka, India", "").replace(", Karnataka, India", ""),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        setSuggestions(formatted);
      }
    } catch (error) {
      console.warn("OSM Nominatim API error, falling back to mock Hassan locations:", error);
      
      // Fallback Hassan mock locations list
      const hassanMocks = [
        { display_name: "Kuvempu Nagar Main Road, Hassan", lat: 13.0135, lng: 76.0945 },
        { display_name: "Hemavathi Nagar, Hassan", lat: 13.0078, lng: 76.1023 },
        { display_name: "Vidya Nagar, Hassan", lat: 13.0195, lng: 76.1067 },
        { display_name: "BM Road, Hassan City Center", lat: 13.0055, lng: 76.0921 },
        { display_name: "Channapatna Outer Ring Road, Hassan", lat: 12.9982, lng: 76.0898 },
        { display_name: "Salagame Road (near Government College), Hassan", lat: 13.0232, lng: 76.0911 },
        { display_name: "Dairy Circle, Hassan", lat: 13.0012, lng: 76.1154 },
        { display_name: "Vijaya Nagar Layout, Hassan", lat: 13.0161, lng: 76.1210 }
      ];

      const queryLower = queryText.toLowerCase();
      const matched = hassanMocks.filter((m) =>
        m.display_name.toLowerCase().includes(queryLower)
      );
      setSuggestions(matched.map((m, idx) => ({ id: `mock-${idx}`, ...m })));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setShowDropdown(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500); // 500ms debounce
  };

  const handleSelectSuggestion = (sug) => {
    onChange(sug.display_name);
    setShowDropdown(false);
    onSelect({
      address: sug.display_name,
      lat: sug.lat,
      lng: sug.lng
    });
  };

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500 w-4 h-4" />
        <input
          type="text"
          required
          placeholder="Type street address (e.g. Kuvempunagar...)"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 border border-slate-205 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 animate-spin" />
        )}
      </div>

      {/* Glassmorphism Autocomplete suggestions list */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/85 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[220px] overflow-y-auto">
          {suggestions.map((sug) => (
            <button
              key={sug.id}
              type="button"
              onClick={() => handleSelectSuggestion(sug)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 flex items-start gap-3 transition-colors text-slate-700 dark:text-slate-350"
            >
              <MapPin className="w-4 h-4 text-blue-550 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold truncate leading-tight text-slate-900 dark:text-white">{sug.display_name}</p>
                <span className="text-[10px] text-slate-400">Hassan, Karnataka</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
