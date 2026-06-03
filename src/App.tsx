import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AIChatbot from "./components/AIChatbot";

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

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
          
          {/* Main Navigation bar */}
          <Navbar />

          {/* Primary View Area */}
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:serviceId" element={<WorkersList />} />
              <Route path="/book/:workerId" element={<BookingPage />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/register-worker" element={<WorkerRegister />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/my-bookings" element={<MyBookings />} />
            </Routes>
          </main>

          {/* Persistent AI Chatbot Bubble */}
          <AIChatbot />

          {/* Footer details */}
          <Footer />

        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
