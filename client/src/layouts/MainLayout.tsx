import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MobileNavbar } from '../components/MobileNavbar';

export const MainLayout: React.FC = () => {
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
          <div className="flex items-center gap-3">
            <img src="/pixelLogo.png" alt="Pixell" className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
          </div>
          <p className="hover:underline cursor-pointer">
            Questions? Call 1-800-012-3456
          </p>

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
            &copy; 1997-{new Date().getFullYear()} Pixell, Inc. Inspired by cinematic streaming aesthetics.
          </p>
        </div>
      </footer>
    </div>
  );
};
