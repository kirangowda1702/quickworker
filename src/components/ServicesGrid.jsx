import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

// Map service icons to premium gradients and colors matching the mockup
const categoryStyles = {
  electrician: { bg: "bg-gradient-to-br from-blue-500/10 to-blue-600/5", text: "text-blue-600 dark:text-blue-400", border: "hover:border-blue-500/30", icon: "Zap" },
  plumber: { bg: "bg-gradient-to-br from-teal-500/10 to-teal-600/5", text: "text-teal-650 dark:text-teal-400", border: "hover:border-teal-500/30", icon: "Droplets" },
  carpenter: { bg: "bg-gradient-to-br from-amber-500/10 to-amber-600/5", text: "text-amber-655 dark:text-amber-400", border: "hover:border-amber-500/30", icon: "Hammer" },
  painting: { bg: "bg-gradient-to-br from-purple-500/10 to-purple-600/5", text: "text-purple-600 dark:text-purple-400", border: "hover:border-purple-500/30", icon: "Paintbrush" },
  "ac-repair": { bg: "bg-gradient-to-br from-rose-500/10 to-rose-600/5", text: "text-rose-600 dark:text-rose-455", border: "hover:border-rose-500/30", icon: "Wind" },
  "house-cleaning": { bg: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5", text: "text-emerald-600 dark:text-emerald-450", border: "hover:border-emerald-500/30", icon: "Brush" },
  appliance: { bg: "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5", text: "text-indigo-600 dark:text-indigo-450", border: "hover:border-indigo-500/30", icon: "Tv" },
  "sofa-cleaning": { bg: "bg-gradient-to-br from-cyan-500/10 to-cyan-600/5", text: "text-cyan-650 dark:text-cyan-400", border: "hover:border-cyan-500/30", icon: "Brush" },
  "deep-cleaning": { bg: "bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-600/5", text: "text-fuchsia-600 dark:text-fuchsia-400", border: "hover:border-fuchsia-500/30", icon: "Sparkles" },
  gardener: { bg: "bg-gradient-to-br from-green-500/10 to-green-600/5", text: "text-green-600 dark:text-green-455", border: "hover:border-green-500/30", icon: "Sprout" },
  driver: { bg: "bg-gradient-to-br from-sky-500/10 to-sky-600/5", text: "text-sky-600 dark:text-sky-400", border: "hover:border-sky-500/30", icon: "Car" },
  "cctv-install": { bg: "bg-gradient-to-br from-pink-500/10 to-pink-600/5", text: "text-pink-600 dark:text-pink-400", border: "hover:border-pink-500/30", icon: "Video" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function ServicesGrid({ limit }) {
  const { services } = useApp();
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  // Get unique categories list
  const categories = React.useMemo(() => {
    return ["All", ...new Set(services.map((s) => s.category))];
  }, [services]);

  // Filter services by category (or strictly load the 12 requested categories on the home page)
  const filteredServices = React.useMemo(() => {
    if (limit) {
      const targetIds = [
        "electrician", "plumber", "carpenter", "painting", "ac-repair", "house-cleaning",
        "appliance", "sofa-cleaning", "deep-cleaning", "gardener", "driver", "cctv-install"
      ];
      return targetIds
        .map(id => services.find(s => s.id === id))
        .filter(Boolean);
    }
    
    const list = activeCategory === "All" 
      ? services 
      : services.filter((s) => s.category === activeCategory);
      
    return list;
  }, [services, activeCategory, limit]);

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
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
                    : "bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Services Grid (Animate with Framer Motion) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredServices.map((service) => {
            const style = categoryStyles[service.id] || { 
              bg: "bg-blue-500/10", 
              text: "text-blue-600 dark:text-blue-400", 
              border: "hover:border-blue-500/30",
              icon: service.icon 
            };
            
            const IconComponent = Icons[style.icon] || Icons[service.icon] || Icons.HelpCircle;
            
            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate(`/services/${service.id}`)}
                className={`group p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/85 rounded-3xl cursor-pointer shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-900 ${style.border} transition-all duration-300 flex flex-col items-center text-center space-y-4`}
              >
                {/* Circle Icon Container with Gradient Background */}
                <div className={`p-4 rounded-full ${style.bg} ${style.text} transition-transform group-hover:scale-110 duration-300`}>
                  <IconComponent className="w-6 h-6 stroke-[2.2]" />
                </div>

                {/* Content */}
                <div className="space-y-2 min-w-0 w-full">
                  <h3 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-450 transition-colors">
                    {service.name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View all button (styled as outline link button) */}
        {limit && services.length > limit && (
          <div className="text-center mt-12 sm:mt-16">
            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-1.5 px-6.5 py-3 border border-blue-600 dark:border-blue-500 hover:bg-blue-600 dark:hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white font-extrabold rounded-2xl text-xs tracking-wide uppercase transition-all shadow-sm hover:shadow-blue-500/10 cursor-pointer"
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
