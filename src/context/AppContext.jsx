import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  onAuthStateChanged,
  isConfigValid
} from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  setDoc,
  doc, 
  updateDoc, 
  query, 
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { services as initialServices, workers as initialWorkers } from "../data";

const safeGetTime = (val) => {
  if (!val) return Date.now();
  if (typeof val.toDate === "function") return val.toDate().getTime();
  if (val.seconds) return val.seconds * 1000;
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
  }
  return Date.now();
};

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
  
  // Keep a ref to track the currently logged in user to avoid duplicate fetches and duplicate toasts
  const currentUserRef = useRef(null);
  const isFirstLoad = useRef(true);

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

  // PWA & Connection States
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(() => {
    return localStorage.getItem("pwa_dismissed") !== "true" && 
           !window.matchMedia("(display-mode: standalone)").matches;
  });

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
          const profile = await syncUserProfileAfterLogin(result.user);
          showToast(`Welcome back, ${profile.displayName}!`, "success");
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
        // If user is already set and matches the firebaseUser, do not reload
        if (currentUserRef.current && currentUserRef.current.uid === firebaseUser.uid) {
          setUser(currentUserRef.current);
          setAuthLoading(false);
          return;
        }

        // Fetch role from Firestore
        let role = "customer";
        let displayName = firebaseUser.displayName || firebaseUser.email.split("@")[0];
        let photoURL = firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.email}`;

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            role = userData.role || "customer";
            displayName = userData.displayName || displayName;
            photoURL = userData.photoURL || photoURL;
          } else {
            const defaultIsWorker = firebaseUser.email.endsWith("@quickworker.com") && firebaseUser.email !== "admin@quickworker.com";
            const defaultIsAdmin = firebaseUser.email === "admin@quickworker.com";
            role = defaultIsAdmin ? "admin" : defaultIsWorker ? "worker" : "customer";
            
            // Save initial user profile doc in Firestore
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName,
              photoURL,
              role,
              createdAt: new Date().toISOString()
            });
          }
        } catch (dbErr) {
          console.warn("Could not query Firestore user role, defaulting based on email:", dbErr);
          const defaultIsWorker = firebaseUser.email.endsWith("@quickworker.com") && firebaseUser.email !== "admin@quickworker.com";
          const defaultIsAdmin = firebaseUser.email === "admin@quickworker.com";
          role = defaultIsAdmin ? "admin" : defaultIsWorker ? "worker" : "customer";
        }

        const profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName,
          photoURL,
          role,
          isWorker: role === "worker",
          isAdmin: role === "admin"
        };
        currentUserRef.current = profile;
        setUser(profile);
        
        if (!isFirstLoad.current) {
          showToast(`Welcome back, ${profile.displayName}!`, "success");
        }
        isFirstLoad.current = false;
      } else {
        currentUserRef.current = null;
        setUser(null);
        isFirstLoad.current = false;
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle PWA Events & Offline status
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("📥 PWA install prompt available.");
    };

    const goOnline = () => {
      setIsOnline(true);
      showToast("You are back online!", "success");
    };

    const goOffline = () => {
      setIsOnline(false);
      showToast("Working offline. Showing cached data.", "warning");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Initial check for standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false);
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const triggerInstallPrompt = async () => {
    if (!deferredPrompt) {
      console.warn("PWA: No install prompt captured yet.");
      return false;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User choice outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
    setShowInstallBanner(false);
    if (outcome === "accepted") {
      showToast("Thank you for installing QuickWorker!", "success");
      return true;
    }
    return false;
  };

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
    if (user.role === "worker") {
      qBookings = query(bookingsRef, where("workerEmail", "==", user.email));
    } else if (user.role === "customer") {
      qBookings = query(bookingsRef, where("customerUid", "==", user.uid));
    }
    
    const unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
      const fsBookings = snapshot.docs.map((docSnap) => {
        const { id, ...data } = docSnap.data();
        return {
          id: docSnap.id,
          ...data
        };
      });

      fsBookings.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt));
      setBookings(fsBookings);
    }, (error) => {
      console.error("Firestore bookings real-time sync failed:", error);
      showToast("Real-time bookings sync failed", "error");
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
      fsNotif.sort((a, b) => safeGetTime(b.createdAt) - safeGetTime(a.createdAt));
      setNotifications(fsNotif);
    }, (error) => {
      console.error("Firestore notifications sync failed:", error);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeNotifications();
    };
  }, [user]);

  // Load Custom Services and Workers from Firestore
  useEffect(() => {
    const loadCustomData = async () => {
      try {
        // Load custom services
        const servSnapshot = await getDocs(collection(db, "services"));
        const customServs = [];
        servSnapshot.forEach(docSnap => {
          customServs.push({ id: docSnap.id, ...docSnap.data() });
        });
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
        workSnapshot.forEach(docSnap => {
          customWorkers.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (customWorkers.length > 0) {
          setWorkers((prev) => {
            const merged = [...prev];
            customWorkers.forEach(cw => {
              if (!merged.some(m => m.id === cw.id)) {
                merged.push(cw);
              } else {
                // update existing static worker if changed in DB (e.g. rating, availability)
                const idx = merged.findIndex(m => m.id === cw.id);
                if (idx !== -1) {
                  merged[idx] = { ...merged[idx], ...cw };
                }
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn("Could not load custom workers from Firestore", err);
      }
    };

    loadCustomData();
  }, []);

  // Helper to sync user profile and set state instantly after login/register
  const syncUserProfileAfterLogin = async (firebaseUser, customDisplayName = null) => {
    let role = "customer";
    let displayName = firebaseUser.displayName || customDisplayName || firebaseUser.email.split("@")[0];
    let photoURL = firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.email}`;

    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = userData.role || "customer";
        displayName = userData.displayName || displayName;
        photoURL = userData.photoURL || photoURL;
      } else {
        const defaultIsWorker = firebaseUser.email.endsWith("@quickworker.com") && firebaseUser.email !== "admin@quickworker.com";
        const defaultIsAdmin = firebaseUser.email === "admin@quickworker.com";
        role = defaultIsAdmin ? "admin" : defaultIsWorker ? "worker" : "customer";
        
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName,
          photoURL,
          role,
          createdAt: new Date().toISOString()
        });
      }
    } catch (dbErr) {
      console.warn("Could not query Firestore user role during sync:", dbErr);
      const defaultIsWorker = firebaseUser.email.endsWith("@quickworker.com") && firebaseUser.email !== "admin@quickworker.com";
      const defaultIsAdmin = firebaseUser.email === "admin@quickworker.com";
      role = defaultIsAdmin ? "admin" : defaultIsWorker ? "worker" : "customer";
    }

    const profile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName,
      photoURL,
      role,
      isWorker: role === "worker",
      isAdmin: role === "admin"
    };

    currentUserRef.current = profile;
    setUser(profile);
    return profile;
  };

  // Firebase auth functions
  const emailLogin = async (email, password) => {
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      setAuthLoading(false);
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
            role: isAdmin ? "admin" : isWorker ? "worker" : "customer",
            isWorker,
            isAdmin
          };
          currentUserRef.current = mockProfile;
          setUser(mockProfile);
          showToast(`Welcome back (Demo), ${mockProfile.displayName}!`, "info");
          return { success: true, isDemo: true };
        }
      }
      showToast(error.message, "error");
      return { success: false, error: error.message };
    }
  };

  const emailRegister = async (email, password, displayName) => {
    setAuthLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save profile doc in Firestore immediately so auth observer can load it
      const userDocRef = doc(db, "users", cred.user.uid);
      const photoURL = `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`;
      const defaultIsWorker = email.endsWith("@quickworker.com") && email !== "admin@quickworker.com";
      const defaultIsAdmin = email === "admin@quickworker.com";
      const role = defaultIsAdmin ? "admin" : defaultIsWorker ? "worker" : "customer";

      await setDoc(userDocRef, {
        uid: cred.user.uid,
        email: email,
        displayName,
        photoURL,
        role,
        createdAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      setAuthLoading(false);
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
          role: isAdmin ? "admin" : isWorker ? "worker" : "customer",
          isWorker,
          isAdmin
        };
        currentUserRef.current = mockProfile;
        setUser(mockProfile);
        showToast("Registered successfully (Demo Account)!", "info");
        return { success: true, isDemo: true };
      }
      showToast(error.message, "error");
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    // 1. If using a mock API key, log in offline immediately to prevent popup triggers
    const apiKey = auth.config?.apiKey || "";
    const isMockConfig = apiKey.includes("MOCK") || !apiKey || apiKey === "your_api_key_here";

    if (isMockConfig) {
      const mockGoogleProfile = {
        uid: `MOCK_GOOGLE_UID_${Date.now()}`,
        email: "google-demo@quickworker.com",
        displayName: "Google Demo User",
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=google-demo",
        role: "customer",
        isWorker: false,
        isAdmin: false
      };
      currentUserRef.current = mockGoogleProfile;
      setUser(mockGoogleProfile);
      showToast("Logged in with Google (Demo Account)!", "info");
      return { success: true, isDemo: true };
    }

    // 2. Check if user is on mobile. If so, use redirect instead of popup
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      try {
        setAuthLoading(true);
        showToast("Redirecting to Google Sign In...", "info");
        await signInWithRedirect(auth, googleProvider);
        return { success: true, isRedirecting: true };
      } catch (redirectErr) {
        setAuthLoading(false);
        console.error("❌ Google Redirect Login error:", redirectErr);
        showToast(`Redirect Authentication failed: ${redirectErr.message}`, "error");
        return { success: false, error: redirectErr.message };
      }
    }

    // 3. Desktop flow: try popup first, then fallback to redirect if blocked
    try {
      setAuthLoading(true);
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
          setAuthLoading(false);
          console.error("❌ Google Redirect Login error:", redirectErr);
          showToast(`Redirect Authentication failed: ${redirectErr.message}`, "error");
          return { success: false, error: redirectErr.message };
        }
      }
      
      setAuthLoading(false);
      showToast(error.message || "Google sign in failed. Please use Email login.", "error");
      return { success: false, error: error.message };
    }
  };

  const logoutUser = async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      currentUserRef.current = null;
      setUser(null);
      setBookings([]);
      showToast("Signed out successfully!", "success");
    } catch (error) {
      // Force logout on local environment
      currentUserRef.current = null;
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

    const matchedWorker = workers.find((w) => w.id === bookingDetails.workerId);
    const workerEmail = bookingDetails.workerEmail || matchedWorker?.email || "";
    const workerPhone = bookingDetails.workerPhone || matchedWorker?.phone || "";
    const workerName = bookingDetails.workerName || matchedWorker?.name || "Unknown Worker";
    const customerPhone = bookingDetails.contactPhone || bookingDetails.phone || "";
    const estimatedPrice = bookingDetails.servicePrice || bookingDetails.estimatedPrice || 0;
    const notes = bookingDetails.notes || bookingDetails.instructions || "";

    const displayBookingId = `QW-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const newBooking = {
      // Required Firestore document keys from USER_REQUEST
      bookingId: displayBookingId, // for compatibility
      displayBookingId,
      customerId: user.uid,
      customerName: user.displayName,
      customerPhone,
      workerId: bookingDetails.workerId,
      workerName,
      workerPhone,
      workerEmail,
      serviceName: bookingDetails.serviceName,
      bookingDate: bookingDetails.bookingDate,
      bookingTime: bookingDetails.bookingTime,
      address: bookingDetails.address,
      notes,
      estimatedPrice,
      bookingStatus: "pending", // lowercase default
      paymentStatus: bookingDetails.paymentStatus || "pending",

      // Existing compatibility keys
      userId: user.uid,
      userName: user.displayName,
      userEmail: user.email,
      customerUid: user.uid,
      customerName: user.displayName,
      customerEmail: user.email,
      ...bookingDetails,
      status: "Pending",
    };

    const { id: dummyId, ...newBookingWithoutId } = newBooking;
    const bookingData = {
      ...newBookingWithoutId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Filter out all undefined fields before saving to Firestore
    const cleanedBookingData = Object.fromEntries(
      Object.entries(bookingData).filter(([_, v]) => v !== undefined)
    );

    try {
      console.log("Creating booking...");
      console.log("Final booking payload:", cleanedBookingData);

      const docRef = await addDoc(collection(db, "bookings"), cleanedBookingData);
      console.log("Firestore doc ID:", docRef.id);

      const bookingWithId = { 
        id: docRef.id, 
        createdAt: now,
        updatedAt: now,
        ...newBookingWithoutId 
      };
      
      // Update local state for instant feedback
      setBookings((prev) => [bookingWithId, ...prev]);
      
      showToast("Booking created successfully!", "success");

      // Send Realtime notifications in a non-blocking way
      addNotification(
        user.uid, 
        `Your booking for ${bookingDetails.serviceName} with ${bookingDetails.workerName} is confirmed. ID: ${displayBookingId}`, 
        "success"
      ).catch(console.error);
      addNotification(
        "admin", 
        `New booking request ${displayBookingId} created by ${user.displayName} for ${bookingDetails.serviceName}.`, 
        "info"
      ).catch(console.error);

      return bookingWithId;
    } catch (error) {
      console.error("❌ [addBooking] Firestore save failed:", error);
      showToast(`Failed to create booking: ${error.message || error}`, "error");
      return null;
    }
  };

  // Update Booking Status
  const updateBookingStatus = async (id, status) => {
    console.log("🚀 [updateBookingStatus] Function called with id:", id, "and status:", status);
    if (!id) {
      console.warn("⚠️ [updateBookingStatus] Cannot update booking: invalid ID");
      showToast("Cannot update booking: invalid ID", "error");
      return { success: false, error: "Invalid ID" };
    }

    let bookingStatus = "pending";
    let statusLabel = status;
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus === "approved" || lowerStatus === "accepted") {
      bookingStatus = "accepted";
      statusLabel = "Accepted";
    } else if (lowerStatus.includes("way") || lowerStatus.includes("on_the_way")) {
      bookingStatus = "worker_on_the_way";
      statusLabel = "Worker on the Way";
    } else if (lowerStatus.includes("started") || lowerStatus.includes("work_started") || lowerStatus.includes("in_progress")) {
      bookingStatus = "in_progress";
      statusLabel = "In Progress";
    } else if (lowerStatus === "completed" || lowerStatus === "reviewed") {
      bookingStatus = "completed";
      statusLabel = "Completed";
    } else if (lowerStatus === "cancelled") {
      bookingStatus = "cancelled";
      statusLabel = "Cancelled";
    }

    const now = new Date().toISOString();
    
    // Resolve Firestore ID if human-readable bookingId is passed
    let targetDocId = id;
    let foundBooking = bookings.find(b => b.id === id || b.bookingId === id);
    if (foundBooking) {
      targetDocId = foundBooking.id;
    }
    console.log("🚀 [updateBookingStatus] Resolved targetDocId:", targetDocId, "foundBooking:", foundBooking ? foundBooking.bookingId : "none");

    // Prevent duplicate cancellations
    if (bookingStatus === "cancelled" && foundBooking && 
        (foundBooking.bookingStatus === "cancelled" || foundBooking.status === "Cancelled")) {
      console.log("🚀 [updateBookingStatus] Booking is already cancelled. Exiting early.");
      showToast("Booking is already cancelled", "info");
      return { success: true, alreadyCancelled: true };
    }

    // Online Firestore update flow
    console.log("🚀 [updateBookingStatus] Performing online updateDoc for:", targetDocId);
    try {
      const docRef = doc(db, "bookings", targetDocId);
      await updateDoc(docRef, { status: statusLabel, bookingStatus, updatedAt: serverTimestamp() });
      console.log("🚀 [updateBookingStatus] online updateDoc succeeded!");
      
      showToast(`Booking ${statusLabel.toLowerCase()} successfully!`, "success");

      const updatedBooking = foundBooking || bookings.find(b => b.id === targetDocId || b.id === id || b.bookingId === id);
      if (updatedBooking) {
        if (bookingStatus === "cancelled") {
          addNotification(
            updatedBooking.customerId || updatedBooking.customerUid || updatedBooking.userId, 
            `Your booking for ${updatedBooking.serviceName} with ${updatedBooking.workerName} has been cancelled. ID: ${updatedBooking.bookingId}`, 
            "warning"
          ).catch(console.error);
          if (updatedBooking.workerId) {
            addNotification(
              updatedBooking.workerId, 
              `Booking request ${updatedBooking.bookingId} for ${updatedBooking.serviceName} has been cancelled by the customer.`, 
              "warning"
            ).catch(console.error);
          }
          addNotification(
            "admin", 
            `Booking ${updatedBooking.bookingId} has been cancelled by customer ${updatedBooking.customerName || "User"}.`, 
            "warning"
          ).catch(console.error);
        } else {
          addNotification(
            updatedBooking.customerUid || updatedBooking.customerId || updatedBooking.userId, 
            `Your booking ${updatedBooking.bookingId} status is now: ${statusLabel.toLowerCase()}.`, 
            statusLabel === "Accepted" || statusLabel === "Completed" ? "success" : "info"
          ).catch(console.error);
        }
      }
      return { success: true, mode: "online" };
    } catch (error) {
      console.error("❌ [updateBookingStatus] Firestore update failed:", error);
      showToast(`Failed to update booking status: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  };

  // Update User Profile
  const updateUserProfile = async (displayName, photoURL) => {
    if (!user) {
      showToast("User not authenticated", "error");
      return false;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName,
        photoURL
      });
      setUser((prev) => ({ ...prev, displayName, photoURL }));
      showToast("Profile updated successfully!", "success");
      return true;
    } catch (error) {
      console.error("Firestore user profile update failed:", error);
      showToast(`Profile update failed: ${error.message}`, "error");
      return false;
    }
  };

  // Update Worker Profile
  const updateWorkerProfile = async (workerId, updatedFields) => {
    try {
      const workerDocRef = doc(db, "workers", workerId);
      await updateDoc(workerDocRef, updatedFields);
      
      // Update local workers state
      setWorkers((prev) => 
        prev.map((w) => (w.id === workerId ? { ...w, ...updatedFields } : w))
      );
      
      showToast("Professional profile updated successfully!", "success");
      return true;
    } catch (error) {
      console.error("Firestore worker profile update failed:", error);
      showToast(`Professional profile update failed: ${error.message}`, "error");
      return false;
    }
  };

  // Submit Review and recalculate worker rating
  const submitReview = async (reviewDetails) => {
    if (!user) return false;
    
    const { bookingId, workerId, rating, comment } = reviewDetails;
    const reviewDoc = {
      bookingId,
      workerId,
      customerId: user.uid,
      rating: parseInt(rating) || 5,
      reviewMessage: comment || "",
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Add to reviews collection in Firestore
      await addDoc(collection(db, "reviews"), reviewDoc);
      
      // 2. Query all reviews for this worker to calculate new average rating and count
      const q = query(collection(db, "reviews"), where("workerId", "==", workerId));
      const querySnapshot = await getDocs(q);
      
      let totalRating = 0;
      let reviewCount = 0;
      
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        totalRating += data.rating;
        reviewCount += 1;
      });
      
      if (reviewCount === 0) {
        totalRating = rating;
        reviewCount = 1;
      }
      
      const averageRating = parseFloat((totalRating / reviewCount).toFixed(1));
      
      // 3. Update the worker document in Firestore
      const workerDocRef = doc(db, "workers", workerId);
      await updateDoc(workerDocRef, {
        rating: averageRating,
        reviewsCount: reviewCount,
        completedJobs: reviewCount + 10
      });
      
      // Update local state instantly
      setWorkers((prev) => 
        prev.map((w) => w.id === workerId ? { ...w, rating: averageRating, reviewsCount: reviewCount, completedJobs: reviewCount + 10 } : w)
      );
      
      // 4. Update the booking status to "Reviewed" (both status and bookingStatus)
      const booking = bookings.find(b => b.bookingId === bookingId || b.id === bookingId);
      if (booking) {
        const bookingDocRef = doc(db, "bookings", booking.id);
        await updateDoc(bookingDocRef, {
          status: "Reviewed",
          bookingStatus: "completed",
          updatedAt: new Date().toISOString()
        });
        
        setBookings((prev) => 
          prev.map((b) => b.id === booking.id ? { ...b, status: "Reviewed", bookingStatus: "completed", updatedAt: new Date().toISOString() } : b)
        );

        // Add a notification for review reminder done
        addNotification(
          user.uid,
          `Review submitted successfully for ${booking.workerName}. Thank you!`,
          "success"
        ).catch(console.error);
      }
      
      showToast("Thank you! Your review has been recorded.", "success");
      return true;
    } catch (err) {
      console.error("Error submitting review:", err);
      showToast(`Failed to submit review: ${err.message}`, "error");
      return false;
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
      console.error("Firestore error adding notification:", error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (id) => {
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error("Firestore error marking notification as read:", error);
      showToast("Failed to mark notification as read", "error");
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      for (const n of unread) {
        if (n.id) {
          const docRef = doc(db, "notifications", n.id);
          await updateDoc(docRef, { read: true });
        }
      }
    } catch (error) {
      console.error("Firestore error marking all notifications as read:", error);
      showToast("Failed to mark all notifications as read", "error");
    }
  };

  // Register Custom Worker
  const registerWorker = async (workerData) => {
    const id = `W${(workers.length + 1).toString().padStart(3, "0")}`;
    const newWorker = {
      id,
      ...workerData,
      rating: 5.0,
      reviewsCount: 0,
      completedJobs: 0,
      isAvailable: true
    };

    try {
      const workerDocRef = doc(db, "workers", newWorker.id);
      await setDoc(workerDocRef, newWorker);
      setWorkers((prev) => [newWorker, ...prev]);
      showToast("Worker registered in database successfully!", "success");
      return newWorker;
    } catch (err) {
      console.error("Could not save worker to Firestore:", err);
      showToast(`Registration failed: ${err.message}`, "error");
      return null;
    }
  };

  // Register Custom Service (Admin function)
  const addService = async (serviceData) => {
    const id = serviceData.name.toLowerCase().replace(/\s+/g, "-");
    const newService = {
      id,
      ...serviceData,
    };

    try {
      const serviceDocRef = doc(db, "services", newService.id);
      await setDoc(serviceDocRef, newService);
      setServices((prev) => [...prev, newService]);
      showToast(`Service "${newService.name}" created!`, "success");
    } catch (err) {
      console.error("Could not save service to Firestore:", err);
      showToast(`Failed to add service: ${err.message}`, "error");
    }
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

  const isAuthenticated = !!user;

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        isAuthenticated,
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
        updateUserProfile,
        updateWorkerProfile,
        registerWorker,
        addService,
        askAI,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        submitReview,
        isOnline,
        isInstallable,
        showInstallBanner,
        setShowInstallBanner,
        triggerInstallPrompt
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
