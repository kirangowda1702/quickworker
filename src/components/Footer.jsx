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
          <div className="md:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-2xl tracking-tight">
              <div className="bg-yellow-400 text-slate-950 p-1.5 rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
              <span>Quick<span className="text-yellow-400">Worker</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              QuickWorker is Hassan's premium home services platform. Book highly rated, verified electricians, plumbers, carpenters, cleaning pros, and beauty experts in under 60 seconds.
            </p>
            {/* Social Media Follow Buttons */}
            <div className="flex gap-3.5 pt-2">
              <a href="#" className="p-2 bg-slate-800 hover:bg-yellow-450 hover:text-slate-950 rounded-xl text-slate-300 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-yellow-450 hover:text-slate-950 rounded-xl text-slate-300 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-yellow-450 hover:text-slate-950 rounded-xl text-slate-300 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-yellow-450 hover:text-slate-950 rounded-xl text-slate-300 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
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
