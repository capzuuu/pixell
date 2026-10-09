import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Plus, Check, Film, ThumbsUp, ArrowLeft, ChevronDown, Star } from 'lucide-react';
import { tmdbService } from '../services/tmdbService';
import { seriesService } from '../services/seriesService';
import { Series, Episode } from '../types';
import { NetflixCard } from '../components/NetflixCard';
import { Modal } from '../components/Modal';
import { HeroSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { useWatchlist } from '../store/WatchlistContext';

export const SeriesDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isSaved, toggleWatchlist } = useWatchlist();

  const [series, setSeries] = useState<Series | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [trailerOpen, setTrailerOpen] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    async function loadSeries() {
      if (!slug) return;
      try {
        setLoading(true);
        if (/^\d+$/.test(slug)) {
          const res = await tmdbService.getSeriesDetails(slug);
          if (res.success && res.data) {
            setSeries(res.data);
            setSelectedSeasonNumber(1);
          }
        } else {
          const localRes = await seriesService.getSeriesBySlugOrId(slug).catch(() => null);
          if (localRes && localRes.success && localRes.data) {
            setSeries(localRes.data);
            setSelectedSeasonNumber(1);
          } else {
            const searchRes = await tmdbService.search(slug, 'tv', 1);
            if (searchRes.success && searchRes.results?.length > 0) {
              const detailsRes = await tmdbService.getSeriesDetails(searchRes.results[0].tmdbId);
              if (detailsRes.success && detailsRes.data) {
                setSeries(detailsRes.data);
                setSelectedSeasonNumber(1);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading series:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSeries();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Load episodes when selectedSeasonNumber changes
  useEffect(() => {
    async function loadEpisodes() {
      if (!series) return;
      const tmdbId = series.tmdbId || series.id;
      try {
        setEpisodesLoading(true);
        const res = await tmdbService.getSeasonEpisodes(tmdbId, selectedSeasonNumber);
        if (res.success && res.data) {
          setEpisodes(res.data);
        }
      } catch (err) {
        console.error('Error loading season episodes:', err);
      } finally {
        setEpisodesLoading(false);
      }
    }

    loadEpisodes();
  }, [series, selectedSeasonNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] pt-20">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
          <CardSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-[75vh] bg-[#141414] text-white flex flex-col items-center justify-center text-center p-6 pt-24">
        <h2 className="text-3xl font-black text-white mb-2">Series Not Found</h2>
        <p className="text-[#a3a3a3] text-sm mb-6">The requested TV series could not be located in the catalog.</p>
        <Link
          to="/series"
          className="px-6 py-2.5 rounded bg-[#E50914] hover:bg-[#c11119] text-white font-bold text-sm transition-colors"
        >
          Return to TV Shows
        </Link>
      </div>
    );
  }

  const targetId = String(series.tmdbId || series.id);
  const saved = isSaved(targetId);
  const seasons = series.seasons || [];
  const matchScore = series.voteAverage ? Math.min(99, Math.round(series.voteAverage * 10)) : 97;

  const handleWatchFirst = () => {
    navigate(`/watch/tv/${targetId}/${selectedSeasonNumber}/1`);
  };

  const handlePlayEpisode = (epNum: number) => {
    navigate(`/watch/tv/${targetId}/${selectedSeasonNumber}/${epNum}`);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white pb-20">
      {/* Netflix Hero Billboard Section */}
      <div className="relative w-full aspect-[21/9] min-h-[500px] max-h-[750px] overflow-hidden bg-black">
        <img
          src={series.backdropUrl || series.posterUrl || ''}
          alt={series.title}
          className="w-full h-full object-cover object-center"
        />

        {/* Netflix Dual Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-24 left-4 md:left-12 lg:left-16 z-20">
          <button
            onClick={() => navigate('/series')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 text-xs font-bold backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </button>
        </div>

        {/* Hero Bottom Meta & CTAs */}
        <div className="absolute bottom-8 sm:bottom-12 left-4 md:left-12 lg:left-16 right-4 md:right-12 z-20 max-w-4xl space-y-4">
          {/* Netflix Top 10 Badge if applicable */}
          <div className="flex items-center gap-2">
            <span className="bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider shadow-md">
              TOP 10
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-white tracking-wide drop-shadow">
              #1 in TV Shows Today
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
            {series.title}
          </h1>

          {/* Quick specs row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <span className="font-bold text-[#46D369]">{matchScore}% Match</span>
            <span className="text-[#a3a3a3] font-semibold">{series.releaseYear || 2026}</span>
            <span className="px-1.5 py-0.5 border border-white/40 rounded text-[11px] font-bold text-white uppercase">
              {series.rating || 'TV-MA'}
            </span>
            <span className="text-[#a3a3a3] font-semibold">
              {seasons.length || series.numberOfSeasons || 1} Season{(seasons.length || series.numberOfSeasons || 1) !== 1 ? 's' : ''}
            </span>
            <span className="px-1.5 py-0.5 border border-white/30 rounded text-[10px] font-bold text-[#a3a3a3]">
              Ultra HD 4K
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Netflix Big Play Button */}
            <button
              onClick={handleWatchFirst}
              className="flex items-center gap-2.5 px-7 py-3 rounded-md bg-white hover:bg-white/85 text-black font-extrabold text-sm sm:text-base shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Play S{selectedSeasonNumber}:E1</span>
            </button>

            {/* Add to List Round Button */}
            <button
              onClick={() =>
                toggleWatchlist({
                  tmdbId: series.tmdbId,
                  mediaType: 'tv',
                  title: series.title,
                  posterUrl: series.posterUrl,
                  backdropUrl: series.backdropUrl,
                  rating: series.rating,
                  releaseYear: series.releaseYear,
                })
              }
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                saved
                  ? 'bg-white/20 border-white text-white'
                  : 'bg-[#2a2a2a]/70 border-white/50 text-white hover:border-white'
              }`}
              title={saved ? 'Remove from My List' : 'Add to My List'}
            >
              {saved ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
            </button>

            {/* Like Button */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                isLiked
                  ? 'bg-white/20 border-white text-white'
                  : 'bg-[#2a2a2a]/70 border-white/50 text-white hover:border-white'
              }`}
              title={isLiked ? 'Liked' : 'I like this'}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            </button>

            {/* Trailer Preview Button */}
            {series.trailerUrl && (
              <button
                onClick={() => setTrailerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#2a2a2a]/70 hover:bg-[#3a3a3a] border border-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all hover:border-white"
              >
                <Film className="w-4 h-4 text-[#E50914]" />
                <span>Trailer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Netflix Two-Column Detail Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-16 pt-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Left Column: Synopsis, Cast, Episodes */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">Storyline</h2>
              <p className="text-[#d1d5db] text-sm sm:text-base md:text-lg leading-relaxed font-normal">
                {series.description}
              </p>
            </div>

            {/* Top Cast List */}
            {series.cast && series.cast.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-bold text-white tracking-tight">Top Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {series.cast.slice(0, 8).map((actor) => (
                    <div
                      key={actor.id}
                      className="p-3 rounded-lg bg-[#181818] border border-white/5 flex items-center gap-3 hover:bg-[#222222] transition-colors"
                    >
                      {actor.profileUrl ? (
                        <img
                          src={actor.profileUrl}
                          alt={actor.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#2a2a2a] text-[#a3a3a3] flex items-center justify-center shrink-0 font-bold text-xs">
                          {actor.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate">{actor.name}</p>
                        <p className="text-[11px] text-[#a3a3a3] truncate">{actor.character || 'Cast'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Netflix Specs & Attributes */}
          <div className="bg-[#181818] rounded-xl p-6 border border-white/10 space-y-4 text-xs sm:text-sm text-[#a3a3a3] h-fit">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              About {series.title}
            </h3>

            {series.director && (
              <div>
                <span className="text-[#737373]">Creator / Director: </span>
                <span className="text-white font-medium">{series.director}</span>
              </div>
            )}

            {series.cast && series.cast.length > 0 && (
              <div>
                <span className="text-[#737373]">Cast: </span>
                <span className="text-white font-medium">
                  {series.cast.slice(0, 4).map((c) => c.name).join(', ')}
                </span>
              </div>
            )}

            {series.genres && series.genres.length > 0 && (
              <div>
                <span className="text-[#737373]">Genres: </span>
                <span className="text-white font-medium">
                  {series.genres.map((g) => g.name).join(', ')}
                </span>
              </div>
            )}

            <div>
              <span className="text-[#737373]">This show is: </span>
              <span className="text-white font-medium">
                Binge-Worthy, Gripping, Suspenseful, Mind-Bending
              </span>
            </div>

            <div>
              <span className="text-[#737373]">Maturity Rating: </span>
              <span className="px-1.5 py-0.5 border border-white/30 rounded text-[10px] text-white font-bold uppercase ml-1">
                {series.rating || 'TV-MA'}
              </span>
              <p className="text-[11px] text-[#737373] mt-1">
                Recommended for mature audiences.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between">
              <span className="text-[#737373]">Audio / Language:</span>
              <span className="text-white font-medium">{series.language || 'English (Original)'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#737373]">Origin Country:</span>
              <span className="text-white font-medium">{series.country || 'United States'}</span>
            </div>
          </div>
        </div>

        {/* Netflix TV Episodes Section */}
        <div className="space-y-6 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Episodes</h2>

            {/* Season Selector Dropdown */}
            {seasons.length > 1 && (
              <div className="relative inline-block">
                <select
                  value={selectedSeasonNumber}
                  onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value, 10))}
                  className="appearance-none px-4 py-2 pr-10 rounded bg-[#242424] text-white font-bold text-xs sm:text-sm border border-white/20 focus:outline-none focus:border-white cursor-pointer"
                >
                  {seasons.map((sea) => (
                    <option key={sea.id || sea.seasonNumber} value={sea.seasonNumber}>
                      {sea.title || `Season ${sea.seasonNumber}`} ({sea.episodeCount || 0} Episodes)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-white/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Episode List */}
          <div className="divide-y divide-white/10 bg-[#181818] rounded-xl border border-white/10 overflow-hidden">
            {episodesLoading ? (
              <div className="py-12 text-center text-[#a3a3a3] text-sm">
                Loading Season {selectedSeasonNumber} episodes...
              </div>
            ) : episodes.length > 0 ? (
              episodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => handlePlayEpisode(ep.episodeNumber)}
                  className="group py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-[#222222] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-xl text-[#737373] min-w-[28px]">
                    {ep.episodeNumber}
                  </span>

                  <div className="relative w-40 sm:w-48 aspect-video rounded-md overflow-hidden bg-black shrink-0">
                    <img
                      src={ep.thumbnailUrl || series.backdropUrl || ''}
                      alt={ep.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-[#E50914] transition-colors truncate">
                        {ep.title}
                      </h4>
                      <span className="text-xs text-[#a3a3a3] shrink-0 font-medium">
                        {ep.duration}m
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#a3a3a3] line-clamp-2 leading-relaxed font-normal">
                      {ep.description || 'No synopsis available for this episode.'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[#a3a3a3] text-sm">
                No episode records found for Season {selectedSeasonNumber}.
              </div>
            )}
          </div>
        </div>

        {/* More Like This (Netflix Recommendations Grid) */}
        {series.similar && series.similar.length > 0 && (
          <div className="pt-10 border-t border-white/10 space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-8 sm:gap-x-3 sm:gap-y-10">
              {series.similar.map((sim) => (
                <NetflixCard key={sim.id} item={sim} aspect="backdrop" isGrid={true} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {series.trailerUrl && (
        <Modal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          title={`Trailer: ${series.title}`}
          maxWidth="4xl"
        >
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            {series.trailerUrl.includes('youtube.com') ? (
              <iframe
                src={series.trailerUrl.replace('watch?v=', 'embed/')}
                title="Trailer"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                src={series.trailerUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

