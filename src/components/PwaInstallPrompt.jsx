import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Smartphone, Download, CheckCircle, WifiOff } from "lucide-react";

export default function PwaInstallPrompt() {
  const { isInstallable, showInstallBanner, setShowInstallBanner, triggerInstallPrompt } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-show after a brief delay if PWA is installable and banner hasn't been dismissed
  useEffect(() => {
    if (isInstallable && showInstallBanner) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, showInstallBanner]);

  const handleInstall = async () => {
    const success = await triggerInstallPrompt();
    if (success) {
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setShowInstallBanner(false);
    localStorage.setItem("pwa_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          {/* Modal Card */}
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative text-left"
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-655 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* App Header Promo */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 shrink-0">
                <img src="/pwa-512x512.png" alt="QuickWorker PWA Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  QuickWorker App
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                  Doorstep Services Hassan
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5 border border-emerald-200/30 dark:border-emerald-800/30">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>Works Offline</span>
                  </span>
                  <span className="text-[9px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5 border border-blue-200/30 dark:border-blue-800/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>App Mode</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Benefit Bullets */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mt-0.5">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold">Launch from Home Screen</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">Behaves like a native mobile app with full-screen standalone view (no browser tabs).</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mt-0.5">
                  <WifiOff className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold">Rapid Offline Performance</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">Load categories, profiles, and past bookings instantly even without active internet.</p>
                </div>
              </div>
            </div>

            {/* Android / Chrome Manual Guide */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-805/50 mb-5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1.5">
              <p className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[9px]">How to install on Android / Chrome:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Click the <strong>Install App</strong> button below.</li>
                <li>When prompted, tap <strong>Install</strong> to add to home screen.</li>
                <li>Alternatively, tap Chrome menu <strong className="font-black">⋮</strong> and select <strong className="text-blue-650 dark:text-blue-400">Add to Home Screen</strong>.</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs flex-1 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-blue-500/10"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="py-3.5 px-5 border border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-350 font-bold rounded-2xl text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
