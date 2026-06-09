import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hammer, Sparkles, CheckCircle2, UserCheck, MapPin, BadgePercent, ArrowLeft, Upload, FileText, Image as ImageIcon, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../firebase/config";

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

  // File Upload State
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [idProof, setIdProof] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({}); // { profile: 0, id: 0, gallery_0: 0, ... }
  const [isUploading, setIsUploading] = useState(false);

  // Helper to handle profile pic change
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  // Helper to handle ID proof change
  const handleIdProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdProof(file);
      setIdProofPreview(URL.createObjectURL(file));
    }
  };

  // Helper to handle gallery selection
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // File Upload Logic (handles both production Firebase Storage and Mock simulated environments)
  const uploadFile = (file, folder, onProgress) => {
    return new Promise((resolve) => {
      const apiKey = auth.config?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || "";
      const isMockConfig = !apiKey || apiKey.includes("MOCK") || apiKey === "your_api_key_here";

      if (isMockConfig) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          onProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve(URL.createObjectURL(file));
          }
        }, 100);
        return;
      }

      console.log(`[WorkerRegister] Real uploading file: ${file.name} to ${folder}`);
      let completed = false;
      
      const timeoutId = setTimeout(() => {
        if (!completed) {
          completed = true;
          console.warn("Storage upload timed out (8000ms), falling back to local object URL");
          onProgress(100);
          resolve(URL.createObjectURL(file));
        }
      }, 8000);

      onProgress(20);
      const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      
      uploadBytes(fileRef, file)
        .then(async (snapshot) => {
          if (completed) return;
          onProgress(70);
          try {
            const downloadURL = await getDownloadURL(snapshot.ref);
            if (completed) return;
            completed = true;
            clearTimeout(timeoutId);
            onProgress(100);
            resolve(downloadURL);
          } catch (urlErr) {
            console.error("Failed to get download URL, fallback to local URL:", urlErr);
            if (completed) return;
            completed = true;
            clearTimeout(timeoutId);
            onProgress(100);
            resolve(URL.createObjectURL(file));
          }
        })
        .catch((err) => {
          console.error("Storage upload failed, fallback to local URL:", err);
          if (completed) return;
          completed = true;
          clearTimeout(timeoutId);
          onProgress(100);
          resolve(URL.createObjectURL(file));
        });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !about.trim()) {
      showToast("Please fill all fields", "warning");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (profilePic && profilePic.size > maxFileSize) {
      showToast("Profile picture must be less than 5MB", "warning");
      return;
    }
    if (idProof && idProof.size > maxFileSize) {
      showToast("ID proof must be less than 5MB", "warning");
      return;
    }
    if (galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        if (file.size > maxFileSize) {
          showToast(`Gallery image "${file.name}" must be less than 5MB`, "warning");
          return;
        }
      }
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

    // Default random portrait fallback
    const genderPath = gender === "Female" ? "women" : "men";
    const avatarNum = Math.floor(Math.random() * 85) + 1;
    const defaultAvatar = `https://randomuser.me/api/portraits/${genderPath}/${avatarNum}.jpg`;

    setIsUploading(true);
    let avatarUrl = "";
    let idProofUrl = "";
    let galleryUrls = [];

    try {
      if (profilePic) {
        avatarUrl = await uploadFile(profilePic, "profiles", (p) => {
          setUploadProgress((prev) => ({ ...prev, profile: p }));
        });
      } else {
        avatarUrl = defaultAvatar;
      }

      if (idProof) {
        idProofUrl = await uploadFile(idProof, "id_proofs", (p) => {
          setUploadProgress((prev) => ({ ...prev, idProof: p }));
        });
      }

      if (galleryFiles.length > 0) {
        const promises = Array.from(galleryFiles).map((file, idx) => {
          return uploadFile(file, "gallery", (p) => {
            setUploadProgress((prev) => ({ ...prev, [`gallery_${idx}`]: p }));
          });
        });
        galleryUrls = await Promise.all(promises);
      }
    } catch (err) {
      console.error("Error uploading registration files:", err);
      showToast("File upload failed. Defaulting to local preview images.", "warning");
      avatarUrl = profilePicPreview || defaultAvatar;
      idProofUrl = idProofPreview;
      galleryUrls = galleryPreviews;
    } finally {
      setIsUploading(false);
    }

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
      avatar: avatarUrl,
      idProof: idProofUrl,
      gallery: galleryUrls,
      approved: false
    };

    const result = await registerWorker(workerData);
    if (result) {
      setRegistered(true);
    }
  };

  if (registered) {
    return (
      <div className="flex-1 py-16 bg-slate-55 dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl animate-scale-up">
          <div className="inline-flex p-4.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-full border border-emerald-200/50 dark:border-emerald-800">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-450 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Registration Submitted!</h2>
          <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
            Welcome to the QuickWorker family. Your partner profile has been registered and is pending administrator verification. We will verify your credentials and approve your listing shortly.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md transition-all text-sm cursor-pointer"
            >
              Back to Home
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

            {/* File Uploads Section (Pivotal Phase 3 & Storage Requirements) */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Required Verification Files & Gallery
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                    Profile Picture <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {profilePicPreview ? (
                      <div className="relative w-16 h-16 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
                        <img src={profilePicPreview} alt="Profile preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setProfilePic(null); setProfilePicPreview(""); }}
                          className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl hover:bg-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-950 shrink-0">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          required
                          className="hidden"
                          onChange={handleProfilePicChange}
                        />
                      </label>
                      <p className="text-[10px] text-slate-450 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                  {isUploading && uploadProgress.profile !== undefined && (
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress.profile}%` }} />
                    </div>
                  )}
                </div>

                {/* ID Proof Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                    Govt-Issued ID Proof <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {idProofPreview ? (
                      <div className="relative w-16 h-16 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <button
                          type="button"
                          onClick={() => { setIdProof(null); setIdProofPreview(""); }}
                          className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl hover:bg-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-950 shrink-0">
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-255 text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload ID (PDF/Image)</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          required
                          className="hidden"
                          onChange={handleIdProofChange}
                        />
                      </label>
                      <p className="text-[10px] text-slate-450 mt-1">Aadhaar Card, DL, or PAN</p>
                    </div>
                  </div>
                  {isUploading && uploadProgress.idProof !== undefined && (
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress.idProof}%` }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Work Gallery Uploads */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                  Work Gallery Images (Showcase your previous jobs)
                </label>
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-all shrink-0">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-[9px] text-slate-550 font-bold block mt-1">Add Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryChange}
                    />
                  </label>

                  {/* Previews List */}
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative w-16 h-16 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden group/item shrink-0">
                      <img src={preview} alt={`Gallery preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl hover:bg-rose-700 opacity-90"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {isUploading && uploadProgress[`gallery_${index}`] !== undefined && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-bold">
                          {uploadProgress[`gallery_${index}`]}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isUploading ? "Uploading Verification Files..." : "Submit Registration Profile"}</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
