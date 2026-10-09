import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, X, ChevronDown, Cast, Flame } from 'lucide-react';
import { tmdbService } from '../services/tmdbService';
import { SearchPreviewDropdown } from './SearchPreviewDropdown';
import { Genre } from '../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [categoriesOpen, setCategoriesOpen] = useState<boolean>(false);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch genres for mobile categories drawer
  useEffect(() => {
    tmdbService.getMovieGenres().then((res) => {
      if (res.success && res.data) setGenres(res.data);
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'TV Shows', path: '/series' },
    { name: 'Movies', path: '/movies' },
    { name: 'New & Popular', path: '/movies?sort=popularity.desc' },
    { name: 'My List', path: '/my-list' },
    { name: 'Browse by Languages', path: '/movies' },
  ];

  const handleSelectCategory = (genreId: string | number) => {
    setCategoriesOpen(false);
    navigate(`/movies?genre=${genreId}`);
  };

  const isHome = location.pathname === '/';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
          ? 'bg-[#141414] shadow-2xl py-2.5 sm:py-3.5'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-3 sm:py-4 md:py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between">
          {/* Left: Netflix Red Logo & Navigation Links */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="flex items-center group shrink-0">
              <img
                src="/pixelLogo.png"
                alt="Pixell"
                className="h-8 xs:h-9 sm:h-10 md:h-11 lg:h-12 w-auto max-w-[135px] xs:max-w-[160px] sm:max-w-[165px] md:max-w-none object-contain hover:opacity-90 transition-all"
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-[13px] font-medium transition-colors duration-200 ${isActive && link.path === location.pathname
                      ? 'text-white font-bold'
                      : 'text-[#e5e5e5] hover:text-[#b3b3b3]'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right: Search, Notifications & Profile Avatar */}
          <div className="flex items-center gap-3.5 sm:gap-6">
            {/* Mobile Cast Icon (Netflix style) */}
            <button
              className="lg:hidden text-white/80 hover:text-white transition-colors"
              title="Cast to Device"
            >
              <Cast className="w-5 h-5" />
            </button>

            {/* Netflix Expanding Search with Live Preview */}
            <div className="relative flex items-center">
              {searchOpen ? (
                <div className="relative">
                  <form onSubmit={handleSearchSubmit} className="flex items-center animate-scale-in">
                    <div className="relative flex items-center">
                      <Search className="absolute left-2.5 w-4 h-4 text-[#808080]" />
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setSearchOpen(false);
                        }}
                        placeholder="Titles, people, genres..."
                        className="w-36 xs:w-52 sm:w-72 md:w-80 pl-9 pr-8 py-1.5 bg-black/95 text-xs text-white border border-white/80 focus:outline-none focus:border-white transition-all shadow-xl rounded-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                        className="absolute right-2 text-[#808080] hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>

                  {/* Live Search Results Preview Dropdown directly underneath the input */}
                  <SearchPreviewDropdown
                    query={searchQuery}
                    isOpen={searchOpen && searchQuery.trim().length >= 2}
                    align="navbar"
                    onClose={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    onViewAll={() => {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1 text-white hover:text-[#b3b3b3] transition-colors"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1 text-white hover:text-[#b3b3b3] transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#E50914]" />
              </button>

              {notificationsOpen && (
                <>
                  <div onClick={() => setNotificationsOpen(false)} className="fixed inset-0 z-30" />
                  <div className="absolute right-0 mt-3 w-72 bg-[#181818] border border-white/10 shadow-2xl p-4 z-40 rounded-md animate-scale-in text-xs">
                    <h4 className="font-bold text-white text-sm mb-2">Notifications</h4>
                    <div className="space-y-3 divide-y divide-white/5">
                      <div className="pt-2">
                        <p className="font-bold text-white">Now Streaming: Insidious & Marvel</p>
                        <p className="text-[11px] text-[#a3a3a3] mt-0.5">Explore the latest blockbusters in 4K Ultra HD.</p>
                      </div>
                      <div className="pt-2">
                        <p className="font-bold text-white">Continue Watching Ready</p>
                        <p className="text-[11px] text-[#a3a3a3] mt-0.5">Pick up where you left off on any screen.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sign In Button */}
            <button
              onClick={() => { }}
              data-tv-focus="true"
              className="px-3 sm:px-4 py-1.5 rounded-sm bg-[#E50914] hover:bg-[#C11119] text-white font-bold text-xs sm:text-sm transition-colors shadow cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Netflix Mobile Subheader: TV Shows | Movies | Categories ▾ */}
        <div className="lg:hidden flex items-center justify-around pt-3 pb-1 border-t border-white/5 mt-2.5 text-xs font-semibold text-white/90">
          <Link
            to="/series"
            className={`px-3 py-1 hover:text-white transition-colors ${location.pathname === '/series' ? 'font-bold text-white border-b-2 border-[#E50914]' : 'text-[#d1d5db]'
              }`}
          >
            TV Shows
          </Link>
          <Link
            to="/movies"
            className={`px-3 py-1 hover:text-white transition-colors ${location.pathname === '/movies' ? 'font-bold text-white border-b-2 border-[#E50914]' : 'text-[#d1d5db]'
              }`}
          >
            Movies
          </Link>
          <button
            onClick={() => setCategoriesOpen(true)}
            className="flex items-center gap-1 px-3 py-1 text-[#d1d5db] hover:text-white transition-colors"
          >
            <span>Categories</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>
      </nav>

      {/* Netflix Mobile Full-Screen Categories Drawer Overlay */}
      {categoriesOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-6 animate-fade-in text-white overflow-y-auto">
          <div className="space-y-6 pt-8 text-center max-w-sm mx-auto w-full">
            <img
              src="/pixelLogo.png"
              alt="Pixell"
              className="h-10 sm:h-12 w-auto object-contain mx-auto mb-2"
            />
            <h3 className="text-xl font-black tracking-tight text-white mb-6">
              Select a Category
            </h3>

            <div className="space-y-4 text-base font-semibold text-[#a3a3a3]">
              <div
                onClick={() => {
                  setCategoriesOpen(false);
                  navigate('/movies');
                }}
                className="hover:text-white hover:scale-105 transition-transform cursor-pointer py-1"
              >
                All Movies & TV Shows
              </div>
              <div
                onClick={() => {
                  setCategoriesOpen(false);
                  navigate('/series');
                }}
                className="hover:text-white hover:scale-105 transition-transform cursor-pointer py-1"
              >
                TV Series & Dramas
              </div>

              {genres.map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleSelectCategory(g.id)}
                  className="hover:text-white hover:scale-105 transition-transform cursor-pointer py-1"
                >
                  {g.name}
                </div>
              ))}
            </div>
          </div>

          {/* Floating Bottom (X) Close Circle Button (Netflix Mobile Style) */}
          <div className="flex justify-center pb-8 pt-6">
            <button
              onClick={() => setCategoriesOpen(false)}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
              title="Close"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

