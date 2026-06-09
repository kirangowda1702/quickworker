import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Briefcase, Phone, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { getDistance } from "../data";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
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

export default function FeaturedWorkers() {
  const { workers, userLocation } = useApp();
  const navigate = useNavigate();

  // Get top 4 rated workers with high ratings (>= 4.7)
  const featured = React.useMemo(() => {
    const list = workers.map(w => {
      const lat = w.coordinates?.lat || 13.0065;
      const lng = w.coordinates?.lng || 76.1002;
      const dist = getDistance(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      );
      return { ...w, currentDistance: parseFloat(dist.toFixed(1)) };
    });
    
    // Sort by rating descending
    return list
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [workers, userLocation]);

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Top Rated Workers
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Highly rated and experienced workers
          </p>
        </div>

        {/* Worker Cards Grid (Animate with Framer Motion) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
        >
          {featured.map((worker) => (
            <motion.div 
              key={worker.id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              className="group bg-white dark:bg-slate-950/40 border border-slate-205 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden"
            >
              {/* Availability Badge */}
              <span className={`absolute top-4 right-4 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${
                worker.isAvailable 
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" 
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
              }`}>
                {worker.isAvailable ? "Available" : "Busy"}
              </span>

              <div className="space-y-4">
                {/* Worker Avatar & Name Row */}
                <div className="flex items-center gap-4">
                  <img 
                    src={worker.avatar} 
                    alt={worker.name} 
                    className="w-14 h-14 rounded-full border border-slate-100 dark:border-slate-800 object-cover shrink-0 bg-slate-50" 
                  />
                  <div className="min-w-0 pr-14">
                    <h3 className="font-extrabold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      {worker.name}
                    </h3>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {worker.serviceName}
                    </span>
                  </div>
                </div>

                {/* Ratings & Details Block */}
                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  {/* Rating stars & Experience */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                      <Star className="w-4 h-4 text-yellow-500 fill-current shrink-0" />
                      <span>{worker.rating}</span>
                      <span className="font-medium text-slate-400">({worker.reviewsCount})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{worker.experience} yrs exp</span>
                    </span>
                  </div>

                  {/* Location & Distance */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{worker.locality}</span>
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                      {worker.currentDistance} km away
                    </span>
                  </div>

                  {/* Starting Price */}
                  <p className="font-extrabold text-slate-900 dark:text-white text-lg pt-1">
                    ₹{worker.price} <span className="text-xs text-slate-400 font-medium">/ Visit</span>
                  </p>
                </div>
              </div>

              {/* WhatsApp, Call, and Book Now actions */}
              <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-slate-100 dark:border-slate-800/80">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${worker.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(worker.name)}%2C%20I%20found%20you%20on%20QuickWorker!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 border border-emerald-500/35 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${worker.phone}`}
                    className="py-2 px-3 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Pro</span>
                  </a>
                </div>
                
                <button
                  onClick={() => navigate(`/book/${worker.id}`)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-755 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow-blue-500/10 transition-all text-center cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View all link button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/services")}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-650 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <span>View All Workers</span>
            <span>→</span>
          </button>
        </div>

      </div>
    </section>
  );
}
