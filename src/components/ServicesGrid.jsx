import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useApp } from "../context/AppContext";

// Map service icons to specific colored circles matching the mockup
const categoryStyles = {
  electrician: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", icon: "Zap" },
  plumber: { bg: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-650 dark:text-teal-400", icon: "Droplets" },
  carpenter: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", icon: "Hammer" },
  painting: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", icon: "Paintbrush" },
  "house-cleaning": { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-450", icon: "Brush" },
  "ac-repair": { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-450", icon: "Wind" },
  "car-washing": { bg: "bg-sky-50 dark:bg-sky-950/30", text: "text-sky-600 dark:text-sky-400", icon: "Car" },
  gardener: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-450", icon: "Sprout" },
};

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
    <section className="py-16 sm:py-20 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Our Services
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Professional workers for all your needs
          </p>
        </div>

        {/* Category Tabs (only shown when not limiting/home page) */}
        {!limit && (
          <div className="flex flex-wrap gap-2.5 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4.5 py-2 text-xs font-bold rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Services Grid (Centered Mockup Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => {
            // Get category specific styling or fallback
            const style = categoryStyles[service.id] || { 
              bg: "bg-blue-50 dark:bg-blue-950/20", 
              text: "text-blue-600 dark:text-blue-400", 
              icon: service.icon 
            };
            
            const IconComponent = Icons[style.icon] || Icons[service.icon] || Icons.HelpCircle;
            
            return (
              <div
                key={service.id}
                onClick={() => navigate(`/services/${service.id}`)}
                className="group p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 rounded-3xl cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4 shadow-sm"
              >
                {/* Circle Icon Container */}
                <div className={`p-4 rounded-full ${style.bg} ${style.text} transition-transform group-hover:scale-110 duration-350`}>
                  <IconComponent className="w-6 h-6 stroke-[2.2]" />
                </div>

                {/* Content */}
                <div className="space-y-2 min-w-0 w-full">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    {service.name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all button (styled as outline link button) */}
        {limit && services.length > limit && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 border border-blue-600 dark:border-blue-450 hover:bg-blue-600 dark:hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              <span>View All Services</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
