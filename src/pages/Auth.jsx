import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { LogIn, UserPlus, LogOut, Calendar, Clock, MapPin, Phone, Star, ShieldAlert, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";
import ReviewModal from "../components/ReviewModal";

export default function Auth() {
  const { user, login, register, loginWithGoogle, logout, bookings, updateBookingStatus, showToast } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Redirect handling
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    // If user logs in and we have a redirect path, take them there
    if (user && redirect !== "/auth") {
      navigate(redirect);
    }
  }, [user, redirect, navigate]);

  // UI state toggles
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Review states
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    let res;
    if (isSignUp) {
      if (!name.trim()) {
        showToast("Please enter your name", "warning");
        setLoading(false);
        return;
      }
      res = await register(email, password, name);
    } else {
      res = await login(email, password);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    // Trigger popup immediately on user click stack to prevent browser popup blocking
    const res = await loginWithGoogle();
    
    if (res && res.success && res.isRedirecting) {
      setLoading(true); // Keep loading animation active while redirect is in progress
    }
  };

  const handleReviewSubmit = (reviewDetails) => {
    showToast(`Thank you for rating ${selectedBookingForReview.workerName}!`, "success");
    updateBookingStatus(selectedBookingForReview.id, "Reviewed");
    setSelectedBookingForReview(null);
  };

  // If user is logged in, show their PROFILE & BOOKINGS dashboard!
  if (user) {
    return (
      <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Profile Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 text-left">
            <img src={user.photoURL} alt={user.displayName} className="w-16 h-16 rounded-full border border-blue-500/40 object-cover bg-slate-100" />
            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{user.displayName}</h2>
                {user.isAdmin && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Admin Account</span>
                )}
                {user.isWorker && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Partner Pro</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto justify-center">
              {user.isAdmin && (
                <Link to="/admin" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-755 text-white font-bold text-xs rounded-2xl transition-all shadow-sm">
                  Admin Panel
                </Link>
              )}
              <button
                onClick={logout}
                className="px-5 py-2.5 border border-rose-500/30 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Bookings Tracker section */}
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white pl-1">
              Your Booking History
            </h3>

            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.bookingId}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden"
                  >
                    {/* Booking metadata */}
                    <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                      <img src={b.workerAvatar} alt={b.workerName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-extrabold text-slate-900 dark:text-white leading-tight">
                            {b.workerName}
                          </h4>
                          <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded">
                            {b.serviceName}
                          </span>
                        </div>

                        {/* Calendar date slot info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{b.bookingDate}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{b.bookingTime}</span>
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{b.address}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Action block */}
                    <div className="flex sm:flex-row md:flex-col items-center justify-between md:justify-center md:items-end gap-3.5 pl-5 md:border-l border-slate-100 dark:border-slate-800 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          b.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                          b.status === "Approved" ? "bg-blue-105 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" :
                          b.status === "Completed" || b.status === "Reviewed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
                          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      {/* Cancel / review buttons */}
                      <div className="flex gap-2">
                        {b.status === "Pending" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "Cancelled")}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200/50 transition-colors cursor-pointer"
                          >
                            Cancel Job
                          </button>
                        )}
                        
                        {/* Demo complete and Review helpers */}
                        {b.status === "Pending" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "Approved")}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-105 text-blue-650 font-bold text-xs rounded-xl border border-blue-200/40 transition-colors cursor-pointer"
                          >
                            Approve (Demo)
                          </button>
                        )}

                        {b.status === "Approved" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "Completed")}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-650 font-bold text-xs rounded-xl border border-emerald-200/40 transition-colors cursor-pointer"
                          >
                            Complete Work
                          </button>
                        )}

                        {b.status === "Completed" && (
                          <button
                            onClick={() => setSelectedBookingForReview(b)}
                            className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl space-y-4">
                <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No service bookings scheduled yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">Explore our 30 categories to book your first background-verified professional in Hassan today.</p>
                <Link to="/services" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
                  Browse Services
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Write Review Modal overlay */}
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

  // Otherwise, show Login / Sign Up Page
  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-xl text-left space-y-6 animate-scale-up">
        
        {/* Navigation title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isSignUp ? "Sign up to track and book home services" : "Enter details to check your booking schedule"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Password (Min. 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer text-sm disabled:opacity-50"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? "Please wait..." : isSignUp ? "Create Free Account" : "Log In"}</span>
          </button>
        </form>

        {/* Alternative Google Sign In */}
        <div className="space-y-4">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs">Or continue with</span>
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-250 font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google Sign In</span>
          </button>
        </div>

        {/* Bottom helper credentials alerts */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-405 p-3 rounded-2xl border border-yellow-100/50 dark:border-yellow-900/30 text-[11px] font-medium leading-relaxed">
          💡 <strong>Demo Credentials:</strong> Try typing <code>admin@quickworker.com</code> with password <code>123456</code> to check the Admin Dashboard!
        </div>

        {/* Toggle option link */}
        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Create Account"}
          </button>
        </div>

      </div>
    </div>
  );
}
