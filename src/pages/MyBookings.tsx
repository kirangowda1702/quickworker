import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Phone, Star, AlertTriangle, ShieldAlert, ArrowLeft, ArrowRight, MessageSquareCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import ReviewModal from "../components/ReviewModal";

export default function MyBookings() {
  const { user, bookings, updateBookingStatus, showToast } = useApp() as any;
  const navigate = useNavigate();
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);

  const handleReviewSubmit = (reviewDetails: any) => {
    showToast(`Thank you for rating ${selectedBookingForReview.workerName}!`, "success");
    updateBookingStatus(selectedBookingForReview.id || selectedBookingForReview.bookingId, "Reviewed");
    setSelectedBookingForReview(null);
  };

  if (!user) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-xl animate-scale-up text-left">
          <ShieldAlert className="w-12 h-12 text-blue-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">Login Required</h2>
          <p className="text-sm text-slate-500 text-center leading-relaxed">
            Please log in to your QuickWorker account to view and manage your doorstep scheduled bookings.
          </p>
          <Link
            to="/auth?redirect=/my-bookings"
            className="w-full inline-block py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-sm text-sm text-center"
          >
            Sign In / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-55 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Scheduled Bookings</h1>
            <p className="text-xs sm:text-sm text-slate-500">Track current status, coordinate with workers or write feedback reviews.</p>
          </div>
          
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-slate-550 hover:text-slate-900 font-bold px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Bookings Lists */}
        {bookings.length > 0 ? (
          <div className="space-y-5">
            {bookings.map((b: any) => (
              <div
                key={b.bookingId}
                className="group p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl hover:border-slate-350 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col md:flex-row justify-between gap-6 text-left relative overflow-hidden"
              >
                {/* Visual side highlights */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  b.status === "Pending" ? "bg-amber-500" :
                  b.status === "Approved" ? "bg-blue-500" :
                  b.status === "Completed" || b.status === "Reviewed" ? "bg-emerald-500" :
                  "bg-slate-400"
                }`}></div>

                {/* Worker Details Column */}
                <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                  <img 
                    src={b.workerAvatar} 
                    alt={b.workerName} 
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0 mx-auto sm:mx-0" 
                  />
                  <div className="space-y-2 flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                        {b.workerName}
                      </h3>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {b.serviceName}
                      </span>
                    </div>

                    {/* Booking specifications details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Date: <strong>{b.bookingDate}</strong></span>
                      </span>
                      <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>Time: <strong>{b.bookingTime}</strong></span>
                      </span>
                      <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        <span>Contact: <strong>{b.contactPhone || b.workerPhone}</strong></span>
                      </span>
                      <span className="flex items-center gap-1.5 justify-center sm:justify-start truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate" title={b.address}>{b.address}</span>
                      </span>
                    </div>
                    
                    {b.instructions && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        Instructions: "{b.instructions}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex sm:flex-row md:flex-col items-center justify-between md:justify-center md:items-end gap-4 shrink-0 pl-0 md:pl-6 md:border-l border-slate-100 dark:border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Price Amount</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">₹{b.servicePrice}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md block mt-1 text-center ${
                      b.status === "Pending" ? "bg-amber-50 text-amber-705 bg-amber-100/70 text-amber-700" :
                      b.status === "Approved" ? "bg-blue-50 text-blue-705 bg-blue-105/70 text-blue-700" :
                      b.status === "Completed" || b.status === "Reviewed" ? "bg-emerald-50 text-emerald-750 bg-emerald-100/70 text-emerald-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2">
                    {b.status === "Pending" && (
                      <button
                        onClick={() => updateBookingStatus(b.id || b.bookingId, "Cancelled")}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200/50 transition-colors cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {/* Demo triggers */}
                    {b.status === "Pending" && (
                      <button
                        onClick={() => updateBookingStatus(b.id || b.bookingId, "Approved")}
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-105 text-blue-650 font-bold text-xs rounded-xl border border-blue-200/40 transition-colors cursor-pointer"
                      >
                        Approve (Demo)
                      </button>
                    )}

                    {b.status === "Approved" && (
                      <button
                        onClick={() => updateBookingStatus(b.id || b.bookingId, "Completed")}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-650 font-bold text-xs rounded-xl border border-emerald-200/40 transition-colors cursor-pointer"
                      >
                        Complete Service
                      </button>
                    )}

                    {b.status === "Completed" && (
                      <button
                        onClick={() => setSelectedBookingForReview(b)}
                        className="px-4 py-2 bg-yellow-450 hover:bg-yellow-500 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        Write Review
                      </button>
                    )}

                    {b.status === "Reviewed" && (
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <MessageSquareCheck className="w-4 h-4 text-emerald-550" />
                        <span>Reviewed</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl space-y-5 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No active bookings found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">You haven't scheduled any service booking appointments yet. Select from our 30 service categories to hire a professional in Hassan.</p>
            <Link
              to="/services"
              className="inline-block px-8 py-3.5 bg-blue-650 text-white font-extrabold rounded-2xl shadow-md hover:bg-blue-700 text-sm"
            >
              Browse Services List
            </Link>
          </div>
        )}

      </div>

      {/* Review Modal popup */}
      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
