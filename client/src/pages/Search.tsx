import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdbService';
import { MediaItem, Genre } from '../types';
import { NetflixCard } from '../components/NetflixCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Search as SearchIcon, Film, Tv, Sparkles } from 'lucide-react';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || '';

  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(Boolean(initialQuery || initialGenre));

  useEffect(() => {
    tmdbService.getMovieGenres().then((res) => {
      if (res.success && res.data) setGenres(res.data);
    });
  }, []);

  const performSearch = useCallback(async (q: string, g: string) => {
    try {
      setLoading(true);
      setHasSearched(true);

      if (q.trim()) {
        const res = await tmdbService.search(q.trim(), 'multi', 1);
        if (res.success && res.results) {
          setResults(res.results);
        }
      } else if (g) {
        const res = await tmdbService.discoverMovies({ genreId: g, page: 1 });
        if (res.success && res.results) {
          setResults(res.results);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() || selectedGenre) {
        const params: any = {};
        if (query.trim()) params.q = query.trim();
        if (selectedGenre) params.genre = selectedGenre;
        setSearchParams(params);
        performSearch(query.trim(), selectedGenre);
      } else {
        setSearchParams({});
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedGenre, setSearchParams, performSearch]);

  const movies = results.filter((r) => r.mediaType === 'movie');
  const series = results.filter((r) => r.mediaType === 'tv');

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-20 px-4 md:px-12 lg:px-16">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
          Search Titles & Genres
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3a3] mb-6">
          Find movies, TV series, actors, and originals instantly across the entire catalog.
        </p>

        <div className="max-w-xl mx-auto">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => {
              setQuery('');
              setSelectedGenre('');
            }}
          />
        </div>

        {/* Quick Genre Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none py-4 text-xs">
          <button
            onClick={() => setSelectedGenre('')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
              !selectedGenre ? 'bg-white text-black font-bold' : 'bg-[#242424] text-white hover:bg-[#333]'
            }`}
          >
            All Genres
          </button>
          {genres.slice(0, 10).map((g) => {
            const isActive = selectedGenre === String(g.id);
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(isActive ? '' : String(g.id))}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                  isActive ? 'bg-white text-black font-bold' : 'bg-[#242424] text-white hover:bg-[#333]'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="space-y-10">
          <CardSkeleton count={12} />
        </div>
      ) : hasSearched && results.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="w-10 h-10 text-[#E50914]" />}
          title="No titles found"
          description="Try searching for another movie, TV show, or exploring different genres."
          actionText="Clear Search"
          onAction={() => {
            setQuery('');
            setSelectedGenre('');
          }}
        />
      ) : hasSearched ? (
        <div className="space-y-12 animate-fade-in">
          {/* Movies Results */}
          {movies.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                <Film className="w-5 h-5 text-[#E50914]" />
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Movies ({movies.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-8 sm:gap-x-3 sm:gap-y-10">
                {movies.map((m) => (
                  <NetflixCard key={m.id} item={m} aspect="backdrop" isGrid={true} />
                ))}
              </div>
            </section>
          )}

          {/* Series Results */}
          {series.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                <Tv className="w-5 h-5 text-[#E50914]" />
                <h2 className="text-xl font-bold text-white tracking-wide">
                  TV Series ({series.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-8 sm:gap-x-3 sm:gap-y-10">
                {series.map((s) => (
                  <NetflixCard key={s.id} item={s} aspect="backdrop" isGrid={true} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Empty Prompt State */
        <div className="text-center py-20 text-[#a3a3a3]">
          <div className="w-16 h-16 rounded-full bg-[#202020] border border-white/10 mx-auto flex items-center justify-center mb-4 text-[#a3a3a3]">
            <SearchIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Explore by Title, Person, or Genre</h3>
          <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">
            Type in the search bar above to instantly find movies and TV shows to stream.
          </p>
        </div>
      )}
    </div>
  );
};

