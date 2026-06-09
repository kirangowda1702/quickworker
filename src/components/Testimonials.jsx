import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const reviews = [
  {
    name: "Kavya M.",
    locality: "Hassan City Center",
    rating: 5,
    text: "QuickWorker saved my day! The electrician arrived within 30 minutes and fixed our short circuit issue. Very professional and tidy work.",
    image: "https://randomuser.me/api/portraits/women/12.jpg"
  },
  {
    name: "Darshan Gowda",
    locality: "Kuvempu Nagar, Hassan",
    rating: 5,
    text: "Booked a deep cleaning service for our house before housewarming. The team was thorough, polite, and left our house sparkling clean. Pricing was extremely fair.",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Rekha S.",
    locality: "Vidya Nagar, Hassan",
    rating: 5,
    text: "I have used their plumbing and AC service multiple times. It is so convenient to find background-verified workers near me in Hassan without bargaining.",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Vijay Kumar",
    locality: "Hemavathi Nagar, Hassan",
    rating: 4.8,
    text: "Outstanding service! Fixed my RO water purifier in no time. Safe doorstep transaction, and the app works beautifully offline too.",
    image: "https://randomuser.me/api/portraits/men/55.jpg"
  }
];

export default function Testimonials() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIdx((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const currentReview = reviews[currentIdx];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-1.5 rounded-full">
            Customer Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Loved by 10,000+ Hassan Families
          </h2>
          <p className="text-slate-555 dark:text-slate-400 text-sm sm:text-base">
            Read what our customers say about their experience with QuickWorker.
          </p>
        </div>

        {/* Testimonial Slider Card */}
        <div className="max-w-3xl mx-auto relative px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden text-left min-h-[260px] flex flex-col justify-between">
            
            {/* Top quote icon */}
            <Quote className="w-12 h-12 text-blue-500/10 absolute top-6 right-6 shrink-0" />
            
            <div className="relative overflow-hidden flex-1">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIdx}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 150, damping: 18 }}
                  className="space-y-6"
                >
                  {/* Review text */}
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-305 leading-relaxed font-medium italic">
                    "{currentReview.text}"
                  </p>
                  
                  {/* User Profile Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={currentReview.image}
                      alt={currentReview.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                        {currentReview.name}
                      </h4>
                      <p className="text-[11px] text-slate-405">
                        {currentReview.locality}
                      </p>
                    </div>

                    {/* Star Rating */}
                    <div className="ml-auto flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {currentReview.rating}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              {/* Pagination Dots */}
              <div className="flex gap-1.5">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentIdx ? 1 : -1);
                      setCurrentIdx(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIdx === idx ? "w-6 bg-blue-600" : "w-2 bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
