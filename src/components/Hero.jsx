import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Clock, Star, MapPin, Zap, Droplets, Paintbrush, Brush, CheckCircle, CircleDollarSign, Flame } from "lucide-react";
import { services } from "../data";
import heroWorkersImg from "../assets/hero_workers.png";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 1) {
      const filtered = services.filter((s) =>
        s.name.toLowerCase().includes(val.toLowerCase()) ||
        s.category.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/services?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/services");
    }
  };

  const handleSuggestionClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950 pt-10 pb-16 sm:py-20 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      {/* Background radial light gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-50/50 dark:bg-blue-950/10 blur-3xl pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-left space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Find Trusted <br />
              <span className="text-blue-600 dark:text-blue-400">Workers</span> Near You
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Book electricians, plumbers, painters, cleaners and many more skilled workers instantly from your area.
            </p>

            {/* Smart Location Search Form */}
            <div className="relative max-w-xl z-20">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-2 rounded-2.5xl border border-slate-205 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
                <div className="relative flex-1 flex items-center gap-2 pl-3">
                  <MapPin className="text-blue-500 w-5 h-5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Hassan, Karnataka (e.g. Electrician...)"
                    value={query}
                    onChange={handleSearchChange}
                    className="w-full py-3.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-450 border-none outline-none focus:ring-0 text-sm"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute left-[-8px] right-[-8px] top-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 animate-scale-up">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSuggestionClick(s.id)}
                          className="w-full text-left px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between text-slate-700 dark:text-slate-350 transition-colors"
                        >
                          <span className="font-semibold text-sm">{s.name}</span>
                          <span className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider">{s.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md hover:shadow-blue-500/20 transition-all text-sm shrink-0 cursor-pointer"
                >
                  Find Workers
                </button>
              </form>
            </div>

            {/* Checklist Badges Row */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-8 pt-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-350">
              <span className="flex items-center gap-2">
                <div className="p-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-100 dark:border-emerald-900/60">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-450 fill-current text-white" />
                </div>
                <span>Verified Workers</span>
              </span>

              <span className="flex items-center gap-2">
                <div className="p-1 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-100 dark:border-blue-900/60">
                  <CircleDollarSign className="w-4 h-4 text-blue-600 dark:text-blue-450 fill-current text-white" />
                </div>
                <span>Affordable Prices</span>
              </span>

              <span className="flex items-center gap-2">
                <div className="p-1 bg-purple-50 dark:bg-purple-950/40 rounded-full border border-purple-100 dark:border-purple-900/60">
                  <Zap className="w-4 h-4 text-purple-600 dark:text-purple-450 fill-current text-white" />
                </div>
                <span>Quick Service</span>
              </span>
            </div>
          </div>

          {/* Right Visual Image Column */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Visual background circular rings */}
            <div className="absolute w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] rounded-full border-2 border-dashed border-blue-100 dark:border-blue-900/40 animate-spin-slow"></div>
            <div className="absolute w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full bg-blue-50/40 dark:bg-blue-950/10"></div>
            
            {/* Main Workers Portrait Asset */}
            <img 
              src={heroWorkersImg} 
              alt="Trusted Workers Near You" 
              className="relative w-full max-w-[360px] sm:max-w-[420px] h-auto object-contain drop-shadow-2xl z-10" 
            />

            {/* Floating Service Badges (Electrician, Plumber, Painter, Cleaner) */}
            {/* Plumber Faucet badge */}
            <div className="absolute top-10 left-4 sm:left-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-full shadow-lg z-20 flex items-center justify-center animate-bounce-slow">
              <div className="bg-sky-500 text-white p-1.5 rounded-full">
                <Droplets className="w-4 h-4" />
              </div>
            </div>

            {/* Electrician Bulb badge */}
            <div className="absolute top-[-10px] right-10 sm:right-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-full shadow-lg z-20 flex items-center justify-center animate-bounce-delayed">
              <div className="bg-amber-400 text-white p-1.5 rounded-full">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            {/* Painter badge */}
            <div className="absolute bottom-10 right-4 sm:right-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-full shadow-lg z-20 flex items-center justify-center animate-bounce-slow">
              <div className="bg-indigo-500 text-white p-1.5 rounded-full">
                <Paintbrush className="w-4 h-4" />
              </div>
            </div>

            {/* Cleaning badge */}
            <div className="absolute bottom-20 left-4 sm:left-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-full shadow-lg z-20 flex items-center justify-center animate-bounce-delayed">
              <div className="bg-emerald-500 text-white p-1.5 rounded-full">
                <Brush className="w-4 h-4" />
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}
