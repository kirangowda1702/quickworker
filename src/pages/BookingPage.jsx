import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, Clock, MapPin, User, Phone, ListCollapse, ArrowLeft, Star, Briefcase } from "lucide-react";
import { useApp } from "../context/AppContext";
import PaymentModal from "../components/PaymentModal";
import AddressAutocomplete from "../components/AddressAutocomplete";

export default function BookingPage() {
  const { workerId } = useParams();
  const { user, workers, addBooking, showToast } = useApp();
  const navigate = useNavigate();

  // Find worker details
  const worker = useMemo(() => {
    return workers.find((w) => w.id === workerId);
  }, [workers, workerId]);

  // Form states
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 12:00 PM");
  const [instructions, setInstructions] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  // Time slot configurations
  const slots = [
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:05 PM",
    "06:00 PM - 08:00 PM"
  ];

  const handleOpenPayment = (e) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login first to confirm bookings", "warning");
      navigate(`/auth?redirect=/book/${workerId}`);
      return;
    }
    if (!address.trim() || !phone.trim() || !date) {
      showToast("Please fill in all required fields", "warning");
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentStatus) => {
    setShowPayment(false);
    
    const bookingDetails = {
      workerId: worker.id,
      workerName: worker.name,
      workerAvatar: worker.avatar,
      workerPhone: worker.phone,
      serviceName: worker.serviceName,
      servicePrice: worker.price,
      bookingDate: date,
      bookingTime: timeSlot,
      address,
      landmark,
      contactPhone: phone,
      instructions,
      paymentStatus,
      coordinates: coordinates || worker.coordinates
    };

    const newBooking = await addBooking(bookingDetails);
    if (newBooking) {
      navigate(`/booking-success?id=${newBooking.bookingId}`);
    }
  };

  // Min date set to today to avoid historic bookings
  const today = useMemo(() => {
    const d = new Date();
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }, []);

  if (!worker) {
    return (
      <div className="flex-1 py-16 text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Worker profile not found</h3>
        <Link to="/services" className="text-blue-500 hover:underline">Browse service categories</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header link */}
        <div className="flex items-center gap-2 text-left">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Worker brief layout */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-5 text-left">
          <img src={worker.avatar} alt={worker.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-800" />
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {worker.serviceName} Pro
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">{worker.name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-550 dark:text-slate-400">
              <span className="flex items-center gap-1 font-bold text-slate-950 dark:text-white">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                <span>{worker.rating}</span>
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{worker.experience} yrs exp</span>
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                <MapPin className="w-3.5 h-3.5" />
                <span>{worker.locality}</span>
              </span>
            </div>
          </div>
          <div className="sm:border-l border-slate-100 dark:border-slate-800 sm:pl-6 text-center sm:text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Service Cost</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{worker.price}</span>
          </div>
        </div>

        {/* Check Logged-in state */}
        {!user ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign in required to schedule bookings</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">Please log in to your QuickWorker account first to enter your location details and secure booking scheduling.</p>
            <Link
              to={`/auth?redirect=/book/${workerId}`}
              className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-md hover:bg-blue-750 text-sm"
            >
              Log In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleOpenPayment} className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            {/* Form details */}
            <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Booking Information
              </h3>

              {/* Service location inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wide flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>Customer Name</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user.displayName}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/65 text-slate-500 border border-slate-200 dark:border-slate-850 text-sm font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wide flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span>Mobile Number <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>Street Address <span className="text-rose-500">*</span></span>
                  </label>
                  <AddressAutocomplete 
                    value={address}
                    onChange={setAddress}
                    onSelect={(loc) => {
                      setAddress(loc.address);
                      setCoordinates({ lat: loc.lat, lng: loc.lng });
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wide">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Hassan Main Library"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date and time slots selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Choose Date & Time</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wide">Schedule Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wide flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Select Time Slot <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {slots.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setTimeSlot(s)}
                        className={`p-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                          timeSlot === s
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold"
                            : "border-slate-205 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                      >
                        <span>{s}</span>
                        {timeSlot === s && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Special instruction text area */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-455 uppercase tracking-wide flex items-center gap-1">
                  <ListCollapse className="w-3.5 h-3.5 text-blue-500" />
                  <span>Special Work Instructions (Optional)</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Please bring an extra wiring pipe, or ring door bell twice..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>
            </div>

            {/* Right Summary column */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2.5">
                  Invoice Summary
                </h3>

                <div className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Base Service Price</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{worker.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Safety Inspection Fee</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Convenience Fee</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between font-black text-slate-900 dark:text-white text-base">
                    <span>Grand Total</span>
                    <span>₹{worker.price}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 p-3 rounded-2xl border border-yellow-100/50 dark:border-yellow-900/30 text-[11px] font-medium leading-relaxed">
                  📢 <strong>Free Cancelation:</strong> Reschedule or cancel directly from your profile dashboard for free at any time.
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </form>
        )}

      </div>

      {/* Payment Gateway Modal */}
      {showPayment && (
        <PaymentModal
          amount={worker.price}
          workerName={worker.name}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
