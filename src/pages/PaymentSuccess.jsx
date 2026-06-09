import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight, Download, Home, ClipboardList, ShieldCheck, MessageCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function PaymentSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useApp();

  const { booking, paymentMethod } = state || {};

  if (!booking) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Checkout Completed</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your booking details were recorded successfully. Please visit your profile dashboard to review booking details.
          </p>
          <Link
            to="/my-bookings"
            className="w-full inline-block py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-sm text-sm"
          >
            Track in My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-left">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Animated Check & Header */}
        <div className="text-center space-y-4 animate-scale-up">
          <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-950/40 rounded-full border border-emerald-200/50 dark:border-emerald-900/40">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-450 animate-bounce" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Payment Successful!</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your transaction has been processed. <strong>{booking.workerName}</strong> has accepted the schedule and is preparing for arrival.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5 animate-slide-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Booking reference</span>
              <span className="text-sm font-black text-slate-905 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                {booking.bookingId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Amount Paid</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{booking.servicePrice}</span>
            </div>
          </div>

          {/* Details layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-655 dark:text-slate-350">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider block">Professional</span>
              <div className="flex items-center gap-2">
                <img src={booking.workerAvatar} alt={booking.workerName} className="w-8 h-8 rounded-lg object-cover" />
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white leading-tight">{booking.workerName}</h4>
                  <p className="text-[10px] text-slate-500">{booking.serviceName} Pro</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider block">Payment Method</span>
              <div className="flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-205">{paymentMethod || "Razorpay Checkout"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider block">Appointment Slot</span>
              <div className="flex items-center gap-2 pt-0.5">
                <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-semibold">{booking.bookingDate}</span>
                <Clock className="w-4 h-4 text-blue-500 shrink-0 ml-1" />
                <span className="font-semibold">{booking.bookingTime}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider block">Service Address</span>
              <div className="flex items-start gap-1.5 pt-0.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-tight">{booking.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice breakdown details */}
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            <span>Invoice Details Summary</span>
          </h3>

          <div className="space-y-2 text-xs sm:text-sm text-slate-500">
            <div className="flex justify-between">
              <span>Service Base Charge</span>
              <span className="font-semibold text-slate-905 dark:text-white">₹{booking.servicePrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Safety Inspection Fee</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between">
              <span>Razorpay Transaction Fee</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-black text-slate-900 dark:text-white text-base">
              <span>Grand Total</span>
              <span>₹{booking.servicePrice}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${(booking.workerPhone || "9876543210").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `New booking received from QuickWorker.\n\nCustomer: ${booking.customerName || user?.displayName}\nPhone: ${booking.customerPhone || booking.contactPhone || ""}\nService: ${booking.serviceName}\nDate: ${booking.bookingDate}\nTime: ${booking.bookingTime}\n\nPlease open your dashboard to accept or reject this booking.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>WhatsApp Worker</span>
          </a>

          <button
            onClick={() => {
              alert("Receipt download mockup triggered. Invoice PDF copy saved successfully.");
            }}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4.5 h-4.5" />
            <span>Download Invoice PDF</span>
          </button>
          
          <Link
            to="/my-bookings"
            className="px-6 py-3.5 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-4.5 h-4.5 text-blue-500" />
            <span>Track in Dashboard</span>
          </Link>
          
          <Link
            to="/"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Home className="w-4.5 h-4.5" />
            <span>Back to Home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
