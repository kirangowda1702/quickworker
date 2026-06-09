import React, { useEffect, useState } from "react";
import { Users, UserCheck, Wrench, Star } from "lucide-react";
import { motion, useInView } from "framer-motion";

function Counter({ end, duration = 1.5, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      if (typeof end === "number") {
        setCount(progress * end);
      } else {
        // Handle floating point rating (e.g. 4.9)
        const val = parseFloat(end);
        setCount(progress * val);
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  const displayCount = typeof end === "number" 
    ? Math.floor(count).toLocaleString() 
    : count.toFixed(1);

  return (
    <span ref={ref} className="tabular-nums">
      {displayCount}
      {suffix}
    </span>
  );
}

export default function LiveStats() {
  const stats = [
    {
      icon: <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      value: 10000,
      suffix: "+",
      label: "Happy Customers",
      description: "Served across Hassan city"
    },
    {
      icon: <UserCheck className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />,
      value: 500,
      suffix: "+",
      label: "Verified Workers",
      description: "Background check cleared"
    },
    {
      icon: <Wrench className="w-6 h-6 text-emerald-600 dark:text-emerald-450" />,
      value: 30,
      suffix: "+",
      label: "Services Offered",
      description: "From repairs to personal care"
    },
    {
      icon: <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 fill-current" />,
      value: "4.9",
      suffix: " / 5",
      label: "Average Rating",
      description: "Based on 8,000+ reviews"
    }
  ];

  return (
    <section className="py-12 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
              whileHover={{ y: -4 }}
              className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-800/80 rounded-3xl flex items-center gap-4 text-left shadow-sm hover:shadow-md hover:border-blue-500/20 transition-all duration-300"
            >
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm shrink-0 border border-slate-100 dark:border-slate-800">
                {stat.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </h4>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-205 mt-0.5">
                  {stat.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
