import React, { useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, MapPin, Phone, MessageCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const { bookings } = useApp();
  const navigate = useNavigate();

  const bookingId = searchParams.get("id");

  // Find this booking in state
  const booking = useMemo(() => {
    return bookings.find((b) => b.bookingId === bookingId);
  }, [bookings, bookingId]);

  if (!booking) {
    return (
      <div className="flex-1 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Booking Details Not Found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">We couldn't retrieve transaction records for id "{bookingId}".</p>
        <Link to="/" className="text-blue-500 hover:underline">Return to Home</Link>
      </div>
    );
  }

  const getWhatsAppLink = () => {
    const text = `Hi ${booking.workerName}, my booking is confirmed! ID: ${booking.bookingId} for ${booking.serviceName} on ${booking.bookingDate} at ${booking.bookingTime}. Please confirm your arrival.`;
    return `https://wa.me/${booking.workerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-55 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-8 text-center animate-scale-up">
        
        {/* Lottie-style success icon */}
        <div className="space-y-4">
          <div className="inline-flex p-4.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-full border border-emerald-200/50 dark:border-emerald-800">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400 animate-bounce" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Booking Confirmed!</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your appointment is scheduled. {booking.workerName} has been notified and will arrive at your address within the selected slot.
          </p>
        </div>

        {/* Booking Card summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 text-left shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Booking ID</span>
            <span className="text-sm font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
              {booking.bookingId}
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-3.5 text-sm text-slate-650 dark:text-slate-350">
            <div className="flex items-start gap-3">
              <img src={booking.workerAvatar} alt={booking.workerName} className="w-10 h-10 rounded-xl object-cover shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{booking.workerName}</h4>
                <p className="text-xs text-slate-500">{booking.serviceName} Professional</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-1.5 border-t border-slate-50 dark:border-slate-850">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{booking.bookingDate}</span>
            </div>

            <div className="flex items-center gap-3.5">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{booking.bookingTime}</span>
            </div>

            <div className="flex items-start gap-3.5">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{booking.address}</span>
            </div>
            
            <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm">
              <span>Paid Status</span>
              <span className="text-emerald-600 dark:text-emerald-450 uppercase text-xs font-black tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md">
                {booking.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Communication CTAs */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/35 rounded-3xl p-5 text-left space-y-4">
          <h3 className="font-bold text-sm text-blue-900 dark:text-blue-450">Contact your worker instantly:</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Pro</span>
            </a>
            
            <a
              href={`tel:${booking.workerPhone}`}
              className="py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Worker</span>
            </a>
          </div>
        </div>

        {/* Back home */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/my-bookings"
            className="px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-750 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl border border-slate-205 dark:border-slate-800"
          >
            Track in My Bookings
          </Link>
          <Link
            to="/"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Back to Home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
