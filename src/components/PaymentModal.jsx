import React, { useState } from "react";
import { CreditCard, QrCode, Banknote, X, Check, Loader2 } from "lucide-react";

export default function PaymentModal({ amount, workerName, onClose, onPaymentSuccess }) {
  const [method, setMethod] = useState("upi"); // upi, card, cod
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    upiId: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: ""
  });

  const handlePay = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate gateway response
    setTimeout(() => {
      setLoading(false);
      onPaymentSuccess(method === "cod" ? "Unpaid (COD)" : "Paid Online");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-up text-left">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
          Complete Your Booking
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Booking amount for <strong>{workerName}</strong>: <span className="text-sm font-bold text-slate-900 dark:text-white">₹{amount}</span>
        </p>

        <form onSubmit={handlePay} className="space-y-6">
          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-2.5">
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
              <span className="text-[10px] uppercase tracking-wide">UPI Pay</span>
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
              <span className="text-[10px] uppercase tracking-wide">Card</span>
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
              <span className="text-[10px] uppercase tracking-wide">Cash</span>
            </button>
          </div>

          {/* Form details based on selection */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850/60 min-h-[140px] flex flex-col justify-center">
            {method === "upi" && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pay via Instant UPI</span>
                <input
                  type="text"
                  required
                  placeholder="Enter UPI ID (e.g. mobile@ybl)"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 leading-tight">You will receive a notification to complete the payment on your UPI app.</p>
              </div>
            )}

            {method === "card" && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Credit / Debit Card</span>
                <input
                  type="text"
                  required
                  placeholder="Card Number (16 digits)"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value.slice(0, 5) })}
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    required
                    placeholder="CVV"
                    value={formData.cardCvv}
                    onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-950 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {method === "cod" && (
              <div className="text-center space-y-2">
                <Banknote className="w-10 h-10 text-emerald-600 dark:text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pay Cash After Service</h4>
                <p className="text-xs text-slate-500">No payment is required right now. Hand over the cash directly to {workerName} after they finish the work.</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Simulating Gateway...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Confirm & Pay ₹{amount}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
