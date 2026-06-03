import React from "react";
import { ShieldCheck, UserCheck, Banknote, HelpCircle } from "lucide-react";

export default function WhyChoose() {
  const points = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: "100% Background Verified",
      description: "Every service professional undergoes strict background checks, identity checks, and skills assessment audits before joining."
    },
    {
      icon: <UserCheck className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />,
      title: "Hassan Local Experts",
      description: "Workers are based directly in Hassan (Kuvempu Nagar, Hemavathi Nagar, etc.), allowing rapid 45-min arrival times."
    },
    {
      icon: <Banknote className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      title: "Transparent Flat Pricing",
      description: "No hidden charges, surprise add-ons, or travel bills. View fixed prices upfront and pay securely online or via cash."
    },
    {
      icon: <HelpCircle className="w-8 h-8 text-indigo-650 dark:text-indigo-400" />,
      title: "24/7 Dedicated Support",
      description: "Our local support helpline is available round-the-clock for booking modifications, worker coordination, and queries."
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 px-3 py-1 rounded-full">
            Our Quality Guarantee
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Why Hassan Chooses QuickWorker
          </h2>
          <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base">
            We focus on convenience, transparency, and safety to deliver the best home services experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((point, index) => (
            <div 
              key={index}
              className="flex flex-col text-left p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm"
            >
              <div className="bg-white dark:bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-5 border border-slate-100 dark:border-slate-800">
                {point.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {point.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-450 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
