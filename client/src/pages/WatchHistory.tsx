import React, { useState, useEffect } from 'react';
import { historyService } from '../services/historyService';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { WatchHistory as WatchHistoryType } from '../types';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { History, Play, Trash2, Film, Tv, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/formatTime';

export const WatchHistory: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [history, setHistory] = useState<WatchHistoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await historyService.getHistory();
        if (res.success && res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const handleClearAll = async () => {
    try {
      await historyService.clearHistory();
      setHistory([]);
      success('Viewing history cleared');
    } catch (err: any) {
      error(err.message || 'Failed to clear viewing history');
    }
  };

  const handleRemoveSingle = async (id: string) => {
    try {
      await historyService.clearHistory(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      success('Removed from viewing activity');
    } catch (err: any) {
      error(err.message || 'Failed to remove item');
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-20 px-4 md:px-12 lg:px-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Viewing Activity
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3a3] mt-1">
            Recently streamed titles and progress on your profile
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#202020] hover:bg-[#E50914]/20 hover:text-[#E50914] text-[#a3a3a3] text-xs font-bold border border-white/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hide All Activity</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {loading ? (
        <CardSkeleton count={8} aspect="backdrop" />
      ) : history.length > 0 ? (
        <div className="divide-y divide-white/10 bg-[#181818] rounded-xl border border-white/10 overflow-hidden">
          {history.map((item) => {
            const isTv = item.mediaType === 'tv' || Boolean(item.episodeId) || Boolean(item.seasonNumber);
            const title = item.title || item.movie?.title || item.episode?.title || 'Unknown Title';
            const imageSrc = item.backdropUrl || item.posterUrl || item.movie?.backdropUrl || item.episode?.thumbnailUrl || '';

            const subtitle = isTv
              ? (item.seasonNumber && item.episodeNumber
                  ? `Season ${item.seasonNumber}: Episode ${item.episodeNumber} ${item.episodeTitle ? `"${item.episodeTitle}"` : ''}`
                  : item.episode?.seriesTitle || 'TV Series')
              : `${item.movie?.releaseYear || ''} Movie`;

            const playUrl = isTv
              ? (item.tmdbId
                  ? `/watch/tv/${item.tmdbId}/${item.seasonNumber || 1}/${item.episodeNumber || 1}`
                  : `/watch/episode/${item.episodeId}`)
              : `/watch/movie/${item.tmdbId || item.movieId}`;

            return (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 hover:bg-[#222222] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative w-36 aspect-video shrink-0 rounded-md overflow-hidden bg-black">
                    <img
                      src={imageSrc}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Link
                      to={playUrl}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </Link>
                  </div>

                  {/* Title & metadata */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isTv ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#46D369] uppercase">
                          <Tv className="w-3 h-3" /> Series
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#E50914] uppercase">
                          <Film className="w-3 h-3" /> Movie
                        </span>
                      )}
                      <span className="text-xs text-[#a3a3a3]">• Watched {formatTimeAgo(item.watchedAt)}</span>
                    </div>

                    <Link
                      to={playUrl}
                      className="font-bold text-sm sm:text-base text-white hover:text-[#E50914] transition-colors line-clamp-1"
                    >
                      {title}
                    </Link>
                    <p className="text-xs text-[#a3a3a3] mt-0.5 truncate">{subtitle}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Link
                    to={playUrl}
                    className="flex items-center gap-1.5 px-4 py-2 rounded bg-white hover:bg-white/80 text-black font-extrabold text-xs transition-transform hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Resume</span>
                  </Link>

                  <button
                    onClick={() => handleRemoveSingle(item.id)}
                    className="p-2 rounded-full text-[#a3a3a3] hover:text-white hover:bg-white/10 transition-colors"
                    title="Hide from viewing activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<History className="w-10 h-10 text-[#E50914]" />}
          title="No viewing activity yet"
          description="Titles you watch will appear here so you can easily track and replay them."
          actionText="Start Watching"
          actionHref="/"
        />
      )}
    </div>
  );
};

