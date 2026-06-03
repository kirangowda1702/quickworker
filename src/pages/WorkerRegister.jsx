import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hammer, Sparkles, CheckCircle2, UserCheck, MapPin, BadgePercent, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function WorkerRegister() {
  const { services, registerWorker, showToast } = useApp();
  const navigate = useNavigate();

  // Onboarding form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("electrician");
  const [experience, setExperience] = useState(5);
  const [locality, setLocality] = useState("Kuvempu Nagar");
  const [price, setPrice] = useState(199);
  const [about, setAbout] = useState("");
  const [gender, setGender] = useState("Male");
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !about.trim()) {
      showToast("Please fill all fields", "warning");
      return;
    }

    const selectedService = services.find((s) => s.id === serviceId);
    
    // Choose coordinates matching the locality
    const localitiesCoords = {
      "Kuvempu Nagar": { lat: 13.0135, lng: 76.0945 },
      "Hemavathi Nagar": { lat: 13.0078, lng: 76.1023 },
      "Vidya Nagar": { lat: 13.0195, lng: 76.1067 },
      "BM Road": { lat: 13.0055, lng: 76.0921 },
      "Channapatna": { lat: 12.9982, lng: 76.0898 },
      "Salagame Road": { lat: 13.0232, lng: 76.0911 },
      "Dairy Circle": { lat: 13.0012, lng: 76.1154 },
      "Vijaya Nagar": { lat: 13.0161, lng: 76.1210 },
      "Hassan City Center": { lat: 13.0065, lng: 76.1002 },
      "Arasikere Road": { lat: 13.0312, lng: 76.1018 }
    };

    const coord = localitiesCoords[locality] || localitiesCoords["Hassan City Center"];

    // Automatically assign a matching avatar based on gender and a random offset
    const genderPath = gender === "Female" ? "women" : "men";
    const avatarNum = Math.floor(Math.random() * 85) + 1;
    const avatar = `https://randomuser.me/api/portraits/${genderPath}/${avatarNum}.jpg`;

    const workerData = {
      name,
      email,
      phone: `+91 ${phone}`,
      serviceId,
      serviceName: selectedService ? selectedService.name : "Custom",
      experience: parseInt(experience),
      locality,
      coordinates: coord,
      price: parseInt(price),
      about,
      gender,
      avatar
    };

    const result = await registerWorker(workerData);
    if (result) {
      setRegistered(true);
    }
  };

  if (registered) {
    return (
      <div className="flex-1 py-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl animate-scale-up">
          <div className="inline-flex p-4.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-full border border-emerald-200/50 dark:border-emerald-800">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-450 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Registration Approved!</h2>
          <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
            Welcome to the QuickWorker family. Your worker profile is now live and listed in our Hassan directory! Customers can view your details and schedule appointments.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate(`/services/${serviceId}`)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md transition-all text-sm cursor-pointer"
            >
              View Services Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 sm:py-16 bg-slate-55 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation link */}
        <div className="flex items-center gap-2 text-left">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Form layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Left panel instructions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-5">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Join QuickWorker</span>
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Unlock booking opportunities across Hassan. Get matching notifications, build customer reviews, and receive direct payments.
              </p>

              <div className="space-y-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex gap-3 text-xs">
                  <UserCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Build Reviews</h4>
                    <p className="text-slate-500 mt-0.5">Collect stars to display at the top of customer search pages.</p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs">
                  <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Local Bookings</h4>
                    <p className="text-slate-500 mt-0.5">Get assigned only to jobs within your preferred Hassan locality.</p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs">
                  <BadgePercent className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Keep 100% Earnings</h4>
                    <p className="text-slate-500 mt-0.5">We don't take any commissions from your doorstep transactions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right actual inputs form */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
              Professional Partner Registration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Gowda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Gender <span className="text-rose-500">*</span></label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white border border-slate-202 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Email Address <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">10-Digit Mobile Phone <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Service Category <span className="text-rose-500">*</span></label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-955 dark:text-white border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Hassan Locality <span className="text-rose-500">*</span></label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-955 dark:text-white border border-slate-200 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Kuvempu Nagar">Kuvempu Nagar</option>
                  <option value="Hemavathi Nagar">Hemavathi Nagar</option>
                  <option value="Vidya Nagar">Vidya Nagar</option>
                  <option value="BM Road">BM Road</option>
                  <option value="Channapatna">Channapatna</option>
                  <option value="Salagame Road">Salagame Road</option>
                  <option value="Dairy Circle">Dairy Circle</option>
                  <option value="Vijaya Nagar">Vijaya Nagar</option>
                  <option value="Hassan City Center">Hassan City Center</option>
                  <option value="Arasikere Road">Arasikere Road</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Starting Price (₹) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  required
                  min={100}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-950 dark:text-white border border-slate-202 dark:border-slate-850 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Years of Experience <span className="text-rose-500">*</span></label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full h-2 bg-slate-105 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs text-slate-500 font-bold block mt-1">{experience} Years Experience</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">About Your Work / Biography <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe your credentials, license training, tools you use, and availability..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-905 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Submit Registration Profile</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
