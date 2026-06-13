import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Briefcase, 
  Coins, 
  UserCheck, 
  Star, 
  ArrowLeft, 
  ToggleLeft, 
  ToggleRight,
  Edit3,
  MessageSquare
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function WorkerDashboard() {
  const { user, bookings, workers, updateBookingStatus, updateWorkerProfile, showToast, authLoading } = useApp();
  const navigate = useNavigate();

  // Active sub-tab switcher: active, completed, profile
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobFilter, setJobFilter] = useState("all");

  // Edit profile states
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(199);
  const [locality, setLocality] = useState("");
  const [about, setAbout] = useState("");

  // 1. Locate the professional worker profile using the email
  const workerProfile = useMemo(() => {
    if (!user) return null;
    return workers.find(w => w.email === user.email) || workers.find(w => w.id === user.uid) || null;
  }, [workers, user]);

  // Set default values when profile loads
  React.useEffect(() => {
    if (workerProfile) {
      setPrice(workerProfile.price);
      setLocality(workerProfile.locality);
      setAbout(workerProfile.about || "");
    }
  }, [workerProfile]);

  // 2. Filter bookings specifically assigned to this worker
  const workerBookings = useMemo(() => {
    if (!workerProfile) return [];
    const baseList = bookings.filter(b => b.workerId === workerProfile.id || b.workerEmail === user.email);
    
    if (jobFilter === "pending") {
      return baseList.filter(b => b.bookingStatus === "pending" || b.status === "Pending");
    } else if (jobFilter === "active") {
      return baseList.filter(b => 
        b.bookingStatus === "accepted" || b.status === "Accepted" || b.status === "Approved" ||
        b.bookingStatus === "in_progress" || b.status === "In Progress" ||
        b.bookingStatus === "worker_on_the_way" || b.status === "Worker on the Way" ||
        b.bookingStatus === "work_started" || b.status === "Work Started"
      );
    } else if (jobFilter === "completed") {
      return baseList.filter(b => 
        b.bookingStatus === "completed" || b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "reviewed" ||
        b.bookingStatus === "rejected" || b.status === "Rejected" ||
        b.bookingStatus === "cancelled" || b.status === "Cancelled"
      );
    }
    return baseList;
  }, [bookings, workerProfile, user, jobFilter]);

  // Calculations for earnings
  const analytics = useMemo(() => {
    const completedJobs = workerBookings.filter(b => b.status === "Completed" || b.status === "Reviewed");
    const totalEarnings = completedJobs.reduce((sum, b) => sum + (parseInt(b.servicePrice) || 0), 0);
    return {
      completedCount: completedJobs.length,
      totalEarnings,
      pendingCount: workerBookings.filter(b => b.status === "Pending").length,
      activeCount: workerBookings.filter(b => b.status === "Approved").length
    };
  }, [workerBookings]);

  // Handle availability toggle
  const handleToggleAvailability = async () => {
    if (!workerProfile) return;
    try {
      const nextAvailability = !workerProfile.isAvailable;
      const success = await updateWorkerProfile(workerProfile.id, { isAvailable: nextAvailability });
      if (success) {
        showToast(`Availability status updated to: ${nextAvailability ? "Available" : "Busy"}`, "success");
      }
    } catch (err) {
      showToast("Failed to toggle availability status", "error");
    }
  };
 
  // Handle saving worker profile settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!workerProfile) return;
    
    try {
      const success = await updateWorkerProfile(workerProfile.id, {
        price: parseInt(price),
        locality,
        about
      });
      if (success) {
        setEditing(false);
      }
    } catch (err) {
      showToast("Failed to update profile details", "error");
    }
  };

  // Auth Protection Check
  if (authLoading) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verifying partner session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-xl animate-scale-up text-left">
          <ShieldAlert className="w-12 h-12 text-blue-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">Verification Required</h2>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Please log into your QuickWorker Professional Partner account to manage customer requests.
          </p>
          <Link
            to="/auth?redirect=/worker-dashboard"
            className="w-full inline-block py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-sm text-sm text-center"
          >
            Sign In as Pro
          </Link>
        </div>
      </div>
    );
  }

  // Not registered as a worker warning
  if (!workerProfile && !user.isWorker) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-955 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-xl animate-scale-up text-left">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">No Partner Profile</h2>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Your email is not currently registered in our Hassan professional directory. Would you like to create a partner profile?
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/register-worker"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-sm text-sm text-center"
            >
              Become a Partner Pro
            </Link>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 font-bold rounded-2xl text-sm text-center"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-left">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Partner Active
              </span>
              <span className="text-xs text-slate-400">ID: {workerProfile?.id}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Worker Partner Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Welcome back, <strong className="text-slate-800 dark:text-white">{workerProfile?.name}</strong>. Manage your scheduled jobs in Hassan.
            </p>
          </div>
          
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-slate-550 hover:text-slate-900 font-bold px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Home</span>
          </button>
        </div>

        {/* Worker Analytics summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 bg-white dark:bg-slate-905 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Earnings</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">₹{analytics.totalEarnings}</h3>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-905 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Jobs Done</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{analytics.completedCount}</h3>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-905 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-500 rounded-2xl shrink-0">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Rating</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{workerProfile?.rating} <span className="text-xs font-normal text-slate-400">({workerProfile?.reviewsCount})</span></h3>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-905 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 rounded-2xl shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Requests</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{analytics.pendingCount} new</h3>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-850 gap-4">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "jobs" 
                ? "border-blue-600 text-blue-650 dark:text-blue-400" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Assigned Jobs ({workerBookings.length})
          </button>
          
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "profile" 
                ? "border-blue-600 text-blue-650 dark:text-blue-400" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Profile & Availability
          </button>
        </div>        {/* Tab 1: Assigned Jobs List */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            {/* Job Sub-filters */}
            <div className="flex flex-wrap gap-2 bg-slate-105/85 dark:bg-slate-900/60 p-1.5 rounded-2xl w-fit border border-slate-200/40 dark:border-slate-800/40 mb-2">
              {[
                { id: "all", label: "All Jobs" },
                { id: "pending", label: "Pending Requests" },
                { id: "active", label: "Active Jobs" },
                { id: "completed", label: "Finished" }
              ].map((filter) => {
                let count = 0;
                const baseList = bookings.filter(b => workerProfile && (b.workerId === workerProfile.id || b.workerEmail === user.email));
                if (filter.id === "all") count = baseList.length;
                else if (filter.id === "pending") count = baseList.filter(b => b.bookingStatus === "pending" || b.status === "Pending").length;
                else if (filter.id === "active") count = baseList.filter(b => 
                  b.bookingStatus === "accepted" || b.status === "Accepted" || b.status === "Approved" ||
                  b.bookingStatus === "in_progress" || b.status === "In Progress" ||
                  b.bookingStatus === "worker_on_the_way" || b.status === "Worker on the Way" ||
                  b.bookingStatus === "work_started" || b.status === "Work Started"
                ).length;
                else if (filter.id === "completed") count = baseList.filter(b => 
                  b.bookingStatus === "completed" || b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "reviewed" ||
                  b.bookingStatus === "rejected" || b.status === "Rejected" ||
                  b.bookingStatus === "cancelled" || b.status === "Cancelled"
                ).length;

                return (
                  <button
                    key={filter.id}
                    onClick={() => setJobFilter(filter.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      jobFilter === filter.id 
                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50" 
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                      jobFilter === filter.id ? "bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {workerBookings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {workerBookings.map((booking) => (
                  <div
                    key={booking.id || booking.bookingId}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden"
                  >
                    {/* Top color tag */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                      (booking.bookingStatus === "pending" || booking.status === "Pending") ? "bg-amber-400" :
                      (booking.bookingStatus === "accepted" || booking.status === "Approved" || booking.status === "Accepted") ? "bg-blue-500" :
                      (booking.bookingStatus === "worker_on_the_way" || booking.status === "Worker on the Way") ? "bg-indigo-500 animate-pulse" :
                      (booking.bookingStatus === "in_progress" || booking.status === "In Progress" || booking.status === "work_started" || booking.status === "Work Started") ? "bg-purple-500 animate-pulse" :
                      (booking.bookingStatus === "completed" || booking.status === "Completed" || booking.status === "reviewed" || booking.status === "Reviewed") ? "bg-emerald-500" :
                      (booking.bookingStatus === "cancelled" || booking.status === "Cancelled") ? "bg-rose-500 animate-pulse" :
                      (booking.bookingStatus === "rejected" || booking.status === "Rejected") ? "bg-rose-500" :
                      "bg-slate-400"
                    }`} />

                    <div className="space-y-3.5 pl-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">ID: {booking.bookingId}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-wider ${
                          (booking.bookingStatus === "pending" || booking.status === "Pending") ? "bg-amber-100 text-amber-800" :
                          (booking.bookingStatus === "accepted" || booking.status === "Approved" || booking.status === "Accepted") ? "bg-blue-100 text-blue-800" :
                          (booking.bookingStatus === "worker_on_the_way" || booking.status === "Worker on the Way") ? "bg-indigo-100 text-indigo-800 animate-pulse" :
                          (booking.bookingStatus === "in_progress" || booking.status === "In Progress" || booking.status === "Work Started") ? "bg-purple-100 text-purple-800 animate-pulse" :
                          (booking.bookingStatus === "completed" || booking.status === "Completed" || booking.status === "reviewed" || booking.status === "Reviewed") ? "bg-emerald-100 text-emerald-800" :
                          (booking.bookingStatus === "cancelled" || booking.status === "Cancelled" || booking.bookingStatus === "rejected" || booking.status === "Rejected") ? "bg-rose-105 text-rose-800 dark:bg-rose-955/40 dark:text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.25)]" :
                          "bg-slate-100 text-slate-655"
                        }`}>
                          {booking.bookingStatus === "in_progress" || booking.status === "In Progress" ? "In Progress" :
                           booking.bookingStatus === "worker_on_the_way" || booking.status === "Worker on the Way" ? "On Way" :
                           booking.bookingStatus === "pending" || booking.status === "Pending" ? "PENDING" :
                           booking.bookingStatus === "rejected" || booking.status === "Rejected" ? "REJECTED" :
                           booking.bookingStatus === "cancelled" || booking.status === "Cancelled" ? "CANCELLED" :
                           booking.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold ml-auto sm:ml-0">
                          Scheduled: {booking.bookingDate} • {booking.bookingTime}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                        <p>Customer: <strong className="text-slate-900 dark:text-white">{booking.customerName}</strong></p>
                        <p>Service Type: <strong className="text-blue-650 dark:text-blue-400 font-extrabold">{booking.serviceName}</strong></p>
                        <p className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span>Address: {booking.address} {booking.landmark && `(Landmark: ${booking.landmark})`}</span>
                        </p>
                        {booking.instructions && (
                          <p className="text-slate-400 italic">Notes: "{booking.instructions}"</p>
                        )}
                        <p className="font-bold text-slate-800 dark:text-slate-200">Payment status: <span className="text-blue-500">{booking.paymentStatus || "Unpaid (COD)"}</span></p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-row md:flex-col items-center justify-end gap-3 shrink-0 pt-4 md:pt-0 md:pl-5 md:border-l border-slate-100 dark:border-slate-800/80">
                      <div className="flex gap-2 w-full justify-between">
                        <a href={`tel:${booking.customerPhone || booking.contactPhone || booking.phone || "9876543210"}`} className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-950 flex-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                        <a 
                          href={`https://wa.me/${(booking.customerPhone || booking.contactPhone || booking.phone || "9876543210").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello, I am your QuickWorker Partner ${booking.workerName || ""}. I am managing your booking reference ${booking.bookingId} for ${booking.serviceName}.`
                          )}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2 border border-emerald-500/30 text-emerald-655 dark:text-emerald-500 bg-emerald-50/10 hover:bg-emerald-550 hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs font-bold flex-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {(booking.bookingStatus === "pending" || booking.status === "Pending") && (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => updateBookingStatus(booking.id, "accepted")}
                            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex-1 cursor-pointer shadow-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, "rejected")}
                            className="py-2 px-3 border border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded-xl text-xs font-bold flex-1 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {(booking.bookingStatus === "accepted" || booking.status === "Approved" || booking.status === "Accepted") && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, "in_progress")}
                          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Start Work</span>
                        </button>
                      )}

                      {(booking.bookingStatus === "in_progress" || booking.bookingStatus === "work_started" || booking.status === "In Progress" || booking.status === "Work Started") && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, "completed")}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete Work</span>
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-905 border border-slate-205 dark:border-slate-800 rounded-3xl space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No jobs assigned yet</h3>
                <p className="text-xs text-slate-400">Once customers book services in Hassan, they will appear here in real-time.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile settings & Availability */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left panel: Info & Availability status */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="text-center space-y-4">
                <img 
                  src={workerProfile?.avatar} 
                  alt={workerProfile?.name} 
                  className="w-24 h-24 rounded-full border-2 border-slate-100 dark:border-slate-850 mx-auto object-cover" 
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{workerProfile?.name}</h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{workerProfile?.serviceName} Partner</span>
                </div>
              </div>

              {/* Live Availability Toggle Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl space-y-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Status</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle availability to accept jobs</p>
                </div>
                <button 
                  onClick={handleToggleAvailability}
                  className="focus:outline-none cursor-pointer"
                  title="Toggle Live Availability"
                >
                  {workerProfile?.isAvailable ? (
                    <ToggleRight className="w-12 h-12 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Right panel: Edit Form */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Edit Professional Profile
                </h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Service Price (₹)</label>
                    <input
                      type="number"
                      disabled={!editing}
                      min={100}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Locality in Hassan</label>
                    <select
                      disabled={!editing}
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-955 dark:text-white border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Kuvempu Nagar">Kuvempu Nagar</option>
                      <option value="Hemavathi Nagar">Hemavathi Nagar</option>
                      <option value="Vidya Nagar">Vidya Nagar</option>
                      <option value="BM Road">BM Road</option>
                      <option value="Channapatna">Channapatna</option>
                      <option value="Salagame Road">Salagame Road</option>
                      <option value="Dairy Circle">Dairy Circle</option>
                      <option value="Vijaya Nagar">Vijaya Nagar</option>
                      <option value="Hassan City Center">Hassan City Center</option>
                      <option value="Arasikere Road">Arasikere Road</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Professional Biography</label>
                  <textarea
                    disabled={!editing}
                    rows="4"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  ></textarea>
                </div>

                {editing && (
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs cursor-pointer shadow-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setPrice(workerProfile?.price);
                        setLocality(workerProfile?.locality);
                        setAbout(workerProfile?.about || "");
                      }}
                      className="py-3 px-6 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 font-bold rounded-2xl text-xs cursor-pointer hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
