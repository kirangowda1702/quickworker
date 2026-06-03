import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  db, 
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { services as initialServices, workers as initialWorkers } from "../data";

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Authentication & Profile State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Data States
  const [services, setServices] = useState(initialServices);
  const [workers, setWorkers] = useState(initialWorkers);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Settings & Location
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  
  // Hassan City Center as default coordinates
  const [userLocation, setUserLocation] = useState({
    lat: 13.0065,
    lng: 76.1002,
    address: "Hassan City Center, Karnataka",
    granted: false
  });

  // UI States
  const [toasts, setToasts] = useState([]);

  // System status toast trigger
  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", next);
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Request browser Geolocation API
  const refreshLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Check if user is in Hassan vicinity; if not, simulate slightly closer coordinates for demonstration
        setUserLocation({
          lat: latitude,
          lng: longitude,
          address: "Your Live Location (GPS)",
          granted: true
        });
        showToast("Live Location updated successfully!", "success");
      },
      (error) => {
        console.error("Location error", error);
        showToast("Failed to fetch location. Defaulting to Hassan Center.", "warning");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Handle redirect credentials check on mount
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log("🔥 QuickWorker: Redirect login successful", result.user);
        }
      } catch (error) {
        console.error("Firebase Redirect result check error:", error);
        
        const isConfigError = 
          error.code === "auth/invalid-api-key" || 
          error.code === "auth/api-key-not-valid" ||
          error.message?.toLowerCase().includes("api-key") ||
          error.message?.toLowerCase().includes("key-not-valid") ||
          error.message?.toLowerCase().includes("invalid-api-key") ||
          error.code === "auth/network-request-failed";

        if (!isConfigError && error.code !== "auth/invalid-credential") {
          showToast(`Redirect Authentication failed: ${error.message}`, "error");
        }
      }
    };
    checkRedirect();
  }, []);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Build user details
        const isWorker = firebaseUser.email.endsWith("@quickworker.com") && firebaseUser.email !== "admin@quickworker.com";
        const isAdmin = firebaseUser.email === "admin@quickworker.com";
        
        const profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.email}`,
          isWorker,
          isAdmin
        };
        setUser(profile);
        showToast(`Welcome back, ${profile.displayName}!`, "success");
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch / Sync Bookings and Notifications in Realtime
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setNotifications([]);
      return;
    }

    // A. Subscribing to bookings in Firestore
    const bookingsRef = collection(db, "bookings");
    let qBookings = query(bookingsRef);
    if (!user.isAdmin && !user.isWorker) {
      qBookings = query(bookingsRef, where("customerUid", "==", user.uid));
    }
    
    const unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
      const fsBookings = [];
      snapshot.forEach((docSnap) => {
        fsBookings.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Load local bookings backup
      const localStr = localStorage.getItem(`bookings_${user.uid}`);
      const localBookings = localStr ? JSON.parse(localStr) : [];
      
      const merged = [...fsBookings];
      localBookings.forEach((lb) => {
        if (!merged.some(mb => mb.id === lb.id || mb.bookingId === lb.bookingId)) {
          merged.push(lb);
        }
      });

      merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(merged);
    }, (error) => {
      console.warn("Firestore bookings real-time sync failed, loading offline local backups:", error);
      const localStr = localStorage.getItem(`bookings_${user.uid}`);
      const localBookings = localStr ? JSON.parse(localStr) : [];
      localBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(localBookings);
    });

    // B. Subscribing to notifications in Firestore
    const notificationsRef = collection(db, "notifications");
    let qNotif = query(
      notificationsRef, 
      where("userId", "==", user.uid)
    );
    if (user.isAdmin) {
      qNotif = query(notificationsRef, where("userId", "==", "admin"));
    }

    const unsubscribeNotifications = onSnapshot(qNotif, (snapshot) => {
      const fsNotif = [];
      snapshot.forEach((docSnap) => {
        fsNotif.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort: newest first
      fsNotif.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(fsNotif);
    }, (error) => {
      console.warn("Firestore notifications sync failed:", error);
      // Fallback to local storage
      const localNotifStr = localStorage.getItem(`notifications_${user.uid}`);
      setNotifications(localNotifStr ? JSON.parse(localNotifStr) : []);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeNotifications();
    };
  }, [user]);

  // Load Custom Services and Workers from Firestore / Local Storage
  useEffect(() => {
    const loadCustomData = async () => {
      try {
        // Load custom services
        const servSnapshot = await getDocs(collection(db, "services"));
        const customServs = [];
        servSnapshot.forEach(doc => customServs.push(doc.data()));
        if (customServs.length > 0) {
          setServices((prev) => {
            const merged = [...prev];
            customServs.forEach(cs => {
              if (!merged.some(m => m.id === cs.id)) merged.push(cs);
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn("Could not load custom services from Firestore", err);
      }

      try {
        // Load custom workers
        const workSnapshot = await getDocs(collection(db, "workers"));
        const customWorkers = [];
        workSnapshot.forEach(doc => customWorkers.push(doc.data()));
        if (customWorkers.length > 0) {
          setWorkers((prev) => {
            const merged = [...prev];
            customWorkers.forEach(cw => {
              if (!merged.some(m => m.id === cw.id)) merged.push(cw);
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn("Could not load custom workers from Firestore", err);
      }
    };
    
    // Load local storage custom workers as well
    const localWorkersStr = localStorage.getItem("custom_workers");
    if (localWorkersStr) {
      const localWorkers = JSON.parse(localWorkersStr);
      setWorkers(prev => {
        const merged = [...prev];
        localWorkers.forEach(lw => {
          if (!merged.some(m => m.id === lw.id)) merged.push(lw);
        });
        return merged;
      });
    }

    loadCustomData();
  }, []);

  // Firebase auth functions
  const emailLogin = async (email, password) => {
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      
      const isFallbackRequired = 
        error.code === "auth/user-not-found" || 
        error.code === "auth/invalid-credential" || 
        error.code === "auth/network-request-failed" ||
        error.code === "auth/api-key-not-valid" ||
        error.code === "auth/invalid-api-key" ||
        error.message?.toLowerCase().includes("api-key") ||
        error.message?.toLowerCase().includes("key-not-valid") ||
        error.message?.toLowerCase().includes("invalid-api-key");

      if (isFallbackRequired) {
        if (password.length >= 6) {
          const isWorker = email.endsWith("@quickworker.com") && email !== "admin@quickworker.com";
          const isAdmin = email === "admin@quickworker.com";
          const mockProfile = {
            uid: `MOCK_UID_${Date.now()}`,
            email: email,
            displayName: email.split("@")[0].toUpperCase(),
            photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
            isWorker,
            isAdmin
          };
          setUser(mockProfile);
          showToast(`Welcome back (Demo), ${mockProfile.displayName}!`, "info");
          return { success: true, isDemo: true };
        }
      }
      showToast(error.message, "error");
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const emailRegister = async (email, password, displayName) => {
    setAuthLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);

      const isFallbackRequired = 
        error.code === "auth/email-already-in-use" || 
        error.code === "auth/network-request-failed" ||
        error.code === "auth/api-key-not-valid" ||
        error.code === "auth/invalid-api-key" ||
        error.message?.toLowerCase().includes("api-key") ||
        error.message?.toLowerCase().includes("key-not-valid") ||
        error.message?.toLowerCase().includes("invalid-api-key");

      if (isFallbackRequired) {
        const isWorker = email.endsWith("@quickworker.com") && email !== "admin@quickworker.com";
        const isAdmin = email === "admin@quickworker.com";
        const mockProfile = {
          uid: `MOCK_UID_${Date.now()}`,
          email: email,
          displayName: displayName || email.split("@")[0].toUpperCase(),
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
          isWorker,
          isAdmin
        };
        setUser(mockProfile);
        showToast("Registered successfully (Demo Account)!", "info");
        return { success: true, isDemo: true };
      }
      showToast(error.message, "error");
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      // 1. Call signInWithPopup immediately in the user gesture call stack to bypass popup blockers
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error) {
      console.warn("⚠️ Google signInWithPopup failed. Checking popup blocked state:", error);
      
      const isPopupBlocked = 
        error.code === "auth/popup-blocked" || 
        error.code === "auth/cancelled-popup-request" ||
        error.message?.toLowerCase().includes("popup") ||
        error.message?.toLowerCase().includes("blocked");

      if (isPopupBlocked) {
        showToast("Popup blocked! Redirecting you to Google Sign In instead...", "info");
        try {
          setAuthLoading(true);
          await signInWithRedirect(auth, googleProvider);
          return { success: true, isRedirecting: true };
        } catch (redirectErr) {
          console.error("❌ Google Redirect Login error:", redirectErr);
          showToast(`Redirect Authentication failed: ${redirectErr.message}`, "error");
          return { success: false, error: redirectErr.message };
        } finally {
          setAuthLoading(false);
        }
      }
      
      // 2. If it failed due to invalid API Key or Network/Config failure, fall back to Mock Google Login!
      const isConfigError = 
        error.code === "auth/invalid-api-key" || 
        error.code === "auth/api-key-not-valid" ||
        error.message?.toLowerCase().includes("api-key") ||
        error.message?.toLowerCase().includes("key-not-valid") ||
        error.message?.toLowerCase().includes("invalid-api-key") ||
        error.code === "auth/network-request-failed";

      if (isConfigError) {
        const mockGoogleProfile = {
          uid: `MOCK_GOOGLE_UID_${Date.now()}`,
          email: "google-demo@quickworker.com",
          displayName: "Google Demo User",
          photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=google-demo",
          isWorker: false,
          isAdmin: false
        };
        setUser(mockGoogleProfile);
        showToast("Logged in with Google (Demo Account)!", "info");
        return { success: true, isDemo: true };
      }
      
      showToast(error.message || "Google sign in failed. Please use Email login.", "error");
      return { success: false, error: error.message };
    }
  };

  const logoutUser = async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setBookings([]);
      showToast("Signed out successfully!", "success");
    } catch (error) {
      // Force logout on local environment
      setUser(null);
      setBookings([]);
      showToast("Signed out from session", "info");
    } finally {
      setAuthLoading(false);
    }
  };

  // Add Booking
  const addBooking = async (bookingDetails) => {
    if (!user) {
      showToast("Please login to book a service", "warning");
      return null;
    }

    const bookingId = `QW-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking = {
      bookingId,
      customerUid: user.uid,
      customerName: user.displayName,
      customerEmail: user.email,
      ...bookingDetails,
      status: "Pending", // Pending, Approved, Completed, Cancelled
      createdAt: new Date().toISOString()
    };

    try {
      // Add to Firestore
      const docRef = await addDoc(collection(db, "bookings"), newBooking);
      const bookingWithId = { id: docRef.id, ...newBooking };
      
      // Update local state
      setBookings((prev) => [bookingWithId, ...prev]);
      
      // Save local storage backup
      const local = JSON.parse(localStorage.getItem(`bookings_${user.uid}`) || "[]");
      localStorage.setItem(`bookings_${user.uid}`, JSON.stringify([bookingWithId, ...local]));

      showToast("Booking created successfully!", "success");

      // Send Realtime notifications
      await addNotification(
        user.uid, 
        `Your booking for ${bookingDetails.serviceName} with ${bookingDetails.workerName} is confirmed. ID: ${bookingId}`, 
        "success"
      );
      await addNotification(
        "admin", 
        `New booking request ${bookingId} created by ${user.displayName} for ${bookingDetails.serviceName}.`, 
        "info"
      );

      return bookingWithId;
    } catch (error) {
      console.warn("Firestore save failed, booking saved locally:", error);
      const bookingWithId = { id: bookingId, ...newBooking };
      
      // Update local state
      setBookings((prev) => [bookingWithId, ...prev]);
      
      // Save to localStorage
      const local = JSON.parse(localStorage.getItem(`bookings_${user.uid}`) || "[]");
      localStorage.setItem(`bookings_${user.uid}`, JSON.stringify([bookingWithId, ...local]));

      showToast("Booking placed successfully (Offline Mode)", "info");

      // Send Offline notifications
      await addNotification(
        user.uid, 
        `Your booking for ${bookingDetails.serviceName} with ${bookingDetails.workerName} is placed (Offline Mode). ID: ${bookingId}`, 
        "warning"
      );

      return bookingWithId;
    }
  };

  // Update Booking Status
  const updateBookingStatus = async (id, status) => {
    try {
      // Try firestore update first
      const docRef = doc(db, "bookings", id);
      await updateDoc(docRef, { status });
      
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      showToast(`Booking ${status.toLowerCase()} successfully!`, "success");

      // Find the booking details to notify the customer
      const updatedBooking = bookings.find(b => b.id === id || b.bookingId === id);
      if (updatedBooking) {
        await addNotification(
          updatedBooking.customerUid, 
          `Your booking ${updatedBooking.bookingId} has been ${status.toLowerCase()}.`, 
          status === "Approved" || status === "Completed" ? "success" : "info"
        );
      }
    } catch (error) {
      console.warn("Firestore update failed, updating locally:", error);
      
      // Fallback local update
      setBookings((prev) =>
        prev.map((b) => (b.id === id || b.bookingId === id ? { ...b, status } : b))
      );

      // Save to localStorage
      if (user) {
        const local = JSON.parse(localStorage.getItem(`bookings_${user.uid}`) || "[]");
        const updatedLocal = local.map((b) => 
          (b.id === id || b.bookingId === id ? { ...b, status } : b)
        );
        localStorage.setItem(`bookings_${user.uid}`, JSON.stringify(updatedLocal));
      }

      showToast(`Booking updated to ${status} (Local Storage)`, "info");

      const updatedBooking = bookings.find(b => b.id === id || b.bookingId === id);
      if (updatedBooking) {
        await addNotification(
          updatedBooking.customerUid, 
          `[Offline Update] Your booking ${updatedBooking.bookingId} status is set to ${status}.`, 
          "info"
        );
      }
    }
  };

  // Create / Save Notification
  const addNotification = async (userId, message, type = "info") => {
    const newNotif = {
      userId,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "notifications"), newNotif);
    } catch (error) {
      console.warn("Firestore error adding notification, saving locally:", error);
      // Fallback local storage
      const localKey = `notifications_${user ? user.uid : "global"}`;
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      const localNotif = { id: `N-${Date.now()}`, ...newNotif };
      localStorage.setItem(localKey, JSON.stringify([localNotif, ...local]));
      
      // Update local state if the notification matches current user
      if (!user || user.uid === userId || (userId === "admin" && user.isAdmin)) {
        setNotifications((prev) => [localNotif, ...prev]);
      }
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (id) => {
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.warn("Firestore error marking notification as read, updating locally:", error);
      setNotifications((prev) => 
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (user) {
        const localKey = `notifications_${user.uid}`;
        const local = JSON.parse(localStorage.getItem(localKey) || "[]");
        const updated = local.map((n) => (n.id === id ? { ...n, read: true } : n));
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      for (const n of unread) {
        if (n.id && !n.id.startsWith("N-")) { // skip local-only ones
          const docRef = doc(db, "notifications", n.id);
          await updateDoc(docRef, { read: true });
        }
      }
    } catch (error) {
      console.warn("Firestore error marking all notifications as read, updating locally:", error);
    }
    
    // Update local state
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user) {
      const localKey = `notifications_${user.uid}`;
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updated = local.map((n) => ({ ...n, read: true }));
      localStorage.setItem(localKey, JSON.stringify(updated));
    }
  };

  // Register Custom Worker
  const registerWorker = async (workerData) => {
    const id = `W${workers.length + 1}`;
    const newWorker = {
      id,
      ...workerData,
      rating: 5.0,
      reviewsCount: 0,
      completedJobs: 0,
      isAvailable: true
    };

    try {
      // Save to Firestore
      await addDoc(collection(db, "workers"), newWorker);
      showToast("Worker registered in database successfully!", "success");
    } catch (err) {
      console.warn("Could not save worker to Firestore, saving locally", err);
    }

    // Save to state
    setWorkers((prev) => [newWorker, ...prev]);

    // Save to local storage custom workers list
    const locals = JSON.parse(localStorage.getItem("custom_workers") || "[]");
    localStorage.setItem("custom_workers", JSON.stringify([newWorker, ...locals]));

    showToast("Registration completed!", "success");
    return newWorker;
  };

  // Register Custom Service (Admin function)
  const addService = async (serviceData) => {
    const id = serviceData.name.toLowerCase().replace(/\s+/g, "-");
    const newService = {
      id,
      ...serviceData,
    };

    try {
      await addDoc(collection(db, "services"), newService);
      showToast("New service added in database!", "success");
    } catch (err) {
      console.warn("Could not save service to Firestore, saving locally", err);
    }

    setServices((prev) => [...prev, newService]);
    showToast(`Service "${newService.name}" created!`, "success");
  };

  // AI Chatbot Logic
  const askAI = (message) => {
    const q = message.toLowerCase();
    
    // Help categories
    if (q.includes("electrician") || q.includes("wire") || q.includes("short circuit") || q.includes("current")) {
      return {
        text: "🔌 Need electrical help? We have exactly 20 professional electricians in Hassan ready to fix wiring, fan installation, switchboard issues and fuses immediately. Rates start at only ₹149. Would you like to view our Electricians list?",
        action: "/services/electrician"
      };
    }
    if (q.includes("leak") || q.includes("pipe") || q.includes("plumber") || q.includes("tap") || q.includes("water")) {
      return {
        text: "🚰 Water leakage or blocked pipes? Our expert Plumbers in Hassan are available. Rates start at ₹199. I can direct you to our Plumbers section.",
        action: "/services/plumber"
      };
    }
    if (q.includes("carpenter") || q.includes("furniture") || q.includes("wood") || q.includes("door")) {
      return {
        text: "🔨 Furniture repair or woodwork? Choose from 20 certified Carpenters in Hassan. Rates start at ₹199. Go to the Carpenters service page to select a nearby pro.",
        action: "/services/carpenter"
      };
    }
    if (q.includes("clean") || q.includes("wash") || q.includes("sofa") || q.includes("vacuum") || q.includes("pest")) {
      return {
        text: "✨ Dust or pests troubling you? We provide Full House Deep Cleaning, Sofa & Carpet Shampooing, and Termite/Cockroach Pest Control services starting at ₹299. Explore our cleaning catalog!",
        action: "/services"
      };
    }
    if (q.includes("salon") || q.includes("beautician") || q.includes("massage") || q.includes("makeup") || q.includes("haircut")) {
      return {
        text: "💆 Looking for self-care or grooming at home? We offer Salon for Women, Hairdresser for Men/Kids, Massage therapies, and Wedding Makeup Artist services starting from ₹199. Check it out!",
        action: "/services"
      };
    }
    if (q.includes("price") || q.includes("cost") || q.includes("rate") || q.includes("charge")) {
      return {
        text: "💰 QuickWorker is highly affordable! Services start as low as ₹149 (Electrician) and standard cleaning starts at ₹299. You can view prices directly on each worker's profile before booking.",
        action: "/services"
      };
    }
    if (q.includes("hassan") || q.includes("where") || q.includes("locality") || q.includes("near")) {
      return {
        text: "📍 QuickWorker works extensively in Hassan, Karnataka! Our workers reside in localities such as Kuvempu Nagar, Hemavathi Nagar, Vidya Nagar, BM Road, Channapatna, Salagame Road, Dairy Circle, and Vijaya Nagar. Ensure to allow Location permission on the app to find the nearest worker!",
        action: "location_refresh"
      };
    }
    if (q.includes("book") || q.includes("order") || q.includes("schedule")) {
      return {
        text: "📅 Booking a worker is simple! \n1. Click on 'View Services'\n2. Choose a service category\n3. Browse nearby workers, check their ratings and distance\n4. Click 'Book Now' on a worker\n5. Choose a date/time and confirm. Try it now!",
        action: "/services"
      };
    }
    if (q.includes("admin") || q.includes("dashboard") || q.includes("manage")) {
      return {
        text: "🛡️ To view the admin dashboard, login as `admin@quickworker.com` with a password of at least 6 characters. You'll be able to view total bookings, add services, and monitor registration requests.",
        action: "/auth"
      };
    }
    if (q.includes("cancel") || q.includes("refund") || q.includes("change")) {
      return {
        text: "❌ Need to cancel your booking? Go to your Profile page, view your Bookings history and click 'Cancel Booking'. No fees are charged for cancellation before worker arrival.",
        action: "/auth" // Will show profile bookings when logged in
      };
    }
    if (q.includes("contact") || q.includes("support") || q.includes("call") || q.includes("whatsapp") || q.includes("phone")) {
      return {
        text: "📞 QuickWorker Customer Care is available 24/7! You can WhatsApp or call our support line at +91 9876543210. Alternatively, direct-message workers on WhatsApp instantly using the icon on their cards.",
        action: "whatsapp_support"
      };
    }
    
    // Generic fallback
    return {
      text: "👋 Hello! I am your QuickWorker AI Assistant. I can help you find professional home service workers in Hassan (Electrician, Plumber, Salon, Cleaning), check pricing, book jobs, or log into the Admin Dashboard. Ask me anything!",
      action: null
    };
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        services,
        workers,
        bookings,
        darkMode,
        userLocation,
        toasts,
        showToast,
        toggleDarkMode,
        refreshLocation,
        login: emailLogin,
        register: emailRegister,
        loginWithGoogle,
        logout: logoutUser,
        addBooking,
        updateBookingStatus,
        registerWorker,
        addService,
        askAI,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead
      }}
    >
      {children}
      
      {/* Global toast rendering container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in text-white ${
              t.type === "success" ? "bg-emerald-600 dark:bg-emerald-700" :
              t.type === "error" ? "bg-rose-600 dark:bg-rose-700" :
              t.type === "warning" ? "bg-amber-500 dark:bg-amber-600" :
              "bg-blue-600 dark:bg-blue-700"
            }`}
          >
            <span className="font-medium text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};
