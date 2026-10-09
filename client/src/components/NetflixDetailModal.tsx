import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Play,
  Plus,
  Check,
  ThumbsUp,
  Volume2,
  VolumeX,
  ChevronDown,
  Star,
  Film,
  Tv
} from 'lucide-react';
import { useTitleModal } from '../store/TitleModalContext';
import { useWatchlist } from '../store/WatchlistContext';
import { tmdbService } from '../services/tmdbService';
import { MediaItem, Movie, Series, Episode } from '../types';
import { formatDuration } from '../utils/formatTime';

export const NetflixDetailModal: React.FC = () => {
  const { isOpen, activeItem, closeModal } = useTitleModal();
  const { isSaved, toggleWatchlist } = useWatchlist();
  const navigate = useNavigate();

  const [details, setDetails] = useState<MediaItem | Movie | Series | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const tmdbId = activeItem?.tmdbId || activeItem?.id;
  const isTv = activeItem?.mediaType === 'tv' || (activeItem && 'seasons' in activeItem);

  useEffect(() => {
    if (!isOpen || !activeItem) {
      setDetails(null);
      setEpisodes([]);
      return;
    }

    const currentItem = activeItem;
    async function loadDetails() {
      try {
        setLoading(true);
        const resolvedId = String(currentItem.tmdbId || currentItem.id);

        if (isTv) {
          const res = await tmdbService.getSeriesDetails(resolvedId);
          if (res.success && res.data) {
            setDetails(res.data);
            setSelectedSeason(1);
          } else {
            setDetails(currentItem);
          }
        } else {
          const res = await tmdbService.getMovieDetails(resolvedId);
          if (res.success && res.data) {
            setDetails(res.data);
          } else {
            setDetails(currentItem);
          }
        }
      } catch (err) {
        console.error('Failed to load title modal details:', err);
        setDetails(currentItem);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [isOpen, activeItem, isTv]);

  // Load season episodes
  useEffect(() => {
    if (!isOpen || !isTv || !tmdbId) return;

    const validTmdbId = tmdbId;
    async function loadEpisodes() {
      try {
        setEpisodesLoading(true);
        const res = await tmdbService.getSeasonEpisodes(validTmdbId, selectedSeason);
        if (res.success && res.data) {
          setEpisodes(res.data);
        }
      } catch (err) {
        console.error('Failed to load season episodes:', err);
      } finally {
        setEpisodesLoading(false);
      }
    }

    loadEpisodes();
  }, [isOpen, isTv, tmdbId, selectedSeason]);

  if (!isOpen || !activeItem) return null;

  const currentData = details || activeItem;
  const targetId = String(currentData.tmdbId || currentData.id);
  const saved = isSaved(targetId);

  const handlePlayMain = () => {
    closeModal();
    if (isTv) {
      navigate(`/watch/tv/${targetId}/${selectedSeason}/1`);
    } else {
      navigate(`/watch/movie/${targetId}`);
    }
  };

  const handlePlayEpisode = (seasonNum: number, epNum: number) => {
    closeModal();
    navigate(`/watch/tv/${targetId}/${seasonNum}/${epNum}`);
  };

  const handleToggleWatchlist = () => {
    toggleWatchlist({
      tmdbId: currentData.tmdbId,
      mediaType: isTv ? 'tv' : 'movie',
      title: currentData.title,
      posterUrl: currentData.posterUrl,
      backdropUrl: currentData.backdropUrl,
      rating: currentData.rating,
      releaseYear: currentData.releaseYear,
    });
  };

  const seasonsList = (currentData as Series).seasons || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex justify-center p-0 sm:p-4 md:p-6 animate-fade-in">
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={closeModal} />

      <div
        className="relative w-full max-w-4xl bg-[#181818] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden my-auto z-10 text-white animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hero Backdrop Header */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <img
            src={currentData.backdropUrl || currentData.posterUrl || ''}
            alt={currentData.title}
            className="w-full h-full object-cover object-center"
          />

          {/* Netflix Bottom & Left Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent" />

          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#181818]/80 hover:bg-[#282828] text-white flex items-center justify-center border border-white/10 transition-colors z-20"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero CTAs on Bottom Left */}
          <div className="absolute bottom-6 left-6 md:left-10 right-6 z-10 flex items-end justify-between">
            <div className="space-y-4 max-w-xl">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                {currentData.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                {/* Netflix White Play Button */}
                <button
                  onClick={handlePlayMain}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-white hover:bg-white/85 text-black font-extrabold text-sm md:text-base shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-black" />
                  <span>Play</span>
                </button>

                {/* Add to List Round Button */}
                <button
                  onClick={handleToggleWatchlist}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                    saved
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-[#2a2a2a]/60 border-white/50 text-white hover:border-white'
                  }`}
                  title={saved ? 'Remove from My List' : 'Add to My List'}
                >
                  {saved ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                </button>

                {/* Like / Thumbs Up Round Button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                    isLiked
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-[#2a2a2a]/60 border-white/50 text-white hover:border-white'
                  }`}
                  title={isLiked ? 'Liked' : 'I like this'}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mute toggle button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="hidden sm:flex w-10 h-10 rounded-full bg-[#2a2a2a]/60 border border-white/20 items-center justify-center text-white/80 hover:text-white hover:border-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-6 md:p-10 space-y-10">
          {/* Top Row: Meta Specs + Cast/Genres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Col: Synopsis & Badges */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                <span className="font-bold text-[#46D369]">
                  {currentData.voteAverage ? `${Math.round(currentData.voteAverage * 10)}% Match` : '98% Match'}
                </span>
                <span className="text-[#a3a3a3] font-semibold">{currentData.releaseYear || 2025}</span>
                <span className="px-1.5 py-0.5 border border-white/40 rounded text-[11px] font-bold text-white uppercase">
                  {currentData.rating || (isTv ? 'TV-MA' : 'PG-13')}
                </span>
                <span className="text-[#a3a3a3] font-semibold">
                  {isTv
                    ? `${seasonsList.length || (currentData as any).numberOfSeasons || 1} Season${seasonsList.length !== 1 ? 's' : ''}`
                    : `${currentData.duration ? formatDuration(currentData.duration) : '2h 15m'}`}
                </span>
                <span className="px-1.5 py-0.5 border border-white/30 rounded text-[10px] font-bold text-[#a3a3a3]">
                  Ultra HD 4K
                </span>
              </div>

              {/* Top 10 Badge if applicable */}
              <div className="flex items-center gap-2">
                <span className="bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider">
                  TOP 10
                </span>
                <span className="font-bold text-sm text-white">
                  #1 in {isTv ? 'TV Shows' : 'Movies'} Today
                </span>
              </div>

              {/* Story Overview */}
              <p className="text-[#d1d5db] text-sm md:text-base leading-relaxed">
                {currentData.description}
              </p>
            </div>

            {/* Right Col: Cast & Genre Attributes */}
            <div className="space-y-3 text-xs md:text-sm text-[#a3a3a3]">
              {currentData.cast && currentData.cast.length > 0 && (
                <div>
                  <span className="text-[#737373]">Cast: </span>
                  <span className="text-white font-medium">
                    {currentData.cast.slice(0, 4).map((c) => c.name).join(', ')}
                  </span>
                </div>
              )}

              {currentData.genres && currentData.genres.length > 0 && (
                <div>
                  <span className="text-[#737373]">Genres: </span>
                  <span className="text-white font-medium">
                    {currentData.genres.map((g) => g.name).join(', ')}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[#737373]">This title is: </span>
                <span className="text-white font-medium">
                  {isTv ? 'Exciting, Suspenseful, Mind-Bending' : 'Action-Packed, Thrilling, Immersive'}
                </span>
              </div>
            </div>
          </div>

          {/* TV Shows: Episodes Section */}
          {isTv && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white tracking-tight">Episodes</h3>

                {seasonsList.length > 1 && (
                  <div className="relative inline-block">
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(parseInt(e.target.value, 10))}
                      className="appearance-none px-4 py-2 pr-9 rounded bg-[#242424] text-white font-bold text-xs border border-white/15 focus:outline-none cursor-pointer"
                    >
                      {seasonsList.map((sea) => (
                        <option key={sea.id || sea.seasonNumber} value={sea.seasonNumber}>
                          {sea.title || `Season ${sea.seasonNumber}`} ({sea.episodeCount || 0} Episodes)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-white/70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Episode list */}
              <div className="divide-y divide-white/10">
                {episodesLoading ? (
                  <div className="py-8 text-center text-[#a3a3a3] text-sm">
                    Loading season episodes...
                  </div>
                ) : episodes.length > 0 ? (
                  episodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => handlePlayEpisode(ep.seasonNumber || selectedSeason, ep.episodeNumber)}
                      className="group py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl p-3 hover:bg-[#242424] transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-lg text-[#737373] min-w-[24px]">
                        {ep.episodeNumber}
                      </span>

                      <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-[#242424] shrink-0">
                        <img
                          src={ep.thumbnailUrl || currentData.backdropUrl || ''}
                          alt={ep.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-black ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-sm text-white group-hover:text-[#E50914] transition-colors truncate">
                            {ep.title}
                          </h4>
                          <span className="text-xs text-[#a3a3a3] shrink-0 font-medium">
                            {ep.duration}m
                          </span>
                        </div>
                        <p className="text-xs text-[#a3a3a3] line-clamp-2 leading-relaxed">
                          {ep.description || 'No synopsis available for this episode.'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-[#a3a3a3] text-sm">
                    No episode records found for Season {selectedSeason}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* More Like This 3-Column Section */}
          {currentData.similar && currentData.similar.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white tracking-tight">More Like This</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {currentData.similar.slice(0, 6).map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => {
                      closeModal();
                      if (sim.mediaType === 'tv') {
                        navigate(`/watch/tv/${sim.tmdbId || sim.id}/1/1`);
                      } else {
                        navigate(`/watch/movie/${sim.tmdbId || sim.id}`);
                      }
                    }}
                    className="group bg-[#242424] rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={sim.backdropUrl || sim.posterUrl || ''}
                        alt={sim.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 text-xs font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                        {sim.duration ? `${sim.duration}m` : 'Movie'}
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#46D369]">97% Match</span>
                        <span className="text-xs text-[#a3a3a3]">{sim.releaseYear || 2025}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white truncate">{sim.title}</h4>
                      <p className="text-xs text-[#a3a3a3] line-clamp-2 leading-relaxed">
                        {sim.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="space-y-2 pt-6 border-t border-white/10 text-xs text-[#a3a3a3]">
            <h4 className="text-base font-bold text-white mb-2">About {currentData.title}</h4>
            {currentData.director && (
              <p>
                <span className="text-[#737373]">Director: </span>
                <span className="text-white">{currentData.director}</span>
              </p>
            )}
            <p>
              <span className="text-[#737373]">Maturity Rating: </span>
              <span className="px-1 border border-white/30 rounded text-[10px] text-white">
                {currentData.rating || 'PG-13'}
              </span>
              <span className="text-white ml-2">Recommended for ages 13 and up.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
