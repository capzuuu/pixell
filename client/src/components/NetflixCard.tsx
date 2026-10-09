import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, ThumbsUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { MediaItem, Movie, Series } from '../types';
import { useWatchlist } from '../store/WatchlistContext';
import { useTitleModal } from '../store/TitleModalContext';
import { formatDuration } from '../utils/formatTime';

interface NetflixCardProps {
  item: MediaItem | Movie | Series | any;
  aspect?: 'backdrop' | 'poster';
  progressSeconds?: number;
  durationSeconds?: number;
  isGrid?: boolean;
}

export const NetflixCard: React.FC<NetflixCardProps> = ({
  item,
  aspect = 'backdrop',
  progressSeconds,
  durationSeconds,
  isGrid = false,
}) => {
  const navigate = useNavigate();
  const { isSaved, toggleWatchlist } = useWatchlist();
  const { openModal } = useTitleModal();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const isTv = item.mediaType === 'tv' || Boolean(item.seasonNumber) || Boolean(item.seasons) || Boolean(item.episodeId);
  const targetId = String(item.tmdbId || item.movieId || (isTv ? item.seriesId : undefined) || item.id);
  const saved = isSaved(targetId);

  const imageSrc = aspect === 'poster'
    ? (item.posterUrl || item.backdropUrl || item.movie?.posterUrl || item.episode?.thumbnailUrl || '')
    : (item.backdropUrl || item.posterUrl || item.movie?.backdropUrl || item.episode?.thumbnailUrl || '');

  const matchScore = item.voteAverage ? Math.min(99, Math.round(item.voteAverage * 10)) : 97;
  const ratingBadge = item.rating || (isTv ? 'TV-MA' : 'PG-13');
  const durationText = isTv
    ? `${item.numberOfSeasons || item.seasons?.length || 1} Season${(item.numberOfSeasons || item.seasons?.length || 1) !== 1 ? 's' : ''}`
    : item.duration ? formatDuration(item.duration) : '2h 10m';

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTv) {
      if (item.tmdbId) {
        navigate(`/watch/tv/${item.tmdbId}/${item.seasonNumber || 1}/${item.episodeNumber || 1}`);
      } else if (item.episodeId) {
        navigate(`/watch/episode/${item.episodeId}`);
      } else {
        navigate(`/watch/tv/${targetId}/${item.seasonNumber || 1}/${item.episodeNumber || 1}`);
      }
    } else {
      navigate(`/watch/movie/${item.tmdbId || item.movieId || targetId}`);
    }
  };

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist({
      tmdbId: item.tmdbId,
      mediaType: isTv ? 'tv' : 'movie',
      title: item.title,
      posterUrl: item.posterUrl || imageSrc,
      backdropUrl: item.backdropUrl || imageSrc,
      rating: item.rating,
      releaseYear: item.releaseYear,
    });
  };

  const handleOpenDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const mediaObject = item.movie || item.series || {
      ...item,
      id: targetId,
      tmdbId: item.tmdbId ? Number(item.tmdbId) : undefined,
      mediaType: isTv ? 'tv' : 'movie',
      posterUrl: item.posterUrl || imageSrc,
      backdropUrl: item.backdropUrl || imageSrc,
    };
    openModal(mediaObject);
  };

  const genreNames = item.genres && item.genres.length > 0
    ? item.genres.slice(0, 3).map((g: any) => g.name).join(' • ')
    : isTv ? 'Suspenseful • Drama' : 'Action • Thriller';

  const hasProgress = progressSeconds !== undefined && progressSeconds > 0;
  const progressPercentage = durationSeconds && durationSeconds > 0
    ? Math.min(100, Math.round((progressSeconds! / durationSeconds) * 100))
    : 0;

  return (
    <div
      className={`relative ${isGrid ? 'w-full' : 'shrink-0'} group select-none`}
      style={isGrid ? undefined : { width: aspect === 'poster' ? 'clamp(120px, 34vw, 180px)' : 'clamp(165px, 48vw, 260px)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Card */}
      <div
        onClick={handleOpenDetail}
        className={`relative w-full rounded-md overflow-hidden bg-[#181818] cursor-pointer transition-transform duration-300 ${
          aspect === 'poster' ? 'aspect-[2/3]' : 'aspect-video'
        }`}
      >
        <img
          src={imageSrc}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />

        {/* Progress bar overlay if continuing */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-[#E50914]" style={{ width: `${progressPercentage}%` }} />
          </div>
        )}
      </div>

      {/* Netflix Floating Hover Expansion Preview (Desktop Only) */}
      {isHovered && (
        <div
          className="hidden md:block absolute -top-12 -left-8 w-[320px] bg-[#181818] rounded-md shadow-2xl z-50 overflow-hidden animate-scale-in border border-white/10 pointer-events-auto"
          style={{ transformOrigin: 'center center' }}
        >
          {/* Top Video Preview Thumbnail */}
          <div
            onClick={handlePlay}
            className="relative aspect-video w-full bg-black cursor-pointer group/thumb"
          >
            <img
              src={item.backdropUrl || item.posterUrl || imageSrc}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

            {/* Quick Play Trigger Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 fill-black ml-0.5" />
              </div>
            </div>

            {/* Title watermark on preview */}
            <div className="absolute bottom-2 left-3 right-3">
              <h4 className="font-extrabold text-sm text-white drop-shadow-md truncate">
                {item.title}
              </h4>
            </div>
          </div>

          {/* Expanded Card Details Body */}
          <div className="p-3.5 space-y-2.5">
            {/* Action Buttons Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play Button */}
                <button
                  onClick={handlePlay}
                  className="w-8 h-8 rounded-full bg-white hover:bg-white/80 text-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md"
                  title="Play"
                >
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </button>

                {/* Add to My List Button */}
                <button
                  onClick={handleToggleWatchlist}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                    saved
                      ? 'bg-white/20 border-white text-white'
                      : 'border-white/50 text-white hover:border-white'
                  }`}
                  title={saved ? 'Remove from My List' : 'Add to My List'}
                >
                  {saved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                </button>

                {/* Like Button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                    isLiked
                      ? 'bg-white/20 border-white text-white'
                      : 'border-white/50 text-white hover:border-white'
                  }`}
                  title={isLiked ? 'Liked' : 'Like'}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Chevron Down for Full Modal */}
              <button
                onClick={handleOpenDetail}
                className="w-8 h-8 rounded-full border-2 border-white/50 text-white hover:border-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                title="More info"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Netflix Metadata Row */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#46D369]">{matchScore}% Match</span>
              <span className="px-1 border border-white/40 rounded text-[10px] font-bold text-white uppercase">
                {ratingBadge}
              </span>
              <span className="text-[#a3a3a3] font-medium">{durationText}</span>
              <span className="px-1 border border-white/30 rounded text-[9px] font-bold text-[#a3a3a3]">
                HD
              </span>
            </div>

            {/* Genre Dot Tags */}
            <div className="text-[11px] text-white/90 font-medium truncate">
              {genreNames}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
