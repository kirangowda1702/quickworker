import React, { useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CreditCard, QrCode, Banknote, ArrowLeft, ShieldCheck, Loader2, Sparkles, Building } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function PaymentPage() {
  const { state } = useLocation();
  const { user, addBooking, showToast } = useApp();
  const navigate = useNavigate();

  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const bookingDetails = useMemo(() => {
    return state?.bookingDetails || null;
  }, [state]);

  if (!bookingDetails) {
    return (
      <div className="flex-1 py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Checkout Session Expired</h3>
        <Link to="/services" className="text-blue-500 hover:underline">Browse service categories</Link>
      </div>
    );
  }

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment gateway API processing
    setTimeout(async () => {
      setLoading(false);
      
      // Simulate random payment failure for retry flow demonstration (10% chance)
      const isFailed = Math.random() < 0.1 && method !== "cod";
      
      if (isFailed) {
        showToast("Payment transaction failed by bank network", "error");
        navigate("/payment-failure", { state: { bookingDetails } });
        return;
      }

      const paymentStatus = method === "cod" ? "Unpaid (COD)" : "Paid Online (Razorpay)";
      const finalizedDetails = {
        ...bookingDetails,
        paymentStatus
      };

      const newBooking = await addBooking(finalizedDetails);
      if (newBooking) {
        navigate("/payment-success", { 
          state: { 
            booking: newBooking, 
            paymentMethod: method === "cod" ? "Cash on Delivery" : "Razorpay Online" 
          } 
        });
      }
    }, 2000);
  };

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation back */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Modify Booking Details</span>
          </button>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Secure Payment Gateway</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: Payment Method Forms */}
          <form onSubmit={handlePay} className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Select Payment Method
            </h3>

            {/* Selector tabs */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMethod("upi")}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  method === "upi"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">UPI Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  method === "card"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("cod")}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  method === "cod"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Cash</span>
              </button>
            </div>

            {/* Input field cards */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850/60 min-h-[150px] flex flex-col justify-center">
              {method === "upi" && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pay via Instant UPI (PhonePe / GPay / Paytm)</span>
                  <input
                    type="text"
                    required
                    placeholder="Enter UPI ID (e.g. name@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">Your Razorpay-ready endpoint will prompt your designated mobile UPI app for checkout completion.</p>
                </div>
              )}

              {method === "card" && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Credit / Debit Card</span>
                  <input
                    type="text"
                    required
                    placeholder="Card Number (16 digits)"
                    value={cardNo}
                    onChange={(e) => setCardNo(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <input
                      type="password"
                      required
                      placeholder="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {method === "cod" && (
                <div className="text-center space-y-2.5">
                  <Banknote className="w-10 h-10 text-emerald-600 dark:text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pay Cash On Service Delivery</h4>
                  <p className="text-xs text-slate-500">Secure booking now without transaction overheads. Hand over the cash directly to your professional after service is complete.</p>
                </div>
              )}
            </div>

            {/* Confirm button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Contacting Razorpay Gateway...</span>
                </>
              ) : (
                <>
                  <span>Pay & Confirm Booking ₹{bookingDetails.servicePrice}</span>
                </>
              )}
            </button>
          </form>

          {/* Right: Invoice Summary */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2.5">
              Order Details
            </h3>

            <div className="space-y-3">
              <div className="text-xs text-slate-550 dark:text-slate-400 space-y-1">
                <p>Service: <strong className="text-slate-905 dark:text-white">{bookingDetails.serviceName}</strong></p>
                <p>Professional: <strong className="text-slate-905 dark:text-white">{bookingDetails.workerName}</strong></p>
                <p>Schedule: <strong>{bookingDetails.bookingDate} • {bookingDetails.bookingTime}</strong></p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Service Base Charge</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{bookingDetails.servicePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Safety Inspection Fee</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-black text-slate-900 dark:text-white text-base">
                  <span>Total Bill Amount</span>
                  <span>₹{bookingDetails.servicePrice}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-450 rounded-2xl border border-yellow-100/50 dark:border-yellow-900/30 text-[11px] font-medium leading-relaxed">
              🔐 <strong>Secure Checkout:</strong> Transactions are protected with end-to-end encryption.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
