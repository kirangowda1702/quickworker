import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowLeft, 
  MessageSquareCheck,
  User,
  LogOut,
  Edit2,
  Bell,
  Check,
  CheckCheck,
  X,
  CreditCard,
  History,
  LayoutDashboard,
  Wrench,
  Sparkles,
  Info,
  TrendingUp,
  BarChart3,
  PieChart,
  Download,
  Share2,
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  RefreshCw,
  Play,
  CheckCircle2,
  Lock,
  MessageCircle,
  FileText,
  Upload
} from "lucide-react";
import { useApp } from "../context/AppContext";
import ReviewModal from "../components/ReviewModal";
import { motion, AnimatePresence } from "framer-motion";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "../firebase/config";
import { isConfigValid } from "../lib/firebase";
export default function MyBookings() {
  const { 
    user, 
    authLoading,
    bookings, 
    updateBookingStatus, 
    showToast,
    updateUserProfile,
    logout,
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    workers,
    submitReview,
    isInstallable,
    showInstallBanner,
    triggerInstallPrompt
  } = useApp() as any;

  const navigate = useNavigate();

  // Tab selections: active, completed, cancelled, history, analytics, notifications
  const [activeTab, setActiveTab] = useState("active");
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);

  // Edit profile modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Live Tracking Modal States
  const [trackingBooking, setTrackingBooking] = useState<any>(null);
  const [trackingProgress, setTrackingProgress] = useState(0); // 0 to 100 path animation

  // Rescheduling Modal States
  const [reschedulingBooking, setReschedulingBooking] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("10:00 AM - 12:00 PM");

  // Cancellation Modal States
  const [cancelConfirmBooking, setCancelConfirmBooking] = useState<any | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);

  // Advanced History Search, Sort & Filter
  const [historySearch, setHistorySearch] = useState("");
  const [historySortKey, setHistorySortKey] = useState("date"); // date, price, status
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("desc");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("All");

  // Initialize edit fields
  useEffect(() => {
    if (user) {
      setEditName(user.displayName || "");
      setEditPhoto(user.photoURL || "");
      setAvatarPreview(user.photoURL || "");
    }
  }, [user]);

  // Animate mock worker tracking movement on path
  useEffect(() => {
    let interval: any;
    if (trackingBooking) {
      const isArrived = trackingBooking.bookingStatus === "in_progress" || trackingBooking.status === "In Progress" || trackingBooking.bookingStatus === "work_started" || trackingBooking.status === "Work Started" || trackingBooking.bookingStatus === "completed" || trackingBooking.status === "Completed";
      if (isArrived) {
        setTrackingProgress(100);
      } else {
        setTrackingProgress(0);
        interval = setInterval(() => {
          setTrackingProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 1;
          });
        }, 150);
      }
    }
    return () => clearInterval(interval);
  }, [trackingBooking]);

  const handleReviewSubmit = async (reviewDetails: any) => {
    await submitReview(reviewDetails);
    setSelectedBookingForReview(null);
  };

  // Profile avatar selector
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Upload avatar file to Storage (Mock fallback if offline config)
  const uploadAvatar = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const apiKey = auth.config?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || "";
      const isMockConfig = !apiKey || apiKey.includes("MOCK") || apiKey === "your_api_key_here";

      if (isMockConfig) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          setAvatarProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve(URL.createObjectURL(file));
          }
        }, 100);
        return;
      }

      console.log(`[MyBookings] Real uploading avatar: ${file.name}`);
      let completed = false;

      const timeoutId = setTimeout(() => {
        if (!completed) {
          completed = true;
          console.warn("Avatar upload timed out (8000ms), falling back to local object URL");
          setAvatarProgress(100);
          resolve(URL.createObjectURL(file));
        }
      }, 8000);

      setAvatarProgress(20);
      const fileRef = ref(storage, `avatars/${user.uid}_${Date.now()}_${file.name}`);
      
      uploadBytes(fileRef, file)
        .then(async (snapshot) => {
          if (completed) return;
          setAvatarProgress(70);
          try {
            const downloadURL = await getDownloadURL(snapshot.ref);
            if (completed) return;
            completed = true;
            clearTimeout(timeoutId);
            setAvatarProgress(100);
            resolve(downloadURL);
          } catch (urlErr) {
            console.error("Failed to get download URL, fallback to local URL:", urlErr);
            if (completed) return;
            completed = true;
            clearTimeout(timeoutId);
            setAvatarProgress(100);
            resolve(URL.createObjectURL(file));
          }
        })
        .catch((err) => {
          console.error("Storage upload failed, fallback to local URL:", err);
          if (completed) return;
          completed = true;
          clearTimeout(timeoutId);
          setAvatarProgress(100);
          resolve(URL.createObjectURL(file));
        });
    });
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast("Name cannot be empty", "warning");
      return;
    }

    setUpdatingProfile(true);
    let finalPhotoURL = editPhoto;

    if (avatarFile) {
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      if (avatarFile.size > maxFileSize) {
        showToast("Profile photo must be less than 5MB", "warning");
        setUpdatingProfile(false);
        return;
      }
      setAvatarUploading(true);
      setAvatarProgress(0);
      try {
        finalPhotoURL = await uploadAvatar(avatarFile);
      } catch (err) {
        showToast("Image upload failed, saving text fields only", "warning");
      } finally {
        setAvatarUploading(false);
      }
    }

    const success = await updateUserProfile(editName.trim(), finalPhotoURL);
    setUpdatingProfile(false);
    if (success) {
      setShowEditProfile(false);
      setAvatarFile(null);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleDate) {
      showToast("Please select a rescheduling date", "warning");
      return;
    }

    try {
      const bookingId = reschedulingBooking.id;
      
      // Try updating Firestore
      const docRef = doc(db, "bookings", bookingId);
      await updateDoc(docRef, {
        bookingDate: rescheduleDate,
        bookingTime: rescheduleSlot
      });

      showToast("Booking rescheduled successfully!", "success");
      setReschedulingBooking(null);
      navigate(0); // reload to update state lists
    } catch (err) {
      showToast("Failed to reschedule booking", "error");
      setReschedulingBooking(null);
    }
  };

  const handleConfirmCancel = async () => {
    console.log("🖱️ [MyBookings] handleConfirmCancel clicked.");
    console.log("🖱️ [MyBookings] Current cancelConfirmBooking:", cancelConfirmBooking);
    if (!cancelConfirmBooking) return;
    
    const bookingId = cancelConfirmBooking.id;
    setCancelingBookingId(bookingId);

    try {
      // Online Direct updateDoc
      console.log("REAL FIRESTORE ID:", cancelConfirmBooking.id);
      console.log("DISPLAY ID:", cancelConfirmBooking.bookingId);
      console.log("🚀 [MyBookings] Performing direct updateDoc...");
      const docRef = doc(db, "bookings", cancelConfirmBooking.id);
      
      await updateDoc(docRef, {
        bookingStatus: "cancelled",
        status: "Cancelled",
        updatedAt: serverTimestamp()
      });
      
      console.log("✅ [MyBookings] Direct updateDoc succeeded!");

      // Trigger non-blocking notifications in background
      addNotification(
        cancelConfirmBooking.customerId || cancelConfirmBooking.customerUid || cancelConfirmBooking.userId || user?.uid, 
        `Your booking for ${cancelConfirmBooking.serviceName} with ${cancelConfirmBooking.workerName} has been cancelled. ID: ${cancelConfirmBooking.bookingId}`, 
        "warning"
      ).catch(console.error);

      if (cancelConfirmBooking.workerId) {
        addNotification(
          cancelConfirmBooking.workerId, 
          `Booking request ${cancelConfirmBooking.bookingId} for ${cancelConfirmBooking.serviceName} has been cancelled by the customer.`, 
          "warning"
        ).catch(console.error);
      }

      addNotification(
        "admin", 
        `Booking ${cancelConfirmBooking.bookingId} has been cancelled by customer ${cancelConfirmBooking.customerName || "User"}.`, 
        "warning"
      ).catch(console.error);

      setCancelConfirmBooking(null);
      showToast("Booking cancelled successfully", "success");

    } catch (err: any) {
      console.error("❌ [MyBookings] Error in handleConfirmCancel:", err);
      showToast(`Failed to cancel booking: ${err.message || err}`, "error");
    } finally {
      console.log("🖱️ [MyBookings] handleConfirmCancel finally block running. Resetting cancelingBookingId.");
      setCancelingBookingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Filter lists memo
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    switch (activeTab) {
      case "active":
        return bookings.filter((b: any) => 
          b.status === "Pending" || 
          b.status === "Approved" || 
          b.status === "Accepted" || 
          b.status === "Worker on the Way" || 
          b.status === "Work Started" ||
          b.status === "In Progress" ||
          b.bookingStatus === "pending" || 
          b.bookingStatus === "accepted" || 
          b.bookingStatus === "worker_on_the_way" || 
          b.bookingStatus === "work_started" ||
          b.bookingStatus === "in_progress"
        );
      case "completed":
        return bookings.filter((b: any) => b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "completed");
      case "cancelled":
        return bookings.filter((b: any) => 
          b.status === "Cancelled" || 
          b.status === "Rejected" ||
          b.bookingStatus === "cancelled" ||
          b.bookingStatus === "rejected"
        );
      default:
        return bookings; // "all"
    }
  }, [bookings, activeTab]);

  // Tab counters memo
  const counters = useMemo(() => {
    const list = bookings || [];
    return {
      active: list.filter((b: any) => 
        b.status === "Pending" || 
        b.status === "Approved" || 
        b.status === "Accepted" || 
        b.status === "Worker on the Way" || 
        b.status === "Work Started" ||
        b.status === "In Progress" ||
        b.bookingStatus === "pending" || 
        b.bookingStatus === "accepted" || 
        b.bookingStatus === "worker_on_the_way" || 
        b.bookingStatus === "work_started" ||
        b.bookingStatus === "in_progress"
      ).length,
      completed: list.filter((b: any) => b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "completed").length,
      cancelled: list.filter((b: any) => 
        b.status === "Cancelled" || 
        b.status === "Rejected" ||
        b.bookingStatus === "cancelled" ||
        b.bookingStatus === "rejected"
      ).length,
      all: list.length,
      unreadNotif: (notifications || []).filter((n: any) => !n.read).length
    };
  }, [bookings, notifications]);

  // Analytics calculator memo (Phase 2 analytics requirements)
  const analytics = useMemo(() => {
    const list = bookings || [];
    const completed = list.filter((b: any) => b.status === "Completed" || b.status === "Reviewed");
    
    const totalSpent = completed.reduce((sum: number, b: any) => sum + (parseInt(b.servicePrice) || 0), 0);
    
    // Calculate favorite service
    const counts: any = {};
    let favService = "None Yet";
    let maxCount = 0;
    list.forEach((b: any) => {
      counts[b.serviceName] = (counts[b.serviceName] || 0) + 1;
      if (counts[b.serviceName] > maxCount) {
        maxCount = counts[b.serviceName];
        favService = b.serviceName;
      }
    });

    // Calculate monthly activity counts (Mock mapping by schedule month)
    const monthCounts: any = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 };
    list.forEach((b: any) => {
      try {
        const month = new Date(b.bookingDate).toLocaleString("default", { month: "short" });
        if (monthCounts[month] !== undefined) {
          monthCounts[month]++;
        }
      } catch (e) {}
    });

    const monthData = Object.keys(monthCounts).map(k => ({ month: k, count: monthCounts[k] }));

    // Loyalty Badge calculation
    let loyaltyTier = "Bronze Client";
    let loyaltyColor = "from-amber-600 to-amber-800";
    if (completed.length >= 6) {
      loyaltyTier = "VIP Gold Member";
      loyaltyColor = "from-yellow-500 via-amber-500 to-yellow-600 animate-pulse";
    } else if (completed.length >= 3) {
      loyaltyTier = "Silver Pro Client";
      loyaltyColor = "from-slate-400 to-slate-600";
    }

    return { totalSpent, totalBooked: list.length, completedCount: completed.length, favService, monthData, loyaltyTier, loyaltyColor };
  }, [bookings]);

  // Advanced history filtering & sorting memo
  const historyList = useMemo(() => {
    let list = [...(bookings || [])];

    // Filter by search
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      list = list.filter((b: any) => 
        b.workerName.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.bookingId.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
      );
    }

    // Filter by status dropdown
    if (historyStatusFilter !== "All") {
      list = list.filter((b: any) => b.status === historyStatusFilter);
    }

    // Sort list
    list.sort((a: any, b: any) => {
      let aVal: any = a.createdAt;
      let bVal: any = b.createdAt;

      if (historySortKey === "price") {
        aVal = parseInt(a.servicePrice) || 0;
        bVal = parseInt(b.servicePrice) || 0;
      } else if (historySortKey === "status") {
        aVal = a.status;
        bVal = b.status;
      }

      if (aVal < bVal) return historySortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return historySortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [bookings, historySearch, historySortKey, historySortOrder, historyStatusFilter]);

  // Invoice generator (downloads / prints a beautiful template)
  const handleDownloadInvoice = (b: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocker active! Enable popups to print invoices", "warning");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Invoice - ${b.bookingId}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
            .logo span { color: #f59e0b; }
            .details { margin: 30px 0; display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
            .details h4 { margin: 0 0 5px 0; color: #475569; text-transform: uppercase; font-size: 11px; tracking-wider; }
            .details p { margin: 0; font-size: 14px; font-weight: 600; }
            .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 12px; }
            .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .total { margin-top: 30px; text-align: right; font-size: 18px; font-weight: 800; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-t: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="logo">Quick<span>Worker</span></div>
              <div>
                <h2 style="margin:0;font-size:20px;">TAX INVOICE</h2>
                <p style="margin:5px 0 0 0;font-size:12px;color:#64748b;">ID: ${b.bookingId}</p>
              </div>
            </div>
            
            <div class="details" style="display: flex; justify-content: space-between;">
              <div>
                <h4>Customer Details</h4>
                <p>${user?.displayName}</p>
                <p style="font-weight:normal;color:#64748b;">${user?.email}</p>
                <p style="font-weight:normal;color:#64748b;">Phone: ${b.contactPhone || b.phone || ""}</p>
              </div>
              <div style="text-align: right;">
                <h4>Provider Assigned</h4>
                <p>${b.workerName}</p>
                <p style="font-weight:normal;color:#64748b;">Service: ${b.serviceName}</p>
                <p style="font-weight:normal;color:#64748b;">Date: ${b.bookingDate} (${b.bookingTime})</p>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Doorstep Professional ${b.serviceName} Handyman Booking</td>
                  <td style="text-align: right;">₹${b.servicePrice}</td>
                </tr>
                <tr>
                  <td>Safety, Convenience & Insurance Fees</td>
                  <td style="text-align: right;">₹0.00 (Waived)</td>
                </tr>
              </tbody>
            </table>

            <div class="total">
              Total Paid: ₹${b.servicePrice}
            </div>
            
            <div class="details" style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
              <div>
                <h4>Payment Status</h4>
                <p style="color: #10b981;">${b.paymentStatus || "COD"}</p>
              </div>
              <div style="text-align: right;">
                <h4>Service Location</h4>
                <p style="font-weight:normal;color:#64748b;">${b.address}</p>
              </div>
            </div>

            <div class="footer">
              Thank you for choosing QuickWorker Hassan! For support, contact support@quickworker.com.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast("Invoice print dialogue launched!", "success");
  };

  // CSV Exporter for booking lists
  const handleExportCSV = () => {
    if (!bookings || bookings.length === 0) {
      showToast("No bookings available to export", "warning");
      return;
    }

    const headers = ["Booking ID", "Worker", "Service", "Date", "Slot", "Address", "Price", "Status", "Payment Status"];
    const rows = bookings.map((b: any) => [
      b.bookingId,
      b.workerName,
      b.serviceName,
      b.bookingDate,
      b.bookingTime,
      b.address.replace(/,/g, " "),
      b.servicePrice,
      b.status,
      b.paymentStatus || "COD"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quickworker_bookings_${user.uid}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Booking history exported successfully!", "success");
  };

  const slots = [
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM"
  ];

  const minRescheduleDate = useMemo(() => {
    const d = new Date();
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }, []);

  // 1️⃣3️⃣ LOADING EXPERIENCE - Shimmer Skeleton loader structure
  if (authLoading) {
    return (
      <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse text-left">
          {/* Header Profile Shimmer */}
          <div className="bg-white dark:bg-slate-900 h-36 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0"></div>
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Menu Shimmer */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-800/80 space-y-2 h-[280px]">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
              </div>
            </div>

            {/* List Shimmer */}
            <div className="lg:col-span-9 space-y-4">
              <div className="bg-white dark:bg-slate-900 h-40 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/80"></div>
              <div className="bg-white dark:bg-slate-900 h-40 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/80"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth fail guard redirect (handles standard guest page check)
  if (!user) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-xl animate-scale-up text-left">
          <ShieldAlert className="w-12 h-12 text-blue-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">Login Required</h2>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Please log in to your QuickWorker account to view and manage your doorstep scheduled bookings.
          </p>
          <Link
            to="/auth?redirect=/my-bookings"
            className="w-full inline-block py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-sm text-sm text-center"
          >
            Sign In / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-left min-h-[90vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Card Header with Verification and Loyalty status */}
        <div className="bg-white dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10 w-full sm:w-auto">
            <div className="relative">
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-105 dark:border-slate-800 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full border-2 border-white dark:border-slate-900" title="Account Verified">
                <Check className="w-3 h-3 fill-current text-white font-bold" />
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{user.displayName}</span>
                </h2>
                
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r text-white shadow-sm ${analytics.loyaltyColor}`}>
                  {analytics.loyaltyTier}
                </span>

                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400`}>
                  {user.role}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Joined June 2026</span>
                <span>•</span>
                <span>Total Bookings: <strong>{analytics.totalBooked}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Header controls */}
          <div className="flex flex-wrap gap-2 shrink-0 z-10 w-full sm:w-auto justify-center md:justify-end">
            {user.isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-905 font-bold text-xs rounded-xl border border-blue-200/40 transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
            
            <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200/50 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-rose-500/20 text-rose-600 hover:bg-rose-650 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tabs Menu Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm flex flex-col gap-1">
              
              {/* Tab: Active */}
              <button
                onClick={() => setActiveTab("active")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                  activeTab === "active"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5" />
                  <span>Active Bookings</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                  activeTab === "active" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {counters.active}
                </span>
              </button>

              {/* Tab: Completed */}
              <button
                onClick={() => setActiveTab("completed")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                  activeTab === "completed"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquareCheck className="w-4.5 h-4.5" />
                  <span>Completed</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                  activeTab === "completed" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {counters.completed}
                </span>
              </button>

              {/* Tab: Cancelled */}
              <button
                onClick={() => setActiveTab("cancelled")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                  activeTab === "cancelled"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>Cancelled</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                  activeTab === "cancelled" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {counters.cancelled}
                </span>
              </button>

              {/* Tab: Advanced History Table */}
              <button
                onClick={() => setActiveTab("history")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                  activeTab === "history"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-2">
                  <History className="w-4.5 h-4.5" />
                  <span>Advanced History</span>
                </div>
              </button>

              {/* Tab: Analytics Data Panel */}
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                  activeTab === "analytics"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5" />
                  <span>Insights & Analytics</span>
                </div>
              </button>

              {/* Tab: Realtime Notifications */}
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${
                  activeTab === "notifications"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-655 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5" />
                  <span>Alert Feed</span>
                </div>
                {counters.unreadNotif > 0 && (
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${
                    activeTab === "notifications" ? "bg-white/30 text-white" : "bg-rose-600 text-white animate-pulse"
                  }`}>
                    {counters.unreadNotif} new
                  </span>
                )}
              </button>
            </div>

            {/* PWA Install Promo Card (Phase 5 Mobile App Experience) */}
            {/* PWA Install Promo Card (Phase 5 Mobile App Experience) */}
            {showInstallBanner && isInstallable && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-650 text-white rounded-3xl p-5 shadow-lg space-y-4 border border-blue-500/20 text-left relative overflow-hidden mt-4 animate-fade-in">
                <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-yellow-400 animate-bounce" />
                    <span>Install QuickWorker App</span>
                  </h4>
                  <p className="text-[11px] text-blue-100 leading-relaxed">
                    Install our app on your home screen for rapid doorstep booking actions, offline capabilities, and faster local tracking.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-900/40 p-2 rounded-xl border border-blue-400/25">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[9px] text-blue-100">PWA Works Offline & Standalone Optimized</span>
                </div>
                <button
                  onClick={triggerInstallPrompt}
                  className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-955 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Install App
                </button>
              </div>
            )}
          </div>

          {/* Active View Column */}
          <div className="lg:col-span-9">
            
            {/* Tab: Realtime Notifications Alert Feed */}
            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <span>Realtime Alerts Feed</span>
                  </h3>
                  {counters.unreadNotif > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[450px] overflow-y-auto pr-1">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((n: any) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`py-4 flex gap-3 text-xs sm:text-sm cursor-pointer transition-all rounded-xl px-2 hover:bg-slate-50 dark:hover:bg-slate-950/40 ${
                          !n.read ? "bg-blue-50/30 dark:bg-blue-950/10 border-l-2 border-blue-500" : ""
                        }`}
                      >
                        <div className="flex-1 space-y-1">
                          <p className={`text-slate-800 dark:text-slate-205 leading-relaxed ${!n.read ? "font-bold" : "font-medium"}`}>
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {!n.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                      <Bell className="w-10 h-10 text-slate-300 mx-auto opacity-40 animate-pulse" />
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">All caught up!</h4>
                      <p className="text-xs text-slate-500">There are no new notifications at this time.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Insights & Analytics Section */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                {/* Analytics summary row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Spendings</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">₹{analytics.totalSpent}</span>
                    <p className="text-[10px] text-slate-400 mt-2">Across {analytics.completedCount} completed services</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Favorite Service</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block truncate" title={analytics.favService}>{analytics.favService}</span>
                    <p className="text-[10px] text-slate-400 mt-2">Most frequently requested category</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm text-left relative overflow-hidden">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Loyalty Membership</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white mt-2 block uppercase tracking-wider">{analytics.loyaltyTier}</span>
                    <p className="text-[10px] text-slate-400 mt-2">Book 3+ for Silver, 6+ for Gold</p>
                  </div>
                </div>

                {/* SVG Graphs Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Activity Column Chart */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm text-left">
                    <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <span>Monthly Booking Frequency</span>
                    </h4>
                    <div className="w-full h-44 flex items-end justify-between gap-1 pt-4 border-b border-l border-slate-100 dark:border-slate-850 px-2">
                      {analytics.monthData.map((d) => (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                          {/* Animated Column bar */}
                          <div 
                            className="w-full bg-blue-600 hover:bg-yellow-500 rounded-t-md transition-all duration-500 relative cursor-pointer"
                            style={{ height: `${Math.max(d.count * 20, 6)}px` }}
                          >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {d.count}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold">{d.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Support Recommendations Box (Phase 6 AI features preparation) */}
                  <div className="bg-gradient-to-br from-blue-900/20 via-slate-900/35 to-blue-950/20 border border-blue-500/20 rounded-3xl p-6 text-left space-y-4">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                      <span>AI Smart Recommendations</span>
                    </h4>
                    <p className="text-xs text-slate-405 dark:text-slate-350 leading-relaxed">
                      Based on your local neighborhood trends and previous bookings, we recommend these doorstep services for your Hassan residence:
                    </p>
                    <div className="space-y-2.5">
                      <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between text-xs hover:bg-white/10 cursor-pointer transition-colors">
                        <div>
                          <span className="font-bold text-slate-200 block">AC Safety Inspection</span>
                          <span className="text-[10px] text-slate-450">Recommended for pre-monsoon checks</span>
                        </div>
                        <span className="text-blue-400 font-bold">₹249</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between text-xs hover:bg-white/10 cursor-pointer transition-colors">
                        <div>
                          <span className="font-bold text-slate-200 block">House Deep Cleaning</span>
                          <span className="text-[10px] text-slate-450">Regular clean scheduled on average in Hassan</span>
                        </div>
                        <span className="text-blue-400 font-bold">₹1,199</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Advanced Booking History Table view */}
            {activeTab === "history" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <History className="w-5 h-5 text-blue-500" />
                    <span>Booking Archives Table</span>
                  </h3>
                  
                  {/* CSV Export & Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 font-bold text-xs rounded-xl border border-slate-200/50 dark:border-slate-750 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filters, search and Sorting block */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search archive history..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Filter Status dropdown */}
                  <select
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {/* Sort configurations */}
                  <button
                    onClick={() => {
                      setHistorySortOrder(prev => prev === "asc" ? "desc" : "asc");
                    }}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl flex items-center justify-between cursor-pointer text-slate-700 dark:text-slate-350"
                  >
                    <span>Sort: {historySortKey === "date" ? "Date" : "Price"} ({historySortOrder.toUpperCase()})</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Table Layout */}
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Booking ID</th>
                        <th className="px-4 py-3">Assigned Pro</th>
                        <th className="px-4 py-3">Service</th>
                        <th className="px-4 py-3">Schedule Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                      {historyList.length > 0 ? (
                        historyList.map((h: any) => (
                          <tr key={h.bookingId} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                            <td className="px-4 py-3.5 font-bold font-mono">{h.bookingId}</td>
                            <td className="px-4 py-3.5">{h.workerName}</td>
                            <td className="px-4 py-3.5 font-semibold text-blue-600 dark:text-blue-400">{h.serviceName}</td>
                            <td className="px-4 py-3.5">{h.bookingDate}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">₹{h.servicePrice}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${
                                h.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                                h.status === "Approved" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400" :
                                h.status === "Completed" || h.status === "Reviewed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
                                "bg-rose-100 text-rose-800 dark:bg-rose-955 dark:text-rose-400"
                              }`}>
                                {h.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => handleDownloadInvoice(h)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg"
                                title="Download PDF Invoice"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-450">
                            No matching booking records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Standard lists (Active, Completed, Cancelled) */}
            {activeTab !== "notifications" && activeTab !== "analytics" && activeTab !== "history" && (
              <div className="space-y-5">
                {filteredBookings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookings.map((b: any) => {
                      const workerInfo = workers?.find((w: any) => w.id === b.workerId) || null;
                      const isTrackable = b.status === "Approved" || b.status === "Accepted" || b.status === "Worker on the Way" || b.status === "Work Started" || b.status === "In Progress" || b.bookingStatus === "accepted" || b.bookingStatus === "worker_on_the_way" || b.bookingStatus === "work_started" || b.bookingStatus === "in_progress";
                      return (
                        <motion.div
                          layout
                          key={b.bookingId}
                          className="group p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden"
                        >
                          {/* Status visual strip */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            (b.status === "Pending" || b.bookingStatus === "pending") ? "bg-amber-400" :
                            (b.status === "Approved" || b.status === "Accepted" || b.bookingStatus === "accepted") ? "bg-blue-500 animate-pulse" :
                            (b.status === "Worker on the Way" || b.bookingStatus === "worker_on_the_way") ? "bg-indigo-500 animate-pulse" :
                            (b.status === "Work Started" || b.status === "In Progress" || b.bookingStatus === "work_started" || b.bookingStatus === "in_progress") ? "bg-purple-500 animate-pulse" :
                            (b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "completed") ? "bg-emerald-500" :
                            "bg-rose-500"
                          }`}></div>

                          {/* Details Panel */}
                          <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                            <img 
                              src={b.workerAvatar} 
                              alt={b.workerName} 
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0 mx-auto sm:mx-0" 
                            />
                            <div className="space-y-2 flex-1 min-w-0 text-center sm:text-left">
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                                  {b.workerName}
                                </h3>
                                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {b.serviceName}
                                </span>
                                
                                {/* 1️⃣ GLOW EFFECTS AND PULSE STATUS INDICATORS */}
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 transition-all duration-300 ${
                                   (b.status === "Pending" || b.bookingStatus === "pending") ? "bg-amber-100 text-amber-855 dark:bg-amber-950/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]" :
                                   (b.status === "Approved" || b.status === "Accepted" || b.bookingStatus === "accepted") ? "bg-blue-100 text-blue-805 dark:bg-blue-950/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]" :
                                   (b.status === "Worker on the Way" || b.bookingStatus === "worker_on_the_way") ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 shadow-[0_0_15px_rgba(99,102,241,0.4)] animate-pulse" :
                                   (b.status === "Work Started" || b.status === "In Progress" || b.bookingStatus === "work_started" || b.bookingStatus === "in_progress") ? "bg-purple-100 text-purple-805 dark:bg-purple-955/40 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse" :
                                   (b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "completed") ? "bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40" :
                                   (b.status === "Cancelled" || b.bookingStatus === "cancelled" || b.bookingStatus === "rejected" || b.status === "Rejected") ? "bg-rose-100 text-rose-805 dark:bg-rose-955/40 dark:text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.35)] border border-rose-200/20" :
                                   "bg-rose-100 text-rose-850 dark:bg-rose-955"
                                 }`}>
                                   {(b.status === "Approved" || b.status === "Accepted" || b.bookingStatus === "accepted") && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block"></span>}
                                   {(b.status === "Pending" || b.bookingStatus === "pending") && <span className="w-1.5 h-1.5 rounded-full bg-amber-450 animate-ping inline-block"></span>}
                                   {(b.status === "Worker on the Way" || b.bookingStatus === "worker_on_the_way") && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping inline-block"></span>}
                                   {(b.status === "Work Started" || b.status === "In Progress" || b.bookingStatus === "work_started" || b.bookingStatus === "in_progress") && <Wrench className="w-3 h-3 text-purple-600 animate-spin mr-1" />}
                                   {(b.status === "Cancelled" || b.bookingStatus === "cancelled" || b.bookingStatus === "rejected" || b.status === "Rejected") && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>}
                                   <span>
                                     {b.bookingStatus === "worker_on_the_way" || b.status === "Worker on the Way" ? "Partner on the way" :
                                      b.bookingStatus === "work_started" || b.status === "Work Started" || b.bookingStatus === "in_progress" || b.status === "In Progress" ? "Work In Progress" :
                                      b.status === "Pending" || b.status === "PENDING" || b.bookingStatus === "pending" ? "PENDING" :
                                      b.bookingStatus === "rejected" || b.status === "Rejected" ? "REJECTED" :
                                      b.status === "Cancelled" || b.status === "CANCELLED" || b.bookingStatus === "cancelled" ? "CANCELLED" :
                                      b.status}
                                   </span>
                                 </span>
                              </div>

                              {/* 2️⃣ Display Worker Details (Rating, Exp, Verified status) */}
                              {workerInfo && (
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span>{workerInfo.rating}</span>
                                  </span>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                  <span>{workerInfo.experience} Yrs Exp</span>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                  <span className="text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded text-[10px]">
                                    Verified Pro
                                  </span>
                                </div>
                              )}

                              {/* Details grid list */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-550 dark:text-slate-400 mt-2">
                                <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                                  <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span>Schedule Date: <strong>{b.bookingDate}</strong></span>
                                </span>
                                
                                <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span>Schedule Slot: <strong>{b.bookingTime}</strong></span>
                                </span>
                                
                                <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                                  <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span>Phone: <strong>{b.contactPhone || b.phone || b.workerPhone}</strong></span>
                                </span>
                                
                                <span className="flex items-center gap-1.5 justify-center sm:justify-start truncate">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate" title={b.address}>Address: {b.address}</span>
                                </span>
                              </div>

                              {/* 3️⃣ Refined Live arrival helper notification messages */}
                              {(b.status === "Approved" || b.status === "Accepted" || b.bookingStatus === "accepted") && (
                                <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/20 px-3.5 py-2 rounded-2xl text-[11px] text-blue-650 dark:text-blue-400 flex items-center gap-2 mt-2 w-fit">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                                  <span><strong>Estimated Arrival</strong>: Booking accepted. Awaiting journey start.</span>
                                </div>
                              )}

                              {(b.status === "Worker on the Way" || b.bookingStatus === "worker_on_the_way") && (
                                <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/20 px-3.5 py-2 rounded-2xl text-[11px] text-indigo-655 dark:text-indigo-400 flex items-center gap-2 mt-2 w-fit shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                                  <span><strong>On the Way</strong>: Partner is heading to your location (Arriving in ~10 mins)</span>
                                </div>
                              )}

                              {(b.status === "Work Started" || b.status === "In Progress" || b.bookingStatus === "work_started" || b.bookingStatus === "in_progress") && (
                                <div className="bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/20 px-3.5 py-2 rounded-2xl text-[11px] text-purple-650 dark:text-purple-400 flex items-center gap-2 mt-2 w-fit shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                  <Wrench className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                                  <span><strong>Work In Progress</strong>: Service partner has arrived and is working.</span>
                                </div>
                              )}

                              {b.notes && (
                                <p className="text-[11px] text-slate-400 italic bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-850/40 mt-2">
                                  Special instructions: "{b.notes}"
                                </p>
                              )}

                              {/* Realtime Status Flow Stepper */}
                              {b.status !== "Cancelled" && b.bookingStatus !== "cancelled" && b.bookingStatus !== "rejected" && b.status !== "Rejected" && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-3">Booking Progress</p>
                                  <div className="flex items-center justify-between relative">
                                    {/* Background Line */}
                                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0" />
                                    {/* Progress Line */}
                                    <div 
                                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500" 
                                      style={{ 
                                        width: 
                                          (b.bookingStatus === "completed" || b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "reviewed") ? "100%" :
                                          (b.bookingStatus === "in_progress" || b.status === "In Progress" || b.bookingStatus === "work_started" || b.status === "Work Started") ? "66%" :
                                          (b.bookingStatus === "accepted" || b.status === "Accepted" || b.status === "Approved") ? "33%" : "0%"
                                      }}
                                    />
                                    
                                    {/* Step Nodes */}
                                    {[
                                      { label: "Pending", key: "pending" },
                                      { label: "Accepted", key: "accepted" },
                                      { label: "In Progress", key: "in_progress" },
                                      { label: "Completed", key: "completed" }
                                    ].map((step, idx) => {
                                      const isCurrent = 
                                        (step.key === "pending" && (b.bookingStatus === "pending" || b.status === "Pending")) ||
                                        (step.key === "accepted" && (b.bookingStatus === "accepted" || b.status === "Accepted" || b.status === "Approved")) ||
                                        (step.key === "in_progress" && (b.bookingStatus === "in_progress" || b.status === "In Progress" || b.bookingStatus === "work_started" || b.status === "Work Started")) ||
                                        (step.key === "completed" && (b.bookingStatus === "completed" || b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "reviewed"));

                                      const isPassed = 
                                        (step.key === "pending" && (b.bookingStatus !== "pending" && b.status !== "Pending")) ||
                                        (step.key === "accepted" && (b.bookingStatus === "in_progress" || b.status === "In Progress" || b.bookingStatus === "work_started" || b.status === "Work Started" || b.bookingStatus === "completed" || b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "reviewed")) ||
                                        (step.key === "in_progress" && (b.bookingStatus === "completed" || b.status === "Completed" || b.status === "Reviewed" || b.bookingStatus === "reviewed")) ||
                                        (step.key === "completed" && (b.bookingStatus === "completed" && b.status === "Completed"));

                                      return (
                                        <div key={step.key} className="flex flex-col items-center z-10">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                            isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-500/20" :
                                            isPassed ? "bg-emerald-500 text-white" :
                                            "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                                          }`}>
                                            {isPassed ? "✓" : idx + 1}
                                          </div>
                                          <span className={`text-[10px] font-extrabold mt-1.5 ${
                                            isCurrent ? "text-blue-600 dark:text-blue-400" :
                                            isPassed ? "text-slate-700 dark:text-slate-300" :
                                            "text-slate-400 dark:text-slate-600"
                                          }`}>
                                            {step.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Rejected/Declined Indicator */}
                              {(b.bookingStatus === "rejected" || b.status === "Rejected") && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50/25 dark:bg-rose-955/10 p-3 rounded-2xl border border-rose-200/20">
                                  <X className="w-4 h-4 shrink-0" />
                                  <span className="text-xs font-bold">This booking request was declined by the service partner.</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status price summary column */}
                          <div className="flex sm:flex-row md:flex-col items-center justify-between md:justify-center md:items-end gap-4 shrink-0 pl-0 md:pl-5 md:border-l border-slate-100 dark:border-slate-850">
                            <div className="text-left md:text-right">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Service Price</span>
                              <span className="text-lg font-black text-slate-900 dark:text-white">₹{b.servicePrice}</span>
                              <div className="flex flex-col md:items-end gap-1 mt-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                  <CreditCard className="w-3 h-3 text-slate-400" />
                                  <span>{b.paymentStatus || "COD"}</span>
                                </span>
                              </div>
                            </div>

                            {/* 3️⃣ QUICK ACTION BUTTONS */}
                            <div className="flex gap-2">
                              {/* Call & Whatsapp handles */}
                              <a
                                href={`tel:${b.workerPhone || "9876543210"}`}
                                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-955 text-slate-700 dark:text-slate-350 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                                title="Call Worker directly"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              <a
                                href={`https://wa.me/${(b.workerPhone || "9876543210").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                  `New booking received from QuickWorker.\n\nCustomer: ${b.customerName || user?.displayName}\nPhone: ${b.customerPhone || b.contactPhone || ""}\nService: ${b.serviceName}\nDate: ${b.bookingDate}\nTime: ${b.bookingTime}\n\nPlease open your dashboard to accept or reject this booking.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 border border-emerald-500/30 text-emerald-655 dark:text-emerald-500 bg-emerald-50/10 hover:bg-emerald-550 hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                                title="WhatsApp Worker"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              {/* Reschedule Button */}
                              {b.status === "Pending" && (
                                <button
                                  onClick={() => setReschedulingBooking(b)}
                                  className="px-3 py-2 border border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all"
                                >
                                  Reschedule
                                </button>
                              )}

                              {/* Track Worker (Active/Approved bookings only) */}
                              {isTrackable && (
                                <button
                                  onClick={() => setTrackingBooking(b)}
                                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-white" />
                                  <span>Track Worker</span>
                                </button>
                              )}

                              {b.status === "Pending" && (
                                <button
                                  onClick={() => setCancelConfirmBooking(b)}
                                  disabled={cancelingBookingId !== null}
                                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 text-rose-600 dark:text-rose-450 font-bold text-xs rounded-xl border border-rose-200/40 hover:border-rose-300 transition-all cursor-pointer disabled:opacity-55 flex items-center gap-1.5"
                                >
                                  {cancelingBookingId === (b.id || b.bookingId) ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>Cancelling...</span>
                                    </>
                                  ) : (
                                    <span>Cancel Booking</span>
                                  )}
                                </button>
                              )}

                              {b.status === "Completed" && (
                                <button
                                  onClick={() => setSelectedBookingForReview(b)}
                                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-955 font-extrabold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
                                >
                                  Write Review
                                </button>
                              )}

                              {b.status === "Reviewed" && (
                                <span className="text-xs font-semibold text-slate-405 flex items-center gap-1 py-1">
                                  <MessageSquareCheck className="w-4 h-4 text-emerald-500" />
                                  <span>Reviewed</span>
                                </span>
                              )}
                            </div>
                          </div>

                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl space-y-4 shadow-sm">
                    <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
                    <h3 className="text-lg font-bold text-slate-905 dark:text-white">No bookings in this tab group</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      You do not have any appointments recorded under the "{activeTab}" group tab. Check other options or schedule a new service.
                    </p>
                    <Link
                      to="/services"
                      className="inline-block px-6 py-3.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold text-xs rounded-2xl shadow-md"
                    >
                      Browse Service Catalog
                    </Link>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog with Local File Uploads */}
      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowEditProfile(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
                Edit User Profile
              </h3>
              <p className="text-xs text-slate-500 mb-5">Update your display metrics saved in the database directory.</p>

              <form onSubmit={handleEditProfileSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Display Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-955 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Avatar Image</label>
                  <div className="flex items-center gap-3">
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-12 h-12 rounded-full object-cover border" 
                    />
                    <div className="flex-1">
                      <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarFileChange}
                        />
                      </label>
                      <p className="text-[9px] text-slate-450 mt-1">Select an image to write to storage</p>
                    </div>
                  </div>
                  {avatarUploading && (
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${avatarProgress}%` }} />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Or Avatar Image URL</label>
                  <input
                    type="text"
                    value={editPhoto}
                    onChange={(e) => { setEditPhoto(e.target.value); setAvatarPreview(e.target.value); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-955 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={updatingProfile || avatarUploading}
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs flex-1 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {updatingProfile ? "Saving database..." : "Save Profile"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="py-3 px-5 border border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-350 font-bold rounded-2xl text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rescheduling Modal (Firestore dynamic slot updating) */}
      <AnimatePresence>
        {reschedulingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left"
            >
              <button
                onClick={() => setReschedulingBooking(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
                Reschedule Doorstep Appointment
              </h3>
              <p className="text-xs text-slate-500 mb-5">Change the date or time slot of your booking with {reschedulingBooking.workerName}.</p>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Select New Date</label>
                  <input
                    type="date"
                    required
                    min={minRescheduleDate}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-955 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Select Time Slot</label>
                  <select
                    value={rescheduleSlot}
                    onChange={(e) => setRescheduleSlot(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-955 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {slots.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs flex-1 shadow-sm cursor-pointer"
                  >
                    Update Booking
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setReschedulingBooking(null)}
                    className="py-3 px-5 border border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-350 font-bold rounded-2xl text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {cancelConfirmBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/90 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left backdrop-blur-md"
            >
              <button
                onClick={() => !cancelingBookingId && setCancelConfirmBooking(null)}
                disabled={cancelingBookingId !== null}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-full cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 rounded-2xl animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug font-display">
                    Cancel Service Booking
                  </h3>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
                    ID: {cancelConfirmBooking.bookingId}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Service Partner</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{cancelConfirmBooking.workerName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-slate-500 font-medium">Required Service</span>
                    <span className="font-bold text-blue-600 dark:text-blue-450">{cancelConfirmBooking.serviceName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-slate-200/55 dark:border-slate-800/50">
                    <span className="text-slate-500 font-medium">Estimated Cost</span>
                    <span className="font-black text-slate-900 dark:text-white">₹{cancelConfirmBooking.servicePrice}</span>
                  </div>
                </div>

                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/50 dark:bg-rose-950/10 p-3 rounded-xl border border-rose-100/30 dark:border-rose-900/20 leading-relaxed">
                  Are you sure you want to cancel this service appointment? This action will notify the worker and cannot be undone.
                </p>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    disabled={cancelingBookingId !== null}
                    className="py-3 px-6 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs flex-1 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {cancelingBookingId ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Cancelling Booking...</span>
                      </>
                    ) : (
                      <span>Confirm Cancellation</span>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setCancelConfirmBooking(null)}
                    disabled={cancelingBookingId !== null}
                    className="py-3 px-5 border border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-350 font-bold rounded-2xl text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-50"
                  >
                    Keep Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* Live Worker Tracking Modal (Interactive Swiggy/Uber map experience) */}
      <AnimatePresence>
        {trackingBooking && (() => {
          const t = trackingProgress / 100;
          // Curve interpolation formula for M 50 150 Q 200 50 350 50
          const cx = (1 - t) * (1 - t) * 50 + 2 * (1 - t) * t * 200 + t * t * 350;
          const cy = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * 50 + t * t * 50;
          
          const isArrived = trackingBooking.bookingStatus === "in_progress" || trackingBooking.status === "In Progress" || trackingBooking.bookingStatus === "work_started" || trackingBooking.status === "Work Started" || trackingBooking.bookingStatus === "completed" || trackingBooking.status === "Completed";
          
          const etaText = isArrived 
            ? "Arrived & Work in Progress" 
            : trackingBooking.bookingStatus === "worker_on_the_way" || trackingBooking.status === "Worker on the Way"
              ? `${Math.round(15 - (trackingProgress * 0.15))} mins away`
              : `Awaiting partner start (approx. 25 mins)`;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative text-left"
              >
                <button
                  onClick={() => setTrackingBooking(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-105 dark:hover:bg-slate-850 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500 animate-pulse" />
                  <span>Live Partner Tracking</span>
                </h3>
                <p className="text-xs text-slate-555 mb-5">Track {trackingBooking.workerName}'s arrival progress to your doorstep.</p>

                {/* Mock tracking map SVG */}
                <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-4 h-48 relative overflow-hidden flex items-center justify-center">
                  
                  {/* SVG path mapping */}
                  <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 200">
                    {/* Road path */}
                    <path 
                      d="M 50 150 Q 200 50 350 50" 
                      fill="none" 
                      stroke="#cbd5e1" 
                      strokeWidth="6" 
                      strokeLinecap="round"
                      className="dark:stroke-slate-800"
                    />
                    {/* Animated Dashed Route Indicator */}
                    <path 
                      d="M 50 150 Q 200 50 350 50" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="4" 
                      strokeDasharray="8,6"
                      strokeLinecap="round"
                    />

                    {/* Customer House Node */}
                    <circle cx="350" cy="50" r="12" fill="#10b981" />
                    <text x="350" y="30" fill="#10b981" fontSize="9" fontWeight="800" textAnchor="middle">HOME</text>

                    {/* Worker Node Moving Along Path */}
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r="10" 
                      fill="#3b82f6" 
                      className="animate-pulse"
                    />
                    <text 
                      x={cx} 
                      y={cy - 20} 
                      fill="#3b82f6" 
                      fontSize="9" 
                      fontWeight="850" 
                      textAnchor="middle"
                    >
                      PRO
                    </text>
                  </svg>
                  
                  <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded">
                    GPS: Hassan Vicinity Roadways
                  </span>
                </div>

                {/* Status details */}
                <div className="mt-4 flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border">
                  <div className="flex items-center gap-3">
                    <img src={trackingBooking.workerAvatar} alt={trackingBooking.workerName} className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{trackingBooking.workerName}</h4>
                      <span className="text-[10px] text-blue-500 font-bold uppercase">{trackingBooking.serviceName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Estimated Arrival</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      {etaText}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <a
                    href={`tel:${trackingBooking.contactPhone || trackingBooking.phone}`}
                    className="py-3 px-5 border border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-350 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 flex-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Pro</span>
                  </a>
                  
                  <button
                    onClick={() => setTrackingBooking(null)}
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs flex-1 shadow-sm cursor-pointer"
                  >
                    Close Tracking
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Review Modal popup */}
      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
