import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || "",
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || "quickworker-54496.firebaseapp.com",
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || "quickworker-54496",
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || "quickworker-54496.firebasestorage.app",
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || "",
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || ""
};

// Check if the configuration has been properly set up in environment variables
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_api_key_here" && 
  !firebaseConfig.apiKey.includes("MOCK");

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

try {
  if (isConfigValid) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log("🔥 QuickWorker: Firebase initialized successfully with production credentials.");
  } else {
    console.warn(
      "⚠️ QuickWorker Warning: Firebase API Key is missing or invalid. Please configure your .env file.\n" +
      "Application is running in offline mock-sync fallback mode."
    );
    // Initialize with safe mock configs to prevent fatal startup crashes
    app = getApps().length === 0 ? initializeApp({
      apiKey: "AIzaSyBw-MOCK_KEY_FOR_QUICKWORKER_DEVELOPMENT",
      authDomain: "quickworker-54496.firebaseapp.com",
      projectId: "quickworker-54496",
      storageBucket: "quickworker-54496.firebasestorage.app",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef123456"
    }) : getApp();
  }

  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("❌ QuickWorker: Failed to initialize Firebase services:", error);
  throw error;
}

export { 
  app, 
  auth, 
  db, 
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
};
export default app;
