import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Briefcase, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getDistance } from "../data";

export default function FeaturedWorkers() {
  const { workers, userLocation } = useApp();
  const navigate = useNavigate();

  // Get top 4 rated workers with high ratings (>= 4.8)
  const featured = React.useMemo(() => {
    // Sort by rating descending, and calculate actual distance from user
    const list = workers.map(w => {
      const dist = getDistance(
        userLocation.lat,
        userLocation.lng,
        w.coordinates.lat,
        w.coordinates.lng
      );
      return { ...w, currentDistance: parseFloat(dist.toFixed(1)) };
    });
    
    return list
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [workers, userLocation]);

  return (
    <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full">
            Expert Handpicked Professionals
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Top Rated Near You
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base">
            Book local specialists in Hassan with proven service excellence and immediate availability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((worker) => (
            <div 
              key={worker.id}
              className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-slate-350 dark:hover:border-slate-700/80 transition-all duration-300 transform hover:-translate-y-1 text-left relative overflow-hidden"
            >
              {/* Availability Badge */}
              <span className={`absolute top-4 right-4 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                worker.isAvailable 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" 
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-450"
              }`}>
                {worker.isAvailable ? "Available" : "Busy"}
              </span>

              {/* Header Info */}
              <div className="flex items-center gap-4.5 mb-4">
                <img 
                  src={worker.avatar} 
                  alt={worker.name} 
                  className="w-14 h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 object-cover" 
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {worker.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    {worker.serviceName}
                  </p>
                </div>
              </div>

              {/* Middle Stats */}
              <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <strong className="text-slate-900 dark:text-white font-bold">{worker.rating}</strong>
                    <span>({worker.reviewsCount} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{worker.experience} yrs exp</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{worker.locality}</span>
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {worker.currentDistance} km away
                  </span>
                </div>
              </div>

              {/* Price & Book now action */}
              <div className="flex items-center justify-between pt-4 mt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Starting at</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">₹{worker.price}</span>
                </div>
                <button
                  onClick={() => navigate(`/book/${worker.id}`)}
                  disabled={!worker.isAvailable}
                  className="px-4.5 py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-2xl transition-all shadow-sm hover:shadow-md hover:shadow-blue-500/10 disabled:opacity-50 disabled:hover:bg-slate-900"
                >
                  Book Pro
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
