import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AlertOctagon, ArrowLeft, PhoneCall, MessageCircle, RefreshCw, HelpCircle } from "lucide-react";

export default function PaymentFailure() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { bookingDetails } = state || {};

  const handleRetry = () => {
    if (bookingDetails) {
      navigate("/payment", { state: { bookingDetails } });
    } else {
      navigate("/services");
    }
  };

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-left">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Animated Decline & Header */}
        <div className="text-center space-y-4 animate-scale-up">
          <div className="inline-flex p-4 bg-rose-100 dark:bg-rose-950/40 rounded-full border border-rose-200/50 dark:border-rose-900/40">
            <AlertOctagon className="w-16 h-16 text-rose-600 dark:text-rose-450 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-slate-905 dark:text-white tracking-tight">Payment Declined</h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your transaction was declined by the bank network. Don't worry, no funds were debited from your account.
          </p>
        </div>

        {/* Diagnostic Card */}
        {bookingDetails && (
          <div className="bg-white dark:bg-slate-905 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Booking Incomplete</h3>
            <div className="text-xs sm:text-sm text-slate-550 space-y-1">
              <p>Service: <strong className="text-slate-800 dark:text-slate-200">{bookingDetails.serviceName}</strong></p>
              <p>Professional: <strong>{bookingDetails.workerName}</strong></p>
              <p>Schedule Date: <strong>{bookingDetails.bookingDate}</strong></p>
              <p>Bill Amount: <strong className="text-rose-600">₹{bookingDetails.servicePrice}</strong></p>
            </div>
          </div>
        )}

        {/* Trouble checklist */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl text-xs space-y-2 border border-slate-200/40 dark:border-slate-800/80">
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Common Solutions:</span>
          <ul className="list-disc list-inside text-slate-500 space-y-1">
            <li>Ensure your UPI app has enough linked bank balance.</li>
            <li>Double-check card numbers, expiry dates, and CVV security codes.</li>
            <li>Check if your mobile network is stable to receive verification OTPs.</li>
            <li>Select <strong>Cash on Service Delivery (COD)</strong> to secure booking without upfront fees!</li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
          >
            <RefreshCw className="w-4.5 h-4.5" />
            <span>Try Payment Again</span>
          </button>

          <button
            onClick={() => navigate(bookingDetails ? `/book/${bookingDetails.workerId}` : "/services")}
            className="px-6 py-3.5 border border-slate-205 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Modify Details</span>
          </button>
        </div>

        {/* Support Help Block */}
        <div className="border-t border-slate-200 dark:border-slate-850 pt-6 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white text-center">Need instant assistance?</h4>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://wa.me/919876543210?text=Hi%20QuickWorker%20Support,%20my%20payment%20failed%20during%20booking%20checkout."
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <MessageCircle className="w-4.5 h-4.5 fill-current" />
              <span>WhatsApp Helpline</span>
            </a>
            
            <a
              href="tel:+919876543210"
              className="py-3 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <PhoneCall className="w-4.5 h-4.5" />
              <span>Call Support Callbox</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
