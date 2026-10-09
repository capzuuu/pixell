import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Flame, Search, Bookmark } from 'lucide-react';

export const MobileNavbar: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'New & Hot', path: '/movies', icon: Flame },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'My List', path: '/my-list', icon: Bookmark },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-white/10 px-1 py-1 select-none shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-lg transition-all min-w-[64px] ${isActive
                  ? 'text-white font-bold'
                  : 'text-[#8c8c8c] hover:text-[#cccccc]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-white' : 'text-[#8c8c8c]'}`} />
                  <span className={`text-[10px] tracking-tight leading-none ${isActive ? 'font-bold text-white' : 'font-medium text-[#8c8c8c]'}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
