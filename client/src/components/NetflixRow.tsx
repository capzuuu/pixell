import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NetflixCard } from './NetflixCard';
import { MediaItem, Movie, Series } from '../types';

interface NetflixRowProps {
  title: string;
  items: Array<MediaItem | Movie | Series | any>;
  aspect?: 'backdrop' | 'poster';
  exploreHref?: string;
}

export const NetflixRow: React.FC<NetflixRowProps> = ({
  title,
  items,
  aspect = 'backdrop',
  exploreHref,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState<boolean>(false);
  const [showArrows, setShowArrows] = useState<boolean>(false);

  if (!items || items.length === 0) return null;

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.75
        : scrollLeft + clientWidth * 0.75;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="relative space-y-2 my-6 px-4 md:px-12 group/row"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Row Header */}
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg md:text-xl font-bold text-[#e5e5e5] hover:text-white transition-colors cursor-pointer group/title inline-flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xs text-[#0080ff] opacity-0 group-hover/title:opacity-100 transition-opacity font-semibold">
            Explore All ›
          </span>
        </h3>
      </div>

      {/* Row Slider Container */}
      <div className="relative">
        {/* Left Arrow Paddle */}
        {isMoved && (
          <button
            onClick={() => handleClick('left')}
            className={`absolute top-0 bottom-0 left-0 z-30 w-12 bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all duration-300 ${
              showArrows ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8 hover:scale-125 transition-transform" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar py-6 -my-6 px-1"
          style={{ scrollBehavior: 'smooth' }}
        >
          {items.map((item, index) => (
            <NetflixCard
              key={item.id || item.tmdbId || index}
              item={item}
              aspect={aspect}
              progressSeconds={item.progressSeconds}
              durationSeconds={item.durationSeconds}
            />
          ))}
        </div>

        {/* Right Arrow Paddle */}
        <button
          onClick={() => handleClick('right')}
          className={`absolute top-0 bottom-0 right-0 z-30 w-12 bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all duration-300 ${
            showArrows ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8 hover:scale-125 transition-transform" />
        </button>
      </div>
    </div>
  );
};
