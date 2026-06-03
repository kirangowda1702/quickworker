import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ServicesPage() {
  const { services } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Load search from URL parameters if available
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Categories list
  const categories = React.useMemo(() => {
    return ["All", ...new Set(services.map((s) => s.category))];
  }, [services]);

  // Filter service cards
  const filtered = React.useMemo(() => {
    return services.filter((s) => {
      const matchCat = activeCategory === "All" || s.category === activeCategory;
      const matchQuery = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCat && matchQuery;
    });
  }, [services, activeCategory, searchQuery]);

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Block */}
        <div className="text-left space-y-3.5 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/45 px-3 py-1 rounded-full">
            Complete Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            Find the Perfect Service
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Search from our comprehensive list of 30 services available right at your doorstep in Hassan, Karnataka.
          </p>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  // Remove search param from URL when changing categories to clear search context
                  if (searchParams.get("search")) {
                    setSearchParams({});
                    setSearchQuery("");
                  }
                }}
                className={`px-4 py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-[320px]">
            <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-205 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Services Listing Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => {
              const IconComponent = Icons[service.icon] || Icons.HelpCircle;

              return (
                <div
                  key={service.id}
                  onClick={() => navigate(`/services/${service.id}`)}
                  className="group p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left h-full"
                >
                  <div className="space-y-4">
                    {/* Icon & Category */}
                    <div className="flex items-center justify-between">
                      <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 p-3 rounded-2xl border border-blue-100/30 dark:border-blue-900/30">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                        {service.category}
                      </span>
                    </div>

                    {/* Titles */}
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing footer details */}
                  <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Starts from</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">₹{service.price}</span>
                    </div>
                    <button
                      className="px-4 py-2 bg-slate-900 group-hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm"
                    >
                      <span>Hire Expert</span>
                      <Icons.ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl space-y-4">
            <Icons.AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No services match your criteria</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">Try checking your spelling or filter another category tab above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
