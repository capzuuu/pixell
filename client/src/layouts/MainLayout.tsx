import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MobileNavbar } from '../components/MobileNavbar';
import { X, Heart, Facebook, Github, Mail } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [donateModalOpen, setDonateModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white selection:bg-[#E50914] selection:text-white">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-12">
        <Outlet />
      </main>

      <MobileNavbar />

      {/* Netflix Authentic Footer */}
      <footer className="bg-[#141414] text-[#808080] text-[13px] py-16 px-4 md:px-12 lg:px-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/pixelLogo.png" alt="Pixell" className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
            </div>

            {/* Social & Contact Icons */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.facebook.com/m.mjoemar.capitle.6"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-white/5 hover:bg-[#1877F2]/20 text-zinc-400 hover:text-[#1877F2] transition-all hover:scale-105"
                title="Facebook: Joemar Capitle"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/capzuuu"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/20 text-zinc-400 hover:text-white transition-all hover:scale-105"
                title="GitHub: capzuuu"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:joemarlabendia4@gmail.com"
                className="p-1.5 rounded-full bg-white/5 hover:bg-[#EA4335]/20 text-zinc-400 hover:text-[#EA4335] transition-all hover:scale-105"
                title="Gmail: joemarlabendia4@gmail.com"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* GCash Donation Trigger */}
          <button
            onClick={() => setDonateModalOpen(true)}
            className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group text-left"
          >
            <span className="text-[#808080] group-hover:text-white group-hover:underline">
              Do you like the app? Donate
            </span>
            <img
              src="/gcash-logo.svg"
              alt="GCash"
              className="h-4 w-auto object-contain transition-transform group-hover:scale-110"
            />
          </button>

          {/* 4-column grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3.5 gap-x-8 text-[13px]">
            <div className="flex flex-col gap-3">
              <Link to="/movies" className="hover:underline">Movies</Link>
              <Link to="/series" className="hover:underline">TV Series</Link>
              <Link to="/my-list" className="hover:underline">My List</Link>
              <Link to="/history" className="hover:underline">Watch History</Link>
            </div>
            <div className="flex flex-col gap-3">
              <a href="#" className="hover:underline">Audio Description</a>
              <a href="#" className="hover:underline">Help Center</a>
              <a href="#" className="hover:underline">Gift Cards</a>
              <a href="#" className="hover:underline">Media Center</a>
            </div>
            <div className="flex flex-col gap-3">
              <a href="#" className="hover:underline">Investor Relations</a>
              <a href="#" className="hover:underline">Jobs</a>
              <a href="#" className="hover:underline">Terms of Use</a>
              <a href="#" className="hover:underline">Privacy</a>
            </div>
            <div className="flex flex-col gap-3">
              <a href="#" className="hover:underline">Cookie Preferences</a>
              <a href="#" className="hover:underline">Corporate Information</a>
              <a href="#" className="hover:underline">Contact Us</a>
              <a href="#" className="hover:underline">Speed Test</a>
            </div>
          </div>

          {/* Service Code Button */}
          <div>
            <button className="border border-[#808080] px-3 py-1.5 text-xs text-[#808080] hover:text-white hover:border-white transition-colors">
              Service Code
            </button>
          </div>

          <p className="text-[11px] text-[#606060]">
            &copy;{new Date().getFullYear()} Pixell, Inc. Inspired by cinematic streaming aesthetics.
          </p>
        </div>
      </footer>

      {/* GCash Donation QR Code Modal */}
      {donateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => setDonateModalOpen(false)} />
          
          <div
            className="relative w-full max-w-sm bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 z-10 text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setDonateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <img src="/gcash-logo.svg" alt="GCash" className="h-6 w-auto object-contain" />
                <span className="font-extrabold text-lg text-white tracking-wide">Support Pixell</span>
              </div>
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                Enjoying free & ad-free streaming? Scan below with GCash or any InstaPay app to support server & domain maintenance!
              </p>
            </div>

            {/* QR Code Container */}
            <div className="relative mx-auto w-64 h-64 bg-white rounded-xl p-3 shadow-lg flex items-center justify-center border-2 border-[#007CFF]/30">
              <img
                src="/donation.jpg"
                alt="GCash Donation QR Code"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#007CFF] font-semibold">
              <Heart className="w-3.5 h-3.5 fill-[#007CFF]" />
              <span>Thank you for supporting Pixell!</span>
            </div>

            {/* Social Links in Modal */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-3">
              <a
                href="https://www.facebook.com/m.mjoemar.capitle.6"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-white/5 hover:bg-[#1877F2]/20 text-zinc-400 hover:text-[#1877F2] transition-colors"
                title="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/capzuuu"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors"
                title="GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:joemarlabendia4@gmail.com"
                className="p-1.5 rounded-full bg-white/5 hover:bg-[#EA4335]/20 text-zinc-400 hover:text-[#EA4335] transition-colors"
                title="Gmail"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
