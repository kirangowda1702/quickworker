import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Clock, Star, MapPin } from "lucide-react";
import { services } from "../data";

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
    }
  };

  const handleSuggestionClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  const quickLinks = [
    { name: "Electrician", id: "electrician" },
    { name: "Plumber", id: "plumber" },
    { name: "AC Service", id: "ac-repair" },
    { name: "Home Cleaning", id: "house-cleaning" },
    { name: "Women's Salon", id: "beautician-women" }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 pt-10 pb-20 sm:py-24">
      {/* Absolute Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-yellow-400/10 dark:bg-yellow-600/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-left space-y-6 sm:space-y-8 animate-slide-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100/80 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-900/40 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping"></span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wide uppercase">Quick, Trusted Home Services in Hassan</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.1]">
              Find Nearby Experts <br />
              For All <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Home Tasks</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-350 max-w-xl leading-relaxed">
              Book professional electricians, plumbers, painters, cleaners, and beauticians instantly. 
              Over <strong className="text-slate-900 dark:text-white">600+ verified workers</strong> located right in Hassan, Karnataka, sorted by distance and customer rating.
            </p>

            {/* Premium Search Bar */}
            <div className="relative max-w-2xl">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for 'electrician', 'sofa cleaning', 'haircut'..."
                    value={query}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent shadow-lg shadow-slate-100 dark:shadow-none transition-all"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSuggestionClick(s.id)}
                          className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <span className="font-semibold text-sm">{s.name}</span>
                          <span className="text-xs text-blue-500 font-medium bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">{s.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Popular:</span>
              {quickLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => navigate(`/services/${link.id}`)}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Visual Card Column */}
          <div className="lg:col-span-5 relative flex justify-center animate-fade-in">
            {/* Visual Backdrops */}
            <div className="absolute w-[80%] h-[80%] bg-blue-500/10 dark:bg-blue-500/5 rounded-3xl transform rotate-6 border border-blue-500/20"></div>
            <div className="absolute w-[80%] h-[80%] bg-yellow-400/10 dark:bg-yellow-400/5 rounded-3xl transform -rotate-3 border border-yellow-400/20"></div>

            {/* Main Interactive Stat Card */}
            <div className="relative w-full max-w-[370px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-400 p-2 rounded-xl">
                    <Star className="w-5 h-5 text-slate-950 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white leading-tight">4.9 / 5.0 Rating</h3>
                    <p className="text-xs text-slate-500">Based on 14k+ reviews</p>
                  </div>
                </div>
              </div>

              {/* Service details mockup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">100% Insured Jobs</h4>
                      <p className="text-xs text-slate-500">Cover up to ₹10,000</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">45 Mins Arrival</h4>
                      <p className="text-xs text-slate-500">Fastest response in Hassan</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 p-2 rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Tracking</h4>
                      <p className="text-xs text-slate-500">Track worker live on map</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <button
                onClick={() => navigate("/services")}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-500/10 text-sm transition-all"
              >
                Book Your First Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
