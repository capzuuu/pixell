import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { tmdbService } from '../services/tmdbService';
import { useToast } from '../store/ToastContext';
import { Search, Sparkles, Download, Check, Star, Film, Tv, Loader2 } from 'lucide-react';

interface TmdbImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
  defaultType?: 'movie' | 'tv';
}

interface DisplayItem {
  id: number | string;
  tmdbId?: number | string;
  title: string;
  overview?: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseYear?: number | string;
  voteAverage?: number;
  voteCount?: number;
  mediaType?: 'movie' | 'tv';
}

export const TmdbImportModal: React.FC<TmdbImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  defaultType = 'movie',
}) => {
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'popular'>('trending');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>(defaultType);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [importingId, setImportingId] = useState<string | number | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string | number>>(new Set());
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  useEffect(() => {
    setMediaType(defaultType);
  }, [defaultType]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (activeTab === 'trending') {
        const res = mediaType === 'movie'
          ? await tmdbService.getTrendingMovies('week')
          : await tmdbService.getTrendingSeries('week');
        if (res.success && res.data) {
          setItems(res.data as any[]);
        }
      } else if (activeTab === 'popular') {
        const res = mediaType === 'movie'
          ? await tmdbService.getPopularMovies(1)
          : await tmdbService.getPopularSeries(1);
        if (res.success && res.results) {
          setItems(res.results as any[]);
        }
      } else if (activeTab === 'search' && searchQuery.trim().length > 1) {
        const res = await tmdbService.search(searchQuery.trim(), mediaType);
        if (res.success && res.results) {
          setItems(res.results as any[]);
        }
      }
    } catch (err: any) {
      console.error('TMDB fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab !== 'search' || searchQuery.trim().length > 1) {
        fetchItems();
      } else {
        setItems([]);
      }
    }
  }, [isOpen, activeTab, mediaType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('search');
      fetchItems();
    }
  };

  const handleImport = async (item: DisplayItem) => {
    const targetTmdbId = item.tmdbId || item.id;
    const isMovie = mediaType === 'movie' || item.mediaType === 'movie';
    setImportingId(targetTmdbId);
    try {
      if (isMovie) {
        const res = await tmdbService.importMovie(targetTmdbId);
        if (res.success) {
          success(`Successfully imported "${res.data?.title || item.title}" with Videasy streaming!`);
          setImportedIds((prev) => new Set(prev).add(targetTmdbId));
          if (onImportSuccess) onImportSuccess();
        }
      } else {
        const res = await tmdbService.importSeries(targetTmdbId);
        if (res.success) {
          success(`Successfully imported TV series "${res.data?.title || item.title}" and its seasons!`);
          setImportedIds((prev) => new Set(prev).add(targetTmdbId));
          if (onImportSuccess) onImportSuccess();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to import from TMDB');
    } finally {
      setImportingId(null);
    }
  };

  const handleSeedTrending = async () => {
    setIsSeeding(true);
    info('Starting batch import of trending movies & TV shows from TMDB...');
    try {
      const res = await tmdbService.seedTrending();
      if (res.success) {
        success(res.message || 'Successfully seeded catalog from TMDB!');
        if (onImportSuccess) onImportSuccess();
      }
    } catch (err: any) {
      error(err.message || 'Failed to seed from TMDB');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import from TMDB & Videasy Player" maxWidth="4xl">
      <div className="space-y-6">
        {/* Top Description & Seed Action Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/80 via-dark-850 to-dark-900 border border-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>TMDB Live Integration + Videasy.ws HD Streams</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Import movies and TV series directly from The Movie Database with metadata, 4K posters, backdrops, and ready-to-stream Videasy player embeds.
            </p>
          </div>

          <button
            onClick={handleSeedTrending}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-pink hover:from-brand-500 hover:to-accent-pink text-white text-xs font-bold shadow-glow-brand transition-all hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isSeeding ? 'Importing Batch...' : '1-Click Seed Trending'}</span>
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Media Type Toggle */}
          <div className="flex bg-dark-800 p-1 rounded-xl border border-white/10 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setMediaType('movie')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mediaType === 'movie' ? 'bg-brand-600 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              onClick={() => setMediaType('tv')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mediaType === 'tv' ? 'bg-accent-purple text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Series</span>
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-dark-800 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'trending' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔥 Trending
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'popular' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⭐ Popular
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'search' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔍 Search
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'search') setActiveTab('search');
              }}
              placeholder={`Search ${mediaType === 'movie' ? 'movies' : 'TV series'} on TMDB...`}
              className="w-full pl-9 pr-20 py-2 rounded-xl bg-dark-800 text-white text-xs border border-white/10 focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Grid */}
        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
              <p className="text-xs">Fetching titles from TMDB API...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item) => {
                const targetId = item.tmdbId || item.id;
                const title = item.title || 'Untitled';
                const releaseYear = item.releaseYear || '2025';
                const poster = item.posterUrl || '';
                const isImported = importedIds.has(targetId);
                const isImporting = importingId === targetId;

                return (
                  <div
                    key={targetId}
                    className="p-3 rounded-xl bg-dark-850 border border-white/5 hover:border-white/20 transition-all flex gap-3 group/item"
                  >
                    <img
                      src={poster}
                      alt={title}
                      className="w-16 aspect-[2/3] rounded-lg object-cover bg-dark-900 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white text-sm truncate group-hover/item:text-brand-300">
                            {title}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                            ID: {targetId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-semibold">{releaseYear}</span>
                          {item.voteAverage && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {item.voteAverage.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
                          {item.description || item.overview || 'No synopsis available.'}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-white/5">
                        {isImported ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Imported to Pixell</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleImport(item)}
                            disabled={isImporting}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow-brand transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                          >
                            {isImporting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Importing...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Import to Pixell</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Film className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No titles found</p>
              <p className="text-xs text-slate-500 mt-1">Try a different search keyword or switch media categories.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
          <span>Streaming powered by <strong>player.videasy.ws</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
