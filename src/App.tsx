import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AIChatbot from "./components/AIChatbot";
import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import PwaInstallPrompt from "./components/PwaInstallPrompt";

// Pages
import Home from "./pages/Home";
import ServicesPage from "./pages/ServicesPage";
import WorkersList from "./pages/WorkersList";
import BookingPage from "./pages/BookingPage";
import BookingSuccess from "./pages/BookingSuccess";
import Auth from "./pages/Auth";
import WorkerRegister from "./pages/WorkerRegister";
import AdminDashboard from "./pages/AdminDashboard";
import MyBookings from "./pages/MyBookings";
import WorkerDashboard from "./pages/WorkerDashboard";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";

const AppContent: React.FC = () => {
  const { isOnline } = useApp() as any;

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 pb-16 md:pb-0 relative">
        
        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-center text-xs font-black tracking-wide flex items-center justify-center gap-1.5 z-55 sticky top-0 border-b border-amber-600/30 shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-900 animate-ping inline-block shrink-0"></span>
            <span>Offline Mode: You are viewing cached QuickWorker data. New bookings will sync when connection returns.</span>
          </div>
        )}
        
        {/* Main Navigation bar */}
        <Navbar />

        {/* Primary View Area */}
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceId" element={<WorkersList />} />
            <Route path="/book/:workerId" element={<BookingPage />} />
            <Route path="/booking-success" element={
              <ProtectedRoute>
                <BookingSuccess />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register-worker" element={<WorkerRegister />} />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/worker-dashboard" element={
              <ProtectedRoute allowedRoles={["worker"]}>
                <WorkerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/payment-success" element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path="/payment-failure" element={
              <ProtectedRoute>
                <PaymentFailure />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {/* Persistent AI Chatbot Bubble */}
        <AIChatbot />

        {/* Global PWA Install Prompt */}
        <PwaInstallPrompt />

        {/* Mobile bottom navigation bar */}
        <BottomNav />

        {/* Footer details */}
        <Footer />

      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
