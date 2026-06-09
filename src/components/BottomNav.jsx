import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Home, Compass, Calendar, User, LayoutDashboard, Wrench } from "lucide-react";

export default function BottomNav() {
  const { user, notifications } = useApp();
  const location = useLocation();

  // Show only on mobile/tablet (hidden on desktop md and up)
  const activeClass = "text-blue-600 dark:text-blue-400 font-bold scale-110";
  const inactiveClass = "text-slate-450 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";

  const getBookingsLink = () => {
    if (!user) return "/auth?redirect=/my-bookings";
    if (user.isAdmin) return "/admin";
    if (user.isWorker) return "/worker-dashboard";
    return "/my-bookings";
  };

  const getAccountLink = () => {
    if (!user) return "/auth";
    if (user.isWorker) return "/worker-dashboard";
    if (user.isAdmin) return "/admin";
    return "/my-bookings";
  };

  const unreadCount = React.useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/80 dark:bg-slate-900/85 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-800/80 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] px-4 py-2 flex justify-around items-center transition-colors duration-300 pb-safe">
      
      {/* Home Tab */}
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 py-1 transition-all ${
          location.pathname === "/" ? activeClass : inactiveClass
        }`}
      >
        <Home className="w-5 h-5 transition-transform duration-200" />
        <span className="text-[10px] tracking-wide font-medium">Home</span>
      </Link>

      {/* Services Tab */}
      <Link
        to="/services"
        className={`flex flex-col items-center gap-1 py-1 transition-all ${
          location.pathname.startsWith("/services") ? activeClass : inactiveClass
        }`}
      >
        <Compass className="w-5 h-5 transition-transform duration-200" />
        <span className="text-[10px] tracking-wide font-medium">Services</span>
      </Link>

      {/* Bookings Tab */}
      <Link
        to={getBookingsLink()}
        className={`flex flex-col items-center gap-1 py-1 transition-all relative ${
          location.pathname === "/my-bookings" || location.pathname === "/admin" || location.pathname === "/worker-dashboard"
            ? activeClass
            : inactiveClass
        }`}
      >
        <Calendar className="w-5 h-5 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-1.5 bg-rose-600 text-white font-extrabold text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-white dark:border-slate-900">
            {unreadCount}
          </span>
        )}
        <span className="text-[10px] tracking-wide font-medium">
          {user?.isWorker ? "Tasks" : user?.isAdmin ? "Admin" : "Bookings"}
        </span>
      </Link>

      {/* Account Profile Tab */}
      <Link
        to={getAccountLink()}
        className={`flex flex-col items-center gap-1 py-1 transition-all ${
          location.pathname === "/auth" ? activeClass : inactiveClass
        }`}
      >
        {user ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className={`w-5 h-5 rounded-full object-cover border ${
              location.pathname === "/my-bookings" || location.pathname === "/worker-dashboard" || location.pathname === "/admin"
                ? "border-blue-500" 
                : "border-slate-300 dark:border-slate-700"
            }`}
          />
        ) : (
          <User className="w-5 h-5 transition-transform duration-200" />
        )}
        <span className="text-[10px] tracking-wide font-medium">
          {user ? "Profile" : "Sign In"}
        </span>
      </Link>

    </div>
  );
}
