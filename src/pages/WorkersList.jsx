import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Star, 
  MapPin, 
  Briefcase, 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Filter, 
  ArrowUpDown, 
  MapIcon, 
  CheckCircle,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getDistance } from "../data";

export default function WorkersList() {
  const { serviceId } = useParams();
  const { workers, services, userLocation, refreshLocation } = useApp();
  const navigate = useNavigate();

  // Search filter options
  const [genderFilter, setGenderFilter] = useState("All");
  const [localityFilter, setLocalityFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All"); // All, Available
  const [sortBy, setSortBy] = useState("distance"); // distance, rating, priceAsc, priceDesc

  // Get current service details
  const service = useMemo(() => {
    return services.find((s) => s.id === serviceId);
  }, [services, serviceId]);

  // Extract unique localities among the workers for this service for filter dropdown
  const serviceWorkers = useMemo(() => {
    return workers.filter((w) => w.serviceId === serviceId);
  }, [workers, serviceId]);

  const uniqueLocalities = useMemo(() => {
    return ["All", ...new Set(serviceWorkers.map((w) => w.locality))];
  }, [serviceWorkers]);

  // Filter and sort workers
  const processedWorkers = useMemo(() => {
    // 1. Calculate actual live distance for all workers
    let list = serviceWorkers.map((w) => {
      const lat = w.coordinates?.lat || 13.0065;
      const lng = w.coordinates?.lng || 76.1002;
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      );
      return { 
        ...w, 
        currentDistance: parseFloat(distance.toFixed(1)) 
      };
    });

    // 2. Apply Filters
    if (genderFilter !== "All") {
      list = list.filter((w) => w.gender === genderFilter);
    }
    if (localityFilter !== "All") {
      list = list.filter((w) => w.locality === localityFilter);
    }
    if (availabilityFilter === "Available") {
      list = list.filter((w) => w.isAvailable);
    }

    // 3. Apply Sorting
    if (sortBy === "distance") {
      list.sort((a, b) => a.currentDistance - b.currentDistance);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "priceAsc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [serviceWorkers, genderFilter, localityFilter, availabilityFilter, sortBy, userLocation]);

  if (!service) {
    return (
      <div className="flex-1 py-16 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Service Category Not Found</h3>
        <Link to="/services" className="text-blue-500 hover:underline">Return to services list</Link>
      </div>
    );
  }

  // Pre-filled WhatsApp message generator
  const getWhatsAppLink = (worker) => {
    const text = `Hi ${worker.name}, I saw your profile on QuickWorker for ${worker.serviceName} and would like to inquire about booking a service.`;
    return `https://wa.me/${worker.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs text-left">
          <Link to="/services" className="hover:text-blue-500 transition-colors">Services</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">{service.name}</span>
        </div>

        {/* Hero header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-850/80 text-left">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Hire Nearby {service.name}s
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
              {service.description} Exactly 20 professionals available near Hassan localities.
            </p>
          </div>

          {/* Location details card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-4.5 min-w-[280px]">
            <MapIcon className="w-9 h-9 text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Address</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userLocation.address}</p>
              <button 
                onClick={refreshLocation} 
                className="text-[11px] text-blue-600 dark:text-blue-400 font-extrabold hover:underline block mt-0.5"
              >
                Change Location / GPS
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sorting Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Filters Panel */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 space-y-6 text-left shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm sm:text-base">
                <Filter className="w-4 h-4 text-blue-500" />
                <span>Filters</span>
              </span>
              <button 
                onClick={() => {
                  setGenderFilter("All");
                  setLocalityFilter("All");
                  setAvailabilityFilter("All");
                  setSortBy("distance");
                }}
                className="text-[11px] font-bold text-blue-500 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Gender filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block">Gender</label>
              <div className="flex flex-col gap-1.5">
                {["All", "Male", "Female"].map((gender) => (
                  <label key={gender} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer py-0.5 hover:text-slate-900">
                    <input
                      type="radio"
                      name="gender"
                      checked={genderFilter === gender}
                      onChange={() => setGenderFilter(gender)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-1"
                    />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Locality filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider block">Locality in Hassan</label>
              <select
                value={localityFilter}
                onChange={(e) => setLocalityFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-750 dark:text-slate-350"
              >
                {uniqueLocalities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === "All" ? "All Hassan Localities" : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider block">Availability</label>
              <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 py-1">
                <input
                  type="checkbox"
                  checked={availabilityFilter === "Available"}
                  onChange={(e) => setAvailabilityFilter(e.target.checked ? "Available" : "All")}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-1"
                />
                <span>Available Workers Only</span>
              </label>
            </div>

            {/* Sort by */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
                <span>Sort by</span>
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: "distance", label: "Nearest Distance" },
                  { value: "rating", label: "Customer Rating" },
                  { value: "priceAsc", label: "Price: Low to High" },
                  { value: "priceDesc", label: "Price: High to Low" }
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer py-0.5 hover:text-slate-900">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === opt.value}
                      onChange={() => setSortBy(opt.value)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-1"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Workers List */}
          <div className="md:col-span-9 space-y-5">
            
            {/* Workers Count summary */}
            <div className="flex items-center justify-between text-xs text-slate-500 pl-1">
              <span>Showing <strong>{processedWorkers.length}</strong> of exactly 20 workers matching filters</span>
              <span>Sorted by {sortBy === "distance" ? "Nearest distance" : sortBy === "rating" ? "Rating" : "Price"}</span>
            </div>

            {/* Workers Card Grid */}
            {processedWorkers.length > 0 ? (
              <div className="space-y-4">
                {processedWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="group p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row justify-between gap-5 text-left relative overflow-hidden"
                  >
                    {/* Left details panel */}
                    <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="relative shrink-0 w-20 h-20 mx-auto sm:mx-0">
                        <img 
                          src={worker.avatar} 
                          alt={worker.name} 
                          className="w-20 h-20 rounded-2xl border-2 border-slate-100 dark:border-slate-800 object-cover" 
                        />
                        {worker.isAvailable && (
                          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900" title="Available">
                            <CheckCircle className="w-3.5 h-3.5 fill-current text-emerald-500" />
                          </span>
                        )}
                      </div>

                      {/* Info description */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                            {worker.name}
                          </h3>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">
                            {worker.gender}
                          </span>
                          {!worker.isAvailable && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-full">
                              Busy
                            </span>
                          )}
                        </div>

                        {/* Experience, completed jobs, rating */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-bold text-slate-950 dark:text-white">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{worker.rating}</span>
                            <span className="font-normal text-slate-500">({worker.reviewsCount} jobs)</span>
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{worker.experience} Years Exp</span>
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{worker.locality}</span>
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed line-clamp-2">
                          {worker.about}
                        </p>
                      </div>
                    </div>

                    {/* Right action & booking panel */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 sm:pl-5 sm:border-l border-slate-100 dark:border-slate-800/80">
                      
                      {/* Price tag */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Upfront Fare</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">₹{worker.price}</span>
                          <span className="text-[10px] text-slate-500">starting</span>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{worker.currentDistance} km away</span>
                      </div>

                      {/* Communications and booking buttons */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <a
                          href={getWhatsAppLink(worker)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 border border-emerald-500/30 text-emerald-600 dark:text-emerald-500 bg-emerald-50/30 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                          title="Chat with worker on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 fill-current text-emerald-500 hover:text-white" />
                        </a>
                        
                        <a
                          href={`tel:${worker.phone}`}
                          className="p-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                          title="Call worker directly"
                        >
                          <Phone className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => navigate(`/book/${worker.id}`)}
                          disabled={!worker.isAvailable}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:hover:bg-blue-600 cursor-pointer"
                        >
                          Book Now
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No workers match your filter choices</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">Try resetting filters or expanding your locality searches to find nearby pros.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
