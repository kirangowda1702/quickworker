import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ServicesGrid({ limit }) {
  const { services } = useApp();
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  // Get unique categories list
  const categories = React.useMemo(() => {
    return ["All", ...new Set(services.map((s) => s.category))];
  }, [services]);

  // Filter services by category
  const filteredServices = React.useMemo(() => {
    const list = activeCategory === "All" 
      ? services 
      : services.filter((s) => s.category === activeCategory);
    
    return limit ? list.slice(0, limit) : list;
  }, [services, activeCategory, limit]);

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="text-left space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">
              Explore Our Offerings
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Professional Services Catalog
            </h2>
            <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base max-w-xl">
              Choose from 30 expert services. Hire background verified professionals at flat upfront rates.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            // Dynamically load the icon
            const IconComponent = Icons[service.icon] || Icons.HelpCircle;
            
            return (
              <div
                key={service.id}
                onClick={() => navigate(`/services/${service.id}`)}
                className="group p-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-850/80 rounded-3xl cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl transition-all duration-300 flex items-start gap-5 text-left"
              >
                {/* Icon Container */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3.5 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 transition-colors shadow-sm">
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {service.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                      ₹{service.price}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="pt-2 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                    <span>Find Workers</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all button (for home page layout) */}
        {limit && services.length > limit && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/services")}
              className="px-8 py-3.5 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-500 shadow-md text-sm transition-all"
            >
              View All 30 Services
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
