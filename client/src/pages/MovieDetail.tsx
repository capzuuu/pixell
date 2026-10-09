import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Plus, Check, Film, ThumbsUp, ArrowLeft, Volume2, VolumeX, Star, Share2 } from 'lucide-react';
import { tmdbService } from '../services/tmdbService';
import { movieService } from '../services/movieService';
import { Movie } from '../types';
import { NetflixCard } from '../components/NetflixCard';
import { Modal } from '../components/Modal';
import { HeroSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { useWatchlist } from '../store/WatchlistContext';
import { formatDuration } from '../utils/formatTime';

export const MovieDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isSaved, toggleWatchlist } = useWatchlist();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [trailerOpen, setTrailerOpen] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    async function loadMovie() {
      if (!slug) return;
      try {
        setLoading(true);
        // If slug is numeric, fetch directly from TMDB
        if (/^\d+$/.test(slug)) {
          const res = await tmdbService.getMovieDetails(slug);
          if (res.success && res.data) {
            setMovie(res.data);
          }
        } else {
          // Otherwise try local slug or TMDB search
          const localRes = await movieService.getMovieBySlugOrId(slug).catch(() => null);
          if (localRes && localRes.success && localRes.data) {
            setMovie(localRes.data);
          } else {
            const searchRes = await tmdbService.search(slug, 'movie', 1);
            if (searchRes.success && searchRes.results?.length > 0) {
              const detailsRes = await tmdbService.getMovieDetails(searchRes.results[0].tmdbId);
              if (detailsRes.success && detailsRes.data) {
                setMovie(detailsRes.data);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading movie details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMovie();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

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

  if (!movie) {
    return (
      <div className="min-h-[75vh] bg-[#141414] text-white flex flex-col items-center justify-center text-center p-6 pt-24">
        <h2 className="text-3xl font-black text-white mb-2">Title Not Found</h2>
        <p className="text-[#a3a3a3] text-sm mb-6">The requested movie could not be located in the catalog.</p>
        <Link
          to="/movies"
          className="px-6 py-2.5 rounded bg-[#E50914] hover:bg-[#c11119] text-white font-bold text-sm transition-colors"
        >
          Return to Movies
        </Link>
      </div>
    );
  }

  const targetId = String(movie.tmdbId || movie.id);
  const saved = isSaved(targetId);
  const matchScore = movie.voteAverage ? Math.min(99, Math.round(movie.voteAverage * 10)) : 97;

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white pb-20">
      {/* Netflix Hero Billboard Section */}
      <div className="relative w-full aspect-[21/9] min-h-[500px] max-h-[750px] overflow-hidden bg-black">
        <img
          src={movie.backdropUrl || movie.posterUrl || ''}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
        />

        {/* Netflix Dual Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-24 left-4 md:left-12 lg:left-16 z-20">
          <button
            onClick={() => navigate('/movies')}
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
              #1 in Movies Today
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
            {movie.title}
          </h1>

          {/* Quick specs row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <span className="font-bold text-[#46D369]">{matchScore}% Match</span>
            <span className="text-[#a3a3a3] font-semibold">{movie.releaseYear || 2026}</span>
            <span className="px-1.5 py-0.5 border border-white/40 rounded text-[11px] font-bold text-white uppercase">
              {movie.rating || 'PG-13'}
            </span>
            <span className="text-[#a3a3a3] font-semibold">
              {movie.duration ? formatDuration(movie.duration) : '1h 46m'}
            </span>
            <span className="px-1.5 py-0.5 border border-white/30 rounded text-[10px] font-bold text-[#a3a3a3]">
              Ultra HD 4K
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Netflix Big Play Button */}
            <button
              onClick={() => navigate(`/watch/movie/${targetId}`)}
              className="flex items-center gap-2.5 px-7 py-3 rounded-md bg-white hover:bg-white/85 text-black font-extrabold text-sm sm:text-base shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Play</span>
            </button>

            {/* Add to List Round Button */}
            <button
              onClick={() =>
                toggleWatchlist({
                  tmdbId: movie.tmdbId,
                  mediaType: 'movie',
                  title: movie.title,
                  posterUrl: movie.posterUrl,
                  backdropUrl: movie.backdropUrl,
                  rating: movie.rating,
                  releaseYear: movie.releaseYear,
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
            {movie.trailerUrl && (
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
          {/* Left Column: Synopsis & Cast Cards */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white tracking-tight">Storyline</h2>
              <p className="text-[#d1d5db] text-sm sm:text-base md:text-lg leading-relaxed font-normal">
                {movie.description}
              </p>
            </div>

            {/* Top Cast List */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-bold text-white tracking-tight">Top Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {movie.cast.slice(0, 8).map((actor) => (
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
              About {movie.title}
            </h3>

            {movie.director && (
              <div>
                <span className="text-[#737373]">Director: </span>
                <span className="text-white font-medium">{movie.director}</span>
              </div>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <div>
                <span className="text-[#737373]">Cast: </span>
                <span className="text-white font-medium">
                  {movie.cast.slice(0, 4).map((c) => c.name).join(', ')}
                </span>
              </div>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <div>
                <span className="text-[#737373]">Genres: </span>
                <span className="text-white font-medium">
                  {movie.genres.map((g) => g.name).join(', ')}
                </span>
              </div>
            )}

            <div>
              <span className="text-[#737373]">This movie is: </span>
              <span className="text-white font-medium">
                Suspenseful, Spine-Chilling, Psychological, Dark
              </span>
            </div>

            <div>
              <span className="text-[#737373]">Maturity Rating: </span>
              <span className="px-1.5 py-0.5 border border-white/30 rounded text-[10px] text-white font-bold uppercase ml-1">
                {movie.rating || 'PG-13'}
              </span>
              <p className="text-[11px] text-[#737373] mt-1">
                Recommended for audiences aged 13 and older.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between">
              <span className="text-[#737373]">Audio / Language:</span>
              <span className="text-white font-medium">{movie.language || 'English (Original)'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#737373]">Origin Country:</span>
              <span className="text-white font-medium">{movie.country || 'United States'}</span>
            </div>
          </div>
        </div>

        {/* More Like This (Netflix Recommendations Grid) */}
        {movie.similar && movie.similar.length > 0 && (
          <div className="pt-10 border-t border-white/10 space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-8 sm:gap-x-3 sm:gap-y-10">
              {movie.similar.map((sim) => (
                <NetflixCard key={sim.id} item={sim} aspect="backdrop" isGrid={true} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {movie.trailerUrl && (
        <Modal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          title={`Trailer: ${movie.title}`}
          maxWidth="4xl"
        >
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            {movie.trailerUrl.includes('youtube.com') ? (
              <iframe
                src={movie.trailerUrl.replace('watch?v=', 'embed/')}
                title="Trailer"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                src={movie.trailerUrl}
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

