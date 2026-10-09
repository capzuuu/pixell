import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { MediaItem } from '../types';
import { useTitleModal } from '../store/TitleModalContext';
import { Play, Film, Tv, ArrowRight, Loader2, Search } from 'lucide-react';

interface SearchPreviewDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onViewAll?: () => void;
  align?: 'right' | 'full' | 'navbar';
}

export const SearchPreviewDropdown: React.FC<SearchPreviewDropdownProps> = ({
  query,
  isOpen,
  onClose,
  onViewAll,
  align = 'right',
}) => {
  const navigate = useNavigate();
  const { openModal } = useTitleModal();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Debounced search when query changes
  useEffect(() => {
    if (!isOpen || !query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await tmdbService.search(query.trim(), 'multi', 1);
        if (res.success && res.results) {
          // Filter to items with titles
          const validResults = res.results.filter((item) => Boolean(item.title));
          setResults(validResults.slice(0, 7));
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Failed to load search preview:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !query.trim() || query.trim().length < 2) return null;

  const handleItemClick = (e: React.MouseEvent, item: MediaItem) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    openModal(item);
  };

  const handlePlayClick = (e: React.MouseEvent, item: MediaItem) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    const isTv = item.mediaType === 'tv';
    if (isTv) {
      navigate(`/watch/tv/${item.tmdbId || item.id}/1/1`);
    } else {
      navigate(`/watch/movie/${item.tmdbId || item.id}`);
    }
  };

  const handleSeeAll = () => {
    onClose();
    if (onViewAll) {
      onViewAll();
    } else {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Fully responsive position classes for all media queries (mobile, tablet, desktop)
  let positionClasses = 'absolute top-full right-0 w-full sm:w-[420px] md:w-[460px] lg:w-[480px] max-w-[calc(100vw-24px)]';
  if (align === 'full') {
    positionClasses = 'absolute top-full left-0 right-0 w-full';
  } else if (align === 'navbar' || align === 'right') {
    // On mobile devices (<640px), position fixed across screen below navbar to avoid overflow/clipping; on sm+ screens, anchor below search input
    positionClasses = 'fixed left-2.5 right-2.5 top-[58px] xs:top-[62px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-[420px] md:w-[460px] lg:w-[480px] sm:max-w-[calc(100vw-32px)]';
  }

  return (
    <div
      ref={dropdownRef}
      className={`${positionClasses} mt-2 bg-[#181818]/95 border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in text-white select-none backdrop-blur-xl`}
      style={{ transformOrigin: align === 'full' ? 'top center' : 'top right' }}
    >
      {/* Top Header */}
      <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 border-b border-white/10 bg-[#141414] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#a3a3a3] min-w-0">
          <Search className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
          <span className="shrink-0 text-white font-semibold">Search for</span>
          <span className="text-white truncate max-w-[120px] xs:max-w-[170px] sm:max-w-[220px] md:max-w-[280px]">
            "{query}"
          </span>
        </div>
        {loading && (
          <div className="flex items-center gap-1 text-[11px] text-[#888888] shrink-0 ml-2">
            <Loader2 className="w-3 h-3 animate-spin text-[#E50914]" />
            <span className="hidden xs:inline">Searching...</span>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="max-h-[55vh] sm:max-h-[380px] md:max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
        {loading && results.length === 0 ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-11 sm:w-14 aspect-[2/3] rounded bg-[#252525]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 bg-[#252525] rounded" />
                  <div className="h-2.5 w-1/2 bg-[#252525] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          results.map((item) => {
            const isTv = item.mediaType === 'tv';
            const posterSrc = item.posterUrl || item.backdropUrl || '';
            const matchScore = item.voteAverage ? Math.min(99, Math.round(item.voteAverage * 10)) : 95;

            return (
              <div
                key={item.id || item.tmdbId}
                onClick={(e) => handleItemClick(e, item)}
                className="group flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 hover:bg-[#222222] active:bg-[#282828] transition-colors cursor-pointer"
              >
                {/* Poster & Title Details */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="relative w-11 xs:w-12 sm:w-14 aspect-[2/3] rounded overflow-hidden bg-black shrink-0 border border-white/10 group-hover:border-white/30 transition-colors shadow-sm">
                    {posterSrc ? (
                      <img
                        src={posterSrc}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#242424] text-[9px] text-[#888888]">
                        Pixell
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1 flex-wrap">
                      {isTv ? (
                        <span className="inline-flex items-center gap-1 text-[8px] xs:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Tv className="w-2.5 h-2.5 shrink-0" /> TV Series
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[8px] xs:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30">
                          <Film className="w-2.5 h-2.5 shrink-0" /> Movie
                        </span>
                      )}
                      {item.releaseYear && (
                        <span className="text-[9.5px] sm:text-[10px] text-[#737373]">{item.releaseYear}</span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#E50914] transition-colors truncate">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[9px] xs:text-[10px]">
                      <span className="font-bold text-[#46D369]">{matchScore}% Match</span>
                      <span className="text-[#666666]">•</span>
                      <span className="text-[#888888]">{item.rating || 'HD'}</span>
                    </div>
                  </div>
                </div>

                {/* Instant Play Action */}
                <button
                  onClick={(e) => handlePlayClick(e, item)}
                  className="p-1.5 xs:p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#282828] hover:bg-[#E50914] text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 shadow group-hover:bg-[#E50914]"
                  title="Watch now"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Play</span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-6 sm:p-8 text-center text-[#888888]">
            <Film className="w-7 h-7 sm:w-8 sm:h-8 text-[#555555] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-white mb-0.5">No direct titles found</p>
            <p className="text-[10.5px] sm:text-[11px] text-[#777777] max-w-[280px] mx-auto">
              Press Enter or tap below to search across the full catalog.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Action */}
      <div className="p-2 sm:p-2.5 md:p-3 border-t border-white/10 bg-[#141414] text-center">
        <button
          onClick={handleSeeAll}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#242424] hover:bg-[#303030] active:bg-[#383838] text-xs font-bold text-white transition-colors border border-white/10"
        >
          <span className="truncate max-w-[190px] xs:max-w-[260px] sm:max-w-none">
            See all results for "{query}"
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
        </button>
      </div>
    </div>
  );
};
