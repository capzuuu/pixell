import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Volume2, VolumeX } from 'lucide-react';
import { MediaItem, Movie, Series } from '../types';
import { useTitleModal } from '../store/TitleModalContext';
import { useWatchlist } from '../store/WatchlistContext';

interface HeroBannerProps {
  items: Array<MediaItem | Movie | Series>;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ items }) => {
  const navigate = useNavigate();
  const { openModal } = useTitleModal();
  const { isSaved, toggleWatchlist } = useWatchlist();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Auto-rotate hero every 9 seconds
  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const targetId = String(currentItem.tmdbId || currentItem.id);
  const isMovie = currentItem.mediaType === 'movie' || 'duration' in currentItem;
  const saved = isSaved(targetId);

  const handlePlay = () => {
    if (isMovie) {
      navigate(`/watch/movie/${targetId}`);
    } else {
      navigate(`/watch/tv/${targetId}/1/1`);
    }
  };

  const handleMoreInfo = () => {
    openModal(currentItem);
  };

  const handleToggleWatchlist = () => {
    toggleWatchlist({
      tmdbId: currentItem.tmdbId,
      mediaType: isMovie ? 'movie' : 'tv',
      title: currentItem.title,
      posterUrl: currentItem.posterUrl,
      backdropUrl: currentItem.backdropUrl,
      rating: currentItem.rating,
      releaseYear: currentItem.releaseYear,
    });
  };

  const genreDots = currentItem.genres && currentItem.genres.length > 0
    ? currentItem.genres.slice(0, 3).map((g: any) => g.name).join(' • ')
    : isMovie ? 'Action • Sci-Fi • Thriller' : 'Drama • Mystery • Suspenseful';

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] min-h-[500px] sm:min-h-[560px] max-h-[850px] overflow-hidden bg-[#141414] select-none">
      {/* Background Backdrops with Crossfade */}
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <img
            src={item.backdropUrl || item.posterUrl || ''}
            alt={item.title}
            className="w-full h-full object-cover object-center scale-105"
          />
        </div>
      ))}

      {/* Netflix Authentic Dark Vignette Gradients */}
      <div className="absolute inset-0 netflix-vignette-left z-10" />
      <div className="absolute inset-0 netflix-vignette-bottom z-10" />

      {/* Hero Content Information */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col justify-end pb-12 sm:pb-24 md:pb-32">
        <div className="max-w-xl md:max-w-2xl flex flex-col items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
          {/* Top 10 Today Netflix Badge */}
          <div className="flex items-center gap-2">
            <span className="bg-[#E50914] text-white text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded tracking-wider shadow">
              TOP 10
            </span>
            <span className="font-bold text-xs sm:text-sm md:text-base text-white drop-shadow">
              #1 in {isMovie ? 'Movies' : 'TV Shows'} Today
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-2xl font-display">
            {currentItem.title}
          </h1>

          {/* Mobile Genre Dots */}
          <div className="sm:hidden text-xs font-semibold text-white/90 drop-shadow">
            {genreDots}
          </div>

          {/* Desktop Description */}
          <p className="hidden sm:block text-sm md:text-base text-[#e5e5e5] line-clamp-3 leading-relaxed drop-shadow-md max-w-xl font-normal">
            {currentItem.description}
          </p>

          {/* Desktop / Tablet Buttons (>= 640px) */}
          <div className="hidden sm:flex items-center gap-3 pt-2">
            {/* White Play Button */}
            <button
              onClick={handlePlay}
              className="px-7 py-2.5 md:py-3 rounded-md bg-white hover:bg-white/80 text-black font-extrabold text-sm md:text-base flex items-center gap-2.5 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Play</span>
            </button>

            {/* Translucent Gray More Info Button */}
            <button
              onClick={handleMoreInfo}
              className="px-6 py-2.5 md:py-3 rounded-md bg-[#6d6d6e]/70 hover:bg-[#6d6d6e]/40 text-white font-bold text-sm md:text-base flex items-center gap-2 backdrop-blur-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>
          </div>

          {/* Mobile Netflix 3-CTA Row (< 640px) */}
          <div className="sm:hidden flex items-center justify-around w-full max-w-xs pt-3">
            {/* My List Mobile Button */}
            <button
              onClick={handleToggleWatchlist}
              className="flex flex-col items-center gap-1 text-white/90 active:scale-95 transition-transform"
            >
              {saved ? (
                <Check className="w-6 h-6 text-white stroke-[2.5]" />
              ) : (
                <Plus className="w-6 h-6 text-white stroke-[2.5]" />
              )}
              <span className="text-[11px] font-bold">My List</span>
            </button>

            {/* Prominent Play Mobile Button */}
            <button
              onClick={handlePlay}
              className="px-6 py-2 rounded-md bg-white text-black font-extrabold text-sm flex items-center gap-2 shadow-xl active:scale-95 transition-transform"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play</span>
            </button>

            {/* Info Mobile Button */}
            <button
              onClick={handleMoreInfo}
              className="flex flex-col items-center gap-1 text-white/90 active:scale-95 transition-transform"
            >
              <Info className="w-6 h-6 text-white" />
              <span className="text-[11px] font-bold">Info</span>
            </button>
          </div>
        </div>

        {/* Right Side: Maturity Rating & Sound Controls (Desktop / Tablet) */}
        <div className="hidden sm:flex absolute right-0 bottom-24 md:bottom-32 z-20 items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full bg-black/40 border border-white/40 text-white flex items-center justify-center hover:bg-black/60 hover:border-white transition-colors backdrop-blur-sm cursor-pointer"
            title="Toggle Mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Rating Tab */}
          <div className="bg-[#333333]/80 border-l-4 border-white py-1 pl-3 pr-6 text-xs font-bold text-white uppercase backdrop-blur-sm">
            {currentItem.rating || (isMovie ? 'PG-13' : 'TV-MA')}
          </div>
        </div>
      </div>
    </div>
  );
};

