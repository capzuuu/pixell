import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Episode } from '../types';
import { ProgressBar } from './ProgressBar';
import { formatDuration } from '../utils/formatTime';

interface EpisodeCardProps {
  episode: Episode;
  progressSeconds?: number;
  durationSeconds?: number;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  progressSeconds,
  durationSeconds,
}) => {
  const navigate = useNavigate();
  const hasProgress = progressSeconds !== undefined && progressSeconds > 0;

  const handlePlay = () => {
    if (episode.seriesTmdbId) {
      navigate(`/watch/tv/${episode.seriesTmdbId}/${episode.seasonNumber || 1}/${episode.episodeNumber}`);
    } else {
      navigate(`/watch/episode/${episode.id}`);
    }
  };

  return (
    <div
      onClick={handlePlay}
      className="group relative flex flex-col md:flex-row gap-4 p-3.5 rounded-xl bg-dark-900 border border-white/5 hover:border-brand-500/40 hover:bg-dark-850/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-brand-500/10"
    >
      {/* Thumbnail */}
      <div className="relative w-full md:w-56 aspect-video shrink-0 rounded-lg overflow-hidden bg-dark-850 border border-white/5">
        <img
          src={episode.thumbnailUrl || ''}
          alt={episode.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-dark-950/40 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:bg-dark-950/20 transition-all">
          <div className="w-10 h-10 rounded-full bg-brand-600/90 text-white flex items-center justify-center group-hover:scale-110 shadow-glow-brand transition-transform">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {episode.duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-dark-950/80 text-[11px] font-semibold text-slate-300 backdrop-blur-sm">
            {formatDuration(episode.duration)}
          </div>
        )}

        {/* Episode Number badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-brand-600/90 text-[11px] font-bold text-white shadow-glow-brand">
          EP {episode.episodeNumber}
        </div>

        {/* Progress bar */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0">
            <ProgressBar
              progressSeconds={progressSeconds!}
              durationSeconds={durationSeconds || ((episode.duration || 45) * 60)}
              className="rounded-none"
            />
          </div>
        )}
      </div>

      {/* Episode Details */}
      <div className="flex flex-col justify-center flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h4 className="font-bold text-base text-white group-hover:text-brand-300 transition-colors line-clamp-1">
            {episode.episodeNumber}. {episode.title}
          </h4>
          {episode.releaseDate && (
            <span className="text-xs text-slate-400 shrink-0">{episode.releaseDate}</span>
          )}
        </div>
        <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal">
          {episode.description || 'No description available for this episode.'}
        </p>
      </div>
    </div>
  );
};
