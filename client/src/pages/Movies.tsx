import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { MediaItem, Genre } from '../types';
import { NetflixCard } from '../components/NetflixCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Film, ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal } from 'lucide-react';

export const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filter states
  const genreParam = searchParams.get('genre') || undefined;
  const yearParam = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
  const sortParam = searchParams.get('sort') || 'popularity.desc';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    tmdbService.getMovieGenres().then((res) => {
      if (res.success && res.data) setGenres(res.data);
    });
  }, []);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tmdbService.discoverMovies({
        genreId: genreParam,
        year: yearParam,
        sortBy: sortParam,
        page: pageParam,
      });

      if (res.success && res.results) {
        setMovies(res.results);
        setPage(res.page);
        setTotalPages(Math.min(res.totalPages, 100));
      }
    } catch (err) {
      console.error('Error fetching TMDB movies:', err);
    } finally {
      setLoading(false);
    }
  }, [genreParam, yearParam, sortParam, pageParam]);

  useEffect(() => {
    fetchMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchMovies]);

  const updateFilter = (key: string, val: string | number | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (val !== undefined && val !== '') {
      params.set(key, String(val));
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  const currentGenreName = genres.find((g) => String(g.id) === String(genreParam))?.name;

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-20 px-4 md:px-12 lg:px-16">
      {/* Netflix Sticky Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Movies
          </h1>

          {/* Netflix Genre Selector Dropdown */}
          <div className="relative inline-block">
            <select
              value={genreParam || ''}
              onChange={(e) => updateFilter('genre', e.target.value)}
              aria-label="Filter movies by genre"
              className="appearance-none bg-black/80 hover:bg-black text-white font-bold text-xs sm:text-sm px-4 py-1.5 pr-9 rounded border border-white/40 focus:outline-none focus:border-white transition-colors cursor-pointer"
            >
              <option value="">Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {currentGenreName && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white/10 text-white flex items-center gap-1.5">
              <span>{currentGenreName}</span>
              <button
                onClick={() => updateFilter('genre', undefined)}
                className="text-white/60 hover:text-white font-bold"
              >
                ×
              </button>
            </span>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative inline-block">
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              aria-label="Sort movies by"
              className="appearance-none bg-[#1f1f1f] text-[#d1d5db] font-semibold text-xs px-3.5 py-1.5 pr-8 rounded border border-white/20 focus:outline-none focus:border-white cursor-pointer"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="primary_release_date.desc">Newest Releases</option>
              <option value="revenue.desc">Box Office Hits</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/70 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Quick Filter Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none text-xs">
        <button
          onClick={() => updateFilter('genre', undefined)}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
            !genreParam ? 'bg-white text-black font-bold' : 'bg-[#262626] text-white hover:bg-[#333]'
          }`}
        >
          All Genres
        </button>
        {genres.slice(0, 10).map((g) => {
          const isActive = String(genreParam) === String(g.id);
          return (
            <button
              key={g.id}
              onClick={() => updateFilter('genre', isActive ? undefined : g.id)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                isActive ? 'bg-white text-black font-bold' : 'bg-[#262626] text-white hover:bg-[#333]'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {/* Movies Grid */}
      {loading ? (
        <CardSkeleton count={18} />
      ) : movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-8 sm:gap-x-3 sm:gap-y-10">
            {movies.map((movie) => (
              <NetflixCard
                key={movie.id}
                item={movie}
                aspect="backdrop"
                isGrid={true}
              />
            ))}
          </div>

          {/* Netflix Style Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-16">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#242424] hover:bg-[#333] border border-white/10 text-white text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Page</span>
              </button>

              <span className="text-xs text-[#a3a3a3] font-semibold">
                Page <strong className="text-white">{page}</strong> of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#242424] hover:bg-[#333] border border-white/10 text-white text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Film className="w-8 h-8 text-[#E50914]" />}
          title="No movies found"
          description="We couldn't find any movies matching your current filters."
          actionText="Reset Filters"
          onAction={handleReset}
        />
      )}
    </div>
  );
};

