import React from "react";
import { Link } from "react-router-dom";
import { Wrench, Phone, Mail, MapPin, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 transition-colors duration-300">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-2xl tracking-tight">
              <div className="bg-yellow-400 text-slate-950 p-1.5 rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
              <span>Quick<span className="text-yellow-400">Worker</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              QuickWorker is Hassan's premium home services platform. Book highly rated, verified electricians, plumbers, carpenters, cleaning pros, and beauty experts in under 60 seconds.
            </p>
          </div>

          {/* Quick Categories */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Popular Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services/electrician" className="hover:text-yellow-400 transition-colors">Electrician Repairs</Link></li>
              <li><Link to="/services/plumber" className="hover:text-yellow-400 transition-colors">Plumbing Service</Link></li>
              <li><Link to="/services/house-cleaning" className="hover:text-yellow-400 transition-colors">Full Home Deep Cleaning</Link></li>
              <li><Link to="/services/ac-repair" className="hover:text-yellow-400 transition-colors">AC Repair & Gas Fill</Link></li>
              <li><Link to="/services/beautician-women" className="hover:text-yellow-400 transition-colors">Women's Beauty & Salon</Link></li>
            </ul>
          </div>

          {/* Platform Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Join Us</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register-worker" className="hover:text-yellow-400 transition-colors">Register as Worker</Link></li>
              <li><Link to="/auth" className="hover:text-yellow-400 transition-colors">User Login</Link></li>
              <li><Link to="/admin" className="hover:text-yellow-400 transition-colors">Admin Panel</Link></li>
              <li><Link to="/services" className="hover:text-yellow-400 transition-colors">Browse Catalog</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>Kuvempu Nagar Main Road,<br />Hassan, Karnataka - 573201</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-yellow-400 transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-yellow-400 shrink-0" />
                <a href="mailto:support@quickworker.com" className="hover:text-yellow-400 transition-colors">support@quickworker.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {currentYear} QuickWorker Home Services Private Limited. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> in Hassan, Karnataka.
          </p>
        </div>
      </div>
    </footer>
  );
}
