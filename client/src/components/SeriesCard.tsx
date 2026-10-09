import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Info } from 'lucide-react';
import { MediaItem, Series } from '../types';
import { RatingBadge } from './RatingBadge';
import { useWatchlist } from '../store/WatchlistContext';

interface SeriesCardProps {
  series: Series | MediaItem;
  aspect?: 'poster' | 'backdrop';
}

export const SeriesCard: React.FC<SeriesCardProps> = ({
  series,
  aspect = 'poster',
}) => {
  const navigate = useNavigate();
  const { isSaved, toggleWatchlist } = useWatchlist();
  const targetId = String(series.tmdbId || series.id);
  const saved = isSaved(targetId);

  const imageSrc = aspect === 'poster'
    ? (series.posterUrl || series.backdropUrl || '')
    : (series.backdropUrl || series.posterUrl || '');
  const aspectClass = aspect === 'poster' ? 'aspect-[2/3]' : 'aspect-video';

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/series/${targetId}`);
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist({
      tmdbId: series.tmdbId,
      mediaType: 'tv',
      title: series.title,
      posterUrl: series.posterUrl,
      backdropUrl: series.backdropUrl,
      rating: series.rating,
      releaseYear: series.releaseYear,
    });
  };

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-dark-900 border border-white/5 transition-all duration-300 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1.5 select-none">
      {/* Thumbnail Container */}
      <Link to={`/series/${targetId}`} className={`relative w-full ${aspectClass} overflow-hidden bg-dark-850 block`}>
        <img
          src={imageSrc}
          alt={series.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dark Vignette Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
          {/* Top badges */}
          <div className="flex items-center justify-between">
            <RatingBadge rating={series.rating || 'TV-MA'} size="sm" />
            <span className="text-[11px] font-semibold text-slate-300 bg-dark-900/80 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
              TV Series
            </span>
          </div>

          {/* Center Play Button on hover */}
          <div className="self-center">
            <button
              onClick={handlePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-600 to-accent-pink hover:from-brand-500 hover:to-accent-pink text-white flex items-center justify-center shadow-glow-brand transition-all hover:scale-110 active:scale-95"
              title="View Series & Episodes"
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </button>
          </div>

          {/* Bottom quick actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleWatchlist}
              className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                saved
                  ? 'bg-brand-600 text-white shadow-glow-brand'
                  : 'bg-dark-850/80 text-slate-300 hover:text-white hover:bg-white/20 border border-white/10'
              }`}
              title={saved ? 'Remove from My List' : 'Add to My List'}
            >
              {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            <Link
              to={`/series/${targetId}`}
              className="p-2 rounded-lg bg-dark-850/80 text-slate-300 hover:text-white hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all"
              title="Series Details"
            >
              <Info className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Link>

      {/* Card Info Details */}
      <div className="p-3 flex flex-col gap-1">
        <Link
          to={`/series/${targetId}`}
          className="font-bold text-sm text-white hover:text-brand-300 line-clamp-1 transition-colors"
        >
          {series.title}
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{series.releaseYear || 2025}</span>
          <span>•</span>
          <span className="line-clamp-1 text-slate-400">
            {series.genres && series.genres.length > 0 ? series.genres[0].name : 'TV Series'}
          </span>
        </div>
      </div>
    </div>
  );
};
