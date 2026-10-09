import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Info } from 'lucide-react';
import { MediaItem, Movie } from '../types';
import { RatingBadge } from './RatingBadge';
import { ProgressBar } from './ProgressBar';
import { useWatchlist } from '../store/WatchlistContext';
import { formatDuration } from '../utils/formatTime';

interface MovieCardProps {
  movie: Movie | MediaItem;
  progressSeconds?: number;
  durationSeconds?: number;
  aspect?: 'poster' | 'backdrop';
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  progressSeconds,
  durationSeconds,
  aspect = 'poster',
}) => {
  const navigate = useNavigate();
  const { isSaved, toggleWatchlist } = useWatchlist();
  const targetId = String(movie.tmdbId || movie.id);
  const saved = isSaved(targetId);

  const hasProgress = progressSeconds !== undefined && progressSeconds > 0;
  const imageSrc = aspect === 'poster'
    ? (movie.posterUrl || movie.backdropUrl || '')
    : (movie.backdropUrl || movie.posterUrl || '');
  const aspectClass = aspect === 'poster' ? 'aspect-[2/3]' : 'aspect-video';

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/watch/movie/${targetId}`);
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist({
      tmdbId: movie.tmdbId,
      mediaType: 'movie',
      title: movie.title,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      rating: movie.rating,
      releaseYear: movie.releaseYear,
    });
  };

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-dark-900 border border-white/5 transition-all duration-300 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1.5 select-none">
      {/* Thumbnail Container */}
      <Link to={`/movie/${targetId}`} className={`relative w-full ${aspectClass} overflow-hidden bg-dark-850 block`}>
        <img
          src={imageSrc}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dark Vignette Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
          {/* Top badges */}
          <div className="flex items-center justify-between">
            <RatingBadge rating={movie.rating || 'PG-13'} size="sm" />
            {movie.duration ? (
              <span className="text-[11px] font-semibold text-slate-300 bg-dark-900/80 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                {formatDuration(movie.duration)}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-300 bg-dark-900/80 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                Movie
              </span>
            )}
          </div>

          {/* Center Play Button on hover */}
          <div className="self-center">
            <button
              onClick={handlePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-600 to-accent-pink hover:from-brand-500 hover:to-accent-pink text-white flex items-center justify-center shadow-glow-brand transition-all hover:scale-110 active:scale-95"
              title="Watch Now"
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
              to={`/movie/${targetId}`}
              className="p-2 rounded-lg bg-dark-850/80 text-slate-300 hover:text-white hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all"
              title="More Info"
            >
              <Info className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Watch Progress Bar overlay if ongoing */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0">
            <ProgressBar
              progressSeconds={progressSeconds!}
              durationSeconds={durationSeconds || ((movie.duration || 120) * 60)}
              className="rounded-none"
            />
          </div>
        )}
      </Link>

      {/* Card Info Details */}
      <div className="p-3 flex flex-col gap-1">
        <Link
          to={`/movie/${targetId}`}
          className="font-bold text-sm text-white hover:text-brand-300 line-clamp-1 transition-colors"
        >
          {movie.title}
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{movie.releaseYear || 2025}</span>
          <span>•</span>
          <span className="line-clamp-1 text-slate-400">
            {movie.genres && movie.genres.length > 0 ? movie.genres[0].name : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
};
