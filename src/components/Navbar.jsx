import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Wrench, 
  User, 
  LogOut, 
  MapPin, 
  LayoutDashboard, 
  UserPlus, 
  LogIn,
  Bell,
  CheckCheck,
  Calendar,
  Briefcase
} from "lucide-react";

export default function Navbar() {
  const { 
    user, 
    logout, 
    darkMode, 
    toggleDarkMode, 
    userLocation, 
    refreshLocation,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsOpen(false);
  };

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/85 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-xl sm:text-2xl tracking-tight">
              <div className="bg-yellow-400 dark:bg-yellow-500 text-slate-950 p-2 rounded-2xl flex items-center justify-center shadow-md">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span>Quick<span className="text-yellow-500 dark:text-yellow-400 font-bold">Worker</span></span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {/* Geolocation Button */}
            <button 
              onClick={refreshLocation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-2xl transition-all shadow-sm border border-slate-200/50 dark:border-slate-800"
              title="Click to refresh live GPS location"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="truncate max-w-[120px]">{userLocation.address}</span>
            </button>

            <Link to="/" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
            <Link to="/services" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Services</Link>
            
            {user && (
              <Link to="/my-bookings" className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">My Bookings</Link>
            )}

            <Link to="/register-worker" className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <UserPlus className="w-4 h-4" />
              <span>Become a Partner</span>
            </Link>
            
            {user?.isAdmin && (
              <Link to="/admin" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* Notification Bell in Navbar */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative cursor-pointer"
                  title="View Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white font-extrabold text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white dark:border-slate-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-[320px] sm:w-[350px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/85 rounded-3xl shadow-2xl z-50 overflow-hidden text-left animate-scale-up">
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-650 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4.5 h-4.5" />
                        <h4 className="font-extrabold text-sm">Notifications ({unreadCount} unread)</h4>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => { markAllNotificationsAsRead(); setShowNotifications(false); }}
                          className="text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850/65 bg-slate-50 dark:bg-slate-950/40">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => { markNotificationAsRead(n.id); navigate("/my-bookings"); setShowNotifications(false); }}
                            className={`p-4 flex gap-3 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 transition-all ${
                              !n.read ? "bg-blue-50/45 dark:bg-blue-950/10 border-l-2 border-blue-550" : ""
                            }`}
                          >
                            <div className="flex-1 space-y-1">
                              <p className={`text-slate-800 dark:text-slate-200 leading-normal ${!n.read ? "font-bold" : "font-medium"}`}>
                                {n.message}
                              </p>
                              <span className="text-[9px] text-slate-400 block pt-0.5">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-550 shrink-0 mt-1.5"></span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400 space-y-2">
                          <Bell className="w-8 h-8 text-slate-350 mx-auto opacity-40" />
                          <p className="text-xs">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-8 h-8 rounded-full border border-blue-500/50 object-cover" 
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Account</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{user.displayName}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-white border border-rose-500/30 hover:bg-rose-600 rounded-2xl transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-blue-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Notification bell for mobile users */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-600 text-white font-extrabold text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Dark Mode toggle for mobile */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 px-4 pt-2 pb-6 space-y-4 animate-fade-in">
          {/* Geolocation Button */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Service Location:</span>
            <button 
              onClick={() => { refreshLocation(); setIsOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
            >
              <MapPin className="w-3 h-3 text-blue-500" />
              <span className="truncate max-w-[150px]">{userLocation.address}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">Home</Link>
            <Link to="/services" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">Services</Link>
            
            {user && (
              <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900">My Bookings</Link>
            )}

            <Link to="/register-worker" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-500" />
              <span>Become a Partner</span>
            </Link>
            
            {user?.isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-xl text-base font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-3">
                  <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border border-blue-500 object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user.displayName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-rose-500 text-rose-600 dark:text-rose-400 dark:border-rose-800/60 font-bold rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 shadow-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
