import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Handshake, Search, Calendar, Clock, ArrowRight, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react";
import Hero from "../components/Hero";
import ServicesGrid from "../components/ServicesGrid";
import FeaturedWorkers from "../components/FeaturedWorkers";
import WhyChoose from "../components/WhyChoose";
import { useApp } from "../context/AppContext";

export default function Home() {
  const navigate = useNavigate();
  const { user, bookings } = useApp();
  
  // Tracking state
  const [trackId, setTrackId] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // Active bookings list
  const activeBookings = useMemo(() => {
    return bookings.filter(b => b.status === "Pending" || b.status === "Approved");
  }, [bookings]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    
    const found = bookings.find(
      (b) => b.bookingId.toUpperCase() === trackId.toUpperCase().trim() || b.id === trackId.trim()
    );
    
    if (found) {
      setSearchResult(found);
    } else {
      setSearchResult({ error: "Booking ID not found. Please verify the ID and try again." });
    }
  };

  const getStatusSteps = (status) => {
    const steps = ["Requested", "Approved", "In Progress", "Completed"];
    let currentStep = 0;
    if (status === "Approved") currentStep = 1;
    if (status === "Completed" || status === "Reviewed") currentStep = 3;
    if (status === "Cancelled") {
      return { steps: ["Requested", "Cancelled"], currentStep: 1, isCancelled: true };
    }
    return { steps, currentStep, isCancelled: false };
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section with Search bar */}
      <Hero />

      {/* Real-time active bookings tracker timeline (if user has active bookings) */}
      {user && activeBookings.length > 0 && (
        <section className="py-6 bg-blue-50/50 dark:bg-blue-950/10 border-b border-blue-100 dark:border-blue-900/40 text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-slate-900 border border-blue-200/50 dark:border-blue-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Active Booking
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white mt-1 text-sm sm:text-base">
                    Tracking progress for {activeBookings[0].serviceName} Service
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress steps timeline */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
                {(() => {
                  const { steps, currentStep, isCancelled } = getStatusSteps(activeBookings[0].status);
                  return steps.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border font-bold text-xs ${
                          isCancelled && isCompleted 
                            ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950 dark:border-rose-900"
                            : isCompleted 
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10" 
                            : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-950 dark:border-slate-850"
                        }`}>
                          {isCancelled && isCompleted ? "✕" : idx + 1}
                        </div>
                        <div className="text-left leading-tight min-w-0">
                          <p className={`text-xs font-bold ${isCurrent ? "text-blue-600 dark:text-blue-450" : "text-slate-700 dark:text-slate-350"}`}>{step}</p>
                          <p className="text-[10px] text-slate-400">
                            {idx === 0 ? "Confirmed" : isCurrent ? "Active" : "Scheduled"}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Status Tracker Search Widget */}
      <section className="py-8 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1 md:max-w-md">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Track Your Booking Status</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">Enter your QuickWorker booking ID (e.g. QW-123456) to check the arrival status of your Hassan home service pro.</p>
            </div>
            
            <form onSubmit={handleTrackSubmit} className="flex gap-2.5 w-full md:max-w-md">
              <input
                type="text"
                required
                placeholder="Enter Booking ID (e.g. QW-123456)"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs transition-colors shadow shrink-0 cursor-pointer"
              >
                Track Status
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Services Grid Section (Show top 8 services) */}
      <ServicesGrid limit={8} />

      {/* Handpicked Top Rated Workers */}
      <FeaturedWorkers />

      {/* Why Choose Us */}
      <WhyChoose />

      {/* Join as partner CTA section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-750 dark:to-indigo-900 text-white relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 text-left space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full">
                Partner with us
              </span>
              <h2 className="text-3xl sm:text-4xl font-black">
                Are You a Home Service Professional in Hassan?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                Grow your business, find customers near your locality, and manage your bookings easily. Join 100+ electricians, plumbers, and beauticians earning more with QuickWorker.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <button
                onClick={() => navigate("/register-worker")}
                className="px-8 py-4.5 bg-yellow-450 hover:bg-yellow-500 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer text-sm"
              >
                <Handshake className="w-5 h-5" />
                <span>Register as Partner</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Track Result Modal Overlay */}
      {searchResult && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-5 shadow-2xl relative animate-scale-up">
            
            <button
              onClick={() => setSearchResult(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            {searchResult.error ? (
              <div className="space-y-4 py-2">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white text-center">Track Error</h3>
                <p className="text-sm text-slate-500 text-center leading-relaxed">{searchResult.error}</p>
                <button
                  onClick={() => setSearchResult(null)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Live Booking Status</h3>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border space-y-3.5 text-xs text-slate-650 dark:text-slate-350">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>ID: {searchResult.bookingId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${
                      searchResult.status === "Pending" ? "bg-amber-100 text-amber-800" :
                      searchResult.status === "Approved" ? "bg-blue-100 text-blue-800" :
                      searchResult.status === "Completed" || searchResult.status === "Reviewed" ? "bg-emerald-100 text-emerald-800" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {searchResult.status}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800/80 pt-2.5 space-y-2">
                    <p>Professional: <strong className="text-slate-900 dark:text-white">{searchResult.workerName}</strong> ({searchResult.serviceName})</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-500" /> {searchResult.bookingDate}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500" /> {searchResult.bookingTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setSearchResult(null); navigate("/my-bookings"); }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-755 text-white font-extrabold rounded-2xl text-xs text-center cursor-pointer shadow-sm"
                  >
                    Manage Bookings
                  </button>
                  <button
                    onClick={() => setSearchResult(null)}
                    className="w-full py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-350 font-bold rounded-2xl text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

