import React from "react";
import { useNavigate } from "react-router-dom";
import { Handshake, ShieldAlert, Award, Compass } from "lucide-react";
import Hero from "../components/Hero";
import ServicesGrid from "../components/ServicesGrid";
import FeaturedWorkers from "../components/FeaturedWorkers";
import WhyChoose from "../components/WhyChoose";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section with Search bar */}
      <Hero />

      {/* Services Grid Section (Show top 6 services) */}
      <ServicesGrid limit={6} />

      {/* Handpicked Top Rated Workers */}
      <FeaturedWorkers />

      {/* Why Choose Us */}
      <WhyChoose />

      {/* Join as partner CTA section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-750 dark:to-indigo-900 text-white relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 text-left space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full">
                Partner with us
              </span>
              <h2 className="text-3xl sm:text-4xl font-black">
                Are You a Home Service Professional in Hassan?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                Grow your business, find customers near your locality, and manage your bookings easily. Join 100+ electricians, plumbers, and beauticians earning more with QuickWorker.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <button
                onClick={() => navigate("/register-worker")}
                className="px-8 py-4.5 bg-yellow-450 hover:bg-yellow-500 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer text-sm"
              >
                <Handshake className="w-5 h-5" />
                <span>Register as Partner</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
