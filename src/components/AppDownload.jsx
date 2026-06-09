import React from "react";
import { Smartphone, Download, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AppDownload() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner with Gradient blue background */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-650 to-indigo-800 dark:from-blue-750 dark:via-indigo-900 dark:to-slate-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl text-left">
          
          {/* Decorative shapes */}
          <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            
            {/* Left Column: Promotion Text */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold">
                <Smartphone className="w-4 h-4" />
                <span>Mobile App Available</span>
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                QuickWorker App at Your Fingertips
              </h2>
              
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl">
                Get background-verified professionals in Hassan at your doorstep. Fast bookings, real-time tracking, messaging pros, and secure doorstep transactions on the go.
              </p>

              {/* Bullet Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-50">
                  <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Real-time GPS Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-50">
                  <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Instant Booking Alerts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-50">
                  <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Doorstep Cash & Online Pay</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-50">
                  <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Direct Chat & Call with Pros</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                
                {/* Google Play */}
                <a 
                  href="#" 
                  className="bg-slate-900 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all border border-slate-800 shadow shadow-slate-950/20"
                >
                  {/* Google Play Icon SVG */}
                  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M5,2.44a1.86,1.86,0,0,0-.42,1.29V20.27A1.86,1.86,0,0,0,5,21.56l7.85-7.85L5,2.44M13.56,13l3.2,3.2L5.42,21.05A1.33,1.33,0,0,0,6.2,21.3a1.5,1.5,0,0,0,.76-.2l10.87-6.28L13.56,13M21,11a1.27,1.27,0,0,0-.73-.25,1.44,1.44,0,0,0-.79.23L14.77,13l4.71,4.71L21,13.84A1.66,1.66,0,0,0,21,11M13.56,11l4.28-4.28L6.96,2.9a1.53,1.53,0,0,0-.76-.2,1.33,1.33,0,0,0-.78.25L13.56,11Z" />
                  </svg>
                  <div className="text-left leading-none">
                    <p className="text-[9px] text-slate-400 uppercase font-black">Get it on</p>
                    <p className="text-xs font-bold mt-0.5">Google Play</p>
                  </div>
                </a>

                {/* App Store */}
                <a 
                  href="#" 
                  className="bg-slate-900 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all border border-slate-800 shadow shadow-slate-950/20"
                >
                  {/* App Store Apple Icon SVG */}
                  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,22c-1.31,0-1.72-.8-3.22-.8s-2,.78-3.25.82c-1.35.05-2.33-1.32-3.17-2.53C4.25,17,2.94,12.45,4.7,9.39c.87-1.52,2.43-2.48,4.12-2.51c1.28,0,2.5,1,3.29,1c.78,0,2.26-1.2,3.81-1c.65.03,2.47.26,3.64,2C18.64,9.52,18,11.83,18.06,13.88c.07,2.44,2.1,3.27,2.13,3.3C20.17,17.2,19.54,18.3,18.71,19.5M15.97,4.17c.66-.81,1.11-1.93.99-3.06c-1,.04-2.18.67-2.9,1.51c-.64.73-1.2,1.87-1.05,3C14.12,6.67,15.29,5,15.97,4.17Z" />
                  </svg>
                  <div className="text-left leading-none">
                    <p className="text-[9px] text-slate-400 uppercase font-black">Download on the</p>
                    <p className="text-xs font-bold mt-0.5">App Store</p>
                  </div>
                </a>

              </div>
            </div>

            {/* Right Column: Graphic Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="relative"
              >
                {/* Premium Mobile Phone Mockup Container */}
                <div className="w-[240px] h-[480px] bg-slate-900 border-[8px] border-slate-950 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col items-center">
                  {/* Phone Speaker Notch */}
                  <div className="absolute top-2 w-20 h-4 bg-slate-950 rounded-full z-20" />
                  
                  {/* Mock App Interface Screen */}
                  <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950 p-4 pt-8 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-yellow-450 text-slate-950 p-1.5 rounded-lg">
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">QuickWorker</span>
                      </div>
                      <span className="text-[8px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">Hassan</span>
                    </div>

                    {/* Booking in Mock App Screen */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-3.5 rounded-2xl text-left space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                          <img src="https://randomuser.me/api/portraits/men/4.jpg" alt="pro" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black leading-tight text-slate-900 dark:text-white">Ramesh Gowda</p>
                          <p className="text-[8px] text-blue-500 font-bold">Electrician Pro</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-850 pt-2 space-y-1.5 text-[8px] text-slate-500">
                        <p className="font-bold text-slate-800 dark:text-white">Booking ID: QW-78325</p>
                        <p>Status: <span className="text-emerald-500 font-bold">On the way (5 mins)</span></p>
                      </div>
                    </div>

                    {/* App footer navigation mockup */}
                    <div className="flex justify-around items-center border-t border-slate-100 dark:border-slate-850 pt-2 text-[8px] text-slate-400">
                      <div className="flex flex-col items-center text-blue-500"><Smartphone className="w-3.5 h-3.5" /><span>Home</span></div>
                      <div className="flex flex-col items-center"><Download className="w-3.5 h-3.5" /><span>Bookings</span></div>
                    </div>

                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute top-24 -left-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white p-3 rounded-2xl shadow-lg flex items-center gap-2 max-w-[150px] text-left">
                  <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 leading-none">Rating</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">4.9 Stars ★</p>
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
