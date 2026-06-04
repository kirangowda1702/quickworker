import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Briefcase } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getDistance } from "../data";

export default function FeaturedWorkers() {
  const { workers, userLocation } = useApp();
  const navigate = useNavigate();

  // Get top 4 rated workers with high ratings (>= 4.7)
  const featured = React.useMemo(() => {
    const list = workers.map(w => {
      const dist = getDistance(
        userLocation.lat,
        userLocation.lng,
        w.coordinates.lat,
        w.coordinates.lng
      );
      return { ...w, currentDistance: parseFloat(dist.toFixed(1)) };
    });
    
    // Sort by rating descending
    return list
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [workers, userLocation]);

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Top Rated Workers
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Highly rated and experienced workers
          </p>
        </div>

        {/* Worker Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {featured.map((worker) => (
            <div 
              key={worker.id}
              className="group bg-white dark:bg-slate-950/40 border border-slate-205 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                {/* Worker Avatar & Name Row */}
                <div className="flex items-center gap-4">
                  <img 
                    src={worker.avatar} 
                    alt={worker.name} 
                    className="w-14 h-14 rounded-full border border-slate-100 dark:border-slate-800 object-cover shrink-0 bg-slate-50" 
                  />
                  <div className="min-w-0">
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
                  {/* Rating stars */}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current shrink-0" />
                    <span className="font-bold text-slate-850 dark:text-slate-200">{worker.rating}</span>
                    <span>({worker.reviewsCount})</span>
                  </div>

                  {/* Experience */}
                  <p className="font-medium text-slate-700 dark:text-slate-350">
                    {worker.experience}+ Years Experience
                  </p>

                  {/* Starting Price */}
                  <p className="font-extrabold text-slate-900 dark:text-white text-base">
                    ₹{worker.price} <span className="text-xs text-slate-400 font-medium">/ Visit</span>
                  </p>
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => navigate(`/book/${worker.id}`)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-755 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow-blue-500/10 transition-all text-center cursor-pointer"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>

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
