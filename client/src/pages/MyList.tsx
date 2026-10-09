import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWatchlist } from '../store/WatchlistContext';
import { useAuth } from '../store/AuthContext';
import { useTitleModal } from '../store/TitleModalContext';
import { useToast } from '../store/ToastContext';
import { tmdbService } from '../services/tmdbService';
import { MediaItem, Watchlist } from '../types';
import { NetflixCard } from '../components/NetflixCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  Bookmark,
  Film,
  Tv,
  Layers,
  Play,
  Trash2,
  Check,
  Plus,
  Info,
  Search,
  Grid,
  LayoutGrid,
  ArrowUpDown,
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Circle
} from 'lucide-react';

export const MyList: React.FC = () => {
  const navigate = useNavigate();
  const { watchlist, loading, removeFromWatchlist, toggleWatchlist } = useWatchlist();
  const { isAuthenticated, user } = useAuth();
  const { openModal } = useTitleModal();
  const { success } = useToast();

  const [filterType, setFilterType] = useState<'all' | 'movies' | 'series'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'year_desc'>('date_desc');
  const [viewMode, setViewMode] = useState<'poster' | 'backdrop'>('poster');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Manage / Multi-Select Mode (Netflix Mobile/Web feature)
  const [isManageMode, setIsManageMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  // Recommendations when empty
  const [trendingRecommendations, setTrendingRecommendations] = useState<MediaItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);

  useEffect(() => {
    if (watchlist.length === 0) {
      setLoadingSuggestions(true);
      tmdbService.getTrendingMovies('week')
        .then((res) => {
          if (res.success && res.data) {
            setTrendingRecommendations(res.data.slice(0, 10));
          }
        })
        .catch((err) => console.error('Error fetching suggestions:', err))
        .finally(() => setLoadingSuggestions(false));
    }
  }, [watchlist.length]);

  // Clean selections when leaving manage mode
  useEffect(() => {
    if (!isManageMode) {
      setSelectedIds(new Set());
    }
  }, [isManageMode]);

  // Filter and Sort Items
  const processedItems = useMemo(() => {
    let list = [...watchlist];

    // 1. Filter Type
    if (filterType === 'movies') {
      list = list.filter((item) => item.mediaType === 'movie' || Boolean(item.movieId) || Boolean(item.movie));
    } else if (filterType === 'series') {
      list = list.filter((item) => item.mediaType === 'tv' || Boolean(item.seriesId) || Boolean(item.series));
    }

    // 2. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => (item.title || '').toLowerCase().includes(q));
    }

    // 3. Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return (new Date(a.createdAt || 0).getTime()) - (new Date(b.createdAt || 0).getTime());
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'year_desc':
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        case 'date_desc':
        default:
          return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
      }
    });

    return list;
  }, [watchlist, filterType, searchQuery, sortBy]);

  const moviesCount = watchlist.filter((item) => item.mediaType === 'movie' || Boolean(item.movieId) || Boolean(item.movie)).length;
  const seriesCount = watchlist.filter((item) => item.mediaType === 'tv' || Boolean(item.seriesId) || Boolean(item.series)).length;

  // Toggle single item selection in Manage mode
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    if (selectedIds.size === processedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedItems.map((item) => item.id)));
    }
  };

  // Bulk remove selected items
  const handleBulkRemove = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      const idsToRemove = Array.from(selectedIds);
      for (const id of idsToRemove) {
        await removeFromWatchlist(id);
      }
      setSelectedIds(new Set());
      setIsManageMode(false);
      success(`Removed ${idsToRemove.length} title${idsToRemove.length !== 1 ? 's' : ''} from My List`);
    } catch (err) {
      console.error('Error during bulk deletion:', err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Convert watchlist item to normalized media item
  const toMediaItem = (item: Watchlist): any => {
    const isTv = item.mediaType === 'tv' || Boolean(item.seriesId) || Boolean(item.series);
    return item.movie || item.series || {
      id: String(item.tmdbId || item.movieId || item.seriesId || item.id),
      tmdbId: item.tmdbId ? Number(item.tmdbId) : undefined,
      title: item.title || 'Saved Title',
      slug: String(item.tmdbId || item.id),
      posterUrl: item.posterUrl || '',
      backdropUrl: item.backdropUrl || item.posterUrl || '',
      rating: item.rating || (isTv ? 'TV-MA' : 'PG-13'),
      releaseYear: item.releaseYear || 2025,
      mediaType: isTv ? 'tv' : 'movie',
      voteAverage: 8.5
    };
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-20 sm:pt-24 pb-28 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-16 transition-all">
      {/* Netflix Banner Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-2.5 h-6 bg-[#E50914] rounded-sm inline-block" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                My List
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#a3a3a3]">
              {user?.name ? `${user.name}'s Watchlist` : 'Personal Watchlist'} • {watchlist.length} saved title{watchlist.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Top Actions: Manage / Select Toggle & View Switcher */}
          {watchlist.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Manage / Select Mode button (Netflix Mobile & Web style) */}
              <button
                onClick={() => setIsManageMode(!isManageMode)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isManageMode
                    ? 'bg-[#E50914] text-white border-[#E50914] shadow-glow-brand'
                    : 'bg-[#222222] text-[#e5e5e5] border-white/20 hover:bg-[#333333] hover:text-white'
                }`}
              >
                {isManageMode ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Manage List</span>
                  </>
                )}
              </button>

              {/* View Mode Switcher (Desktop & Tablet) */}
              <div className="hidden sm:flex items-center bg-[#202020] rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('poster')}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'poster' ? 'bg-white/20 text-white' : 'text-[#737373] hover:text-white'
                  }`}
                  title="Poster Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('backdrop')}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'backdrop' ? 'bg-white/20 text-white' : 'text-[#737373] hover:text-white'
                  }`}
                  title="Backdrop Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter, Search & Sorting Sub-Bar */}
        {watchlist.length > 0 && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-4">
            {/* Category Filter Chips (Netflix Pill Tabs) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  filterType === 'all'
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#222222] text-[#a3a3a3] hover:text-white hover:bg-[#303030] border border-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All ({watchlist.length})</span>
              </button>
              <button
                onClick={() => setFilterType('movies')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  filterType === 'movies'
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#222222] text-[#a3a3a3] hover:text-white hover:bg-[#303030] border border-white/10'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Movies ({moviesCount})</span>
              </button>
              <button
                onClick={() => setFilterType('series')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  filterType === 'series'
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#222222] text-[#a3a3a3] hover:text-white hover:bg-[#303030] border border-white/10'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>TV Series ({seriesCount})</span>
              </button>
            </div>

            {/* In-List Search & Sort Dropdown */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-[#a3a3a3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in My List..."
                  className="w-full pl-8 pr-7 py-1.5 bg-[#202020] text-xs text-white rounded-lg border border-white/10 focus:outline-none focus:border-white/40 placeholder-[#737373]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="relative shrink-0">
                <div className="flex items-center gap-1.5 bg-[#202020] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#a3a3a3]">
                  <ArrowUpDown className="w-3 h-3 text-[#737373]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="date_desc" className="bg-[#202020] text-white">Date Added (Newest)</option>
                    <option value="date_asc" className="bg-[#202020] text-white">Date Added (Oldest)</option>
                    <option value="title_asc" className="bg-[#202020] text-white">Alphabetical (A–Z)</option>
                    <option value="title_desc" className="bg-[#202020] text-white">Alphabetical (Z–A)</option>
                    <option value="year_desc" className="bg-[#202020] text-white">Release Year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Manage Mode Action Bar (When Manage mode is active) */}
      {isManageMode && processedItems.length > 0 && (
        <div className="mb-6 p-3 sm:p-4 bg-[#1e1e1e] border border-white/15 rounded-xl flex items-center justify-between gap-4 animate-slide-up shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-bold text-white hover:text-[#E50914] transition-colors"
            >
              {selectedIds.size === processedItems.length ? (
                <CheckCircle2 className="w-4 h-4 text-[#E50914]" />
              ) : (
                <Circle className="w-4 h-4 text-[#737373]" />
              )}
              <span>
                {selectedIds.size === processedItems.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
            <span className="text-xs text-[#a3a3a3] border-l border-white/15 pl-3">
              {selectedIds.size} of {processedItems.length} selected
            </span>
          </div>

          <button
            onClick={handleBulkRemove}
            disabled={selectedIds.size === 0 || isBulkDeleting}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              selectedIds.size > 0
                ? 'bg-[#E50914] hover:bg-[#b80710] text-white shadow-glow-brand active:scale-95'
                : 'bg-white/10 text-[#737373] cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isBulkDeleting ? 'Removing...' : `Remove (${selectedIds.size})`}</span>
          </button>
        </div>
      )}

      {/* Main Grid Content */}
      {loading ? (
        <CardSkeleton count={12} />
      ) : processedItems.length > 0 ? (
        <div
          className={`grid gap-2.5 sm:gap-4 ${
            viewMode === 'poster'
              ? 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              : 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          }`}
        >
          {processedItems.map((item) => {
            const mediaObject = toMediaItem(item);
            const isSelected = selectedIds.has(item.id);
            const isTv = mediaObject.mediaType === 'tv';
            const targetId = String(item.tmdbId || item.movieId || item.seriesId || item.id);

            // If in Manage mode, render custom interactive select card
            if (isManageMode) {
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`group relative rounded-md overflow-hidden bg-[#181818] cursor-pointer border-2 transition-all select-none ${
                    viewMode === 'poster' ? 'aspect-[2/3]' : 'aspect-video'
                  } ${
                    isSelected
                      ? 'border-[#E50914] ring-2 ring-[#E50914]/50 scale-[0.98]'
                      : 'border-transparent hover:border-white/30'
                  }`}
                >
                  <img
                    src={
                      viewMode === 'poster'
                        ? (mediaObject.posterUrl || mediaObject.backdropUrl)
                        : (mediaObject.backdropUrl || mediaObject.posterUrl)
                    }
                    alt={mediaObject.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Top Select Checkmark Badge */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-md ${
                        isSelected
                          ? 'bg-[#E50914] text-white ring-2 ring-white'
                          : 'bg-black/60 text-white/60 border border-white/40'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                    </div>
                  </div>

                  {/* Title & Media Type Info at bottom */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="text-xs font-bold text-white truncate drop-shadow-md">
                      {mediaObject.title}
                    </p>
                    <p className="text-[10px] text-[#a3a3a3] uppercase font-semibold">
                      {isTv ? 'Series' : 'Movie'} • {mediaObject.releaseYear}
                    </p>
                  </div>
                </div>
              );
            }

            // Normal Netflix Card Mode (Poster Grid or Backdrop Grid)
            if (viewMode === 'poster') {
              return (
                <div
                  key={item.id}
                  className="group relative rounded-md overflow-hidden bg-[#181818] aspect-[2/3] transition-all duration-300 hover:scale-[1.03] hover:z-20 hover:shadow-2xl select-none"
                >
                  <img
                    src={mediaObject.posterUrl || mediaObject.backdropUrl}
                    alt={mediaObject.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center cursor-pointer"
                    onClick={() => openModal(mediaObject)}
                  />

                  {/* Quick Remove 'X' button on top-right */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWatchlist(item.id);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-[#E50914] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 shadow-md"
                    title="Remove from My List"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Hover Overlay with Netflix Details & Quick Play */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 pointer-events-none group-hover:pointer-events-auto">
                    <h4 className="font-extrabold text-xs sm:text-sm text-white drop-shadow truncate mb-1">
                      {mediaObject.title}
                    </h4>

                    {/* Meta row */}
                    <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-semibold mb-2.5">
                      <span className="text-[#46D369] font-bold">98% Match</span>
                      <span className="px-1 border border-white/40 rounded text-[9px] uppercase">
                        {mediaObject.rating || (isTv ? 'TV-MA' : 'PG-13')}
                      </span>
                      <span>{mediaObject.releaseYear}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (isTv) {
                            navigate(`/watch/tv/${targetId}/1/1`);
                          } else {
                            navigate(`/watch/movie/${targetId}`);
                          }
                        }}
                        className="flex-1 py-1.5 px-2 bg-white hover:bg-white/80 text-black font-bold text-xs rounded flex items-center justify-center gap-1 shadow-md transition-transform active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Play</span>
                      </button>

                      <button
                        onClick={() => openModal(mediaObject)}
                        className="p-1.5 rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border border-white/20 transition-all"
                        title="More Info"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Backdrop Grid Mode
            return (
              <NetflixCard
                key={item.id}
                item={mediaObject}
                aspect="backdrop"
                isGrid={true}
              />
            );
          })}
        </div>
      ) : searchQuery ? (
        /* Search Empty State */
        <div className="bg-[#181818] border border-white/10 rounded-2xl p-10 text-center max-w-md mx-auto my-12">
          <Search className="w-10 h-10 text-[#737373] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No matching titles in My List</h3>
          <p className="text-xs text-[#a3a3a3] mb-5">
            No saved titles match &quot;{searchQuery}&quot;. Try a different search term or clear the filter.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-xs font-bold rounded-lg border border-white/20 transition-all"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Empty State with Netflix Discovery Showcase */
        <div className="space-y-12 my-6">
          <div className="bg-gradient-to-b from-[#1c1c1c] to-[#141414] border border-white/10 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center mx-auto mb-5 shadow-glow-brand">
              <Bookmark className="w-8 h-8 text-[#E50914]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              You haven&apos;t added any titles to your list yet
            </h2>
            <p className="text-xs sm:text-sm text-[#a3a3a3] max-w-md mx-auto mb-8 leading-relaxed">
              Explore movies and TV series across Pixell and click the <strong className="text-white">+ My List</strong> button to save titles here for later streaming.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/movies"
                className="px-6 py-3 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg active:scale-95"
              >
                Browse Popular Movies
              </Link>
              <Link
                to="/series"
                className="px-6 py-3 rounded-lg bg-[#252525] hover:bg-[#353535] text-white border border-white/20 font-bold text-xs sm:text-sm tracking-wide transition-all active:scale-95"
              >
                Explore TV Series
              </Link>
            </div>
          </div>

          {/* Quick Add Trending Titles Row */}
          {trendingRecommendations.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#E50914]" />
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Suggested Titles to Add
                </h3>
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {trendingRecommendations.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-md overflow-hidden bg-[#181818] aspect-[2/3] border border-white/10"
                  >
                    <img
                      src={item.posterUrl || item.backdropUrl}
                      alt={item.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openModal(item)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-90 group-hover:opacity-100 flex flex-col justify-end p-2.5">
                      <p className="text-xs font-bold text-white truncate mb-1">
                        {item.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWatchlist({
                            tmdbId: item.tmdbId,
                            mediaType: 'movie',
                            title: item.title,
                            posterUrl: item.posterUrl,
                            backdropUrl: item.backdropUrl,
                            rating: item.rating,
                            releaseYear: item.releaseYear,
                          });
                        }}
                        className="w-full py-1 bg-white/20 hover:bg-[#E50914] text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add to List</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
