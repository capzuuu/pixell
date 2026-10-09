import React, { useRef, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  children: ReactNode;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  title,
  subtitle,
  viewAllLink,
  children,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative my-6 px-4 md:px-12 group/row">
      {/* Header */}
      <div className="flex items-end justify-between mb-3.5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            Explore all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Row Wrapper */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-dark-950/80 hover:bg-brand-600 text-white border border-white/10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110 backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable track */}
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth py-2 px-1"
        >
          {children}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-dark-950/80 hover:bg-brand-600 text-white border border-white/10 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110 backdrop-blur-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
