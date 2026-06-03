import React, { useState } from "react";
import { Star, X } from "lucide-react";

export default function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit({
      bookingId: booking.bookingId,
      workerId: booking.workerId,
      rating,
      comment
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-up text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          Rate {booking.workerName}
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Your feedback helps us maintain high quality service standards in Hassan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selection */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 focus:outline-none transition-transform active:scale-95"
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "text-yellow-500 fill-current"
                      : "text-slate-355 dark:text-slate-700"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Review Comment</label>
            <textarea
              required
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the service. Was the worker polite? Did they clean up afterward?"
              className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-55 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            ></textarea>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
