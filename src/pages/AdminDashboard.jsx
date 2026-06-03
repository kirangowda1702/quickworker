import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  Briefcase, 
  Activity, 
  PlusCircle, 
  Trash2, 
  Lock, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle 
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AdminDashboard() {
  const { user, bookings, workers, services, addService, updateBookingStatus, showToast } = useApp();
  const navigate = useNavigate();

  // Tab switcher: metrics, service, list
  const [activeTab, setActiveTab] = useState("bookings");

  // Form states for creating custom service
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState(199);
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCat, setServiceCat] = useState("Repairs");
  const [serviceIcon, setServiceIcon] = useState("Zap");

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!serviceName.trim() || !serviceDesc.trim()) {
      showToast("Please enter name and description", "warning");
      return;
    }

    const serviceData = {
      name: serviceName,
      price: parseInt(servicePrice),
      description: serviceDesc,
      category: serviceCat,
      icon: serviceIcon
    };

    await addService(serviceData);
    setServiceName("");
    setServiceDesc("");
    showToast("Service category created!", "success");
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const completed = bookings.filter((b) => b.status === "Completed" || b.status === "Reviewed").length;
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const totalWorkers = workers.length;

    return { totalBookings, completed, pending, totalWorkers };
  }, [bookings, workers]);

  // Auth block checking
  if (!user || !user.isAdmin) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-xl">
          <Lock className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Restricted</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Please log in using admin credentials to manage services, view transaction analytics, and approve booking orders.
          </p>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border text-xs text-left text-slate-500 space-y-1">
            <strong>Hint Credentials:</strong>
            <p>Email: <code className="font-bold text-slate-800 dark:text-slate-300">admin@quickworker.com</code></p>
            <p>Password: <code className="font-bold text-slate-800 dark:text-slate-300">123456</code> (or any 6+ chars)</p>
          </div>
          <Link
            to="/auth"
            className="w-full inline-block py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-sm text-sm"
          >
            Go to Authentication Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-55 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Management Portal</h1>
            <p className="text-xs sm:text-sm text-slate-500">Monitor QuickWorker operations, services directories, and workers database in Hassan.</p>
          </div>
          
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-slate-550 hover:text-slate-900 font-bold px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Dashboard</span>
          </button>
        </div>

        {/* Dashboard Grid Analytics Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-blue-500">
              <Activity className="w-6 h-6" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalBookings}</h2>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Completed Jobs</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.completed}</h2>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-amber-505 text-amber-500">
              <Clock className="w-6 h-6" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Pending Actions</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.pending}</h2>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-indigo-500">
              <Users className="w-6 h-6" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Listed Partners</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalWorkers}</h2>
          </div>
        </div>

        {/* Workspace section content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Navigation drawer links */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === "bookings"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <Activity className="w-4.5 h-4.5" />
                <span>Bookings Orders</span>
              </button>

              <button
                onClick={() => setActiveTab("service")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === "service"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Create Service Category</span>
              </button>

              <button
                onClick={() => setActiveTab("workers")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === "workers"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-855"
                }`}
              >
                <Briefcase className="w-4.5 h-4.5" />
                <span>Workers database ({workers.length})</span>
              </button>
            </div>
          </div>

          {/* Active section view panel */}
          <div className="lg:col-span-9">
            
            {/* Bookings Tracker Table */}
            {activeTab === "bookings" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Active Service Bookings</h3>
                <p className="text-xs text-slate-500 leading-normal">Control real-time client booking orders. Modify schedules, approve pending bookings or cancel requests.</p>
                
                {bookings.length > 0 ? (
                  <div className="overflow-x-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                    {bookings.map((b) => (
                      <div key={b.bookingId} className="py-4.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs sm:text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 dark:text-white">{b.bookingId}</span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 px-2 py-0.5 rounded uppercase">
                              {b.serviceName}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              b.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40" :
                              b.status === "Approved" ? "bg-blue-105 text-blue-700 dark:bg-blue-950/40" :
                              b.status === "Completed" || b.status === "Reviewed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40" :
                              "bg-slate-100 text-slate-600 dark:bg-slate-800"
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          
                          <div className="text-slate-500 dark:text-slate-400 space-y-0.5 text-xs">
                            <p>Customer: <strong className="text-slate-900 dark:text-slate-300 font-semibold">{b.customerName}</strong> ({b.customerEmail})</p>
                            <p>Worker Assigned: <strong className="text-slate-900 dark:text-slate-300 font-semibold">{b.workerName}</strong> (Rate: ₹{b.servicePrice})</p>
                            <p className="flex items-center gap-1.5 mt-1 text-[11px]"><MapPin className="w-3.5 h-3.5 text-slate-405 shrink-0" /> {b.address}</p>
                          </div>
                        </div>

                        {/* Admin Action triggers */}
                        <div className="flex gap-2 shrink-0 justify-end sm:justify-start">
                          {b.status === "Pending" && (
                            <button
                              onClick={() => updateBookingStatus(b.id, "Approved")}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {(b.status === "Pending" || b.status === "Approved") && (
                            <button
                              onClick={() => updateBookingStatus(b.id, "Completed")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {b.status !== "Cancelled" && b.status !== "Reviewed" && (
                            <button
                              onClick={() => updateBookingStatus(b.id, "Cancelled")}
                              className="px-3 py-1.5 border border-rose-500/30 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 border rounded-2xl">
                    <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">No Booking Orders recorded</h4>
                    <p className="text-xs text-slate-500">Wait for users to book local Hassan professionals.</p>
                  </div>
                )}
              </div>
            )}

            {/* Create Custom Service Category */}
            {activeTab === "service" && (
              <form onSubmit={handleCreateService} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Create New Service Offering</h3>
                <p className="text-xs text-slate-550 leading-normal">Onboard custom home categories to render across main search catalogs instantly.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Service Category Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sofa Cleaning"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Tab Group Section *</label>
                    <select
                      value={serviceCat}
                      onChange={(e) => setServiceCat(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-955 dark:text-white border border-slate-202 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Repairs">Repairs</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Personal Care">Personal Care</option>
                      <option value="Tech Support">Tech Support</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Starting price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Lucide Icon String Name *</label>
                    <select
                      value={serviceIcon}
                      onChange={(e) => setServiceIcon(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-955 dark:text-white border border-slate-202 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Zap">Zap (Electrician/Appliance)</option>
                      <option value="Droplets">Droplets (Plumber/RO Water)</option>
                      <option value="Hammer">Hammer (Carpenter)</option>
                      <option value="Wind">Wind (AC Repair)</option>
                      <option value="Sparkles">Sparkles (House Cleaning/Salon)</option>
                      <option value="Flame">Flame (Kitchen Clean)</option>
                      <option value="Bug">Bug (Pest Control)</option>
                      <option value="Car">Car (Car Wash)</option>
                      <option value="Laptop">Laptop (PC Repair)</option>
                      <option value="Smartphone">Smartphone (Mobile)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Description Details *</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Enter short outline summary of what service covers..."
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-sm text-sm cursor-pointer"
                >
                  Create Custom Service offering
                </button>
              </form>
            )}

            {/* Workers Database Directory */}
            {activeTab === "workers" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Active Workers Database</h3>
                <p className="text-xs text-slate-500 leading-normal">Browse through all active worker registrations onboarded in Hassan. Monitor details and active availability.</p>

                <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-105 dark:divide-slate-850 pr-2">
                  {workers.map((w) => (
                    <div key={w.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <img src={w.avatar} alt={w.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div className="text-left">
                          <h4 className="font-extrabold text-slate-900 dark:text-white leading-tight">{w.name}</h4>
                          <p className="text-[11px] text-slate-505 dark:text-slate-400 mt-0.5">{w.serviceName} | {w.locality} | {w.experience} yrs exp</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        w.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {w.isAvailable ? "Available" : "Busy"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}
