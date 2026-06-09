import React from "react";
import { ShieldCheck, CalendarRange, Coins, Headset } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

export default function WhyChoose() {
  const points = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: "Verified & Trusted",
      description: "Every service professional undergoes strict background checks, identity checks, and skills assessments before joining.",
      gradient: "from-blue-500/10 to-indigo-500/5 hover:border-blue-500/35",
      iconBg: "bg-blue-50 dark:bg-blue-950/50"
    },
    {
      icon: <CalendarRange className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />,
      title: "Quick Booking",
      description: "Book home service professionals in Hassan in just 3 clicks. Schedule immediately or choose a custom time slot.",
      gradient: "from-amber-500/10 to-yellow-500/5 hover:border-yellow-500/35",
      iconBg: "bg-amber-50 dark:bg-amber-950/50"
    },
    {
      icon: <Coins className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Affordable Pricing",
      description: "No hidden charges, surprise add-ons, or travel bills. View fixed transparent prices upfront and pay doorstep cash or online.",
      gradient: "from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/35",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50"
    },
    {
      icon: <Headset className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: "24/7 Dedicated Support",
      description: "Our customer success helpline is available round-the-clock for booking adjustments, feedback reviews, or queries.",
      gradient: "from-purple-500/10 to-pink-500/5 hover:border-purple-500/35",
      iconBg: "bg-purple-50 dark:bg-purple-950/50"
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-1.5 rounded-full">
            Our Quality Guarantee
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Hassan Chooses QuickWorker
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            We focus on convenience, transparency, and safety to deliver the best home services experience.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {points.map((point, index) => (
            <motion.div 
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              className={`flex flex-col text-left p-6 bg-gradient-to-br ${point.gradient} border border-slate-200/80 dark:border-slate-800/80 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-lg`}
            >
              {/* Icon Container */}
              <div className={`${point.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-5 border border-slate-200/40 dark:border-slate-850`}>
                {point.icon}
              </div>
              
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                {point.title}
              </h3>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {point.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
