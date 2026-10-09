import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { MediaItem, Movie, Series } from '../types';
import { useTitleModal } from '../store/TitleModalContext';
import { useNavigate } from 'react-router-dom';

interface Top10RowProps {
  title?: string;
  items: Array<MediaItem | Movie | Series | any>;
}

export const Top10Row: React.FC<Top10RowProps> = ({
  title = 'Top 10 Movies & TV Shows Today',
  items,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { openModal } = useTitleModal();
  const navigate = useNavigate();
  const [showArrows, setShowArrows] = useState<boolean>(false);
  const [isMoved, setIsMoved] = useState<boolean>(false);

  if (!items || items.length === 0) return null;

  const top10Items = items.slice(0, 10);

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
      className="relative space-y-2 my-8 px-4 md:px-12 group/top10"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Row Header */}
      <div className="flex items-center gap-2.5">
        <h3 className="text-lg md:text-xl font-bold text-[#e5e5e5] hover:text-white transition-colors cursor-pointer">
          {title}
        </h3>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        {isMoved && (
          <button
            onClick={() => handleClick('left')}
            className={`absolute top-0 bottom-0 left-0 z-30 w-12 bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all ${
              showArrows ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronLeft className="w-8 h-8 hover:scale-125 transition-transform" />
          </button>
        )}

        {/* Top 10 Track */}
        <div
          ref={rowRef}
          className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-4 px-1"
          style={{ scrollBehavior: 'smooth' }}
        >
          {top10Items.map((item, index) => {
            const rank = index + 1;
            const isTv = item.mediaType === 'tv';
            const targetId = String(item.tmdbId || item.id);
            const posterSrc = item.posterUrl || item.backdropUrl || '';

            return (
              <div
                key={item.id || item.tmdbId || index}
                onClick={() => openModal(item)}
                className="relative flex items-end shrink-0 cursor-pointer group/card select-none w-[155px] sm:w-[190px] md:w-[230px] h-[160px] sm:h-[190px] md:h-[220px]"
              >
                {/* Giant Top 10 Rank Number */}
                <div
                  className="netflix-top10-number font-display text-[110px] sm:text-[150px] md:text-[200px] leading-none shrink-0 pointer-events-none select-none -mr-3 sm:-mr-4 md:-mr-6 z-0"
                  style={{
                    WebkitTextStroke: '3px #595959',
                    color: '#141414',
                  }}
                >
                  {rank}
                </div>

                {/* Vertical Poster Card */}
                <div className="relative w-[95px] sm:w-[120px] md:w-[145px] aspect-[2/3] rounded-md overflow-hidden bg-[#181818] shadow-xl z-10 transition-transform duration-300 group-hover/card:scale-105 group-hover/card:shadow-2xl">
                  <img
                    src={posterSrc}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />

                  {/* Poster image */}

                  {/* Play Hover Overlay */}
                  <div className="hidden md:flex absolute inset-0 bg-black/40 items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isTv) {
                          navigate(`/watch/tv/${targetId}/1/1`);
                        } else {
                          navigate(`/watch/movie/${targetId}`);
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => handleClick('right')}
          className={`hidden md:flex absolute top-0 bottom-0 right-0 z-30 w-12 bg-black/50 hover:bg-black/80 text-white items-center justify-center transition-all duration-300 ${
            showArrows ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ChevronRight className="w-8 h-8 hover:scale-125 transition-transform" />
        </button>
      </div>
    </div>
  );
};
