import React, { useState, useMemo, useEffect } from "react";
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
  AlertTriangle,
  CircleDollarSign,
  BarChart3
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { db } from "../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AdminDashboard() {
  const { 
    user, 
    authLoading,
    bookings, 
    workers, 
    services, 
    addService, 
    updateBookingStatus, 
    updateWorkerProfile,
    showToast 
  } = useApp();

  const navigate = useNavigate();

  // Tab switching: overview, bookings, users, workers, service
  const [activeTab, setActiveTab] = useState("overview");

  // User fetching states
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form states for creating custom service
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState(199);
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCat, setServiceCat] = useState("Repairs");
  const [serviceIcon, setServiceIcon] = useState("Zap");

  // Fetch users list
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() });
      });
      // Sort users by date
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setUsersList(list);
    } catch (err) {
      console.error("Could not query Firestore users:", err);
      showToast("Failed to fetch users list", "error");
      setUsersList([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchUsers();
    }
  }, [user]);

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
  };

  const handleDeleteUser = async (uid, userEmail) => {
    if (uid === user.uid || userEmail === "admin@quickworker.com") {
      showToast("Cannot delete the current administrator profile!", "warning");
      return;
    }
    if (window.confirm(`Are you sure you want to delete profile for ${userEmail}? This will erase their user record.`)) {
      try {
        await deleteDoc(doc(db, "users", uid));
        setUsersList((prev) => prev.filter((u) => u.uid !== uid));
        showToast("User profile deleted from Firestore!", "success");
      } catch (err) {
        console.error("Could not delete user from database:", err);
        showToast(`Failed to delete user profile: ${err.message}`, "error");
      }
    }
  };

  const handleWorkerApproval = async (workerId, approve) => {
    if (approve) {
      const success = await updateWorkerProfile(workerId, { approved: true });
      if (success) {
        showToast("Worker registration profile approved!", "success");
      }
    } else {
      if (window.confirm("Reject and delete this registration application?")) {
        try {
          // Reject worker by querying firestore and deleting doc
          const querySnapshot = await getDocs(collection(db, "workers"));
          let docRef = null;
          querySnapshot.forEach((docSnap) => {
            if (docSnap.data().id === workerId) {
              docRef = docSnap.ref;
            }
          });
          if (docRef) {
            await deleteDoc(docRef);
          }
          showToast("Worker application rejected and removed.", "info");
          navigate(0); // Reload window to sync local context lists
        } catch (err) {
          showToast("Application rejected (Local Session)", "info");
          navigate(0);
        }
      }
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    const list = bookings || [];
    const totalBookings = list.length;
    const completed = list.filter((b) => b.status === "Completed" || b.status === "Reviewed").length;
    const pending = list.filter((b) => b.status === "Pending").length;
    const cancelled = list.filter((b) => b.status === "Cancelled").length;
    const approved = list.filter((b) => b.status === "Approved").length;

    // Total Earnings: Sum of completed booking rates
    const totalEarnings = list
      .filter((b) => b.status === "Completed" || b.status === "Reviewed")
      .reduce((sum, b) => sum + (parseInt(b.servicePrice) || 0), 0);

    const totalWorkers = workers?.length || 0;
    const pendingWorkers = workers?.filter((w) => w.approved === false).length || 0;

    return { totalBookings, completed, pending, cancelled, approved, totalEarnings, totalWorkers, pendingWorkers };
  }, [bookings, workers]);

  // Auth block checking
  if (authLoading) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verifying administrator session...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-xl">
          <Lock className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-905 dark:text-white">Admin Access Restricted</h2>
          <p className="text-sm text-slate-505 max-w-sm mx-auto leading-relaxed">
            Please log in using admin credentials to manage services, view transaction analytics, and approve booking orders.
          </p>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border text-xs text-left text-slate-500 space-y-1">
            <strong>Hint Credentials:</strong>
            <p>Email: <code className="font-bold text-slate-800 dark:text-slate-350">admin@quickworker.com</code></p>
            <p>Password: <code className="font-bold text-slate-800 dark:text-slate-350">123456</code> (or any 6+ chars)</p>
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
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-955 transition-colors duration-300 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-505 font-medium">Control QuickWorker directory operations, service listings, and billing orders in Hassan.</p>
          </div>
          
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-slate-550 hover:text-slate-905 font-bold px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Home</span>
          </button>
        </div>

        {/* Dashboard split sidebar navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar controls */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <BarChart3 className="w-4.5 h-4.5" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                  activeTab === "bookings"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5" />
                  <span>Bookings Orders</span>
                </div>
                {stats.pending > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                    activeTab === "bookings" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                  }`}>
                    {stats.pending}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab("users"); fetchUsers(); }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === "users"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-855"
                }`}
              >
                <Users className="w-4.5 h-4.5" />
                <span>Customer Users</span>
              </button>

              <button
                onClick={() => setActiveTab("workers")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                  activeTab === "workers"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4.5 h-4.5" />
                  <span>Service Partners</span>
                </div>
                {stats.pendingWorkers > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                    activeTab === "workers" ? "bg-white/20 text-white" : "bg-rose-600 text-white animate-pulse"
                  }`}>
                    {stats.pendingWorkers}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("service")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === "service"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Create Service</span>
              </button>
            </div>
          </div>

          {/* Right Panel Main View */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Overview Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats grids widgets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-blue-500">
                      <Activity className="w-5 h-5" />
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Bookings</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalBookings}</h2>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-emerald-500">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Completed</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{stats.completed}</h2>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-rose-500">
                      <CircleDollarSign className="w-5 h-5" />
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Earnings</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">₹{stats.totalEarnings}</h2>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-indigo-500">
                      <Briefcase className="w-5 h-5" />
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Partners</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalWorkers}</h2>
                  </div>
                </div>

                {/* Analytical charts templates with Tailwind CSS styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status distributions bars */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking Status breakdown</h4>
                    
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Pending (Waiting)</span>
                          <span className="font-bold">{stats.pending}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-805 rounded-full h-2">
                          <div 
                            className="bg-amber-450 h-2 rounded-full" 
                            style={{ width: `${stats.totalBookings > 0 ? (stats.pending / stats.totalBookings) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Approved (Assigned)</span>
                          <span className="font-bold">{stats.approved}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${stats.totalBookings > 0 ? (stats.approved / stats.totalBookings) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Completed / Reviewed</span>
                          <span className="font-bold">{stats.completed}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${stats.totalBookings > 0 ? (stats.completed / stats.totalBookings) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Cancelled</span>
                          <span className="font-bold">{stats.cancelled}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-805 rounded-full h-2">
                          <div 
                            className="bg-rose-550 h-2 rounded-full" 
                            style={{ width: `${stats.totalBookings > 0 ? (stats.cancelled / stats.totalBookings) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Earnings visual chart line */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Earnings Growth</h4>
                    
                    <div className="h-32 flex items-end justify-between gap-1 pt-4 px-2 font-mono text-[9px] text-slate-400">
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-full bg-gradient-to-t from-blue-600/30 to-blue-500 rounded-lg" style={{ height: "20%" }}></div>
                        <span>Jan</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-full bg-gradient-to-t from-blue-600/30 to-blue-500 rounded-lg" style={{ height: "35%" }}></div>
                        <span>Feb</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-full bg-gradient-to-t from-blue-600/30 to-blue-500 rounded-lg" style={{ height: "45%" }}></div>
                        <span>Mar</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-full bg-gradient-to-t from-blue-600/30 to-blue-500 rounded-lg" style={{ height: "65%" }}></div>
                        <span>Apr</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-full bg-gradient-to-t from-blue-600/30 to-blue-550 rounded-lg" style={{ height: "85%" }}></div>
                        <span>May</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-full bg-gradient-to-t from-blue-600/35 to-blue-600 rounded-lg" style={{ height: "100%" }}></div>
                        <span>Jun</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab Content */}
            {activeTab === "bookings" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Active Service Bookings</h3>
                <p className="text-xs text-slate-500 leading-normal">Control real-time client booking orders. Modify schedules, approve pending bookings or cancel requests.</p>
                
                {bookings.length > 0 ? (
                  <div className="overflow-x-auto divide-y divide-slate-100 dark:divide-slate-850">
                    {bookings.map((b) => (
                      <div key={b.bookingId} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs sm:text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-905 dark:text-white">{b.bookingId}</span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded uppercase">
                              {b.serviceName}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs ${
                               b.status === "Pending" || b.status === "PENDING" || b.bookingStatus === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/20" :
                               b.status === "Approved" || b.status === "Accepted" || b.bookingStatus === "accepted" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/20" :
                               b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450 border border-emerald-200/20" :
                               b.status === "Cancelled" || b.status === "CANCELLED" || b.bookingStatus === "cancelled" ? "bg-rose-100 text-rose-800 dark:bg-rose-955/40 dark:text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.25)] border border-rose-200/20" :
                               "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400"
                             }`}>
                               {b.status === "Pending" || b.status === "PENDING" || b.bookingStatus === "pending" ? "PENDING" :
                                b.status === "Cancelled" || b.status === "CANCELLED" || b.bookingStatus === "cancelled" ? "CANCELLED" :
                                b.status}
                             </span>
                          </div>
                          
                          <div className="text-slate-550 dark:text-slate-400 space-y-0.5 text-xs">
                            <p>Customer: <strong className="text-slate-900 dark:text-slate-300 font-semibold">{b.customerName || b.userName}</strong> ({b.customerEmail || b.userEmail})</p>
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
                              className="px-3 py-1.5 border border-rose-500/30 text-rose-600 hover:bg-rose-650 hover:text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer"
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
                    <AlertTriangle className="w-10 h-10 text-slate-405 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">No Booking Orders recorded</h4>
                    <p className="text-xs text-slate-500">Wait for users to book local Hassan professionals.</p>
                  </div>
                )}
              </div>
            )}

            {/* Customer Users Tab Content */}
            {activeTab === "users" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Customer Accounts</h3>
                    <p className="text-xs text-slate-500 leading-normal">Manage registered clients. Remove fake or demonstration test accounts safely.</p>
                  </div>
                  <button 
                    onClick={fetchUsers}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-55 dark:hover:bg-slate-850"
                  >
                    Refresh List
                  </button>
                </div>

                {loadingUsers ? (
                  <div className="text-center py-10 text-slate-400">Loading directory users from database...</div>
                ) : usersList.length > 0 ? (
                  <div className="overflow-x-auto divide-y divide-slate-100 dark:divide-slate-850">
                    {usersList.map((u) => (
                      <div key={u.uid} className="py-4.5 flex items-center justify-between text-xs sm:text-sm gap-4">
                        <div className="flex items-center gap-3">
                          <img src={u.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.email}`} alt={u.displayName} className="w-10 h-10 rounded-full object-cover" />
                          <div className="text-left">
                            <h4 className="font-extrabold text-slate-900 dark:text-white leading-tight">{u.displayName}</h4>
                            <p className="text-xs text-slate-450 mt-0.5">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            u.role === "admin" ? "bg-rose-100 text-rose-700" :
                            u.role === "worker" ? "bg-emerald-100 text-emerald-700" :
                            "bg-blue-50 text-blue-600 dark:bg-slate-800"
                          }`}>
                            {u.role || "customer"}
                          </span>
                          
                          <button
                            onClick={() => handleDeleteUser(u.uid, u.email)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100/50 cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400">No client accounts found.</div>
                )}
              </div>
            )}

            {/* Service Partners Tab Content */}
            {activeTab === "workers" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Service Partner Registrations</h3>
                <p className="text-xs text-slate-500 leading-normal">Onboard registered professionals. Verify biographies, review expertise, and approve/reject partner listings.</p>

                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {workers.map((w) => {
                    const isPending = w.approved === false;
                    return (
                      <div key={w.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs sm:text-sm">
                        <div className="flex items-start gap-3">
                          <img src={w.avatar} alt={w.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 dark:text-white leading-tight">{w.name}</h4>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                isPending ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {isPending ? "Pending Verification" : "Verified Pro"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-505 dark:text-slate-400 mt-1">
                              Service: <strong className="text-slate-750 dark:text-slate-300">{w.serviceName}</strong> | Locality: {w.locality} | Exp: {w.experience} yrs
                            </p>
                            {w.about && <p className="text-[10px] text-slate-400 mt-1 italic">Bio: "{w.about}"</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 justify-end sm:justify-start">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleWorkerApproval(w.id, true)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer"
                              >
                                Approve Listing
                              </button>
                              <button
                                onClick={() => handleWorkerApproval(w.id, false)}
                                className="px-3.5 py-1.5 border border-rose-500/30 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleWorkerApproval(w.id, false)}
                              className="px-3.5 py-1.5 border border-rose-500/20 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Deregister Pro
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Create Service Tab Content */}
            {activeTab === "service" && (
              <form onSubmit={handleCreateService} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-lg font-extrabold text-slate-955 dark:text-white">Create New Service Offering</h3>
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-955 dark:text-white border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    rows={3}
                    placeholder="Enter short outline summary of what service covers..."
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-955 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
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

          </div>
        </div>

      </div>
    </div>
  );
}
